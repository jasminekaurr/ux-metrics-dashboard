import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Pages URL: https://<user>.github.io/ux-metrics-dashboard/
const pagesBase = '/ux-metrics-dashboard/'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Dev uses /. Production build uses the repo subpath for GitHub Pages.
  base: command === 'build' ? pagesBase : '/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
}))
