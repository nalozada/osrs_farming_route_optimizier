import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes built asset URLs relative, so the site works whether it is
// served from a domain root (Netlify/Vercel) or a GitHub Pages project subpath
// (https://<user>.github.io/osrs_farming_route_optimizier/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
