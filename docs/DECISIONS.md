# Decision Log

Why each pinned technology was chosen and how it's used.

## SvelteKit + Svelte 5 (Runes)

**Why**: SvelteKit provides file-based routing, SSR/SSG, and the best developer experience for content-driven sites. Svelte 5's runes (`$state`, `$derived`, `$effect`) give fine-grained reactivity without stores boilerplate for component-local state.

**How**: Runes are used for all component state (filters, sprite switcher, stat animations). Classic writable stores are reserved for the two cross-cutting persisted concerns (favorites, theme).

## @sveltejs/adapter-static (SPA Mode)

**Why**: GitHub Pages only serves static files. `adapter-static` with `fallback: '404.html'` produces a fully client-side SPA while still prerendering static routes.

**How**: `fallback: '404.html'` catches all unknown routes client-side. Static routes (`/`, `/berries`, `/favorites`) are prerendered. Dynamic routes (`/pokemon/[name]`) use `prerender = false` and render client-side. `paths.base` is set to `/pokedex-glm-52-max` for the project Pages URL.

## Tailwind CSS v4

**Why**: Utility-first CSS for rapid layout. v4 uses a Vite plugin (no PostCSS config) and a CSS-first config with `@import 'tailwindcss'`.

**How**: Tailwind utilities handle layout (grid, flex, spacing). The design system (colors, shadows, motion) is defined as CSS custom properties in `layout.css`, which flip for dark mode. This follows the emil principle: use CSS variables that flip, not `dark:` utilities everywhere.

## lucide-svelte

**Why**: Clean, consistent, tree-shakeable icon set. v1.0.1 uses per-icon imports (`lucide-svelte/icons/heart`) for optimal bundling.

## zod

**Why**: Runtime validation at the API boundary. PokeAPI responses are complex and occasionally change; parsing every response through a schema prevents malformed data from crashing the UI.

**How**: One schema per PokeAPI endpoint shape in `src/lib/api/schemas.ts`. TypeScript types are inferred from the schemas (single source of truth). Every `fetchValidated` call parses before returning.

## In-Memory Cache (Custom)

**Why**: No data-fetching library is needed for this scope. A ~50-line cache with value storage + request deduplication covers the use case (repeated navigations, shared requests).

**How**: `src/lib/api/cache.ts` — a `Map` for cached values (10-min TTL) and a `Map` for in-flight promises. `setInflight` uses `.catch().finally()` to clean up the dedup entry even on rejection, preventing unhandled-rejection crashes.

## vitest + Playwright

**Why**: vitest for fast unit tests (cache logic, type colors, generation helpers). Playwright for realistic e2e tests against the production build (search, filter, detail navigation, favorites persistence, theme toggle).

## oxlint + oxfmt (via ultracite)

**Why**: Rust-based linting and formatting — dramatically faster than ESLint + Prettier. ultracite provides a pre-configured setup that wires oxlint and oxfmt together.

**Note**: oxfmt converts `let` → `const`, which breaks Svelte 5 `$state` variables (which must use `let`). The `format` script targets only `.ts/.js/.json/.css` files, excluding `.svelte` files. Svelte files are validated by `svelte-check` instead.

## lefthook

**Why**: Fast, parallel git hooks in Go. Pre-commit runs lint + format + typecheck on staged files; pre-push runs the full test suite.

## CSS Variables for Theming (not Tailwind dark: mode)

**Why**: Per the emil design engineering principle, using CSS variables that flip values for dark mode is cleaner than peppering `dark:` utilities throughout the markup. It centralizes the theme definition and avoids maintenance headaches.

**How**: `:root` defines light values; `[data-theme='dark']` overrides them. The theme is set on `<html>` by an inline script in `app.html` (before hydration, preventing FOUC) and synced via the `theme` store.
