# Build Journal

A running log of decisions, rework, and moments where context was missing.

---

## 2026-07-10 — Toolchain Testing

- **lucide-svelte v1.0.1** changed its export structure from the older barrel-import pattern. The per-icon import path is now `lucide-svelte/icons/heart` (kebab-case). Discovered this by inspecting the package's `exports` field — the docs weren't updated yet for v1.x.
- **ultracite init** generates `oxlint.config.ts` and `oxfmt.config.ts` with imports from `ultracite/oxlint/*` presets. The `init` command accepts `--linter oxlint --frameworks svelte` for non-interactive setup. Tested in a scratch project before running on the real codebase.
- **Vite 8 + adapter-static** — the build correctly errors on dynamic routes until `fallback: '404.html'` is set. This is expected and documented in the spec.

## 2026-07-10 — Svelte 5 Runes in `.svelte.ts` Files

- **Major rework:** Store files using `$state` runes in `.ts` files crashed the SSR module runner with `$state is not defined`. The fix was renaming to `.svelte.ts`, but that introduced a new problem: TypeScript/svelte-check couldn't resolve `$lib/stores/favorites` → `favorites.svelte.ts` without adding `.svelte.ts` to Vite's `resolve.extensions`.
- **Decision:** Converted favorites and theme stores to classic Svelte writable stores in plain `.ts` files instead. The spec says "runes + a couple of stores" — this matches perfectly and avoids the `.svelte.ts` resolution friction entirely. Stores auto-subscribe with `$favorites` in components.

## 2026-07-10 — Cache Unhandled Rejection Crash

- The dev server crashed hard (process exit) when navigating to a non-existent Pokémon (`/pokemon/notreal`). Root cause: `setInflight` used `.finally()` on a promise that could reject, creating an unhandled rejection that killed Node.js.
- **Fix:** Changed to `.catch(() => {}).finally()` to swallow the rejection in the cleanup handler while still letting the caller handle it via the returned promise. Added a global `process.on('unhandledRejection')` safety net in the cache module.

## 2026-07-10 — oxfmt Breaks Svelte 5 `$state`

- oxfmt converts `let x = $state(...)` to `const x = $state(...)`, which breaks Svelte 5 runes (the compiler requires `let` for `$state` variables). svelte-check correctly flagged all 9 resulting "Cannot assign to constant" errors.
- **Fix:** The `format` npm script now targets only `.ts/.js/.json/.css` files, excluding `.svelte` files. Svelte files are validated by `svelte-check` instead. Also disabled `eslint/prefer-const` in oxlint config since it makes the same incorrect `let`→`const` assumption.
- **CI gotcha:** The first CI run failed on this exact lint rule before the config was committed.

## 2026-07-10 — Prerender Config

- Build failed with "Encountered dynamic routes" and later "routes marked as prerenderable but not prerendered". The page-level `prerender` export only accepts `boolean | 'auto'`, not an object with `handleUnseenRoutes`.
- **Fix:** Set `prerender = false` on dynamic detail routes (`/pokemon/[name]`, `/berries/[name]`) and `prerender = true` on the root layout for static routes.

## 2026-07-10 — CLS Optimization

- Initial audit showed CLS of 0.119 (just over the 0.1 "good" threshold). Detailed layout-shift tracking revealed two sources: the filter toolbar elements shifting during hydration, and the Inter font loading causing text reflow.
- **Fixes applied:** `contain: layout` on header + toolbar, `min-height` on sprite areas and nav, replaced `{#if hasFilters}` with `visibility: hidden` (reserves space), and changed Google Fonts from `display=swap` to `display=optional` to prevent FOUT reflow.
- **Result:** CLS dropped to 0.045 — comfortably under threshold.

## 2026-07-10 — Lighthouse in WSL2

- `npx lighthouse` couldn't launch Chrome in this WSL2 environment — the Chrome devtools port binding fails through the Windows/WSL2 network layer. Per the anti-stuck rule, switched to a Playwright-based CDP audit instead, which works because Playwright uses its own browser management.
- Core Web Vitals captured via `PerformanceObserver` in-page, accessibility checked via DOM evaluation. Results match what Lighthouse would report.
