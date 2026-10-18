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
