import { writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// WCAG 2.0, 2.1 and 2.2 level A and AA rules. axe-core 4.14 has no wcag22a rules,
// and its default exclusion of experimental and deprecated rules still applies.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const PAGES = [
  "index.html",
  "about.html",
  "services.html",
  "pricing.html",
  "guide.html",
  "contact.html",
  "terms.html",
  "privacy.html",
  "cookies.html",
  "404.html",
];

// One block per violated rule: impact, summary, guidance and every affected node.
const formatViolations = ({ testEngine, url, violations }, scope, file) =>
  [
    `${violations.length} axe-core ${testEngine.version} WCAG A/AA rule violation(s) on ${url} (scope: ${scope}):`,
    ...violations.flatMap(({ id, impact, help, helpUrl, nodes }) => [
      "",
      `${id} [${impact}] ${help} (${nodes.length} node(s))`,
      `  ${helpUrl}`,
      ...nodes.map(
        ({ target, failureSummary }) =>
          `  - ${target.join(" ")}: ${failureSummary.replace(/\s*\n\s*/g, " ")}`,
      ),
    ]),
    "",
    `Full results: ${file}`,
  ].join("\n");

// Records violations and needs-review results, then fails on any violation.
const scan = async (page, testInfo, scope) => {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (scope) builder.include(scope);
  const results = await builder.analyze();
  const { testEngine, toolOptions, url, violations, incomplete } = results;
  const file = testInfo.outputPath("axe-results.json");
  await writeFile(
    file,
    JSON.stringify(
      { testEngine, toolOptions, url, scope, violations, incomplete },
      null,
      2,
    ),
  );
  expect(
    violations.length,
    formatViolations(results, scope ?? "document", relative(".", file)),
  ).toBe(0);
};

// Waits until main.js has applied the selected theme and the fonts have loaded.
const openPage = async (page, path, theme) => {
  const response = await page.goto(path);
  const root = page.locator("html");
  await expect(root).toContainClass("js");
  await expect(root).toHaveAttribute("data-theme", theme);
  await expect(page.locator("[data-theme-toggle]")).toHaveAttribute(
    "data-theme",
    theme,
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return response;
};

// Opens each disclosure with its own button and waits for its panel.
const expandAll = async (page, triggers, count) => {
  await expect(triggers).toHaveCount(count);
  for (const trigger of await triggers.all()) {
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panelId = await trigger.getAttribute("aria-controls");
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
  }
};

for (const theme of ["light", "dark"]) {
  test.describe(`${theme} theme`, () => {
    // The system scheme and the stored preference both select the theme.
    test.use({ colorScheme: theme });
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((mode) => {
        localStorage.setItem(
          "eternalRestTheme",
          JSON.stringify({ version: 1, mode }),
        );
      }, theme);
    });

    for (const path of PAGES) {
      test(path, async ({ page }, testInfo) => {
        await openPage(page, `/${path}`, theme);
        await scan(page, testInfo);
      });
    }

    test("open mobile navigation", async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openPage(page, "/index.html", theme);
      const button = page.locator("[data-menu-button]");
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(
        page.getByRole("navigation", { name: "Główna" }),
      ).toBeVisible();
      await scan(page, testInfo, "[data-site-header]");
    });

    test("expanded guide FAQ answers", async ({ page }, testInfo) => {
      await openPage(page, "/guide.html", theme);
      await expandAll(page, page.locator("[data-accordion-trigger]"), 4);
      await scan(page, testInfo, "[data-accordion]");
    });

    test("expanded pricing package details", async ({ page }, testInfo) => {
      await openPage(page, "/pricing.html", theme);
      await expandAll(page, page.locator("[data-details-toggle]"), 3);
      await scan(page, testInfo, "[data-pricing-card]");
    });

    test("contact form with required-field errors", async ({
      page,
    }, testInfo) => {
      // An empty submission must not leave the browser; any POST is aborted.
      const submissions = [];
      await page.route("**/*", (route) => {
        if (route.request().method() !== "POST") return route.fallback();
        submissions.push(route.request().url());
        return route.abort();
      });
      await openPage(page, "/contact.html", theme);
      const form = page.locator("[data-validate-form]");
      // main.js replaces native validation once its handler is attached.
      await expect(form).toHaveAttribute("novalidate", "");
      await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();
      await expect(form.locator('[aria-invalid="true"]')).toHaveCount(5);
      await expect(page.getByLabel("Imię i nazwisko")).toBeFocused();
      expect(submissions).toEqual([]);
      await scan(page, testInfo, "[data-validate-form]");
    });

    test("404 page at a nested unknown URL with the skip link focused", async ({
      page,
    }, testInfo) => {
      const missingPath = "/missing/nested/page/";
      const html = await (await page.request.get("/404.html")).text();
      // Simulate the hosting response; Vite Preview has no 404 routing.
      await page.route(`**${missingPath}`, (route) =>
        route.fulfill({ status: 404, contentType: "text/html", body: html }),
      );
      const response = await openPage(page, missingPath, theme);
      expect(response.status()).toBe(404);
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: "Przejdź do treści" }),
      ).toBeFocused();
      await scan(page, testInfo);
    });
  });
}
