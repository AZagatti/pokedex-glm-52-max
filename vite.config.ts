import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      // Set the base path for GitHub Pages project sites.
      // `import.meta.env.DEV` is true during `vite dev`, so base is '/' locally
      // and '/pokedex-glm-52-max' on the built/deployed site.
      paths: {
        base:
          process.env.NODE_ENV === "production" ? "/pokedex-glm-52-max" : "",
      },
      adapter: adapter({
        // SPA mode for GitHub Pages — dynamic routes render client-side.
        fallback: "404.html",
      }),
    }),
  ],
  resolve: {
    // Ensure .svelte.ts files (runes modules) resolve correctly in SSR.
    extensions: [
      ".svelte.ts",
      ".mjs",
      ".js",
      ".mts",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
      ".svelte",
    ],
  },
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "client",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium", headless: true }],
          },
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"],
        },
      },
      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
        },
      },
    ],
  },
});
