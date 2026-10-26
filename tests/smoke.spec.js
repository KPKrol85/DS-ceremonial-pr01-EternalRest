import { test, expect } from "@playwright/test";

test("mobile navigation isolates page content and restores it on every close path", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const button = page.locator("[data-menu-button]");
  const panel = page.locator("[data-menu-panel]");
  const navigation = page.getByRole("navigation", { name: "Główna" });
  const outsideContent = page.locator(
    ".skip-link, .site-header__brand, main, footer, [data-back-to-top]",
  );
  await expect(outsideContent).toHaveCount(5);

  // Native AX-tree inspection requires Chromium CDP. All engines run the DOM,
  // inert and focus checks below; those do not replace native AX-tree coverage.
  const accessibility =
    browserName === "chromium"
      ? await page.context().newCDPSession(page)
      : null;
  if (accessibility) await accessibility.send("Accessibility.enable");
  const expectBackgroundExposed = async (exposed) => {
    await expect
      .poll(async () => {
        const { nodes } = await accessibility.send(
          "Accessibility.getFullAXTree",
        );
        return [
          ["main"],
          ["contentinfo"],
          ["link", "Przejdź do treści"],
          ["link", "Eternal Rest DOM POGRZEBOWY"],
        ].map(([role, name]) =>
          nodes.some(
            (node) =>
              !node.ignored &&
              node.role?.value === role &&
              (!name || node.name?.value === name),
          ),
        );
      })
      .toEqual([exposed, exposed, exposed, exposed]);
  };

  const expectRestoredContent = async () => {
    for (const element of await outsideContent.all()) {
      await expect(element).not.toHaveAttribute("inert");
    }
    if (accessibility) await expectBackgroundExposed(true);
  };

  const expectClosedMenu = async () => {
    await expect(button).toHaveAccessibleName("Otwórz menu");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toBeHidden();
    await expectRestoredContent();
  };

  await expectClosedMenu();
  for (const closePath of [
    "button",
    "Escape",
    "outside click",
    "desktop resize",
  ]) {
    await test.step(`Close via ${closePath}`, async () => {
      // Make the focus-restoration origin explicit across pointer-focus defaults.
      await button.focus();
      await button.click();
      await expect(button).toHaveAccessibleName("Zamknij menu");
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(panel).toHaveAttribute("aria-hidden", "false");
      await expect(navigation).toBeVisible();
      const firstLink = navigation.getByRole("link").first();
      await expect(firstLink).toBeFocused();
      for (const element of await outsideContent.all()) {
        await expect(element).toHaveJSProperty("inert", true);
      }
      if (accessibility) await expectBackgroundExposed(false);
      // Inert background links must reject focus, independently of the Tab trap.
      for (const selector of [
        ".skip-link",
        ".site-header__brand",
        "footer a",
      ]) {
        await page
          .locator(selector)
          .first()
          .evaluate((element) => element.focus());
        await expect(firstLink).toBeFocused();
      }
      // Neither active menu control may inherit inert from an ancestor.
      for (const element of [button, panel]) {
        expect(
          await element.evaluate((node) => node.closest("[inert]")),
        ).toBeNull();
      }

      // The menu button participates in both directions of the existing Tab cycle.
      await page.keyboard.press("Shift+Tab");
      await expect(button).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(
        panel.getByRole("button", { name: "Tryb systemowy" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(button).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(firstLink).toBeFocused();

      if (closePath === "desktop resize") {
        await page.setViewportSize({ width: 1152, height: 844 });
        await expect(button).toHaveAttribute("aria-label", "Otwórz menu");
        await expect(button).toHaveAttribute("aria-expanded", "false");
        await expect(button).toBeHidden();
        await expect(panel).toHaveAttribute("aria-hidden", "false");
        await expect(navigation).toBeVisible();
        await expect(firstLink).toBeFocused();
        await expectRestoredContent();
        await page.setViewportSize({ width: 390, height: 844 });
      } else {
        if (closePath === "button") {
          await button.click();
        } else if (closePath === "Escape") {
          await page.keyboard.press("Escape");
        } else {
          // The overlay fills the viewport; dispatch an outside click to test its handler.
          await page.locator("[data-site-header]").dispatchEvent("click");
        }
        await expect(button).toBeFocused();
      }
      await expectClosedMenu();
    });
  }

  // A new interaction after resizing must preserve an existing inert attribute exactly.
  const footer = page.locator("footer");
  await footer.evaluate((element) => element.setAttribute("inert", "original"));
  await button.focus();
  await button.click();
  await expect(button).toHaveAccessibleName("Zamknij menu");
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link").first()).toBeFocused();
  for (const element of await outsideContent.all()) {
    await expect(element).toHaveJSProperty("inert", true);
  }
  if (accessibility) await expectBackgroundExposed(false);
  await page.keyboard.press("Escape");
  await expect(footer).toHaveAttribute("inert", "original");
  await footer.evaluate((element) => element.removeAttribute("inert"));
  await expectClosedMenu();
  await expect(button).toBeFocused();
});

// The head initializer of partials/disclosure-init.html, not the application module.
const APP_MODULE = /\/(?:js\/main|assets\/main-[\w-]+)\.js$/;
const DARK_BACKGROUND = "rgb(20, 18, 16)";

test("stored dark theme applies before the application module runs", async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: "light" });
  await context.addInitScript(() => {
    localStorage.setItem(
      "eternalRestTheme",
      JSON.stringify({ version: 1, mode: "dark" }),
    );
  });
  const page = await context.newPage();
  // With the module aborted, every observed state predates it, as after a failed load.
  await page.route(APP_MODULE, (route) => route.abort("failed"));
  await page.goto("/");

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(root).toHaveCSS("color-scheme", "dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    DARK_BACKGROUND,
  );
  // The disclosure fallback still reacts to the failed module load.
  await expect(root).toHaveClass("no-js");
  await context.close();
});

test("theme controls persist explicit modes and restore the system scheme", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const root = page.locator("html");
  const toggle = page.locator("[data-theme-toggle]");
  const auto = page.locator("[data-theme-auto]");
  const storedTheme = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("eternalRestTheme")));
  const expectTheme = async (mode, scheme = mode) => {
    if (mode === "auto") {
      await expect(root).not.toHaveAttribute("data-theme");
    } else {
      await expect(root).toHaveAttribute("data-theme", mode);
    }
    await expect(root).toHaveCSS(
      "color-scheme",
      mode === "auto" ? "light dark" : mode,
    );
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      scheme === "dark" ? DARK_BACKGROUND : "rgb(246, 240, 232)",
    );
    await expect(toggle).toHaveAccessibleName(
      scheme === "dark" ? "Włącz jasny motyw" : "Włącz ciemny motyw",
    );
    await expect(toggle).toHaveAttribute("data-theme", scheme);
    await expect(auto).toHaveAttribute("aria-pressed", String(mode === "auto"));
  };

  await expectTheme("auto", "light");
  await expect.poll(storedTheme).toBeNull();

  await toggle.click();
  await expectTheme("dark");
  await expect.poll(storedTheme).toEqual({ version: 1, mode: "dark" });
  await page.reload();
  await expectTheme("dark");
  await expect.poll(storedTheme).toEqual({ version: 1, mode: "dark" });

  await toggle.click();
  await expectTheme("light");
  await expect.poll(storedTheme).toEqual({ version: 1, mode: "light" });
  await page.emulateMedia({ colorScheme: "dark" });
  await expectTheme("light");

  await auto.click();
  await expectTheme("auto", "dark");
  await expect.poll(storedTheme).toEqual({ version: 1, mode: "auto" });
  await page.emulateMedia({ colorScheme: "light" });
  await expectTheme("auto", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectTheme("auto", "dark");
  await expect.poll(storedTheme).toEqual({ version: 1, mode: "auto" });
});

test("FAQ expands and collapses the same answer", async ({ page }) => {
  await page.goto("/guide.html");

  const question = page.getByRole("button", {
    name: "Jakie dokumenty są potrzebne do rozpoczęcia formalności?",
  });
  const answer = page.locator("#faq-1");
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await expect(answer).toBeHidden();
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(answer).toBeVisible();
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await expect(answer).toBeHidden();
});

test("pricing filter shows the selected category and announces results", async ({
  page,
}) => {
  await page.goto("/pricing.html");

  const filter = page.getByLabel("Filtruj według rodzaju ceremonii");
  const traditional = page.locator(
    '[data-pricing-card][data-category="tradycyjna"]',
  );
  const secular = page.locator('[data-pricing-card][data-category="swiecka"]');
  const family = page.locator('[data-pricing-card][data-category="rodzinna"]');
  const status = page.getByRole("status");
  await expect(page.locator("[data-pricing-card]")).toHaveCount(3);
  await expect(traditional).toBeVisible();
  await expect(secular).toBeVisible();
  await expect(family).toBeVisible();

  await filter.selectOption({ label: "Ceremonia świecka" });
  await expect(secular).toBeVisible();
  await expect(traditional).toBeHidden();
  await expect(family).toBeHidden();
  await expect(status).toHaveAttribute("aria-live", "polite");
  await expect(status).toHaveText("Wyświetlane pakiety: 1 z 3");

  await filter.selectOption({ label: "Wszystkie pakiety" });
  await expect(traditional).toBeVisible();
  await expect(secular).toBeVisible();
  await expect(family).toBeVisible();
  await expect(status).toHaveText("Wyświetlane pakiety: 3 z 3");
});

test("pricing details expand and collapse independently", async ({ page }) => {
  await page.goto("/pricing.html");

  const buttons = page.locator("[data-details-toggle]");
  await expect(buttons).toHaveCount(3);
  const packages = [];
  for (const button of await buttons.all()) {
    const panelId = await button.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toHaveCount(1);
    packages.push({ button, panel });
  }

  const expectExpandedPackages = async (expandedIndexes) => {
    for (const [index, { button, panel }] of packages.entries()) {
      const expanded = expandedIndexes.includes(index);
      await expect(button).toHaveAttribute("aria-expanded", String(expanded));
      await expect(button).toHaveAccessibleName(
        expanded ? "Ukryj szczegóły" : "Pokaż szczegóły",
      );
      await expect(panel).toHaveJSProperty("hidden", !expanded);
      if (expanded) {
        await expect(panel).toBeVisible();
      } else {
        await expect(panel).toBeHidden();
      }
    }
  };

  await expectExpandedPackages([]);
  await packages[0].button.click();
  await expectExpandedPackages([0]);
  await packages[1].button.click();
  await expectExpandedPackages([0, 1]);
  await packages[0].button.click();
  await expectExpandedPackages([1]);
  await packages[1].button.click();
  await expectExpandedPackages([]);
});

test("empty contact submission focuses the first error", async ({ page }) => {
  await page.goto("/contact.html");

  await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();
  for (const id of ["name", "email", "phone", "topic", "message"]) {
    await expect(page.locator(`#${id}`)).toHaveValue("");
    await expect(page.locator(`#${id}`)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator(`#error-${id}`)).toBeVisible();
    await expect(page.locator(`#error-${id}`)).toHaveText(
      "To pole jest wymagane.",
    );
  }
  await expect(page.getByLabel("Imię i nazwisko")).toBeFocused();
  await expect(page.locator("[data-form-success]")).toBeHidden();
  await expect(page).toHaveURL("/contact.html");
});

// Submissions are intercepted in the browser, so tests never reach Netlify.
const isSubmission = (url) => url.pathname === "/";
const contactValues = {
  name: "Jan Testowy",
  email: "jan.testowy@example.com",
  phone: "+48 000 000 000",
  topic: "Nowa strona internetowa",
  message: "Wiadomość testowa.",
};

const fillContactForm = async (page) => {
  await page.getByLabel("Imię i nazwisko").fill(contactValues.name);
  await page.getByLabel("Adres e-mail").fill(contactValues.email);
  await page.getByLabel("Telefon kontaktowy").fill(contactValues.phone);
  await page
    .getByLabel("Temat zapytania")
    .selectOption({ label: contactValues.topic });
  await page.getByLabel("Treść wiadomości").fill(contactValues.message);
};

const expectContactValues = async (page) => {
  for (const [id, value] of Object.entries(contactValues)) {
    await expect(page.locator(`#${id}`)).toHaveValue(value);
  }
};

test("valid contact submission posts once and confirms after success", async ({
  page,
}) => {
  const requests = [];
  let releaseResponse;
  const responseReleased = new Promise((resolve) => {
    releaseResponse = resolve;
  });
  await page.route(isSubmission, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    requests.push(route.request());
    await responseReleased;
    await route.fulfill({ status: 200, contentType: "text/html", body: "" });
  });
  await page.goto("/contact.html");

  const form = page.locator("[data-validate-form]");
  const success = page.locator("[data-form-success]");
  await expect(form).toHaveAttribute("name", "kontakt-kp-code");
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form).toHaveAttribute("data-netlify", "true");
  await expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");
  const honeypot = form.locator('input[name="bot-field"]');
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).toBeHidden();
  await expect(honeypot).toHaveValue("");
  await fillContactForm(page);
  await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();

  const pending = page.getByRole("button", { name: "Wysyłanie…" });
  await expect(pending).toHaveAttribute("aria-disabled", "true");
  await expect(form).toHaveAttribute("aria-busy", "true");
  await expect(success).toBeHidden();
  await pending.click({ force: true });
  await page.getByLabel("Adres e-mail").press("Enter");
  await expect.poll(() => requests.length).toBe(1);

  const [request] = requests;
  expect(request.method()).toBe("POST");
  expect(request.headers()["content-type"]).toBe(
    "application/x-www-form-urlencoded",
  );
  expect(
    Object.fromEntries(new URLSearchParams(request.postData() ?? "")),
  ).toEqual({
    "form-name": "kontakt-kp-code",
    "bot-field": "",
    ...contactValues,
  });

  releaseResponse();
  await expect(success).toBeVisible();
  await expect(success).toBeFocused();
  await expect(success).toHaveText(
    "Dziękujemy. Wiadomość została wysłana do KP_Code Digital Studio.",
  );
  await expect(page.locator("[data-form-failure]")).toBeHidden();
  await expect(form).toHaveAttribute("aria-busy", "false");
  await expect(
    page.getByRole("button", { name: "Wyślij zgłoszenie" }),
  ).toHaveAttribute("aria-disabled", "false");
  for (const id of Object.keys(contactValues)) {
    await expect(page.locator(`#${id}`)).toHaveValue("");
  }
  expect(requests).toHaveLength(1);
});

test("failed contact submissions keep values and announce the error", async ({
  page,
}) => {
  let attempts = 0;
  await page.route(isSubmission, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    attempts += 1;
    if (attempts === 1) {
      await route.abort("failed");
    } else {
      await route.fulfill({ status: 500, contentType: "text/html", body: "" });
    }
  });
  await page.goto("/contact.html");

  const submit = page.getByRole("button", { name: "Wyślij zgłoszenie" });
  const success = page.locator("[data-form-success]");
  const failure = page.locator("[data-form-failure]");
  await fillContactForm(page);

  // Network failure.
  await submit.click();
  await expect(failure).toBeVisible();
  await expect(failure).toBeFocused();
  await expect(failure).toHaveAttribute("role", "alert");
  await expect(failure).toContainText("Nie udało się wysłać wiadomości.");
  await expect(success).toBeHidden();
  await expect(submit).toHaveAttribute("aria-disabled", "false");
  await expectContactValues(page);

  // HTTP 500 on retry.
  await submit.click();
  await expect.poll(() => attempts).toBe(2);
  await expect(failure).toBeVisible();
  await expect(failure).toBeFocused();
  await expect(success).toBeHidden();
  await expect(submit).toHaveAttribute("aria-disabled", "false");
  await expectContactValues(page);
});

// Without main.js the browser posts the form natively to the page that holds it.
const isNativeSubmission = (url) => url.pathname === "/contact.html";

test("invalid contact e-mail keeps the custom error instead of native validation", async ({
  page,
}) => {
  const requests = [];
  await page.route(
    (url) => isSubmission(url) || isNativeSubmission(url),
    async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      requests.push(route.request());
      await route.fulfill({ status: 200, contentType: "text/html", body: "" });
    },
  );
  await page.goto("/contact.html");

  const form = page.locator("[data-validate-form]");
  const email = page.getByLabel("Adres e-mail");
  // main.js replaces native validation and the fallback notice once its handler is attached.
  await expect(form).toHaveAttribute("novalidate", "");
  await expect(page.locator("[data-form-fallback]")).toBeHidden();
  await fillContactForm(page);
  await email.fill("jan.testowy");
  await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();

  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#error-email")).toHaveText(
    "Podaj poprawny adres e-mail.",
  );
  await expect(email).toBeFocused();
  for (const id of ["name", "phone", "topic", "message"]) {
    await expect(page.locator(`#${id}`)).not.toHaveAttribute("aria-invalid");
  }
  await expect(page).toHaveURL("/contact.html");
  expect(requests).toHaveLength(0);
});

const routeNativeSubmissions = async (page) => {
  const requests = [];
  await page.route(isNativeSubmission, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    requests.push(route.request());
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<p>Potwierdzenie testowe</p>",
    });
  });
  return requests;
};

const expectNativeContactSubmission = async (page, requests) => {
  const form = page.locator("[data-validate-form]");
  const fallback = page.locator("[data-form-fallback]");
  const submit = page.getByRole("button", { name: "Wyślij zgłoszenie" });
  const email = page.getByLabel("Adres e-mail");
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText(
    "Formularz zostanie wysłany bezpośrednio przez przeglądarkę",
  );
  await expect(
    fallback.getByRole("link", { name: "kontakt@kp-code.pl" }),
  ).toHaveAttribute("href", "mailto:kontakt@kp-code.pl");
  await expect(
    fallback.getByRole("link", { name: "+48 533 537 091" }),
  ).toHaveAttribute("href", "tel:+48533537091");
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form).not.toHaveAttribute("novalidate");
  await expect(form).not.toHaveAttribute("inert");

  // Required fields block the submission, and the browser focuses the first one.
  await submit.click();
  await expect(page.getByLabel("Imię i nazwisko")).toBeFocused();
  for (const id of Object.keys(contactValues)) {
    await expect(page.locator(`#${id}:invalid`)).toHaveCount(1);
  }

  // So does an e-mail address in the wrong format.
  await fillContactForm(page);
  await email.fill("jan.testowy");
  await submit.click();
  await expect(email).toBeFocused();
  await expect(page.locator("#email:invalid")).toHaveCount(1);
  for (const id of ["name", "phone", "topic", "message"]) {
    await expect(page.locator(`#${id}:valid`)).toHaveCount(1);
  }
  expect(requests).toHaveLength(0);

  await email.fill(contactValues.email);
  await submit.click();
  await expect(page.getByText("Potwierdzenie testowe")).toBeVisible();
  // The values travel in the POST body only, never in the URL.
  await expect(page).toHaveURL("/contact.html");
  expect(requests).toHaveLength(1);

  const [request] = requests;
  expect(request.method()).toBe("POST");
  expect(new URL(request.url()).search).toBe("");
  expect(request.headers()["content-type"]).toBe(
    "application/x-www-form-urlencoded",
  );
  expect(
    Object.fromEntries(new URLSearchParams(request.postData() ?? "")),
  ).toEqual({
    "form-name": "kontakt-kp-code",
    "bot-field": "",
    ...contactValues,
  });
};

test("contact form validates and posts natively without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const requests = await routeNativeSubmissions(page);
  await page.goto("/contact.html");

  await expect(page.locator("html")).toHaveClass("no-js");
  await expectNativeContactSubmission(page, requests);
  await context.close();
});

test("contact form submits natively when the application module fails", async ({
  page,
}) => {
  await page.route(APP_MODULE, (route) => route.abort("failed"));
  const requests = await routeNativeSubmissions(page);
  await page.goto("/contact.html");

  // The disclosure fallback has reacted to the failed module load.
  await expect(page.locator("html")).toHaveClass("no-js");
  await expectNativeContactSubmission(page, requests);
});

test("404 page resolves assets and navigation at a nested unknown URL", async ({
  page,
  browser,
}) => {
  const document = await page.request.get("/404.html");
  expect(document.status()).toBe(200);
  const html = await document.text();
  const missingPath = "/missing/nested/page/";
  // Simulate the hosting response; Vite Preview is not a Netlify routing test.
  const serveMissingPage = (route) =>
    route.fulfill({ status: 404, contentType: "text/html", body: html });
  await page.route(`**${missingPath}`, serveMissingPage);

  const failedAssets = [];
  const loadedTypes = new Set();
  const assetTypes = new Set(["stylesheet", "script", "image", "font"]);
  page.on("response", (response) => {
    const type = response.request().resourceType();
    if (!assetTypes.has(type)) return;
    loadedTypes.add(type);
    if (!response.ok()) failedAssets.push(response.url());
  });
  page.on("requestfailed", (request) => {
    if (assetTypes.has(request.resourceType()))
      failedAssets.push(request.url());
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "light" });

  for (const path of ["/404.html", missingPath]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(path === missingPath ? 404 : 200);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl");
    await expect(page).toHaveTitle(/404/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Nie znaleziono strony",
    );
    await expect(page.getByRole("main")).toContainText("404");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    // These assertions require both the stylesheet and shared module to load.
    await expect(page.locator("html")).not.toHaveClass(/no-js|js-pending/);
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(246, 240, 232)",
    );
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page
        .locator("img")
        .evaluateAll((images) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    ).toBe(true);
    // Check all shared header/footer links, including service fragments.
    expect(
      await page
        .locator("a[href]")
        .evaluateAll((links) =>
          links
            .filter((link) => link.origin === location.origin)
            .every((link) => !link.pathname.startsWith("/missing/")),
        ),
    ).toBe(true);
    await expect(
      page
        .getByRole("main")
        .getByRole("link", { name: "Wróć na stronę główną" }),
    ).toHaveJSProperty("href", new URL("/index.html", page.url()).href);
  }

  expect([...loadedTypes]).toEqual(
    expect.arrayContaining(["stylesheet", "script", "font"]),
  );
  expect(failedAssets).toEqual([]);
  expect(errors).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Przejdź do treści" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/404\.html#main$/);
  await expect(page.getByRole("main")).toBeFocused();
  await page
    .getByRole("main")
    .getByRole("link", { name: "Wróć na stronę główną" })
    .click();
  await expect(page).toHaveURL(/\/index\.html$/);

  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const fallback = await context.newPage();
    await fallback.route(`**${missingPath}`, serveMissingPage);
    expect(
      (await fallback.goto(new URL(missingPath, page.url()).href)).status(),
    ).toBe(404);
    await expect(fallback.getByRole("heading", { level: 1 })).toHaveText(
      "Nie znaleziono strony",
    );
    await fallback.keyboard.press("Tab");
    await fallback.keyboard.press("Enter");
    await expect(fallback).toHaveURL(/\/404\.html#main$/);
    await expect(fallback.getByRole("main")).toBeFocused();
    await fallback
      .getByRole("main")
      .getByRole("link", { name: "Wróć na stronę główną" })
      .click();
    await expect(fallback).toHaveURL(/\/index\.html$/);
  } finally {
    await context.close();
  }
});
