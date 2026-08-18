import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base is set to the repo name for GitHub Pages project sites.
// Override at build time with VITE_BASE_PATH if deploying elsewhere (e.g. custom domain -> '/').
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/frostbyte-movie-hub/',
})
