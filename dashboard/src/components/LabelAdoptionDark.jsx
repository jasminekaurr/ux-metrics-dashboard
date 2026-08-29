import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import '../pages/ExecutiveSummary.css'
import {
  ALL_TICKETS,
  LABEL_DEFINITIONS,
  UX_LABELS,
  VENN_COLORS,
} from '../data/uxLabelTickets'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

const LABELS = LABEL_DEFINITIONS.map(({ key, color, desc }) => ({
  key,
  color,
  desc,
  textLight: VENN_COLORS[key]?.textLight ?? color,
}))

const OVERLAPS = [
  { keys: [UX_LABELS.RESEARCH_DRIVEN, UX_LABELS.DESIGN_REVISION], color: '#3898ec' },
  { keys: [UX_LABELS.RESEARCH_DRIVEN, UX_LABELS.USABILITY_FIX], color: '#0891b2' },
  { keys: [UX_LABELS.DESIGN_REVISION, UX_LABELS.POST_HANDOFF], color: '#f59e0b' },
  { keys: [UX_LABELS.DESIGN_REVISION, UX_LABELS.USABILITY_FIX], color: '#f59e0b' },
  { keys: [UX_LABELS.POST_HANDOFF, UX_LABELS.USABILITY_FIX], color: '#ff2d2d' },
  { keys: [UX_LABELS.RESEARCH_DRIVEN, UX_LABELS.DESIGN_REVISION, UX_LABELS.USABILITY_FIX], color: '#a78bfa' },
]

export default function LabelAdoptionDark() {
  const [selected, setSelected] = useState(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const getTextColor = (key) => {
    const lbl = LABELS.find(l => l.key === key)
    return isDark ? lbl?.color : lbl?.textLight
  }

  const countForLabel = key => ALL_TICKETS.filter(t => t.labels.includes(key)).length
  const maxCount = Math.max(...LABELS.map(l => countForLabel(l.key)))
  const singleLabel = ALL_TICKETS.filter(t => t.labels.length === 1).length
  const multiLabel = ALL_TICKETS.filter(t => t.labels.length > 1).length

  const countForOverlap = keys =>
    ALL_TICKETS.filter(t => keys.every(k => t.labels.includes(k))).length

  const getTickets = () => {
    if (!selected) return []
    if (selected.includes('|')) {
      const keys = selected.split('|')
      return ALL_TICKETS.filter(t => keys.every(k => t.labels.includes(k)))
    }
    return ALL_TICKETS.filter(t => t.labels.includes(selected))
  }

  const selectedLabel = selected && !selected.includes('|')
    ? LABELS.find(l => l.key === selected) : null
  const selectedOverlap = selected && selected.includes('|')
    ? OVERLAPS.find(o => o.keys.join('|') === selected) : null
  const activeColor = selectedLabel
    ? (isDark ? selectedLabel.color : selectedLabel.textLight)
    : (selectedOverlap ? getTextColor(selectedOverlap.keys[0]) : 'var(--es-text-3)')

  const tickets = getTickets()

  return (
    <div style={{ fontFamily: MONO }}>
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--es-border-str)',
        background: 'var(--es-surface-2)',
      }}>
        {[
          { num: ALL_TICKETS.length, label: 'Total tickets' },
          { num: singleLabel, label: 'Single-label' },
          { num: multiLabel, label: 'Multi-label', accent: true },
          { num: LABELS.length, label: 'Categories' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '14px 20px',
            borderRight: i < 3 ? '1px solid var(--es-border-str)' : 'none',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: '"Alliance No. 2", -apple-system, sans-serif',
              fontSize: 28, fontWeight: 300,
              letterSpacing: '-0.10em', lineHeight: 1,
              color: s.accent ? '#f59e0b' : 'var(--es-text-1)',
              marginBottom: 4,
            }}>{s.num}</div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--es-text-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '0 0 55%', padding: '20px 24px', borderRight: '1px solid var(--es-border-str)' }}>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--es-text-3)', marginBottom: 16 }}>
            Label distribution — click to filter tickets
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LABELS.map(lbl => {
              const count = countForLabel(lbl.key)
              const pct = (count / maxCount) * 100
              const isActive = selected === lbl.key
              const textColor = isDark ? lbl.color : lbl.textLight
              return (
                <div
                  key={lbl.key}
                  onClick={() => setSelected(isActive ? null : lbl.key)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${isActive ? lbl.color : 'var(--es-border-str)'}`,
                    background: isActive ? `${lbl.color}0d` : 'transparent',
                    transition: 'border-color 150ms, background 150ms',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: lbl.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: isActive ? textColor : 'var(--es-text-1)', letterSpacing: '0.03em', fontWeight: isActive ? 600 : 400 }}>
                        {lbl.key}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--es-text-3)', marginTop: 2, lineHeight: 1.4 }}>
                        {lbl.desc}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: '"Alliance No. 2", -apple-system, sans-serif',
                      fontSize: 18, fontWeight: 300, letterSpacing: '-0.08em',
                      color: textColor, lineHeight: 1,
                    }}>{count}</div>
                  </div>

                  <div style={{ height: 6, borderRadius: 3, background: 'var(--es-border-str)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${lbl.color}55 0%, ${lbl.color} 100%)`,
                      boxShadow: isActive ? `0 0 8px ${lbl.color}80` : 'none',
                      transition: 'width 0.6s cubic-bezier(0.32,0.72,0,1), box-shadow 150ms',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--es-border-str)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: activeColor, fontWeight: 500, letterSpacing: '0.04em', marginBottom: 2 }}>
                    {selected.includes('|') ? selected.split('|').join(' + ') : selected}
                  </div>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--es-text-3)' }}>
                    {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'transparent', border: `1px solid ${activeColor}40`,
                    color: activeColor, cursor: 'pointer',
                    fontFamily: MONO, fontSize: 9,
                    padding: '3px 10px', borderRadius: 4,
                    letterSpacing: '0.06em',
                  }}
                >
                  ✕ Clear
                </button>
              </div>

              <div className="label-ticket-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {tickets.map((t, i) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '10px 20px',
                      borderBottom: i < tickets.length - 1 ? '1px dashed var(--es-border-str)' : 'none',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      fontSize: 9, color: activeColor, letterSpacing: '0.06em',
                      flexShrink: 0, marginTop: 2, fontWeight: 500,
                    }}>{t.id}</div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.5 }}>
                      {t.name}
                      {t.labels.length > 1 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                          {t.labels.map(l => {
                            const label = LABELS.find(x => x.key === l)
                            const chipTextColor = isDark ? label?.color : label?.textLight
                            return (
                              <span key={l} style={{
                                fontSize: 8, letterSpacing: '0.07em', textTransform: 'uppercase',
                                padding: '1px 6px', borderRadius: 10,
                                background: `${label?.color ?? '#6b6b6e'}18`,
                                color: chipTextColor ?? 'var(--es-text-3)',
                                border: `1px solid ${label?.color ?? '#6b6b6e'}30`,
                                fontWeight: 600,
                              }}>{l}</span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--es-text-3)', gap: 8,
            }}>
              <div style={{ fontSize: 28, opacity: 0.3 }}>◎</div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
                Select a label to view tickets
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--es-border-str)', padding: '16px 24px' }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--es-text-3)', marginBottom: 12 }}>
          Multi-label overlaps — tickets with 2+ categories
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {OVERLAPS.map(o => {
            const count = countForOverlap(o.keys)
            const comboKey = o.keys.join('|')
            const isActive = selected === comboKey
            const overlapTextColor = getTextColor(o.keys[0])
            return (
              <div
                key={comboKey}
                onClick={() => setSelected(isActive ? null : comboKey)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${isActive ? o.color : 'var(--es-border-str)'}`,
                  background: isActive ? `${o.color}12` : 'var(--es-surface-2)',
                  transition: 'border-color 150ms, background 150ms',
                }}
              >
                {o.keys.map((k, i) => {
                  const label = LABELS.find(l => l.key === k)
                  const lblTextColor = isDark ? label?.color : label?.textLight
                  return (
                    <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {i > 0 && <span style={{ fontSize: 8, color: 'var(--es-text-3)' }}>+</span>}
                      <span style={{ width: 5, height: 5, borderRadius: 1, background: label?.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 9, color: isActive ? lblTextColor : 'var(--es-text-2)', letterSpacing: '0.04em', fontWeight: isActive ? 600 : 400 }}>{k}</span>
                    </span>
                  )
                })}
                <span style={{
                  fontFamily: '"Alliance No. 2", -apple-system, sans-serif',
                  fontSize: 14, fontWeight: 300, letterSpacing: '-0.06em',
                  color: overlapTextColor, marginLeft: 4, lineHeight: 1,
                }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
