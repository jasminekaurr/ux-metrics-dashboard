import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sampleDir = resolve(__dirname, '../src/data/sample')

const {
  MONTHS,
  executive,
  roadmap,
  research,
  cost,
  projectComponents,
  strategic,
  researchInitiatives,
  panelHealth,
  ubaIASpotlight,
  researchAsks,
  strategicContributions,
} = await import('../src/data/dummy.js')

const files = {
  months: MONTHS,
  executive,
  roadmap,
  research,
  cost,
  projectComponents,
  strategic,
  researchInitiatives,
  panelHealth,
  ubaIASpotlight,
  researchAsks,
  strategicContributions,
}

await mkdir(sampleDir, { recursive: true })

for (const [name, data] of Object.entries(files)) {
  const path = resolve(sampleDir, `${name}.json`)
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`)
  console.log(`Wrote ${path}`)
}

console.log('Done splitting dummy.js into sample/*.json')
