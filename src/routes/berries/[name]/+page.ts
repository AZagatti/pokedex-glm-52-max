/**
 * Berry detail page load.
 * Dynamic route — renders client-side (SPA mode). Not prerendered.
 */

export const prerender = false;

import { fetchBerryDetail } from "$lib/api/pokeapi";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const name = params.name.toLowerCase();
  try {
    const berry = await fetchBerryDetail(name);
    return { berry };
  } catch {
    throw error(404, `Berry "${name}" not found`);
  }
};
