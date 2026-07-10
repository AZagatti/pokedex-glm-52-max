/**
 * Home page load — fetches the first page of Pokémon list + all 18 types.
 * The list page uses this initial data, then infinite-scrolls for more.
 */

import { fetchPokemonPage, fetchType } from "$lib/api/pokeapi";
import { ALL_TYPES } from "$lib/api/types";

import type { PageLoad } from "./$types";

const PAGE_SIZE = 30;

export const load: PageLoad = async () => {
  // First page of Pokémon + the total count (for pagination math).
  const firstPage = await fetchPokemonPage(0, PAGE_SIZE);

  // Preload all type lists in parallel for the type filter.
  // This is ~18 small requests; cached for the session.
  const types = await Promise.all(
    ALL_TYPES.map((t) => fetchType(t).catch(() => null))
  );

  return {
    firstPage,
    pageSize: PAGE_SIZE,
    totalCount: firstPage.count,
    types: types.filter((t) => t !== null),
  };
};
