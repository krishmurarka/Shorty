import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3100",
    browserName: "chromium",
    ...(process.platform === "win32" ? { channel: "chrome" } : {}),
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/fixtures/auth-server.mjs",
      url: "http://127.0.0.1:3201/health",
    },
    {
      command: "npm run dev -- --port 3100",
      url: "http://localhost:3100",
      env: {
        SHORTY_TEST_BUILD: "1",
        NEON_AUTH_BASE_URL: "http://127.0.0.1:3201/auth",
        NEON_AUTH_COOKIE_SECRET: "shorty-test-secret-for-isolated-browser-tests-only",
      },
      timeout: 120_000,
    },
  ],
});
