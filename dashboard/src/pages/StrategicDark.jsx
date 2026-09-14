/**
 * StrategicDark.jsx — strategic design contribution matrix (/strategic).
 *
 * Plots contribution cards on impact × maturity quadrants; demo filters to a
 * subset of cards. Related: data/sample/strategic.json.
 */
import { useState } from 'react'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import {
  QUADRANTS,
  DETAIL_FIELDS,
  VISIBLE_IDS,
  quadrantOf,
} from '../config/strategicQuadrants'
import { FONT_MONO as MONO } from '../config/typography'
import './ExecutiveSummary.css'
import './StrategicDark.css'

export default function StrategicDark() {
  const { strategicContributions } = useDashboardData()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [lastSelected, setLastSelected] = useState(null)

  const cards = strategicContributions.filter(c => VISIBLE_IDS.includes(c.id))
  const selected = strategicContributions.find(c => c.id === selectedId) || null

  const selectCard = (id) => {
    if (id === selectedId) {
      setSelectedId(null)
      return
    }
    const card = strategicContributions.find(c => c.id === id)
    if (card) setLastSelected(card)
    setSelectedId(id)
  }

  const panelCard = selected || lastSelected
  const panelType = panelCard ? quadrantOf(panelCard.x, panelCard.y) : null
  const panelMeta = panelType ? QUADRANTS[panelType] : null

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">Strategic Contribution</div>
          <h1 className="es-title">Strategic Design Contribution<span className="es-cursor" /></h1>
        </div>
      </div>

      <div className="es-content">
        <div className="sd-matrix-wrap">
          {/* ── Impact × Maturity matrix ── */}
          <div className="sd-matrix">
            {/* Plot area */}
            <div className="sd-matrix-inner">
              {/* Axis cross */}
              <div className="sd-axis-v" />
              <div className="sd-axis-h" />

              {/* Quadrant labels (top-left of each quadrant) */}
              {[
                { type: 'Blocker',      left: '0%',  top: '0%' },
                { type: 'Enhancement',  left: '50%', top: '0%' },
                { type: 'Opportunity',  left: '0%',  top: '50%' },
                { type: 'Optimization', left: '50%', top: '50%' },
              ].map(q => {
                const meta = QUADRANTS[q.type]
                const labelColor = isLight ? meta.textLight : meta.color
                return (
                  <div key={q.type} style={{
                    position: 'absolute', left: q.left, top: q.top,
                    transform: 'translate(14px, 12px)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: labelColor, opacity: isLight ? 0.85 : 0.5,
                    pointerEvents: 'none', whiteSpace: 'nowrap',
                  }}>
                    <span className="sd-quad-icon">{meta.icon}</span>{q.type}
                  </div>
                )
              })}

              {/* Axis captions */}
              <div className="sd-axis-caption sd-axis-caption--impact">
                Business Impact
              </div>
              <div className="sd-axis-caption sd-axis-caption--maturity">
                Product Maturity
              </div>

              {/* Contribution cards */}
              {cards.map(card => {
                const type = quadrantOf(card.x, card.y)
                const meta = QUADRANTS[type]
                const accent = meta.color
                const typeColor = isLight ? meta.textLight : meta.color
                const isSelected = card.id === selectedId
                const isHover = card.id === hoveredId && !isSelected
                const active = isSelected || isHover
                return (
                  <button
                    key={card.id}
                    onClick={() => selectCard(card.id)}
                    onMouseEnter={() => setHoveredId(card.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: 'absolute',
                      left: `${card.x}%`,
                      top: `${100 - card.y}%`,
                      transform: `translate(-50%, -50%) translateY(${isHover ? -2 : 0}px)`,
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9,
                      width: 184,
                      padding: '12px 13px 13px',
                      textAlign: 'left',
                      background: isSelected
                        ? `linear-gradient(${accent}${isLight ? '22' : '2e'}, ${accent}${isLight ? '22' : '2e'}), var(--es-surface)`
                        : `linear-gradient(${accent}${isLight ? '12' : '1a'}, ${accent}${isLight ? '12' : '1a'}), var(--es-surface)`,
                      border: `1px solid ${active ? accent : `${accent}${isLight ? '59' : '4d'}`}`,
                      borderRadius: 'var(--es-r)',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? `inset 3px 0 0 ${accent}, 0 8px 24px ${accent}40`
                        : isHover
                          ? `inset 3px 0 0 ${accent}, 0 6px 18px ${accent}${isLight ? '33' : '3d'}`
                          : `inset 3px 0 0 ${accent}`,
                      transition: 'border-color 150ms, background 150ms, box-shadow 150ms, transform 150ms',
                      zIndex: active ? 3 : 2,
                    }}
                  >
                    <span className="sd-card-type" style={{ color: typeColor }}>
                      {type}
                    </span>
                    <span className="sd-card-title">
                      {card.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide-in detail panel ── */}
      <div
        onClick={() => setSelectedId(null)}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.45)',
          opacity: selected ? 1 : 0,
          pointerEvents: selected ? 'auto' : 'none',
          transition: 'opacity 220ms ease',
        }}
      />
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 41,
          width: 'min(440px, 92vw)',
          background: 'var(--es-surface)',
          borderLeft: '1px solid var(--es-border-str)',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.35)',
          transform: selected ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {panelCard && panelMeta && (
          <>
            <div style={{
              padding: '20px 22px 18px',
              borderBottom: '1px solid var(--es-border-str)',
              background: `linear-gradient(135deg, ${panelMeta.color}12 0%, transparent 100%)`,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '4px 9px', borderRadius: 'var(--es-r-sm)',
                  background: `${panelMeta.color}1f`, border: `1px solid ${panelMeta.color}40`,
                  fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: isLight ? panelMeta.textLight : panelMeta.color, marginBottom: 12,
                }}>
                  <span style={{ fontSize: 13 }}>{panelMeta.icon}</span>{panelType}
                </div>
                <div className="sd-drawer-title">
                  {panelCard.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="sd-drawer-close"
              >
                ✕
              </button>
            </div>

            <div className="sd-drawer-body">
              {DETAIL_FIELDS.map(([label, key]) => (
                <div key={key} className="sd-field">
                  <div className="sd-field-label">
                    {label}
                  </div>
                  <p className="sd-field-body">
                    {panelCard[key]}
                  </p>
                </div>
              ))}

              <div className="sd-field-label" style={{ marginBottom: 8 }}>
                Metrics
              </div>
              <div className="sd-metrics-grid">
                {panelCard.metrics.map((m, i) => (
                  <div key={i} className="sd-metric-tile">
                    <div className="sd-metric-value">
                      {m.value}
                    </div>
                    <div className="sd-metric-label">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

