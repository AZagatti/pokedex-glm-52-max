<div align="center">

# 🎮 Pokédex

**Explore every Pokémon — search, filter, favorite, and dive deep into stats, evolutions, and cries.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-azagatti.github.io-dc2626?style=for-the-badge&logo=github&logoColor=white)](https://azagatti.github.io/pokedex-glm-52-max/)

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2-FF3E00?style=flat-square&logo=svelte&logoColor=white)](https://svelte.dev/)
[![Svelte 5](https://img.shields.io/badge/Svelte_5-Runes-FF3E00?style=flat-square&logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![CI](https://img.shields.io/github/actions/workflow/status/AZagatti/pokedex-glm-52-max/ci.yml?style=flat-square&logo=githubactions&logoColor=white&label=CI)](https://github.com/AZagatti/pokedex-glm-52-max/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-22C55E?style=flat-square&logo=github&logoColor=white)](https://azagatti.github.io/pokedex-glm-52-max/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

- **🔍 Search & Filter** — Debounced name search, multi-select type filter (all 18 types), generation filter (I–IX), and sort by dex number or base-stat total
- **♾️ Infinite Scroll** — IntersectionObserver-powered pagination with skeleton loaders (30 Pokémon per page)
- **📄 Detail Pages** — Official artwork, animated base-stat bars, abilities with hidden-ability tags, evolution chain, sprite variant switcher (front/back/shiny), and **playable Pokémon cries**
- **❤️ Favorites** — Heart any Pokémon to add it to your favorites; persisted to localStorage across reloads
- **🌙 Dark Mode** — Light/dark theme toggle with system preference detection and no flash-of-unstyled-content (FOUC)
- **🫐 Berries** — Browse all berries with firmness, flavor profiles, growth time, and size
- **♿ Accessible** — Keyboard navigation, ARIA labels, focus-visible states, skip link, alt text, and `prefers-reduced-motion` support
- **⚡ Fast** — In-memory API caching with request deduplication, lazy image loading, and prerendered static routes

## 🖼️ Screenshots

### Home — Pokédex Grid

| Light Mode | Dark Mode |
|:---:|:---:|
| ![Home (Light)](docs/screenshots/01-home-light.png) | ![Home (Dark)](docs/screenshots/11-home-dark.png) |

### Detail Page

| Light Mode | Dark Mode |
|:---:|:---:|
| ![Detail (Light)](docs/screenshots/02-detail-light.png) | ![Detail (Dark)](docs/screenshots/12-detail-dark.png) |

### Search & Filters

| Search | Type Filter | Generation Filter |
|:---:|:---:|:---:|
| ![Search](docs/screenshots/06-search.png) | ![Type Filter](docs/screenshots/07-type-filter.png) | ![Gen Filter](docs/screenshots/08-gen-filter.png) |

### More Pages

| Favorites | Berries | Berry Detail | 404 |
|:---:|:---:|:---:|:---:|
| ![Favorites](docs/screenshots/03-favorites.png) | ![Berries](docs/screenshots/04-berries.png) | ![Berry Detail](docs/screenshots/05-berry-detail.png) | ![404](docs/screenshots/10-404.png) |

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [SvelteKit 2](https://svelte.dev/) + [Svelte 5](https://svelte.dev/) (runes) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (strict) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + hand-written CSS |
| **Icons** | [lucide-svelte](https://lucide.dev/) |
| **Validation** | [zod](https://zod.dev/) |
| **Testing** | [vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) |
| **Lint/Format** | [oxlint](https://oxc.rs/) + [oxfmt](https://oxc.rs/) (via [ultracite](https://ultracite.ai/)) |
| **Git Hooks** | [lefthook](https://lefthook.dev/) |
| **Deploy** | GitHub Pages (via GitHub Actions) |
| **Data** | [PokeAPI](https://pokeapi.co/) |

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/AZagatti/pokedex-glm-52-max.git
cd pokedex-glm-52-max

# Install dependencies
npm install

# Start the dev server
npm run dev

# Open http://localhost:5173
```

### Other Commands

```bash
npm run build      # Production build (static, for GitHub Pages)
npm run preview    # Preview the production build locally
npm run check      # Type-check (svelte-check + tsc)
npm run lint       # Lint with oxlint
npm run format     # Format with oxfmt
npm run test       # Run all tests (unit + e2e)
npm run test:unit  # Run unit tests only
npm run test:e2e   # Run e2e tests only (Playwright)
```

## 🏗️ Architecture

```
src/
├── lib/
│   ├── api/
│   │   ├── pokeapi.ts      # PokeAPI client (fetch + cache + validate)
│   │   ├── cache.ts        # In-memory cache with request deduplication
│   │   ├── schemas.ts      # zod schemas (single source of truth for types)
│   │   ├── types.ts        # Pokémon type colors & gradients
│   │   └── generations.ts  # Generation ranges & labels
│   ├── components/         # PokemonCard, TypeBadge, FilterToolbar, etc.
│   └── stores/             # favorites + theme (localStorage-persisted)
├── routes/
│   ├── +page.svelte        # Home: card grid + infinite scroll
│   ├── pokemon/[name]/     # Detail page
│   ├── berries/            # Berry list + detail
│   └── favorites/          # Favorites grid
└── app.html                # HTML shell with inline theme (no FOUC)
```

**Data flow**: `load function` → `cachedFetch` (dedup + TTL cache) → `zod parse` → component.

**Theming**: CSS custom properties that flip for dark mode (no `dark:` utilities). Theme is applied inline in `app.html` before hydration.

📖 See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full technical overview and [docs/DECISIONS.md](docs/DECISIONS.md) for rationale on each technology choice.

## 📊 Performance

Built for a high Lighthouse score:
- Prerendered static routes for instant first paint
- In-memory API caching (10-min TTL) with request deduplication
- Lazy-loaded images with skeleton placeholders
- GPU-accelerated animations (`transform` + `opacity` only)
- `prefers-reduced-motion` support on every animated element

## 📄 License

MIT — Pokémon and Pokémon character names are trademarks of Nintendo. Data provided by [PokeAPI](https://pokeapi.co/).

---

<div align="center">
Built with ❤️ using SvelteKit + Tailwind CSS
</div>
