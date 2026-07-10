import { z } from "zod";

/** NamedReference — PokeAPI's ubiquitous { name, url } shape. */
const namedRef = z.object({
  name: z.string(),
  url: z.string().url(),
});

/** Pokémon list endpoint — /pokemon?limit=&offset= */
export const pokemonListSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(namedRef),
});

/** Type reference on a Pokémon detail. */
const typeSlotSchema = z.object({
  slot: z.number(),
  type: namedRef,
});

/** Ability reference on a Pokémon detail. */
const abilitySlotSchema = z.object({
  ability: namedRef,
  is_hidden: z.boolean(),
  slot: z.number(),
});

/** Stat reference on a Pokémon detail. */
const statSlotSchema = z.object({
  base_stat: z.number(),
  effort: z.number(),
  stat: namedRef,
});

/** Sprite variants. */
const spritesSchema = z.object({
  back_default: z.string().url().nullable(),
  back_shiny: z.string().url().nullable(),
  front_default: z.string().url().nullable(),
  front_shiny: z.string().url().nullable(),
  other: z
    .object({
      "official-artwork": z
        .object({
          front_default: z.string().url().nullable(),
          front_shiny: z.string().url().nullable(),
        })
        .optional(),
    })
    .optional(),
});

/** Cries (Gen 9+). */
const criesSchema = z.object({
  latest: z.string().url().optional(),
  legacy: z.string().url().optional(),
});

/** Pokémon detail endpoint — /pokemon/{name}. */
export const pokemonDetailSchema = z.object({
  abilities: z.array(abilitySlotSchema),
  base_experience: z.number().nullable(),
  cries: criesSchema.optional(),
  height: z.number(), // decimetres
  id: z.number(),
  moves: z
    .array(
      z.object({
        move: namedRef,
        version_group_details: z.array(z.any()),
      })
    )
    .optional(),
  name: z.string(),
  order: z.number(),
  species: namedRef,
  sprites: spritesSchema,
  stats: z.array(statSlotSchema),
  types: z.array(typeSlotSchema),
  weight: z.number(), // hectograms,
});

/** Species endpoint — /pokemon-species/{name} (for evolution chain + flavor text). */
const flavorTextSchema = z.object({
  flavor_text: z.string(),
  language: namedRef,
  version: namedRef,
});

export const speciesSchema = z.object({
  color: namedRef,
  evolution_chain: z.object({ url: z.string().url() }),
  flavor_text_entries: z.array(flavorTextSchema),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: namedRef,
    })
  ),
  generation: namedRef,
  id: z.number(),
  name: z.string(),
});

/** Evolution chain endpoint — /evolution-chain/{id}/. */
const evolutionDetailSchema = z.object({
  item: namedRef.nullable().optional(),
  min_level: z.number().nullable().optional(),
  trigger: namedRef.nullable().optional(),
});

const evolutionLinkSchema: z.ZodType<{
  species: z.infer<typeof namedRef>;
  evolves_to: z.infer<typeof evolutionLinkSchema>[];
  evolution_details: z.infer<typeof evolutionDetailSchema>[];
}> = z.lazy(() =>
  z.object({
    evolution_details: z.array(evolutionDetailSchema),
    evolves_to: z.array(evolutionLinkSchema),
    species: namedRef,
  })
);

export const evolutionChainSchema = z.object({
  chain: evolutionLinkSchema,
  id: z.number(),
});

/** Generation endpoint — /generation/{id}/. */
export const generationSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon_species: z.array(namedRef),
});

/** Type endpoint — /type/{name}/. */
export const typeSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: namedRef,
      slot: z.number(),
    })
  ),
});

/** Berry list endpoint — /berry?limit=&offset=. */
export const berryListSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(namedRef),
});

/** Berry detail endpoint — /berry/{name}/. */
export const berryDetailSchema = z.object({
  firmness: namedRef,
  flavors: z.array(
    z.object({
      potency: z.number(),
      flavor: namedRef,
    })
  ),
  growth_time: z.number(),
  id: z.number(),
  item: namedRef,
  max_harvest: z.number(),
  name: z.string(),
  natural_gift_power: z.number(),
  natural_gift_type: namedRef,
  size: z.number(),
  smoothness: z.number(),
  soil_dryness: z.number(),
});

// ---- Inferred TypeScript types from schemas (single source of truth) --------
export type PokemonListResponse = z.infer<typeof pokemonListSchema>;
export type PokemonDetail = z.infer<typeof pokemonDetailSchema>;
export type Species = z.infer<typeof speciesSchema>;
export type EvolutionChain = z.infer<typeof evolutionChainSchema>;
export type Generation = z.infer<typeof generationSchema>;
export type TypeResponse = z.infer<typeof typeSchema>;
export type BerryListResponse = z.infer<typeof berryListSchema>;
export type BerryDetail = z.infer<typeof berryDetailSchema>;
