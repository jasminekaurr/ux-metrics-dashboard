/**
 * providerCore.js — merge, rolling months, and upload persistence.
 *
 * Deep-merges sample → live → upload, normalizes month arrays, and reads/writes
 * localStorage uploads. Related: data/provider.js, utils/monthLabels.js.
 *
 * Merge order (later wins for the same key):
 *   1. sample  — bundled demo JSON from data/sample/
 *   2. live    — optional capture outputs from data/live/*.json (gitignored)
 *   3. upload  — optional runtime JSON from localStorage (Data Settings UI)
 *
 * deepMerge rules:
 *   - Arrays are replaced wholesale (not concatenated element-wise).
 *   - Plain objects recurse key-by-key; scalars / null from override win.
 *   - Live layer assigns top-level keys (with apex→apexData, months→MONTHS aliases).
 *   - Upload layer deepMerges into keys that already exist on the merged object.
 *
 * Rolling months: unless live/upload supplies custom months, MONTHS is rewritten
 * via buildRollingMonthLabels() so charts always show a trailing N-month window.
 *
 * DATA_FILE_NAMES lists the canonical upload/snapshot file stems (no .json).
 * Keep in sync with sample/index.js, schema.js, and docs/DATA-MANIFEST.json.
 */
import { buildRollingMonthLabels } from '../utils/monthLabels.js'

const STORAGE_KEY = 'ux-dashboard-data-upload'

/**
 * Recursively merge override onto base.
 * Arrays and non-objects from override replace base values entirely.
 */
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

/** Map alternate upload keys (months, apex) onto internal names (MONTHS, apexData). */
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

/**
 * Build the runtime data object consumers read from DataContext.
 *
 * @param {object} sampleData - Bundled sample bundle (from sample/index.js)
 * @param {object} liveOverrides - Map of file-stem → parsed JSON from live/
 * @param {object} uploadOverrides - Partial overrides from localStorage upload
 */
export function buildDataFromSources(sampleData, liveOverrides = {}, uploadOverrides = {}) {
  const uploads = normalizeUploads(uploadOverrides)
  const merged = { ...sampleData }

  // Live wins over sample for matching keys (aliases remapped to internal names).
  for (const [key, value] of Object.entries(liveOverrides)) {
    if (key === 'apex') merged.apexData = value
    else if (key === 'months') merged.MONTHS = value
    else merged[key] = value
  }

  // Upload wins last: deepMerge into existing keys so partial JSON can patch objects.
  for (const [key, value] of Object.entries(uploads)) {
    if (key === 'apex') merged.apexData = value
    else if (key === 'months') merged.MONTHS = value
    else if (key in merged) merged[key] = deepMerge(merged[key], value)
    else merged[key] = value
  }

  // Only roll months when neither live nor upload provided an explicit calendar.
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

/**
 * Canonical data-file stems for upload UI, snapshot export, and validation.
 * Filenames are `{name}.json` under sample/ or live/.
 * Note: 'apex' maps to runtime key apexData; 'months' maps to MONTHS.
 */
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
