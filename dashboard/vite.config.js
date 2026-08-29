import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// GitHub Pages subpath. Override for forks: VITE_BASE_PATH=/ npm run build
const defaultBase = '/ux-metrics-dashboard/'
const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, projectRoot, '')
  const pagesBase = env.VITE_BASE_PATH || defaultBase

  return {
    plugins: [react()],
    // Dev uses /. Production build uses the repo subpath unless overridden.
    base: command === 'build' ? pagesBase : '/',
    build: {
      outDir: '../docs',
      emptyOutDir: true,
    },
  }
})
