import { defineConfig } from "@playwright/test";
import smokeConfig from "./playwright.config.js";

// The accessibility baseline reuses the smoke-test server, timeouts and browser
// options, but runs only its own suite, only in Chromium, and keeps the per-scan
// axe results in the Git-ignored reports/ directory.
export default defineConfig({
  ...smokeConfig,
  testMatch: "accessibility.spec.js",
  outputDir: "reports/accessibility",
  projects: smokeConfig.projects.filter(({ name }) => name === "chromium"),
});
