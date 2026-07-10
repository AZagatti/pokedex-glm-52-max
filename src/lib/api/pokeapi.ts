/**
 * PokeAPI client — native fetch + in-memory cache + zod validation.
 *
 * Every response is parsed through its zod schema so malformed data is caught at
 * the boundary rather than crashing the UI.
 */

import { getCached, getInflight, setCached, setInflight } from "./cache";
import {
  berryDetailSchema,
  berryListSchema,
  evolutionChainSchema,
  generationSchema,
  pokemonDetailSchema,
  pokemonListSchema,
  speciesSchema,
  typeSchema,
} from "./schemas";
import type {
  BerryDetail,
  BerryListResponse,
  EvolutionChain,
  Generation,
  PokemonDetail,
  PokemonListResponse,
  Species,
  TypeResponse,
} from "./schemas";

export const BASE_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 30;

/** Low-level cached fetch with request deduplication. */
async function cachedFetch<T>(url: string): Promise<T> {
  // 1. Synchronous cache hit.
  const cached = getCached<T>(url);
  if (cached !== undefined) {return cached;}

  // 2. Deduplicate in-flight requests.
  const existing = getInflight<T>(url);
  if (existing) {return existing;}

  // 3. Fire a new request, cache the promise so concurrent callers share it.
  const promise = setInflight(
    url,
    fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`PokeAPI ${res.status} for ${url}`);
      }
      return (await res.json()) as T;
    })
  );

  const data = await promise;
  setCached(url, data);
  return data;
}

/** Fetch + validate in one step. */
async function fetchValidated<T>(
  url: string,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const raw = await cachedFetch<unknown>(url);
  return schema.parse(raw);
}

// ---------------------------------------------------------------------------
// Pokémon
// ---------------------------------------------------------------------------

/** Fetch a page of the Pokédex list. */
export async function fetchPokemonPage(
  offset = 0,
  limit = PAGE_SIZE
): Promise<PokemonListResponse> {
  return fetchValidated(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    pokemonListSchema
  );
}

/** Fetch full detail for a single Pokémon (sprites, stats, types, abilities…). */
export async function fetchPokemonDetail(name: string): Promise<PokemonDetail> {
  return fetchValidated(`${BASE_URL}/pokemon/${name}`, pokemonDetailSchema);
}

// ---------------------------------------------------------------------------
// Species & evolution
// ---------------------------------------------------------------------------

/** Fetch species data (evolution chain URL, flavor text, genus). */
export async function fetchSpecies(name: string): Promise<Species> {
  return fetchValidated(`${BASE_URL}/pokemon-species/${name}`, speciesSchema);
}

/** Fetch the full evolution chain for a species. */
export async function fetchEvolutionChain(
  url: string
): Promise<EvolutionChain> {
  return fetchValidated(url, evolutionChainSchema);
}

// ---------------------------------------------------------------------------
// Generation & Type (filters)
// ---------------------------------------------------------------------------

/** Fetch a generation's Pokémon species list. */
export async function fetchGeneration(id: number): Promise<Generation> {
  return fetchValidated(`${BASE_URL}/generation/${id}`, generationSchema);
}

/** Fetch the Pokémon that have a given type. */
export async function fetchType(name: string): Promise<TypeResponse> {
  return fetchValidated(`${BASE_URL}/type/${name}`, typeSchema);
}

// ---------------------------------------------------------------------------
// Berries
// ---------------------------------------------------------------------------

/** Fetch a page of the berry list. */
export async function fetchBerryPage(
  offset = 0,
  limit = PAGE_SIZE
): Promise<BerryListResponse> {
  return fetchValidated(
    `${BASE_URL}/berry?limit=${limit}&offset=${offset}`,
    berryListSchema
  );
}

/** Fetch detail for a single berry. */
export async function fetchBerryDetail(name: string): Promise<BerryDetail> {
  return fetchValidated(`${BASE_URL}/berry/${name}`, berryDetailSchema);
}

/** Fetch the item sprite for a berry (for card images). */
export function berrySpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berry-${id > 64 ? id : `0${id}`}.png`;
}

/** Convert a berry name like "razz-berry" → "Razz Berry" for display. */
export function formatBerryName(name: string): string {
  return name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
