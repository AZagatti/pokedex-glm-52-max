/**
 * Berries list page load — fetches all berries (there are only ~68).
 */

import { fetchBerryPage } from "$lib/api/pokeapi";

import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
  // Load all berries in one go (only ~68 total).
  const all = await fetchBerryPage(0, 200);
  return { berries: all.results, totalCount: all.count };
};
