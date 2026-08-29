import sampleData from './sample/index.js'
import { buildDataFromSources, getStoredUploads, DATA_FILE_NAMES } from './providerCore.js'

const liveModules = import.meta.glob('./live/*.json', { eager: true, import: 'default' })

function mapLiveModules(modules) {
  const mapped = {}
  for (const [path, value] of Object.entries(modules)) {
    const name = path.split('/').pop().replace('.json', '')
    mapped[name] = value
  }
  return mapped
}

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
