import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildDataFromSources, DATA_FILE_NAMES } from '../src/data/providerCore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputDir = resolve(__dirname, '../../sample-data/full-snapshot')
const dashboardOutput = resolve(__dirname, '../src/data/sample/exported-snapshot.json')
const sampleDir = resolve(__dirname, '../src/data/sample')
const liveDir = resolve(__dirname, '../src/data/live')

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function readSampleData() {
  const data = {}
  for (const name of DATA_FILE_NAMES) {
    data[name === 'apex' ? 'apexData' : name === 'months' ? 'MONTHS' : name] = await readJson(resolve(sampleDir, `${name}.json`))
  }
  return data
}

async function readLiveOverrides() {
  const overrides = {}
  try {
    const files = await readdir(liveDir)
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      overrides[file.replace(/\.json$/, '')] = await readJson(resolve(liveDir, file))
    }
  } catch {
    // live/ may not exist yet
  }
  return overrides
}

function toSnapshotPayload(data) {
  const payload = {}
  for (const name of DATA_FILE_NAMES) {
    if (name === 'apex') payload.apex = data.apexData
    else if (name === 'months') payload.months = data.MONTHS
    else payload[name] = data[name]
  }
  return payload
}

const sampleData = await readSampleData()
const liveOverrides = await readLiveOverrides()
const payload = toSnapshotPayload(buildDataFromSources(sampleData, liveOverrides, {}))
const json = `${JSON.stringify(payload, null, 2)}\n`

await mkdir(outputDir, { recursive: true })
await writeFile(resolve(outputDir, 'ux-dashboard-snapshot.json'), json)
await writeFile(dashboardOutput, json)

for (const name of DATA_FILE_NAMES) {
  const value = name === 'apex'
    ? payload.apex
    : name === 'months'
      ? payload.months
      : payload[name]
  await writeFile(resolve(outputDir, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`)
}

console.log(`Exported snapshot to ${outputDir}`)
