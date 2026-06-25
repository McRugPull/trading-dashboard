import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes all asset URLs relative, so the build works under any
// GitHub Pages project path (https://user.github.io/<repo>/) without hardcoding
// the repo name. Combined with HashRouter, deep links and refreshes never 404.
export default defineConfig({
  base: './',
  plugins: [react()],
})
