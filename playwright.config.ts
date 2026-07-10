import { defineConfig } from "@playwright/test";

export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  testMatch: ["**/*.e2e.{ts,js}", "tests/**/*.spec.ts"],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4173",
    // The production build uses paths.base = '/pokedex-glm-52-max'.
    actionTimeout: 10_000,
  },
  webServer: {
    command: "npm run build && npm run preview",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
