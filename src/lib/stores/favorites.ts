/**
 * Favorites store — a Svelte writable store backed by localStorage.
 *
 * Per spec: "State: Svelte 5 runes + a couple of stores; favorites + theme
 * persisted to localStorage." This is the "couple of stores" — a classic writable
 * so components can auto-subscribe with $favorites.
 */

import { browser } from "$app/environment";
import { writable } from "svelte/store";

const STORAGE_KEY = "pokedex-favorites";

function loadInitial(): string[] {
  if (!browser) {return [];}
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function createFavorites() {
  const { subscribe, update, set } = writable<string[]>(loadInitial());

  function persist(value: string[]) {
    if (!browser) {return;}
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Storage full or blocked — silently ignore (favorites are best-effort).
    }
  }

  return {
    subscribe,
    toggle(name: string) {
      update((items) => {
        const next = items.includes(name)
          ? items.filter((n) => n !== name)
          : [...items, name];
        persist(next);
        return next;
      });
    },
    add(name: string) {
      update((items) => {
        if (items.includes(name)) {return items;}
        const next = [...items, name];
        persist(next);
        return next;
      });
    },
    remove(name: string) {
      update((items) => {
        const next = items.filter((n) => n !== name);
        persist(next);
        return next;
      });
    },
    has(name: string): boolean {
      let result = false;
      subscribe((items) => (result = items.includes(name)))();
      return result;
    },
    // Allow restoring (used in tests).
    _set: set,
  };
}

export const favorites = createFavorites();
