import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../.env'),
]
const outputPath = resolve(__dirname, '../src/data/live/apex.json')
const sampleApexPath = resolve(__dirname, '../src/data/sample/apex.json')

async function loadEnvFiles() {
  for (const envPath of envPaths) {
    let file
    try {
      file = await readFile(envPath, 'utf8')
    } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }

    for (const rawLine of file.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const separatorIndex = line.indexOf('=')
      if (separatorIndex === -1) continue
      const key = line.slice(0, separatorIndex).trim()
      let value = line.slice(separatorIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: { 'X-FIGMA-TOKEN': token },
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Figma API error ${response.status}: ${body}`)
  }
  return response.json()
}

async function fetchAllRows(baseUrl, token) {
  const rows = []
  let cursor = null

  do {
    const url = cursor ? `${baseUrl}&cursor=${cursor}` : baseUrl
    const json = await fetchJson(url, token)
    rows.push(...(json.rows || []))
    cursor = json.next_page ? json.cursor : null
  } while (cursor)

  return rows
}

function groupWeekly(rows, field) {
  const totals = {}
  for (const row of rows) {
    const week = row.week
    totals[week] = (totals[week] || 0) + Number(row[field] || 0)
  }
  return Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, value]) => ({ week, [field]: value }))
}

function buildTeamWeekly(rows) {
  const teamWeekly = {}
  for (const row of rows) {
    const team = row.team_name || row.team || 'Unknown'
    if (!teamWeekly[team]) {
      teamWeekly[team] = { components: [] }
    }
    teamWeekly[team].components.push(Number(row.insertions || 0))
  }
  return teamWeekly
}

function buildDetachments(rows) {
  const detachments = {}
  for (const row of rows) {
    const team = row.team_name || row.team || 'Unknown'
    const insertions = Number(row.insertions || 0)
    const detachmentCount = Number(row.detachments || 0)
    const rate = insertions > 0 ? Number(((detachmentCount / insertions) * 100).toFixed(1)) : 0
    detachments[team] = { rate, insertions, detachments: detachmentCount }
  }
  return detachments
}

await loadEnvFiles()

const token = requireEnv('FIGMA_ACCESS_TOKEN')
const fileKey = requireEnv('FIGMA_FILE_KEY')
const startDate = process.env.FIGMA_START_DATE || '2026-01-01'
const endDate = process.env.FIGMA_END_DATE || '2026-04-22'

const base = `https://api.figma.com/v1/analytics/libraries/${fileKey}`
const componentRows = await fetchAllRows(
  `${base}/component/actions?group_by=component&start_date=${startDate}&end_date=${endDate}&order=asc`,
  token
)
const teamRows = await fetchAllRows(
  `${base}/actions?group_by=team&start_date=${startDate}&end_date=${endDate}&order=asc`,
  token
)

const weeklyTotalsRaw = groupWeekly(componentRows, 'components')
const weeks = weeklyTotalsRaw.map(row => row.week)
const weeklyTotals = weeklyTotalsRaw.map(row => ({
  week: row.week,
  components: row.components,
  styles: 0,
  variables: 0,
}))

const teamWeekly = buildTeamWeekly(teamRows)
const detachments = buildDetachments(teamRows)
const activeTeams = Object.keys(teamWeekly).length
const totalInsertions = weeklyTotals.reduce((sum, row) => sum + row.components, 0)

const apexPayload = {
  weeks,
  weeklyTotals,
  teamWeekly,
  detachments,
  summary: {
    activeTeams,
    totalInsertions,
  },
  topComponents: [],
  topFiles: [],
}

try {
  const existing = JSON.parse(await readFile(sampleApexPath, 'utf8'))
  if (!Object.keys(teamWeekly).length) {
    apexPayload.teamWeekly = existing.teamWeekly
    apexPayload.detachments = existing.detachments
    apexPayload.summary = existing.summary
  }
} catch {
  // Keep computed payload when sample file is unavailable.
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(apexPayload, null, 2)}\n`)
console.log(`Captured Figma analytics into ${outputPath}`)
