/**
 * E2e tests — verify key user flows against the built app.
 * These run via Playwright against `npm run preview` (the production build).
 *
 * The production build uses paths.base = '/pokedex-glm-52-max' for GitHub Pages,
 * so all routes are prefixed with that base.
 */

import { test, expect } from "@playwright/test";

// The base path is set in vite.config.ts for production builds.
const BASE = "/pokedex-glm-52-max";

test.describe("Pokédex home", () => {
  test("renders the card grid with Pokémon", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector(".pokemon-card", { timeout: 20_000 });

    const cards = page.locator(".pokemon-card");
    await expect(cards).toHaveCount(30);

    // First card should be Bulbasaur (#0001).
    const firstName = await cards.first().locator(".name").textContent();
    expect(firstName?.toLowerCase()).toContain("bulbasaur");
  });

  test("search filters cards by name", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector(".pokemon-card", { timeout: 20_000 });

    await page.fill(".search-input", "pikachu");
    // Wait for debounce + filter.
    await page.waitForTimeout(1500);

    const cards = page.locator(".pokemon-card");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const name = await cards.first().locator(".name").textContent();
    expect(name?.toLowerCase()).toContain("pikachu");
  });

  test("type filter shows Pokémon of that type", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector(".pokemon-card", { timeout: 20_000 });

    await page.click('.type-chip:has-text("Fire")');
    await page.waitForTimeout(3000);

    const cards = page.locator(".pokemon-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);
  });

  test("clear filters restores results", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector(".pokemon-card", { timeout: 20_000 });

    await page.fill(".search-input", "xyznotapokemon");
    await page.waitForTimeout(1500);
    await expect(page.locator(".empty-state")).toBeVisible();

    await page.click(".clear-all");
    await page.waitForTimeout(1000);
    const cards = page.locator(".pokemon-card");
    await expect(cards.first()).toBeVisible();
  });
});

test.describe("Pokémon detail", () => {
  test("shows artwork, stats, abilities, and evolution", async ({ page }) => {
    await page.goto(`${BASE}/pokemon/charizard`);
    await page.waitForSelector(".detail-page", { timeout: 20_000 });

    // Hero section with name.
    await expect(page.locator("h1")).toContainText("Charizard");

    // Type badges.
    await expect(page.locator(".hero-badges .chip")).toHaveCount(2);

    // Stats section.
    await expect(page.locator(".stats-container")).toBeVisible();
    const statRows = page.locator(".stat-row");
    expect(await statRows.count()).toBeGreaterThanOrEqual(7); // 6 stats + total

    // Abilities.
    await expect(page.locator(".abilities-list")).toBeVisible();

    // Evolution chain.
    await expect(page.locator(".evo-chain")).toBeVisible();
  });

  test("favorite button persists in localStorage", async ({ page }) => {
    await page.goto(`${BASE}/pokemon/bulbasaur`);
    await page.waitForSelector(".detail-page", { timeout: 20_000 });

    // Click the favorite button on the detail page.
    await page.click('.detail-page .btn:has-text("Favorite")');
    // Wait for the button text to change to "Favorited".
    await expect(
      page.locator('.detail-page .btn:has-text("Favorited")')
    ).toBeVisible();
    await page.waitForTimeout(500);

    // Verify localStorage was updated.
    const stored = await page.evaluate(() =>
      localStorage.getItem("pokedex-favorites")
    );
    expect(stored).toContain("bulbasaur");
  });
});

test.describe("Berries", () => {
  test("shows the berry grid", async ({ page }) => {
    await page.goto(`${BASE}/berries`);
    await page.waitForSelector(".berry-card", { timeout: 20_000 });

    const cards = page.locator(".berry-card");
    expect(await cards.count()).toBeGreaterThan(10);
  });

  test("berry detail shows firmness and flavors", async ({ page }) => {
    await page.goto(`${BASE}/berries/sitrus`);
    await page.waitForSelector(".berry-hero", { timeout: 20_000 });

    await expect(page.locator("h1")).toContainText("Sitrus");
    await expect(page.locator(".stats-grid")).toBeVisible();
    await expect(page.locator(".flavors")).toBeVisible();
  });
});

test.describe("Favorites page", () => {
  test("shows empty state when no favorites", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector(".pokemon-card", { timeout: 20_000 });

    // Clear any existing favorites.
    await page.evaluate(() => localStorage.removeItem("pokedex-favorites"));

    await page.goto(`${BASE}/favorites`);
    await page.waitForTimeout(1000);
    await expect(page.locator(".empty-state")).toBeVisible();
  });
});

test.describe("Theme toggle", () => {
  test("toggles between light and dark", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForSelector(".pokemon-card", { timeout: 20_000 });

    const initialTheme = await page.evaluate(() =>
      document.documentElement.dataset.theme
    );

    await page.click('button[aria-label*="theme"]');
    await page.waitForTimeout(500);

    const newTheme = await page.evaluate(() =>
      document.documentElement.dataset.theme
    );

    expect(newTheme).not.toBe(initialTheme);
  });
});
