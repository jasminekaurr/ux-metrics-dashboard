import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for HashRouter compatibility
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
