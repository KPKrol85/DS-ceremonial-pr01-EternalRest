import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { preview } from "vite";

// Service worker and offline coverage (PWA-SW-01) on the production build. Playwright
// supports service workers only in Chromium; the smoke tests block them (see
// playwright.config.js), so this file allows them again.
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "Service workers are tested in Chromium only.",
);
test.use({ serviceWorkers: "allow" });

const OFFLINE_TITLE = "Brak połączenia z internetem";
const LIGHT_BACKGROUND = "rgb(246, 240, 232)";
const DARK_BACKGROUND = "rgb(20, 18, 16)";
const missingPath = "/missing/nested/page/";
const contactValues = {
  name: "Jan Testowy",
  email: "jan.testowy@example.com",
  phone: "+48 000 000 000",
  topic: "Nowa strona internetowa",
  message: "Wiadomość testowa.",
};

// The first page registers the worker after its load event; activation claims the page.
const openControlled = async (page, path) => {
  await page.goto(path);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
};

// Cache Storage of the site: cache name → stored paths, sorted.
const readCaches = (page) =>
  page.evaluate(async () => {
    const result = {};
    for (const name of await caches.keys()) {
      const keys = await (await caches.open(name)).keys();
      result[name] = keys.map(({ url }) => new URL(url).pathname).sort();
    }
    return result;
  });

const cacheNamed = (stored, kind) =>
  Object.keys(stored).find((name) => name.startsWith(`eternal-rest-${kind}-`));

// Fails on uncaught page errors and on failed or unsuccessful page resource loads.
const trackFailures = (page) => {
  const failures = [];
  const types = new Set(["stylesheet", "script", "font", "image", "manifest"]);
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("requestfailed", (request) => {
    if (types.has(request.resourceType())) failures.push(request.url());
  });
  page.on("response", (response) => {
    if (types.has(response.request().resourceType()) && !response.ok()) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  return failures;
};

const expectOfflinePage = async (page, path) => {
  await expect(page).toHaveURL(new RegExp(`${path.replace(/\./g, "\\.")}$`));
  await expect(page).toHaveTitle(`Eternal Rest | ${OFFLINE_TITLE}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    OFFLINE_TITLE,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await expect(page.getByRole("main")).toContainText(
    "Formularz kontaktowy wymaga połączenia z internetem.",
  );
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  // main.js ran from the precache and the stylesheet, fonts and images resolved.
  await expect(page.locator("html")).not.toHaveClass(/no-js|js-pending/);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
  ).toBe(true);
};

test("service worker controls the site and precaches the offline page", async ({
  page,
}) => {
  const failures = trackFailures(page);
  await openControlled(page, "/");

  const registration = await page.evaluate(async () => {
    const { scope, active } = await navigator.serviceWorker.ready;
    return { scope, script: active.scriptURL, state: active.state };
  });
  expect(registration).toEqual({
    scope: new URL("/", page.url()).href,
    script: new URL("/sw.js", page.url()).href,
    state: "activated",
  });

  const stored = await readCaches(page);
  const precache = cacheNamed(stored, "precache");
  const pages = cacheNamed(stored, "pages");
  expect(precache).toBeTruthy();
  expect(pages).toBe(precache.replace("-precache-", "-pages-"));

  // The offline page, the stylesheet, module and icons of the page and the stylesheet's fonts.
  const shell = await page.evaluate(async () => {
    const paths = [
      ...document.querySelectorAll(
        'link[rel="stylesheet"], link[rel="manifest"], link[rel~="icon"], script[type="module"][src]',
      ),
    ].map((element) => new URL(element.href || element.src).pathname);
    const css = document.querySelector('link[rel="stylesheet"]').href;
    const text = await (await fetch(css)).text();
    for (const [, url] of text.matchAll(/url\(["']?([^"')]+)/g)) {
      if (!url.startsWith("data:")) paths.push(new URL(url, css).pathname);
    }
    return paths;
  });
  expect(stored[precache]).toEqual(
    expect.arrayContaining(["/offline.html", ...shell]),
  );
  // No other page and no photograph is downloaded in advance.
  expect(stored[precache].filter((path) => path.endsWith(".html"))).toEqual([
    "/offline.html",
  ]);
  expect(
    stored[precache].some((path) => /\.(avif|webp|jpe?g)$/.test(path)),
  ).toBe(false);
  // The page opened before the worker controlled it is stored for offline use.
  expect(stored[pages]).toEqual(["/index.html"]);
  expect(failures).toEqual([]);
});

test("visited pages open offline, other pages get the offline page and recovery works online", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await openControlled(page, "/");
  await page.goto("/services.html");
  // The stored theme preference applies offline as well.
  await page.locator("[data-theme-toggle]").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await context.setOffline(true);
  const failures = trackFailures(page);
  for (const [path, title] of [
    ["/services.html", "Eternal Rest | Usługi"],
    ["/", "Eternal Rest | Dom pogrzebowy w Tarnowie"],
  ]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    await expect(page).toHaveTitle(title);
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  // An address without a stored copy, including an unknown one, gets the offline page.
  for (const path of [missingPath, "/pricing.html"]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    await expectOfflinePage(page, path);
  }
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    DARK_BACKGROUND,
  );
  // Images of pages not visited online were not stored; the offline page needs none.
  expect(failures.filter((url) => !/\.(avif|webp)$/.test(url))).toEqual([]);

  // Retrying while still offline announces the state instead of reloading.
  const retry = page.getByRole("button", { name: "Spróbuj ponownie" });
  const status = page.locator("[data-offline-status]");
  await expect(status).toHaveAttribute("role", "status");
  await expect(status).toBeEmpty();
  await page.evaluate(() => {
    window.offlineTestMarker = true;
  });
  await retry.click();
  await expect(status).toHaveText(
    "Nadal brak połączenia z internetem. Spróbuj ponownie po jego przywróceniu.",
  );
  expect(await page.evaluate(() => window.offlineTestMarker)).toBe(true);

  // Back online, the restored connection is announced and the retry loads the page.
  await context.setOffline(false);
  await expect(status).toHaveText(
    "Połączenie z internetem zostało przywrócone. Wybierz „Spróbuj ponownie”, aby wczytać stronę.",
  );
  const reload = page.waitForEvent("load");
  await retry.click();
  await reload;
  await expect(page).toHaveURL(/\/pricing\.html$/);
  await expect(page).toHaveTitle("Eternal Rest | Cennik");
  await expect
    .poll(async () => {
      const stored = await readCaches(page);
      return stored[cacheNamed(stored, "pages")];
    })
    .toContain("/pricing.html");
});

test("a page opens offline with and without its .html extension", async ({
  page,
  context,
}) => {
  const servicesTitle = "Eternal Rest | Usługi";
  await openControlled(page, "/");

  // Like Netlify, the server answers the address without the extension with the same page.
  const extensionless = await page.request.get("/services");
  expect(extensionless.status()).toBe(200);
  expect(await extensionless.text()).toContain(
    `<title>${servicesTitle}</title>`,
  );

  // Visited through an internal link, the page is stored once, under its .html address.
  await page
    .getByRole("navigation", { name: "Główna" })
    .getByRole("link", { name: "Usługi", exact: true })
    .click();
  await expect(page).toHaveURL(/\/services\.html$/);
  await expect
    .poll(async () => {
      const stored = await readCaches(page);
      return stored[cacheNamed(stored, "pages")];
    })
    .toEqual(["/index.html", "/services.html"]);

  await context.setOffline(true);
  for (const path of ["/services.html", "/services", "/services?source=pwa"]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    expect(response.fromServiceWorker()).toBe(true);
    await expect(page).toHaveTitle(servicesTitle);
  }
  // A page not visited online still gets the offline page in either form.
  for (const path of ["/pricing", "/pricing.html"]) {
    await page.goto(path);
    await expectOfflinePage(page, path);
  }

  // Visited first without the extension, the page also opens offline through internal links.
  await context.setOffline(false);
  await page.goto("/about");
  await expect(page).toHaveTitle("Eternal Rest | O nas");
  await expect
    .poll(async () => {
      const stored = await readCaches(page);
      return stored[cacheNamed(stored, "pages")];
    })
    .toContain("/about.html");
  await context.setOffline(true);
  await page.goto("/services");
  await page
    .getByRole("navigation", { name: "Główna" })
    .getByRole("link", { name: "O nas", exact: true })
    .click();
  await expect(page).toHaveURL(/\/about\.html$/);
  await expect(page).toHaveTitle("Eternal Rest | O nas");

  // An unknown address without an extension is not stored as a page.
  await context.setOffline(false);
  const html = await (await page.request.get("/404.html")).text();
  await context.route("**/missing-page", (route) =>
    route.fulfill({ status: 404, contentType: "text/html", body: html }),
  );
  const missing = await page.goto("/missing-page");
  expect(missing.status()).toBe(404);
  expect(missing.fromServiceWorker()).toBe(true);
  const stored = await readCaches(page);
  expect(stored[cacheNamed(stored, "pages")]).not.toContain(
    "/missing-page.html",
  );
});

test("HTTP errors and form submissions pass through the service worker unchanged", async ({
  page,
  context,
}) => {
  await openControlled(page, "/contact.html");

  // A simulated hosting 404; context.route also sees the request the worker forwards.
  const html = await (await page.request.get("/404.html")).text();
  await context.route(`**${missingPath}`, (route) =>
    route.fulfill({ status: 404, contentType: "text/html", body: html }),
  );
  const response = await page.goto(missingPath);
  expect(response.status()).toBe(404);
  expect(response.fromServiceWorker()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nie znaleziono strony",
  );
  const pages = cacheNamed(await readCaches(page), "pages");
  expect((await readCaches(page))[pages]).not.toContain(
    `${missingPath}index.html`,
  );

  // A POST sent by main.js is not handled by the worker.
  const posts = [];
  await page.route(
    (url) => url.pathname === "/" || url.pathname === "/contact.html",
    async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      posts.push(route.request());
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<p>Potwierdzenie testowe</p>",
      });
    },
  );
  const fill = async () => {
    await page.getByLabel("Imię i nazwisko").fill(contactValues.name);
    await page.getByLabel("Adres e-mail").fill(contactValues.email);
    await page.getByLabel("Telefon kontaktowy").fill(contactValues.phone);
    await page
      .getByLabel("Temat zapytania")
      .selectOption({ label: contactValues.topic });
    await page.getByLabel("Treść wiadomości").fill(contactValues.message);
  };
  const expectPost = (request, path) => {
    expect(request.method()).toBe("POST");
    expect(request.serviceWorker()).toBeNull();
    expect(new URL(request.url()).pathname).toBe(path);
    expect(new URL(request.url()).search).toBe("");
    expect(
      Object.fromEntries(new URLSearchParams(request.postData() ?? "")),
    ).toEqual({
      "form-name": "kontakt-kp-code",
      "bot-field": "",
      ...contactValues,
    });
  };

  await page.goto("/contact.html");
  await fill();
  const fetchResponse = page.waitForResponse(
    (candidate) => candidate.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();
  expect((await fetchResponse).fromServiceWorker()).toBe(false);
  await expect(page.locator("[data-form-success]")).toBeFocused();
  expect(posts).toHaveLength(1);
  expectPost(posts[0], "/");

  // So is a native submission, which navigates with a POST to the page address.
  await fill();
  const navigation = page.waitForEvent("framenavigated");
  await page.locator("[data-validate-form]").evaluate((form) => form.submit());
  await navigation;
  await expect(page.getByText("Potwierdzenie testowe")).toBeVisible();
  await expect(page).toHaveURL(/\/contact\.html$/);
  expect(posts).toHaveLength(2);
  expectPost(posts[1], "/contact.html");

  // Cache Storage holds no submitted value.
  expect(
    await page.evaluate(
      async (values) => {
        const found = [];
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const request of await cache.keys()) {
            const text = await (await cache.match(request)).text();
            if (values.some((value) => text.includes(value))) {
              found.push(request.url);
            }
          }
        }
        return found;
      },
      [contactValues.email, contactValues.message],
    ),
  ).toEqual([]);
});

test("a new version waits while a page is open and replaces the caches after it closes", async ({
  browser,
}) => {
  // A second preview server whose sw.js can be replaced by a new version.
  let nextWorker = null;
  const server = await preview({
    logLevel: "silent",
    preview: { host: "127.0.0.1", port: 8184, strictPort: true },
    plugins: [
      {
        name: "service-worker-update-test",
        configurePreviewServer({ middlewares }) {
          middlewares.use((request, response, next) => {
            if (!nextWorker || !request.url.startsWith("/sw.js")) return next();
            response.setHeader("Content-Type", "text/javascript");
            response.end(nextWorker);
          });
        },
      },
    ],
  });
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:8184",
    serviceWorkers: "allow",
  });
  try {
    const page = await context.newPage();
    await openControlled(page, "/contact.html");
    const before = await readCaches(page);
    const oldPrecache = cacheNamed(before, "precache");
    const version = oldPrecache.replace("eternal-rest-precache-", "");

    // The visitor is typing when the new deployment is detected.
    const name = page.getByLabel("Imię i nazwisko");
    await name.fill(contactValues.name);
    await page.evaluate(() => {
      window.updateTestController = navigator.serviceWorker.controller;
    });
    nextWorker = readFileSync("dist/sw.js", "utf8").replace(
      `"version":"${version}"`,
      `"version":"${version}next"`,
    );
    expect(nextWorker).toContain(`${version}next`);
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration()).update();
    });

    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            (await navigator.serviceWorker.getRegistration()).waiting?.state,
        ),
      )
      .toBe("installed");
    // The open page keeps its worker and caches; nothing reloads or activates.
    expect(
      await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return (
          navigator.serviceWorker.controller === window.updateTestController &&
          registration.active === window.updateTestController
        );
      }),
    ).toBe(true);
    await expect(name).toHaveValue(contactValues.name);
    await expect(name).toBeFocused();
    const waiting = await readCaches(page);
    expect(Object.keys(waiting)).toEqual(
      expect.arrayContaining([
        oldPrecache,
        `eternal-rest-precache-${version}next`,
      ]),
    );
    expect(waiting[`eternal-rest-precache-${version}next`]).toEqual(
      before[oldPrecache],
    );

    // Once no page uses the old version, the new one activates and removes its caches.
    await page.close();
    const next = await context.newPage();
    await next.goto("/about.html");
    await expect
      .poll(async () =>
        Object.keys(await readCaches(next)).every((cache) =>
          cache.endsWith(`-${version}next`),
        ),
      )
      .toBe(true);
    expect(Object.keys(await readCaches(next))).toEqual(
      expect.arrayContaining([
        `eternal-rest-pages-${version}next`,
        `eternal-rest-precache-${version}next`,
      ]),
    );
    await next.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
    );
    await context.setOffline(true);
    await next.goto("/pricing.html");
    await expectOfflinePage(next, "/pricing.html");
  } finally {
    await context.close();
    await server.close();
  }
});
