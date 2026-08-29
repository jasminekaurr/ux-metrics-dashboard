import { createContext, useContext, useMemo, useState } from 'react'
import { buildData } from '../data/provider.js'
import { clearUploads, getStoredUploads, saveUploads } from '../data/providerCore.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
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

export function useDashboardData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDashboardData must be used within DataProvider')
  }
  return context.data
}

export function useDataControls() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataControls must be used within DataProvider')
  }
  return context
}
