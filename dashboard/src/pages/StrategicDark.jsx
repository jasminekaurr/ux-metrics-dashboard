import { useState } from 'react'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import './ExecutiveSummary.css'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

const QUADRANTS = {
  Blocker:      { icon: '🚧', color: '#a78bfa', textLight: '#6d28d9' },
  Enhancement:  { icon: '✨', color: '#0dc2d6', textLight: '#0e7490' },
  Opportunity:  { icon: '🌱', color: '#34d058', textLight: '#15803d' },
  Optimization: { icon: '⚡', color: '#ff4d4d', textLight: '#dc2626' },
}

// Position on the matrix determines the type: x = maturity, y = impact.
function quadrantOf(x, y) {
  if (y >= 50) return x < 50 ? 'Blocker' : 'Enhancement'
  return x < 50 ? 'Opportunity' : 'Optimization'
}

const DETAIL_FIELDS = [
  ['Problem', 'problem'],
  ['Evidence', 'evidence'],
  ['Recommendation', 'recommendation'],
  ['Outcome', 'outcome'],
]

// Show a focused set of example contributions for now.
const VISIBLE_IDS = ['quantifying-ux', 'design-system-ai-ready', 'transact-panel-groupings']

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
          <p className="es-subtitle">
            Every contribution mapped by business impact and product maturity. Select a card to see the detail.
          </p>
        </div>
      </div>

      <div className="es-content">
        <div style={{ paddingTop: 40, paddingBottom: 60 }}>
          {/* ── Impact × Maturity matrix ── */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 620,
            border: '1px solid var(--es-border-str)',
            borderRadius: 'var(--es-r)',
            background: 'var(--es-surface)',
            padding: '48px 56px 44px 60px',
          }}>
            {/* Plot area */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Axis cross */}
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--es-border-str)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--es-border-str)' }} />

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
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>{q.type}
                  </div>
                )
              })}

              {/* Axis captions */}
              <div style={{
                position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)',
                fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--es-text-3)', whiteSpace: 'nowrap',
              }}>
                Business Impact
              </div>
              <div style={{
                position: 'absolute', top: '50%', right: -46, transform: 'translateY(calc(-50% - 16px))',
                fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--es-text-3)', whiteSpace: 'nowrap',
              }}>
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
                    <span style={{
                      fontFamily: MONO, fontSize: 8.5, fontWeight: 600, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: typeColor,
                    }}>
                      {type}
                    </span>
                    <span style={{
                      fontFamily: MONO, fontSize: 12.5, fontWeight: 500,
                      color: 'var(--es-text-1)', lineHeight: 1.3,
                    }}>
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
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--es-text-1)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  {panelCard.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--es-border-str)',
                  color: 'var(--es-text-3)', cursor: 'pointer', fontFamily: MONO, fontSize: 11,
                  width: 30, height: 30, borderRadius: 'var(--es-r-sm)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 28px' }}>
              {DETAIL_FIELDS.map(([label, key]) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div style={{
                    fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--es-text-3)', marginBottom: 6,
                  }}>
                    {label}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--es-text-2)', lineHeight: 1.6, margin: 0 }}>
                    {panelCard[key]}
                  </p>
                </div>
              ))}

              <div style={{
                fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--es-text-3)', marginBottom: 8,
              }}>
                Metrics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {panelCard.metrics.map((m, i) => (
                  <div key={i} style={{
                    padding: '12px 12px 10px',
                    background: 'var(--es-surface-2)',
                    border: '1px solid var(--es-border-str)',
                    borderRadius: 'var(--es-r-sm)',
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 300, color: 'var(--es-text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                      {m.value}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--es-text-3)', marginTop: 5, lineHeight: 1.35 }}>
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

