# FrostByte Movie Hub

A fast, responsive movie & TV discovery app. Browse trending titles, filter by genre, search, watch trailers, and build a personal watchlist — all powered by live data from [TMDB](https://www.themoviedb.org/).

Built with React 19, TypeScript, and Vite. Deploys automatically to GitHub Pages via GitHub Actions.

## Features

- **Home** — auto-rotating hero of trending titles, plus rows for popular movies/TV, top rated, and in theaters now
- **Browse** — movies and TV shows with genre filters, popular/top-rated sort, and paginated "load more"
- **Search** — debounced live search across movies and TV
- **Detail pages** — synopsis, cast, director, genres, rating, trailer link (YouTube), and similar titles
- **Watchlist** — add/remove titles, saved to your browser (no account needed)
- Fully responsive, keyboard-accessible, respects reduced-motion preferences

## 1. Get a free TMDB API key

1. Create a free account at [themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Go to **Settings → API** and request a free **Developer** API key (approved instantly, no cost)
3. Copy the **API Key (v3 auth)** value

## 2. Run it locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your key:
# VITE_TMDB_API_KEY=your_key_here
npm run dev
```

Open the printed local URL. Without a key set, the app shows a setup screen instead of crashing.

## 3. Deploy to GitHub Pages (automatic)

This repo includes `.github/workflows/deploy.yml`, which builds and publishes the site to GitHub Pages every time you push to `main`.

**One-time setup:**

1. Push this project to a GitHub repository.
2. In the repo, go to **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `TMDB_API_KEY`
   - Value: your TMDB API key
3. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually from the **Actions** tab). The site will build and deploy automatically.

Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

**If your repo name isn't `frostbyte-movie-hub`:** open `vite.config.ts` and change the `base` path to match your repo name (e.g. `/my-repo-name/`), or set it to `/` if you're using a custom domain.

## Project structure

```
src/
  api/tmdb.ts          TMDB API client
  components/          Header, Hero, MediaCard, Row, Footer, skeletons
  pages/               Home, Browse, Detail, Search, Watchlist
  hooks/               Watchlist (localStorage) + debounce
  types/tmdb.ts        Shared TypeScript types
  styles/tokens.css    Design tokens (color, type, spacing)
.github/workflows/deploy.yml   CI/CD build + deploy to GitHub Pages
```

## Notes

- This app only reads public metadata from TMDB (titles, posters, ratings, cast, trailer links). It does not host, stream, or store any video content.
- This product uses the TMDB API but is not endorsed or certified by TMDB.
