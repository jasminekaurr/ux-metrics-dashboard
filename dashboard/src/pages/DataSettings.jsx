import { useMemo, useState } from 'react'
import { useDataControls } from '../context/DataContext'
import { DATA_FILE_NAMES } from '../data/provider'
import { DATA_SCHEMA } from '../data/schema'
import './ExecutiveSummary.css'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

function parseJsonFiles(fileList) {
  const uploads = {}
  const readers = Array.from(fileList).map(file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const key = file.name.replace(/\.json$/i, '')
        uploads[key] = JSON.parse(reader.result)
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  }))

  return Promise.all(readers).then(() => uploads)
}

export default function DataSettings() {
  const { data, applyUpload, resetUpload, hasUpload } = useDataControls()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const snapshot = useMemo(() => {
    const payload = {}
    for (const name of DATA_FILE_NAMES) {
      if (name === 'apex') {
        payload.apex = data.apexData
      } else if (name === 'months') {
        payload.months = data.MONTHS
      } else {
        payload[name] = data[name]
      }
    }
    return payload
  }, [data])

  const downloadSnapshot = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ux-dashboard-snapshot.json'
    link.click()
    URL.revokeObjectURL(url)
    setStatus('Downloaded current dashboard snapshot.')
    setError('')
  }

  const handleUpload = async (event) => {
    const files = event.target.files
    if (!files?.length) return

    setStatus('')
    setError('')

    try {
      let uploads
      if (files.length === 1 && files[0].name.endsWith('.json')) {
        const text = await files[0].text()
        uploads = JSON.parse(text)
      } else {
        uploads = await parseJsonFiles(files)
      }
      applyUpload(uploads)
      setStatus('Uploaded data applied for this browser session.')
    } catch {
      setError('Could not parse the uploaded JSON. Use a snapshot file or individual domain JSON files.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">Data</div>
          <h1 className="es-title">Data Settings</h1>
          <p className="es-subtitle">
            Use bundled sample data, upload your own JSON snapshot, or capture live data with the integration scripts before building.
          </p>
        </div>
      </div>

      <div className="es-content" style={{ fontFamily: MONO, display: 'grid', gap: 24, maxWidth: 900 }}>
        <section style={{ border: '1px solid var(--es-border-str)', borderRadius: 8, padding: 20, background: 'var(--es-surface)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Current source</h2>
          <p style={{ margin: 0, color: 'var(--es-text-2)', lineHeight: 1.6 }}>
            {hasUpload
              ? 'Custom upload is active in this browser session.'
              : 'Bundled sample data is active. Live capture output in src/data/live/ overrides sample data at build time.'}
          </p>
        </section>

        <section style={{ border: '1px solid var(--es-border-str)', borderRadius: 8, padding: 20, background: 'var(--es-surface)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Download snapshot</h2>
          <p style={{ margin: '0 0 16px', color: 'var(--es-text-2)', lineHeight: 1.6 }}>
            Export the data currently powering the dashboard as a single JSON file.
          </p>
          <button type="button" onClick={downloadSnapshot} style={{ cursor: 'pointer' }}>
            Download snapshot
          </button>
        </section>

        <section style={{ border: '1px solid var(--es-border-str)', borderRadius: 8, padding: 20, background: 'var(--es-surface)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Upload snapshot</h2>
          <p style={{ margin: '0 0 16px', color: 'var(--es-text-2)', lineHeight: 1.6 }}>
            Upload a snapshot JSON file or multiple domain JSON files. Uploads are stored in localStorage for this browser only.
          </p>
          <input type="file" accept=".json,application/json" multiple onChange={handleUpload} />
          {hasUpload && (
            <button type="button" onClick={resetUpload} style={{ marginLeft: 12, cursor: 'pointer' }}>
              Reset to bundled sample
            </button>
          )}
        </section>

        <section style={{ border: '1px solid var(--es-border-str)', borderRadius: 8, padding: 20, background: 'var(--es-surface)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Data files</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {Object.entries(DATA_SCHEMA).map(([name, meta]) => (
              <div key={name} style={{ paddingBottom: 12, borderBottom: '1px dashed var(--es-border-str)' }}>
                <div style={{ fontWeight: 600 }}>{name}.json</div>
                <div style={{ color: 'var(--es-text-2)', marginTop: 4, lineHeight: 1.5 }}>{meta.description}</div>
              </div>
            ))}
          </div>
        </section>

        {(status || error) && (
          <p style={{ color: error ? '#ff4d4d' : 'var(--es-text-2)', margin: 0 }}>{error || status}</p>
        )}
      </div>
    </div>
  )
}
