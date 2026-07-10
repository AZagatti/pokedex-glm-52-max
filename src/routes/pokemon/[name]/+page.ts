/**
 * Pokémon detail page load — fetches detail, species, and evolution chain.
 * These three calls have a dependency: species → evolution_chain URL.
 *
 * Dynamic route — renders client-side (SPA mode). Not prerendered.
 */

export const prerender = false;

import {
  fetchPokemonDetail,
  fetchSpecies,
  fetchEvolutionChain,
} from "$lib/api/pokeapi";
import { error } from "@sveltejs/kit";

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const name = params.name.toLowerCase();

  try {
    const detail = await fetchPokemonDetail(name);

    // Species + evolution chain. These can fail independently; degrade gracefully.
    let species = null;
    let evolution = null;
    try {
      species = await fetchSpecies(detail.species.name);
      if (species.evolution_chain?.url) {
        evolution = await fetchEvolutionChain(species.evolution_chain.url);
      }
    } catch {
      // Non-critical — detail page still works without species/evolution.
    }

    return { detail, evolution, species };
  } catch {
    throw error(404, `Pokémon "${name}" not found`);
  }
};
