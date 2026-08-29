import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../src/data')
const sampleDir = resolve(dataDir, 'sample')

const { ALL_TICKETS } = await import('../src/data/uxLabelTickets.js')

const jiraPayload = {
  generatedAt: new Date().toISOString(),
  browseBaseUrl: 'https://example.atlassian.net/browse',
  query: {
    projectKeys: [],
    labelMap: {},
    extraJql: '',
  },
  issues: ALL_TICKETS.map(ticket => ({
    id: ticket.id,
    name: ticket.name,
    labels: ticket.labels,
    status: 'In Progress',
    project: ticket.id.split('-')[0],
    issueType: 'Story',
    priority: 'Medium',
    assignee: '',
    components: [],
    parent: '',
    created: '2026-01-15T10:00:00.000Z',
    updated: '2026-04-01T10:00:00.000Z',
    url: `https://example.atlassian.net/browse/${ticket.id}`,
  })),
}

const fcubPayload = {
  generatedAt: new Date().toISOString(),
  browseBaseUrl: 'https://example.atlassian.net/browse',
  issues: [
    { id: 'DS-101', name: 'Profile header redesign', labels: ['DS', 'Profile'], components: ['Profile Header'] },
    { id: 'DS-102', name: 'Feed card interaction patterns', labels: ['DS', 'Feed'], components: ['Feed Card', 'Profile Header'] },
    { id: 'DS-103', name: 'Messaging thread layout refresh', labels: ['DS', 'Messaging'], components: ['Messaging Thread'] },
    { id: 'DS-104', name: 'Job search filter panel', labels: ['DS', 'Jobs'], components: ['Job Search', 'Profile Header'] },
    { id: 'DS-105', name: 'Notification preferences center', labels: ['DS', 'Notifications'], components: ['Notification Center'] },
  ],
}

await mkdir(sampleDir, { recursive: true })

const targets = [
  [resolve(dataDir, 'jiraLabelAdoption.json'), jiraPayload],
  [resolve(sampleDir, 'jiraLabelAdoption.json'), jiraPayload],
  [resolve(dataDir, 'fcubComponentVenn.json'), fcubPayload],
  [resolve(sampleDir, 'fcubComponentVenn.json'), fcubPayload],
]

for (const [path, payload] of targets) {
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(`Wrote ${path}`)
}

const apexSource = resolve(dataDir, 'apex.json')
const apexTarget = resolve(sampleDir, 'apex.json')
await copyFile(apexSource, apexTarget)
console.log(`Copied ${apexSource} -> ${apexTarget}`)
