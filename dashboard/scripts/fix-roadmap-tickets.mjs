import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = resolve(__dirname, '../src/data/sample/roadmap.json')

const TICKET_MAP = [
  ['CORE-', 'FEED-'],
  ['DNA-', 'REEL-'],
  ['UBA-', 'REEL-'],
  ['MSG-', 'DM-'],
  ['NET-', 'EXPL-'],
  ['PREM-', 'CRE-'],
]

function remapString(value) {
  if (typeof value !== 'string') return value
  let next = value
  for (const [from, to] of TICKET_MAP) next = next.split(from).join(to)
  return next
}

function walk(value) {
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]))
  }
  return remapString(value)
}

const data = JSON.parse(await readFile(path, 'utf8'))
await writeFile(path, `${JSON.stringify(walk(data), null, 2)}\n`)
console.log('Fixed roadmap tickets')
