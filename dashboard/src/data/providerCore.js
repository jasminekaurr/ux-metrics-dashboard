import { buildRollingMonthLabels } from '../utils/monthLabels.js'

const STORAGE_KEY = 'ux-dashboard-data-upload'

function deepMerge(base, override) {
  if (override === undefined || override === null) return base
  if (Array.isArray(override)) return override
  if (typeof override !== 'object' || typeof base !== 'object' || base === null) {
    return override
  }

  const result = { ...base }
  for (const [key, value] of Object.entries(override)) {
    result[key] = key in base ? deepMerge(base[key], value) : value
  }
  return result
}

function normalizeUploads(uploads = {}) {
  const normalized = { ...uploads }
  if (normalized.months && !normalized.MONTHS) {
    normalized.MONTHS = normalized.months
  }
  if (normalized.apex && !normalized.apexData) {
    normalized.apexData = normalized.apex
  }
  return normalized
}

export function getStoredUploads() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveUploads(uploads) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads))
}

export function clearUploads() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function buildDataFromSources(sampleData, liveOverrides = {}, uploadOverrides = {}) {
  const uploads = normalizeUploads(uploadOverrides)
  const merged = { ...sampleData }

  for (const [key, value] of Object.entries(liveOverrides)) {
    if (key === 'apex') merged.apexData = value
    else if (key === 'months') merged.MONTHS = value
    else merged[key] = value
  }

  for (const [key, value] of Object.entries(uploads)) {
    if (key === 'apex') merged.apexData = value
    else if (key === 'months') merged.MONTHS = value
    else if (key in merged) merged[key] = deepMerge(merged[key], value)
    else merged[key] = value
  }

  const hasCustomMonths = Boolean(
    uploads?.MONTHS
    || uploads?.months
    || liveOverrides?.months
  )
  if (!hasCustomMonths && Array.isArray(merged.MONTHS)) {
    merged.MONTHS = buildRollingMonthLabels(merged.MONTHS.length)
  }

  return merged
}

export const DATA_FILE_NAMES = [
  'months',
  'executive',
  'roadmap',
  'research',
  'analytics',
  'cost',
  'projectComponents',
  'strategic',
  'researchInitiatives',
  'panelHealth',
  'ubaIASpotlight',
  'researchAsks',
  'strategicContributions',
  'apex',
  'jiraLabelAdoption',
  'fcubComponentVenn',
]
