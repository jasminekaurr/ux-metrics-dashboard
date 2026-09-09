#!/usr/bin/env node
/**
 * Clears Vite Pages output under docs/ without deleting documentation
 * (*.md, DATA-MANIFEST.json, .nojekyll, etc.).
 */
import { rm, readdir } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs')
const keep = new Set([
  '.nojekyll',
  'favicon.svg',
  'icons.svg',
])

const entries = await readdir(docsDir, { withFileTypes: true })
for (const entry of entries) {
  const name = entry.name
  if (keep.has(name)) continue
  if (name.endsWith('.md') || name.endsWith('.json')) continue
  await rm(join(docsDir, name), { recursive: true, force: true })
}

console.log(`Cleaned Vite artifacts in ${docsDir} (kept docs markdown/json)`)
