/**
 * provider.js — wires sample + live JSON into buildData().
 *
 * Eager-globs optional live/*.json capture outputs and merges them with sample
 * data and uploads. Related: data/providerCore.js, data/sample/index.js.
 *
 * Wiring into buildDataFromSources:
 *   - sampleData  ← default import from ./sample/index.js (or caller override)
 *   - live        ← import.meta.glob('./live/*.json', { eager }) keyed by file stem
 *                   (e.g. './live/jiraLabelAdoption.json' → live.jiraLabelAdoption)
 *   - uploads     ← uploadOverrides arg, else getStoredUploads() from localStorage
 *
 * live/ is gitignored; when empty the glob yields {} and sample data is unchanged.
 * Re-exports providerCore helpers so call sites can import from this module alone.
 */
import sampleData from './sample/index.js'
import { buildDataFromSources, getStoredUploads, DATA_FILE_NAMES } from './providerCore.js'

// Build-time eager glob: every live/*.json becomes a module with default export.
const liveModules = import.meta.glob('./live/*.json', { eager: true, import: 'default' })

/** Convert Vite glob paths into { fileStem: jsonValue } for the live merge layer. */
function mapLiveModules(modules) {
  const mapped = {}
  for (const [path, value] of Object.entries(modules)) {
    const name = path.split('/').pop().replace('.json', '')
    mapped[name] = value
  }
  return mapped
}

/**
 * Primary entry used by DataContext: merge sample + live + uploads.
 * Pass sampleDataInput to swap the bundled sample (tests / alternate demos).
 */
export function buildData(sampleDataInput = sampleData, uploadOverrides = null) {
  const live = mapLiveModules(liveModules)
  return buildDataFromSources(
    sampleDataInput,
    live,
    uploadOverrides ?? getStoredUploads() ?? {}
  )
}

export {
  buildDataFromSources,
  clearUploads,
  DATA_FILE_NAMES,
  getStoredUploads,
  saveUploads,
} from './providerCore.js'
