/**
 * Remap product names across sample JSON while preserving numeric values.
 * Run: node scripts/remap-instagram.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sampleDir = resolve(__dirname, '../src/data/sample')
const dataDir = resolve(__dirname, '../src/data')

const REPLACEMENTS = [
  ['Data Acceleration', 'Stories'],
  ['Client Onboarding', 'Sign-up'],
  ['Online Bill Pay', 'Subscriptions'],
  ['Data Compass', 'Insights'],
  ['Qual Tool Comparison', 'Research Ops'],
  ['AppMarket', 'Shop'],
  ['SnapPay', 'Checkout'],
  ['Messaging', 'DMs'],
  ['Jobs', 'Reels'],
  ['Network', 'Explore'],
  ['Premium', 'Creator'],
  ['Horizon Design System', 'Prism Design System'],
  ['Horizon', 'Prism'],
  ['APEX Design System', 'Prism Design System'],
  ['APEX', 'Prism'],
  ['Harmony', 'Prism'],
  ['UBA', 'Reels'],
  ['LinkedIn', 'Instagram'],
  ['DNA UX', 'Stories'],
  ['Core Advance', 'Feed'],
  ['Universal Banker', 'Reels'],
  ['Portico', 'Explore'],
  ['Applied AI', 'Creator'],
  ['Aitrium', 'Spark AI'],
  ['Insights AI', 'Spark AI'],
  ['Integrated Teller', 'legacy Reels editor'],
  ['teller operators', 'Reels creators'],
  ['cash balancing', 'clip trimming'],
  ['account numbers', 'caption overlays'],
  ['banks', 'creator cohorts'],
  ['bank', 'creator'],
  ['FIs', 'cohorts'],
  ['clients', 'creators'],
  ['client', 'creator'],
  ['members', 'creators'],
  ['member', 'creator'],
  ['purchasing', 'feature adoption'],
  ['orders', 'activations'],
  ['Task Admin', 'Creator Studio'],
  ['CORE-2241', 'FEED-2241'],
]

function remapString(value) {
  if (typeof value !== 'string') return value
  let next = value
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to)
  }
  return next
}

function walk(value) {
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]))
  }
  return remapString(value)
}

async function processDir(dir) {
  const files = await readdir(dir)
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const path = resolve(dir, file)
    const raw = await readFile(path, 'utf8')
    const data = JSON.parse(raw)
    const remapped = walk(data)
    await writeFile(path, `${JSON.stringify(remapped, null, 2)}\n`)
    console.log(`Remapped ${path}`)
  }
}

await processDir(sampleDir)
for (const file of ['apex.json', 'jiraLabelAdoption.json', 'fcubComponentVenn.json']) {
  const path = resolve(dataDir, file)
  const raw = await readFile(path, 'utf8')
  const remapped = walk(JSON.parse(raw))
  await writeFile(path, `${JSON.stringify(remapped, null, 2)}\n`)
  console.log(`Remapped ${path}`)
}
