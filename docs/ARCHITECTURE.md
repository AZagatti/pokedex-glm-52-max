# Architecture

A technical overview of the Pokédex app's structure, data flow, and key decisions.

## Overview

This is a **statically-built single-page application** (SPA) using SvelteKit with `adapter-static`. Static routes (`/`, `/berries`, `/favorites`) are prerendered to real HTML files for fast first paint; dynamic routes (`/pokemon/[name]`, `/berries/[name]`) render client-side via the `404.html` SPA fallback. This makes the app fully deployable to GitHub Pages with no server.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + hand-written CSS |
| Icons | lucide-svelte |
| Validation | zod |
| Testing | vitest (unit) + Playwright (e2e) |
| Lint/Format | oxlint + oxfmt (via ultracite) |
| Git Hooks | lefthook |
| Deploy | GitHub Pages (via GitHub Actions) |

## Route Structure

```
src/routes/
├── +layout.svelte          # App shell: header, footer, skip link
├── +layout.ts              # SPA config (prerender = true)
├── +layout.css             # Global design system (CSS variables, components)
├── +page.svelte            # Home: card grid + infinite scroll
├── +page.ts                # Home load: first page + all 18 types
├── +error.svelte           # 404 / error page
├── pokemon/[name]/
│   ├── +page.svelte        # Detail: artwork, stats, evolutions, cry
│   └── +page.ts            # Detail load: detail + species + evolution
├── berries/
│   ├── +page.svelte        # Berry grid
│   ├── +page.ts            # Berry list load
│   └── [name]/
│       ├── +page.svelte    # Berry detail
│       └── +page.ts        # Berry detail load
└── favorites/
    ├── +page.svelte        # Favorites grid (from localStorage)
    └── +page.ts            # No server data (favorites are client-side)
```

## Data Flow

### Fetching

All data comes from the public [PokeAPI](https://pokeapi.co) (no key required). Data is fetched via native `fetch` inside SvelteKit `load` functions (`+page.ts` files).

```
User navigates → SvelteKit load function → cachedFetch() → PokeAPI → zod parse → component
```

### Caching

`src/lib/api/cache.ts` provides a two-layer in-memory cache:

1. **Value cache** (`Map<string, { value, expiry }>`): Stores parsed responses with a 10-minute TTL. Repeated navigations are instant.
2. **In-flight deduplication** (`Map<string, Promise>`): If two components request the same URL simultaneously, they share a single network request. The promise is removed once settled.

Both layers are keyed by the full PokeAPI URL. The `cachedFetch` function checks the value cache first (synchronous), then deduplicates in-flight requests, then fires a new request.

### Validation

Every PokeAPI response is parsed through a zod schema (`src/lib/api/schemas.ts`) before reaching components. This catches malformed data at the boundary:

```typescript
const raw = await cachedFetch<unknown>(url);
return pokemonDetailSchema.parse(raw); // throws on invalid data
```

Each schema is defined once, and TypeScript types are inferred from the schema (single source of truth).

## State Management

Two patterns, per the spec ("runes + a couple of stores"):

- **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`): Used for all component-local reactive state (filter selections, sprite switcher, stat bar animation).
- **Svelte stores** (writable): Used for the two cross-cutting concerns that need persistence:
  - `favorites` — array of Pokémon names, persisted to `localStorage`
  - `theme` — `'light' | 'dark'`, persisted to `localStorage`

The theme is applied inline in `app.html` before hydration to prevent flash-of-unstyled-content (FOUC).

## Filtering Strategy

The home page supports three filter dimensions:

| Filter | Implementation |
|--------|---------------|
| **Search** | Client-side filter on loaded Pokémon names (debounced 250ms) |
| **Type** | Preloaded type lists (all 18 `/type/{name}` fetched on initial load); when selected, fetches details for matching Pokémon |
| **Generation** | Fetches `/generation/{id}` and fetches details for that generation's species |
| **Sort** | Client-side sort by dex number or base-stat total |

When type or generation filters are active, a dedicated fetch runs (capped at 90 results for performance). Search and sort apply on top of the current result set.

## Design System

Built with CSS custom properties that flip for dark mode (per the [emil design engineering](https://github.com/emilkowalski) principle: variables, not `dark:` utilities):

- **Neutral scale**: 12-step gray scale for backgrounds, text, borders
- **Accent**: Pokéball red
- **Type colors**: 18 hand-tuned colors for Pokémon types, used for badges and card gradients
- **Shadows**: `box-shadow` used instead of borders for better surface blending
- **Motion**: Named easing curves (`--ease-out-quart`, `--ease-out-expo`) with `prefers-reduced-motion` support on every animated element

## Build & Deploy

```
npm run build → vite build → adapter-static → build/ → GitHub Actions → GitHub Pages
```

The production build sets `paths.base = '/pokedex-glm-52-max'` so all assets and routes are correctly prefixed for the GitHub Pages project URL: `https://azagatti.github.io/pokedex-glm-52-max/`.
