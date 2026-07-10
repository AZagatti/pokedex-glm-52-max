/**
 * Theme store — 'light' | 'dark' writable, persisted to localStorage.
 *
 * The initial theme is applied inline in app.html before hydration to prevent
 * FOUC. This store syncs subsequent toggles back to localStorage + the DOM.
 */

import { browser } from "$app/environment";
import { writable, get } from "svelte/store";

const STORAGE_KEY = "pokedex-theme";

export type Theme = "light" | "dark";

function loadInitial(): Theme {
  if (!browser) {return "light";}
  // Read what app.html already set on <html>.
  const attr = document.documentElement.dataset.theme as Theme | null;
  return attr ?? "light";
}

function createTheme() {
  const { subscribe, set } = writable<Theme>(loadInitial());

  function apply(theme: Theme) {
    set(theme);
    if (browser) {
      // Disable transitions during the switch to avoid animated flashes (emil).
      document.body.classList.add("theme-transitioning");
      document.documentElement.dataset.theme = theme;
      localStorage.setItem(STORAGE_KEY, theme);
      requestAnimationFrame(() => {
        document.body.classList.remove("theme-transitioning");
      });
    }
  }

  return {
    set: apply,
    subscribe,
    toggle() {
      const current = get({ subscribe }) as Theme;
      apply(current === "dark" ? "light" : "dark");
    },
  };
}

export const theme = createTheme();
