# All Movies

A modern movie discovery and streaming web app built with **Next.js 16** (App Router).  
It combines a curated catalog of Indian movies (Bollywood, Punjabi, Hindi-dubbed, web series) with a
**Hollywood** section powered by the [TMDB](https://www.themoviedb.org/) API — browse movies & TV shows
by streaming provider, genre, and popularity, watch trailers, and view where to stream.

## Features

- 🏠 **Home** — Featured movies, recently added, and category rows
- 🎬 **Indian catalog** — Bollywood, Punjabi, Hindi-dubbed movies & web series with embedded player
- 🎥 **Hollywood** — Discover movies & TV shows via TMDB, filter by provider (Netflix, Prime, Disney+…), genre & sort
- 📺 **TV shows** — Season/episode browser with player
- 🔍 **Search** — Full-text search across the catalog + TMDB search
- 🌗 **Dark / light theme** — Persisted preference with `data-theme`
- 📱 **Responsive** — Mobile menu, responsive grids (2 → 3 → 4 → 5 columns)
- 🔎 **SEO** — Per-page metadata via `generateMetadata`
- 🎨 **Modern stack** — React 19, Tailwind CSS v4 (CSS-first config), Lucide icons, TypeScript (strict)

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS v4 (CSS-first config, dark/light theme via `data-theme`) |
| Icons | Lucide React |
| Fonts | Oxygen + Encode Sans Condensed (Google Fonts) |
| Language | TypeScript (strict) |
| Data | Mock catalog (`src/lib/data.ts`) + TMDB API (`src/lib/tmdb.ts`) |

## Getting started

### Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

### Install & run

```bash
npm install
npm run dev      # http://localhost:3200
npm run build
npm run start
```

### Environment variables

Create a `.env.local` file (optional — sensible defaults are provided):

```bash
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

> The Hollywood features use a bundled TMDB key for development. For production, supply your own key.

## Project layout

```
src/
  app/
    page.tsx                 # Home
    layout.tsx               # Root layout + fonts + theme provider
    globals.css              # Design tokens + components
    [slug]/page.tsx          # Single (Indian) movie
    category/[slug]/page.tsx  # Category archive
    search/page.tsx          # Search results
    login/page.tsx           # Sign in
    not-found.tsx
    hollywood/
      page.tsx               # Hollywood movies
      tv/page.tsx            # TV shows
      movie/[id]/page.tsx    # Movie details
      tv/[id]/page.tsx       # TV details
    api/
      search/route.ts
      hollywood/...          # TMDB proxy routes
  components/
    Header, Footer, Hero, MovieCard, MovieGrid, SectionHeading,
    Pagination, VideoPlayer, ReportForm, CommentSection, Sidebar,
    ThemeProvider, SearchBar, HollywoodCard, TvPlayerWithEpisodes, …
  lib/
    types.ts                 # Movie, Category types
    data.ts                  # Mock catalog + helpers
    tmdb.ts                  # TMDB client
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server on port 3200 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Notes

- The Indian catalog in `src/lib/data.ts` is mock data mirroring the original site's structure.
  Replace with a real data source (Postgres + Prisma, or headless WordPress) for production.
- Video delivery uses an iframe embed. For a real product, swap in a licensed CDN
  (Mux, Cloudflare Stream) with HLS.js.
- Images are remote (original CDN / TMDB). Configure `next.config.ts` image domains as needed.

## ⚠️ Copyright

The Indian-movies section mirrors a third-party site that distributes copyrighted films.
This project is provided for **educational/structural purposes only**. Use only with licensed
or your own content. The Hollywood section uses TMDB, which requires attribution per their
terms.

## License

MIT
