/**
 * DataContext.jsx — React provider for merged dashboard data.
 *
 * Exposes buildData() output plus upload/reset helpers backed by localStorage.
 * Related: data/provider.js, data/providerCore.js, docs/DATA-SETTINGS.md.
 *
 * Upload flow:
 *   1. Data Settings UI calls applyUpload(partialOverrides) with one or more
 *      DATA_FILE_NAMES keys (parsed JSON).
 *   2. applyUpload persists to localStorage via saveUploads, then setState.
 *   3. useMemo rebuilds `data` via buildData(undefined, uploadOverrides)
 *      (sample + live + upload merge in providerCore).
 *   4. resetUpload clears localStorage and drops overrides so sample/live return.
 *
 * Context value:
 *   - data         — merged dashboard object (pages read keys like roadmap)
 *   - applyUpload  — persist + apply upload overrides
 *   - resetUpload  — clear uploads and restore bundled/live merge
 *   - hasUpload    — true when localStorage overrides are active
 *
 * Hooks: useDashboardData() → data only; useDataControls() → full context value.
 */
import { createContext, useContext, useMemo, useState } from 'react'
import { buildData } from '../data/provider.js'
import { clearUploads, getStoredUploads, saveUploads } from '../data/providerCore.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  // Hydrate from localStorage on first render so refreshes keep uploaded data.
  const [uploadOverrides, setUploadOverrides] = useState(() => getStoredUploads())

  const data = useMemo(
    () => buildData(undefined, uploadOverrides),
    [uploadOverrides]
  )

  const applyUpload = (overrides) => {
    saveUploads(overrides)
    setUploadOverrides(overrides)
  }

  const resetUpload = () => {
    clearUploads()
    setUploadOverrides(null)
  }

  const value = useMemo(() => ({
    data,
    applyUpload,
    resetUpload,
    hasUpload: Boolean(uploadOverrides),
  }), [data, uploadOverrides])

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

/** Convenience hook: returns only the merged `data` object. */
export function useDashboardData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDashboardData must be used within DataProvider')
  }
  return context.data
}

/** Full controls: data, applyUpload, resetUpload, hasUpload. */
export function useDataControls() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataControls must be used within DataProvider')
  }
  return context
}
