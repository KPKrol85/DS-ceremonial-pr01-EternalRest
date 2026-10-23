import { test, expect } from "@playwright/test";

test("mobile navigation closes with Escape and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const button = page.getByRole("button", { name: "Otwórz menu" });
  const panel = page.locator("[data-menu-panel]");
  const navigation = page.getByRole("navigation", { name: "Główna" });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
  await expect(panel).toBeHidden();

  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toHaveAttribute("aria-hidden", "false");
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link").first()).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("aria-hidden", "true");
  await expect(panel).toBeHidden();
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
