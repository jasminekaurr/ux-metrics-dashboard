#!/usr/bin/env node
/**
 * Validates bundled sample data files required for a fresh clone to run.
 * Run from dashboard/: npm run validate:data
 */

import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sampleDir = resolve(__dirname, '../src/data/sample')

const REQUIRED_FILES = [
  'months.json',
  'executive.json',
  'roadmap.json',
  'research.json',
  'analytics.json',
  'cost.json',
  'projectComponents.json',
  'strategic.json',
  'researchInitiatives.json',
  'panelHealth.json',
  'ubaIASpotlight.json',
  'researchAsks.json',
  'strategicContributions.json',
  'apex.json',
  'jiraLabelAdoption.json',
  'fcubComponentVenn.json',
]

const errors = []

async function loadJson(name) {
  const path = resolve(sampleDir, name)
  try {
    const raw = await readFile(path, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    errors.push(`${name}: ${error.message}`)
    return null
  }
}

function assertArray(name, value, { minLength = 1 } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${name}: expected array`)
    return
  }
  if (value.length < minLength) {
    errors.push(`${name}: expected at least ${minLength} entries, got ${value.length}`)
  }
}

for (const file of REQUIRED_FILES) {
  await loadJson(file)
}

const months = await loadJson('months.json')
assertArray('months.json', months, { minLength: 1 })

const roadmap = await loadJson('roadmap.json')
if (roadmap && !roadmap.projects) {
  errors.push('roadmap.json: missing projects')
}

const analytics = await loadJson('analytics.json')
if (analytics) {
  assertArray('analytics.json monthlySummary', analytics.monthlySummary, { minLength: 1 })
  assertArray('analytics.json metrics', analytics.metrics, { minLength: 1 })
}

const jira = await loadJson('jiraLabelAdoption.json')
if (jira) {
  assertArray('jiraLabelAdoption.json issues', jira.issues, { minLength: 1 })
  if (jira.issues?.some(issue => !issue.id || !issue.name)) {
    errors.push('jiraLabelAdoption.json: each issue needs id and name')
  }
}

const strategicContributions = await loadJson('strategicContributions.json')
assertArray('strategicContributions.json', strategicContributions, { minLength: 1 })

if (errors.length) {
  console.error('Data validation failed:\n')
  for (const message of errors) console.error(`  - ${message}`)
  process.exit(1)
}

console.log(`Validated ${REQUIRED_FILES.length} sample data files in ${sampleDir}`)
