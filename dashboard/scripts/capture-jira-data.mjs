import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(__dirname, '../src/data/live/jiraLabelAdoption.json')
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../.env'),
]

const DEFAULT_LABEL_MAP = {
  'UXR Identified': 'ux-validated',
  'Design Rework': 'rework',
  'Post-Handoff Change': 'post-handoff-change',
  'Usability Issue': 'usability-issue',
  'BA Change Request': 'ba-change-request',
  'Iteration Feedback': 'iteration-feedback',
  'Scope Change': 'scope-change',
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

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

function csv(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function parseLabelMap(value) {
  if (!value?.trim()) return DEFAULT_LABEL_MAP

  return csv(value).reduce((map, pair) => {
    const separatorIndex = pair.indexOf(':')
    if (separatorIndex === -1) return map

    const dashboardLabel = pair.slice(0, separatorIndex).trim()
    const jiraLabel = pair.slice(separatorIndex + 1).trim()
    if (dashboardLabel && jiraLabel) {
      map[dashboardLabel] = jiraLabel
    }
    return map
  }, {})
}

function quoteJqlValue(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function toBaseUrl(value) {
  return value.trim().replace(/\/$/, '')
}

function toBrowseBaseUrl(baseUrl) {
  return baseUrl.endsWith('/browse') ? baseUrl : `${baseUrl}/browse`
}

async function jiraFetch(path, options) {
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${config.auth}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Jira request failed: ${response.status} ${response.statusText}\n${body}`)
  }

  return response.json()
}

async function searchIssues(jql) {
  const issues = []
  let startAt = 0
  const maxResults = config.maxResults

  while (true) {
    const payload = await jiraFetch('/rest/api/3/search', {
      method: 'POST',
      body: JSON.stringify({
        jql,
        startAt,
        maxResults,
        fields: [
          'summary',
          'labels',
          'status',
          'project',
          'updated',
          'created',
          'issuetype',
          'priority',
          'assignee',
          'components',
          'parent',
        ],
      }),
    })

    issues.push(...(payload.issues || []))
    startAt += payload.maxResults || maxResults

    if (startAt >= payload.total || !payload.issues?.length) break
  }

  return issues
}

function adaptIssue(issue) {
  const jiraLabels = issue.fields?.labels || []
  const labels = Object.entries(config.labelMap)
    .filter(([, jiraLabel]) => jiraLabels.includes(jiraLabel))
    .map(([dashboardLabel]) => dashboardLabel)

  return {
    id: issue.key,
    name: issue.fields?.summary || issue.key,
    labels,
    status: issue.fields?.status?.name || '',
    project: issue.fields?.project?.key || '',
    issueType: issue.fields?.issuetype?.name || '',
    priority: issue.fields?.priority?.name || '',
    assignee: issue.fields?.assignee?.displayName || '',
    components: (issue.fields?.components || []).map(component => component.name),
    parent: issue.fields?.parent?.key || '',
    created: issue.fields?.created || '',
    updated: issue.fields?.updated || '',
    url: `${config.browseBaseUrl}/${issue.key}`,
  }
}

await loadEnvFiles()

const baseUrl = toBaseUrl(requireEnv('JIRA_BASE_URL'))
const email = requireEnv('JIRA_EMAIL')
const token = requireEnv('JIRA_API_TOKEN')

const config = {
  baseUrl,
  browseBaseUrl: toBrowseBaseUrl(process.env.JIRA_BROWSE_BASE_URL?.trim() || baseUrl),
  auth: Buffer.from(`${email}:${token}`).toString('base64'),
  labelMap: parseLabelMap(process.env.JIRA_LABEL_MAP),
  maxResults: Number(process.env.JIRA_MAX_RESULTS || 100),
}

const jiraLabels = Object.values(config.labelMap)
const labelClause = `labels in (${jiraLabels.map(quoteJqlValue).join(', ')})`
const projectKeys = csv(process.env.JIRA_PROJECT_KEYS)
const projectClause = projectKeys.length
  ? `project in (${projectKeys.map(quoteJqlValue).join(', ')})`
  : ''
const extraJql = process.env.JIRA_EXTRA_JQL?.trim()

const jql = [labelClause, projectClause, extraJql]
  .filter(Boolean)
  .join(' AND ')
  .concat(' ORDER BY updated DESC')

const issues = (await searchIssues(jql))
  .map(adaptIssue)
  .filter(issue => issue.labels.length > 0)

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(
  outputPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    browseBaseUrl: config.browseBaseUrl,
    query: {
      projectKeys,
      labelMap: config.labelMap,
      extraJql: extraJql || '',
    },
    issues,
  }, null, 2)}\n`
)

console.log(`Captured ${issues.length} Jira issues into ${outputPath}`)
