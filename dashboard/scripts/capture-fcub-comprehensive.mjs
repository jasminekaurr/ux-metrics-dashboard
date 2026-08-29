import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(__dirname, '../src/data/fcubComprehensive.json')
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../.env'),
]

// ─── env loading ──────────────────────────────────────────────────────────────

async function loadEnvFiles() {
  for (const envPath of envPaths) {
    let file
    try {
      file = await readFile(envPath, 'utf8')
    } catch (err) {
      if (err.code === 'ENOENT') continue
      throw err
    }
    for (const rawLine of file.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const sep = line.indexOf('=')
      if (sep === -1) continue
      const key = line.slice(0, sep).trim()
      let val = line.slice(sep + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      if (key && process.env[key] === undefined) process.env[key] = val
    }
  }
}

function requireEnv(name) {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

// ─── config ───────────────────────────────────────────────────────────────────

await loadEnvFiles()

const baseUrl = requireEnv('JIRA_BASE_URL').replace(/\/$/, '')
const token   = requireEnv('JIRA_API_TOKEN')
const email   = process.env.JIRA_EMAIL?.trim()
const projectKey   = (process.env.JIRA_PROJECT_KEY || 'DS').trim()
const maxResults   = Math.min(Number(process.env.JIRA_MAX_RESULTS || 100), 100)
const fetchChangelog = process.env.FETCH_CHANGELOG !== 'false'

// Enterprise Jira (on-prem): Bearer token preferred.
// If JIRA_EMAIL is set, fall back to Basic auth (cloud or mixed setups).
const authHeader = email
  ? `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`
  : `Bearer ${token}`

const browseBaseUrl = (() => {
  const b = (process.env.JIRA_BROWSE_BASE_URL || baseUrl).trim().replace(/\/$/, '')
  return b.endsWith('/browse') ? b : `${b}/browse`
})()

// ─── http helpers ─────────────────────────────────────────────────────────────

async function jiraFetch(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Jira ${res.status} on ${path}: ${body.slice(0, 300)}`)
  }
  return res.json()
}

async function jiraGet(path, params = {}) {
  const url = new URL(`${baseUrl}${path}`)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  }
  return jiraFetch(url.pathname + url.search)
}

async function jiraPost(path, body) {
  return jiraFetch(path, { method: 'POST', body: JSON.stringify(body) })
}

async function tryGet(label, fn) {
  try { return await fn() }
  catch (err) { console.warn(`  [skip] ${label}: ${err.message}`); return null }
}

// ─── pagination ───────────────────────────────────────────────────────────────

// /rest/api/* search — uses startAt + total
async function fetchAllIssues(jql, fields, expand = []) {
  const issues = []
  let startAt = 0
  while (true) {
    const page = await jiraPost('/rest/api/2/search', { jql, startAt, maxResults, fields, expand })
    issues.push(...(page.issues || []))
    startAt += page.issues?.length || 0
    process.stdout.write(`\r  issues: ${issues.length}/${page.total}   `)
    if (startAt >= page.total || !page.issues?.length) break
  }
  console.log()
  return issues
}

// /rest/agile/* — uses isLast
async function fetchAgilePages(path, params = {}, key = 'values') {
  const items = []
  let startAt = 0
  while (true) {
    const page = await tryGet(path, () => jiraGet(path, { ...params, startAt, maxResults }))
    if (!page) break
    items.push(...(page[key] || []))
    if (page.isLast || !(page[key]?.length)) break
    startAt += page[key].length
  }
  return items
}

// ─── field list ───────────────────────────────────────────────────────────────
// Request every standard field + common custom fields.
const ISSUE_FIELDS = [
  'summary', 'description', 'status', 'assignee', 'reporter',
  'priority', 'issuetype', 'project', 'labels', 'components',
  'fixVersions', 'versions', 'parent', 'subtasks', 'issuelinks',
  'created', 'updated', 'resolutiondate', 'duedate', 'resolution',
  'comment', 'worklog', 'timetracking', 'timespent',
  'timeoriginalestimate', 'timeestimate', 'progress', 'aggregateprogress',
  'votes', 'watches', 'attachment', 'environment', 'security',
  // common custom field IDs
  'customfield_10014', // Epic Link
  'customfield_10008', // Epic Name
  'customfield_10016', // Story Points (server)
  'customfield_10028', // Story Points (cloud)
  'customfield_10020', // Sprint
  'customfield_10004', // Environment (alt)
]

// ─── issue transformer ────────────────────────────────────────────────────────

function toIssue(issue) {
  const f = issue.fields || {}
  const sprintRaw = f.customfield_10020
  const sprint = Array.isArray(sprintRaw) ? sprintRaw[0] : sprintRaw

  return {
    id: issue.key,
    jiraId: issue.id,
    url: `${browseBaseUrl}/${issue.key}`,
    name: f.summary || issue.key,
    description: typeof f.description === 'string' ? f.description : null,
    status: f.status?.name || null,
    statusCategory: f.status?.statusCategory?.name || null,
    assignee: f.assignee
      ? { name: f.assignee.displayName, email: f.assignee.emailAddress, key: f.assignee.accountId || f.assignee.name }
      : null,
    reporter: f.reporter
      ? { name: f.reporter.displayName, email: f.reporter.emailAddress }
      : null,
    priority: f.priority?.name || null,
    issueType: f.issuetype?.name || null,
    project: f.project?.key || null,
    labels: f.labels || [],
    components: (f.components || []).map(c => c.name),
    fixVersions: (f.fixVersions || []).map(v => v.name),
    affectedVersions: (f.versions || []).map(v => v.name),
    parent: f.parent?.key || null,
    subtasks: (f.subtasks || []).map(s => s.key),
    issueLinks: (f.issuelinks || []).map(link => ({
      type: link.type?.name,
      inwardDesc: link.type?.inward,
      outwardDesc: link.type?.outward,
      linkedIssue: (link.inwardIssue || link.outwardIssue)?.key || null,
      direction: link.inwardIssue ? 'inward' : 'outward',
    })),
    created: f.created || null,
    updated: f.updated || null,
    resolutionDate: f.resolutiondate || null,
    dueDate: f.duedate || null,
    resolution: f.resolution?.name || null,
    timespentSec: f.timespent || null,
    timeestimateSec: f.timeestimate || null,
    timeoriginalSec: f.timeoriginalestimate || null,
    storyPoints: f.customfield_10016 ?? f.customfield_10028 ?? null,
    epicKey: f.customfield_10014 || null,
    epicName: f.customfield_10008 || null,
    sprint: sprint ? { id: sprint.id, name: sprint.name, state: sprint.state } : null,
    commentCount: f.comment?.total || 0,
    comments: (f.comment?.comments || []).slice(-5).map(c => ({
      author: c.author?.displayName || null,
      body: typeof c.body === 'string' ? c.body.slice(0, 500) : null,
      created: c.created || null,
    })),
    worklogs: (f.worklog?.worklogs || []).map(w => ({
      author: w.author?.displayName || null,
      timeSpentSec: w.timeSpentSeconds || 0,
      started: w.started || null,
    })),
    attachmentCount: (f.attachment || []).length,
    votes: f.votes?.votes || 0,
    watches: f.watches?.watchCount || 0,
    changelog: fetchChangelog && issue.changelog
      ? (issue.changelog.histories || []).map(h => ({
          created: h.created,
          author: h.author?.displayName || null,
          items: (h.items || []).map(i => ({ field: i.field, from: i.fromString, to: i.toString })),
        }))
      : null,
  }
}

// ─── metrics aggregation ──────────────────────────────────────────────────────

function countBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = String(keyFn(item) ?? 'Unknown')
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
}

function buildMetrics(issues, sprints) {
  const now = Date.now()
  const day = 86400000

  const ageMs = issues.map(i => now - new Date(i.created).getTime()).filter(n => !isNaN(n))
  const avgAgeDays = ageMs.length ? Math.round(ageMs.reduce((a, b) => a + b, 0) / ageMs.length / day) : 0

  return {
    total: issues.length,
    byStatus: countBy(issues, i => i.status),
    byStatusCategory: countBy(issues, i => i.statusCategory),
    byAssignee: countBy(issues, i => i.assignee?.name || 'Unassigned'),
    byPriority: countBy(issues, i => i.priority),
    byIssueType: countBy(issues, i => i.issueType),
    byComponent: issues.reduce((acc, i) => {
      if (!i.components.length) { acc['(none)'] = (acc['(none)'] || 0) + 1; return acc }
      i.components.forEach(c => { acc[c] = (acc[c] || 0) + 1 })
      return acc
    }, {}),
    byLabel: issues.reduce((acc, i) => {
      if (!i.labels.length) { acc['(unlabeled)'] = (acc['(unlabeled)'] || 0) + 1; return acc }
      i.labels.forEach(l => { acc[l] = (acc[l] || 0) + 1 })
      return acc
    }, {}),
    byFixVersion: issues.reduce((acc, i) => {
      if (!i.fixVersions.length) { acc['(unversioned)'] = (acc['(unversioned)'] || 0) + 1; return acc }
      i.fixVersions.forEach(v => { acc[v] = (acc[v] || 0) + 1 })
      return acc
    }, {}),
    byResolution: countBy(issues.filter(i => i.resolution), i => i.resolution),
    bySprint: countBy(issues.filter(i => i.sprint), i => i.sprint?.name),
    createdLast7d:  issues.filter(i => new Date(i.created) > new Date(now - 7  * day)).length,
    createdLast30d: issues.filter(i => new Date(i.created) > new Date(now - 30 * day)).length,
    createdLast90d: issues.filter(i => new Date(i.created) > new Date(now - 90 * day)).length,
    updatedLast7d:  issues.filter(i => new Date(i.updated) > new Date(now - 7  * day)).length,
    updatedLast30d: issues.filter(i => new Date(i.updated) > new Date(now - 30 * day)).length,
    resolved: issues.filter(i => i.resolutionDate).length,
    withStoryPoints: issues.filter(i => i.storyPoints !== null).length,
    totalStoryPoints: issues.reduce((s, i) => s + (i.storyPoints || 0), 0),
    withSubtasks: issues.filter(i => i.subtasks.length > 0).length,
    withLinks: issues.filter(i => i.issueLinks.length > 0).length,
    withComments: issues.filter(i => i.commentCount > 0).length,
    withWorklogs: issues.filter(i => i.worklogs.length > 0).length,
    totalTimespentSec: issues.reduce((s, i) => s + (i.timespentSec || 0), 0),
    avgAgeDays,
    sprintCount: sprints.length,
    activeSprintCount: sprints.filter(s => s.state === 'active').length,
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

console.log(`\n=== DS Comprehensive Jira Data Capture ===`)
console.log(`Project  : ${projectKey}`)
console.log(`Jira     : ${baseUrl}`)
console.log(`Auth     : ${email ? 'Basic (email+token)' : 'Bearer (PAT)'}`)
console.log(`Changelog: ${fetchChangelog}`)
console.log(`Started  : ${new Date().toISOString()}\n`)

const result = {
  generatedAt: new Date().toISOString(),
  projectKey,
  baseUrl,
  browseBaseUrl,
  project: null,
  components: [],
  versions: [],
  roles: null,
  boards: [],
  sprints: [],
  issues: [],
  metrics: {},
}

// 1. Project metadata
console.log('1. Project metadata...')
result.project = await tryGet('project metadata', () => jiraGet(`/rest/api/2/project/${projectKey}`))

// 2. Components
console.log('2. Components...')
result.components = await tryGet('components', () => jiraGet(`/rest/api/2/project/${projectKey}/components`)) || []

// 3. Versions/releases
console.log('3. Versions...')
result.versions = await tryGet('versions', () => jiraGet(`/rest/api/2/project/${projectKey}/versions`)) || []

// 4. Project roles
console.log('4. Roles...')
result.roles = await tryGet('roles', () => jiraGet(`/rest/api/2/project/${projectKey}/role`))

// 5. Agile boards
console.log('5. Agile boards...')
const boardsData = await tryGet('boards', () => jiraGet('/rest/agile/1.0/board', { projectKeyOrId: projectKey }))
result.boards = boardsData?.values || []
console.log(`   Found ${result.boards.length} board(s)`)

// 6. Sprints
if (result.boards.length > 0) {
  console.log('6. Sprints...')
  for (const board of result.boards) {
    const sprints = await fetchAgilePages(
      `/rest/agile/1.0/board/${board.id}/sprint`,
      { state: 'active,closed,future' }
    )
    result.sprints.push(...sprints.map(s => ({ ...s, boardId: board.id, boardName: board.name })))
  }
  console.log(`   Found ${result.sprints.length} sprint(s)`)
} else {
  console.log('6. Sprints... (no boards found, skipping)')
}

// 7. All issues
console.log(`7. Issues (JQL: project = ${projectKey} ORDER BY updated DESC)...`)
const jql = `project = ${projectKey} ORDER BY updated DESC`
const expand = fetchChangelog ? ['changelog'] : []
const rawIssues = await fetchAllIssues(jql, ISSUE_FIELDS, expand)
console.log(`   Raw issues: ${rawIssues.length}`)

// 8. Transform
console.log('8. Transforming issues...')
result.issues = rawIssues.map(toIssue)

// 9. Metrics
console.log('9. Computing metrics...')
result.metrics = buildMetrics(result.issues, result.sprints)

// 10. Write
await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n')

console.log(`\n✓ Wrote ${outputPath}`)
console.log(`  Issues    : ${result.issues.length}`)
console.log(`  Components: ${result.components.length}`)
console.log(`  Versions  : ${result.versions.length}`)
console.log(`  Sprints   : ${result.sprints.length}`)
console.log(`  Boards    : ${result.boards.length}`)
console.log(`\nKey metrics:`)
console.log(`  Total      : ${result.metrics.total}`)
console.log(`  By status  : ${JSON.stringify(result.metrics.byStatus)}`)
console.log(`  By type    : ${JSON.stringify(result.metrics.byIssueType)}`)
console.log(`  Story pts  : ${result.metrics.totalStoryPoints}`)
console.log(`  Avg age    : ${result.metrics.avgAgeDays} days`)
