import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:8182";

export default defineConfig({
  testDir: "./tests",
  testMatch: "smoke.spec.js",
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: "list",
  use: {
    baseURL,
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 8182 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
