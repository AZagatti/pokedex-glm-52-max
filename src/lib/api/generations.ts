/**
 * Generation data — range of Pokédex IDs per generation, for client-side filtering.
 * These ranges let us filter the list without a round-trip when we already have data.
 * Used both for display labels and for the generation filter.
 */

export const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const GENERATION_LABELS: Record<number, string> = {
  1: "Gen I — Kanto",
  2: "Gen II — Johto",
  3: "Gen III — Hoenn",
  4: "Gen IV — Sinnoh",
  5: "Gen V — Unova",
  6: "Gen VI — Kalos",
  7: "Gen VII — Alola",
  8: "Gen VIII — Galar",
  9: "Gen IX — Paldea",
};

/**
 * Pokédex ID ranges per generation.
 * Source: https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_National_Pokédex_number
 */
export const GENERATION_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};

/** Check which generation a Pokédex ID belongs to. */
export function idToGeneration(id: number): number | null {
  for (const [gen, [min, max]] of Object.entries(GENERATION_RANGES)) {
    if (id >= min && id <= max) {return Number(gen);}
  }
  return null;
}

/** Get the ID range for a generation. */
export function generationRange(gen: number): [number, number] | null {
  return GENERATION_RANGES[gen] ?? null;
}
