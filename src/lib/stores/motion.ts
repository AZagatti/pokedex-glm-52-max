/**
 * Motion preference store — tracks whether the user prefers reduced motion.
 * Used to gate JS-driven animations.
 */

import { browser } from "$app/environment";
import { readable } from "svelte/store";

export const reducedMotion = readable(false, (set) => {
  if (!browser || !("matchMedia" in window)) {return;}

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  set(mq.matches);

  const handler = (e: MediaQueryListEvent) => set(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
});
