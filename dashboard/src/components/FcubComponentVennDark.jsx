import { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import fcubComponentVenn from '../data/fcubComponentVenn.json'
import { getJiraBrowseUrl } from '../utils/jira'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'
const SANS = '"Alliance No. 2", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif'

function pointInCircle(px, py, c) {
  const dx = px - c.cx
  const dy = py - c.cy
  return dx * dx + dy * dy < c.r * c.r
}

function getRegionCentroid(circles, insideIndices, outsideIndices, samplePoints = 50) {
  const minX = Math.min(...circles.map(c => c.cx - c.r)) - 10
  const maxX = Math.max(...circles.map(c => c.cx + c.r)) + 10
  const minY = Math.min(...circles.map(c => c.cy - c.r)) - 10
  const maxY = Math.max(...circles.map(c => c.cy + c.r)) + 10

  let sumX = 0, sumY = 0, count = 0

  for (let i = 0; i < samplePoints; i++) {
    for (let j = 0; j < samplePoints; j++) {
      const x = minX + (maxX - minX) * (i / samplePoints)
      const y = minY + (maxY - minY) * (j / samplePoints)

      const insideAll = insideIndices.every(idx => pointInCircle(x, y, circles[idx]))
      const outsideAll = outsideIndices.every(idx => !pointInCircle(x, y, circles[idx]))

      if (insideAll && outsideAll) {
        sumX += x
        sumY += y
        count++
      }
    }
  }

  return count > 0 ? { x: sumX / count, y: sumY / count } : null
}

// Fallback mock data — LinkedIn-themed component label distribution
const ALL_TICKETS = [
  { id: 'DS-101', name: 'Profile header redesign — backlog', labels: ['UXNotStarted'] },
  { id: 'DS-102', name: 'Feed reaction affordances', labels: ['UXNotStarted'] },
  { id: 'DS-103', name: 'Connection suggestions layout', labels: ['UXNotStarted'] },
  { id: 'DS-104', name: 'Job alert preferences panel', labels: ['UXNotStarted'] },
  { id: 'DS-105', name: 'Premium upsell modal design', labels: ['UXNotStarted'] },
  { id: 'DS-106', name: 'Creator analytics dashboard', labels: ['UXNotStarted'] },
  { id: 'DS-107', name: 'Messaging read receipts pattern', labels: ['UXNotStarted'] },
  { id: 'DS-108', name: 'Network filter chips exploration', labels: ['UXNotStarted'] },
  { id: 'DS-201', name: 'Feed card density refresh in progress', labels: ['UXInProgress'] },
  { id: 'DS-202', name: 'Notification center layout work', labels: ['UXInProgress'] },
  { id: 'DS-203', name: 'Profile skills section reordering', labels: ['UXInProgress'] },
  { id: 'DS-204', name: 'Mobile navigation patterns', labels: ['UXInProgress'] },
  { id: 'DS-205', name: 'Messaging compose bar consolidation', labels: ['UXInProgress'] },
  { id: 'DS-206', name: 'Job apply confirmation flow', labels: ['UXInProgress'] },
  { id: 'DS-301', name: 'Login screen redesign — design complete', labels: ['UXDESIGNDONE'] },
  { id: 'DS-302', name: 'Profile photo upload finalized', labels: ['UXDESIGNDONE'] },
  { id: 'DS-303', name: 'Onboarding flow design complete', labels: ['UXDESIGNDONE'] },
  { id: 'DS-304', name: 'Feed empty state handoff done', labels: ['UXDESIGNDONE'] },
  { id: 'DS-305', name: 'Settings screens delivered', labels: ['UXDESIGNDONE'] },
  { id: 'DS-401', name: 'Job search usability validation', labels: ['UXValidationinProgress'] },
  { id: 'DS-402', name: 'Profile edit flow validation', labels: ['UXValidationinProgress'] },
  { id: 'DS-403', name: 'Messaging attachment validation', labels: ['UXValidationinProgress'] },
  { id: 'DS-404', name: 'Network invite UX validation session', labels: ['UXValidationinProgress'] },
  { id: 'DS-501', name: 'Premium badge treatment — design wrapping', labels: ['UXInProgress', 'UXDESIGNDONE'] },
  { id: 'DS-502', name: 'Feed comment threading — final screens', labels: ['UXInProgress', 'UXDESIGNDONE'] },
  { id: 'DS-503', name: 'Job alert email preferences design', labels: ['UXInProgress', 'UXDESIGNDONE'] },
  { id: 'DS-601', name: 'Profile endorsements — validation', labels: ['UXDESIGNDONE', 'UXValidationinProgress'] },
  { id: 'DS-602', name: 'Creator tools insights validating', labels: ['UXDESIGNDONE', 'UXValidationinProgress'] },
  { id: 'DS-603', name: 'Messaging reactions in validation', labels: ['UXDESIGNDONE', 'UXValidationinProgress'] },
  { id: 'DS-604', name: 'Resume upload flow validation', labels: ['UXDESIGNDONE', 'UXValidationinProgress'] },
  { id: 'DS-701', name: 'Member support chat interface', labels: ['UXNotStarted', 'UXInProgress'] },
  { id: 'DS-702', name: 'Learning course discovery dashboard', labels: ['UXNotStarted', 'UXInProgress'] },
]

const COLORS = {
  'UXNotStarted':           { h: '#6b7280', g1: '#9ca3af', g2: '#374151', textLight: '#374151' },
  'UXInProgress':           { h: '#3898ec', g1: '#5eadff', g2: '#1a6dcc', textLight: '#1d4ed8' },
  'UXDESIGNDONE':           { h: '#10b981', g1: '#34d399', g2: '#059669', textLight: '#065f46' },
  'UXValidationinProgress': { h: '#f59e0b', g1: '#fcd34d', g2: '#d97706', textLight: '#92400e' },
}

const ACTIVE_TICKETS = fcubComponentVenn.issues?.length ? fcubComponentVenn.issues : ALL_TICKETS

function radiusFromCount(count, scale) {
  return Math.sqrt(count / Math.PI) * scale
}

export default function FcubComponentVennDark() {
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const getTextColor = (name) => {
    const c = COLORS[name]
    return isDark ? c.h : c.textLight
  }

  const data = useMemo(() => {
    const totalFor = (cat) => ACTIVE_TICKETS.filter(t => t.labels.includes(cat)).length
    const exactCount = (labels) => {
      const sorted = [...labels].sort().join(',')
      return ACTIVE_TICKETS.filter(t => [...t.labels].sort().join(',') === sorted).length
    }
    const getExactTickets = (labels) => {
      const sorted = [...labels].sort().join(',')
      return ACTIVE_TICKETS.filter(t => [...t.labels].sort().join(',') === sorted)
    }

    const totals = {
      notStarted: totalFor('UXNotStarted'),
      inProgress: totalFor('UXInProgress'),
      designDone: totalFor('UXDESIGNDONE'),
      validation: totalFor('UXValidationinProgress'),
    }

    const scale = 38
    const radii = {
      notStarted: radiusFromCount(totals.notStarted, scale),
      inProgress: radiusFromCount(totals.inProgress, scale),
      designDone: radiusFromCount(totals.designDone, scale),
      validation: radiusFromCount(totals.validation, scale),
    }

    return { totals, exactCount, getExactTickets, radii }
  }, [])

  const total = ACTIVE_TICKETS.length
  const { totals, exactCount, getExactTickets, radii } = data

  const circles = useMemo(() => [
    { id: 'notStarted', name: 'UXNotStarted',           cx: 270, cy: 200, r: radii.notStarted },
    { id: 'inProgress', name: 'UXInProgress',           cx: 430, cy: 200, r: radii.inProgress },
    { id: 'designDone', name: 'UXDESIGNDONE',           cx: 290, cy: 340, r: radii.designDone },
    { id: 'validation', name: 'UXValidationinProgress', cx: 420, cy: 340, r: radii.validation },
  ], [radii])

  const regionDefs = useMemo(() => {
    const names = circles.map(c => c.name)
    const defs = []

    defs.push({ id: 'ns_only',  labels: [names[0]], inside: [0], outside: [1, 2, 3] })
    defs.push({ id: 'ip_only',  labels: [names[1]], inside: [1], outside: [0, 2, 3] })
    defs.push({ id: 'dd_only',  labels: [names[2]], inside: [2], outside: [0, 1, 3] })
    defs.push({ id: 'val_only', labels: [names[3]], inside: [3], outside: [0, 1, 2] })

    defs.push({ id: 'ns_ip',  labels: [names[0], names[1]], inside: [0, 1], outside: [2, 3] })
    defs.push({ id: 'ns_dd',  labels: [names[0], names[2]], inside: [0, 2], outside: [1, 3] })
    defs.push({ id: 'ns_val', labels: [names[0], names[3]], inside: [0, 3], outside: [1, 2] })
    defs.push({ id: 'ip_dd',  labels: [names[1], names[2]], inside: [1, 2], outside: [0, 3] })
    defs.push({ id: 'ip_val', labels: [names[1], names[3]], inside: [1, 3], outside: [0, 2] })
    defs.push({ id: 'dd_val', labels: [names[2], names[3]], inside: [2, 3], outside: [0, 1] })

    defs.push({ id: 'ns_ip_dd',  labels: [names[0], names[1], names[2]], inside: [0, 1, 2], outside: [3] })
    defs.push({ id: 'ns_ip_val', labels: [names[0], names[1], names[3]], inside: [0, 1, 3], outside: [2] })
    defs.push({ id: 'ns_dd_val', labels: [names[0], names[2], names[3]], inside: [0, 2, 3], outside: [1] })
    defs.push({ id: 'ip_dd_val', labels: [names[1], names[2], names[3]], inside: [1, 2, 3], outside: [0] })

    defs.push({ id: 'all_four', labels: names.slice(), inside: [0, 1, 2, 3], outside: [] })

    return defs
  }, [circles])

  const regions = useMemo(() => {
    return regionDefs.map(def => ({
      ...def,
      count: exactCount(def.labels),
      tickets: getExactTickets(def.labels),
    })).filter(r => r.count > 0)
  }, [regionDefs, exactCount, getExactTickets])

  const regionCentroids = useMemo(() => {
    const centroids = {}
    regions.forEach(r => {
      const centroid = getRegionCentroid(circles, r.inside, r.outside, 40)
      if (centroid) centroids[r.id] = centroid
    })
    return centroids
  }, [regions, circles])

  const handleRegionClick = (labels) => {
    const key = [...labels].sort().join(',')
    const currentKey = selected && Array.isArray(selected) ? [...selected].sort().join(',') : null
    if (currentKey === key) {
      setSelected(null)
    } else {
      setSelected(labels)
    }
  }

  const handleCircleClick = (category) => {
    if (selected === category) {
      setSelected(null)
    } else {
      setSelected(category)
    }
  }

  const selectedTickets = useMemo(() => {
    if (!selected) return []
    if (Array.isArray(selected)) return getExactTickets(selected)
    return ACTIVE_TICKETS.filter(t => t.labels.includes(selected))
  }, [selected, getExactTickets])

  const selectedLabels = Array.isArray(selected) ? selected : (selected ? [selected] : [])
  const activeColor = selectedLabels.length > 0 ? getTextColor(selectedLabels[0]) : null

  const isRegionSelected = (labels) => {
    if (!selected || !Array.isArray(selected)) return false
    return [...labels].sort().join(',') === [...selected].sort().join(',')
  }

  const somethingSelected = selected !== null
  const isCircleActive = (name) => selected === name
  const isCircleHovered = (id) => hovered === id

  const circleLabelConfigs = [
    { name: 'UXNotStarted',           total: totals.notStarted, x: circles[0].cx, y: circles[0].cy - circles[0].r - 14, anchor: 'middle' },
    { name: 'UXInProgress',           total: totals.inProgress, x: circles[1].cx, y: circles[1].cy - circles[1].r - 14, anchor: 'middle' },
    { name: 'UXDESIGNDONE',           total: totals.designDone, x: circles[2].cx - circles[2].r, y: circles[2].cy + circles[2].r + 16, anchor: 'start' },
    { name: 'UXValidationinProgress', total: totals.validation, x: circles[3].cx + circles[3].r, y: circles[3].cy + circles[3].r + 16, anchor: 'end' },
  ]

  return (
    <div style={{ fontFamily: MONO, background: 'var(--es-surface)' }}>

      {/* Header */}
      <div style={{
        padding: '18px 24px 14px',
        borderBottom: '1px solid var(--es-border-str)',
        background: 'linear-gradient(180deg, rgba(16,185,129,0.04) 0%, transparent 100%)',
      }}>
        <div style={{
          fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--es-text-3)', marginBottom: 6,
        }}>
          DS · Component Label Distribution
        </div>
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 500,
          color: 'var(--es-text-1)', letterSpacing: '-0.01em',
        }}>
          {total} tickets across UX workflow stages
          <span style={{ fontSize: 11, color: 'var(--es-text-3)', marginLeft: 10, fontWeight: 400 }}>
            Click a circle to explore
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', height: 560 }}>

        {/* ── Venn Diagram ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
          <svg width="100%" height="480" viewBox="0 0 700 470" style={{ display: 'block', maxWidth: 700 }}>
            <defs>
              {Object.entries(COLORS).map(([name, c]) => (
                <filter key={name} id={`fcub-glow-${name}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                  <feFlood floodColor={c.h} floodOpacity="0.7" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}

              {circles.map(circle => {
                const c = COLORS[circle.name]
                return (
                  <radialGradient key={circle.id} id={`fcub-grad-${circle.id}`} cx="40%" cy="40%" r="65%">
                    <stop offset="0%" stopColor={c.g1} stopOpacity={isDark ? "0.40" : "0.50"} />
                    <stop offset="60%" stopColor={c.h} stopOpacity={isDark ? "0.22" : "0.30"} />
                    <stop offset="100%" stopColor={c.g2} stopOpacity={isDark ? "0.08" : "0.15"} />
                  </radialGradient>
                )
              })}
            </defs>

            {/* ── 4 overlapping circles ── */}
            <g style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}>
              {circles.map(circle => {
                const c = COLORS[circle.name]
                const active = isCircleActive(circle.name)
                const hov = isCircleHovered(circle.id)
                const dimmed = somethingSelected && !active

                return (
                  <g key={circle.id}>
                    {active && (
                      <circle
                        cx={circle.cx} cy={circle.cy} r={circle.r + 5}
                        fill="none" stroke={c.h} strokeWidth="1.5" strokeOpacity="0.4"
                        strokeDasharray="3 3"
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="18" dur="3s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={circle.cx} cy={circle.cy} r={circle.r}
                      fill={`url(#fcub-grad-${circle.id})`}
                      stroke={c.h}
                      strokeWidth={active ? 2.5 : hov ? 2 : 1.5}
                      strokeOpacity={active ? 1 : hov ? 0.8 : 0.5}
                      opacity={dimmed ? 0.25 : 1}
                      filter={active ? `url(#fcub-glow-${circle.name})` : undefined}
                      style={{ cursor: 'pointer', transition: 'opacity 0.3s, stroke-width 0.2s, stroke-opacity 0.2s' }}
                      onClick={() => handleCircleClick(circle.name)}
                      onMouseEnter={() => setHovered(circle.id)}
                      onMouseLeave={() => setHovered(null)}
                    />
                  </g>
                )
              })}
            </g>

            {/* ── Circle labels ── */}
            {circleLabelConfigs.map((lbl, i) => {
              const textColor = getTextColor(lbl.name)
              const active = isCircleActive(lbl.name)
              const dimmed = somethingSelected && !active
              return (
                <g key={i} opacity={dimmed ? 0.3 : 1} style={{ transition: 'opacity 0.3s' }}>
                  <text
                    x={lbl.x} y={lbl.y}
                    textAnchor={lbl.anchor}
                    fill={textColor} fontSize="10" fontWeight="600" fontFamily={MONO}
                    letterSpacing="0.04em"
                  >
                    {lbl.name}
                  </text>
                  <text
                    x={lbl.x} y={lbl.y + 12}
                    textAnchor={lbl.anchor}
                    fill={textColor} fontSize="8" fontFamily={MONO}
                    letterSpacing="0.08em" opacity="0.8"
                  >
                    {lbl.total} TICKETS
                  </text>
                </g>
              )
            })}

            {/* ── Clickable overlap region indicators ── */}
            {regions.filter(r => r.labels.length > 1).map(region => {
              const centroid = regionCentroids[region.id]
              if (!centroid) return null

              const regSelected = isRegionSelected(region.labels)
              const regHovered = hovered === region.id
              const isActive = regSelected || regHovered

              const primaryTextColor = getTextColor(region.labels[0])
              const primaryColor = COLORS[region.labels[0]]?.h ?? '#fff'
              const secondaryColor = COLORS[region.labels[1]]?.h ?? primaryColor
              const dimmed = somethingSelected && !regSelected

              const hitRadius = 18

              return (
                <g key={region.id} opacity={dimmed ? 0.25 : 1} style={{ transition: 'opacity 0.3s' }}>
                  {isActive && (
                    <circle
                      cx={centroid.x} cy={centroid.y}
                      r={regSelected ? 32 : 28}
                      fill={`url(#fcub-region-glow-${region.id})`}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {regSelected && (
                    <circle
                      cx={centroid.x} cy={centroid.y} r={24}
                      fill="none" stroke={primaryColor} strokeWidth="1"
                      strokeOpacity="0.6" strokeDasharray="4 4"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="24" dur="4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  <circle
                    cx={centroid.x} cy={centroid.y} r={hitRadius}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(region.labels)}
                    onMouseEnter={() => setHovered(region.id)}
                    onMouseLeave={() => setHovered(null)}
                  />

                  <text
                    x={centroid.x} y={centroid.y}
                    textAnchor="middle" dominantBaseline="central"
                    fill={isActive ? primaryTextColor : (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)')}
                    fontSize={isActive ? '13' : '11'}
                    fontWeight="600"
                    fontFamily={MONO}
                    letterSpacing="0.02em"
                    style={{
                      pointerEvents: 'none',
                      transition: 'all 0.2s ease-out',
                      filter: isActive ? `drop-shadow(0 0 6px ${primaryColor}80)` : (isDark ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))'),
                    }}
                  >
                    {region.count}
                  </text>

                  {regHovered && (
                    <text
                      x={centroid.x}
                      y={centroid.y + hitRadius + 12}
                      textAnchor="middle"
                      fill={primaryTextColor}
                      fontSize="8"
                      fontFamily={MONO}
                      fontWeight="600"
                      letterSpacing="0.06em"
                      style={{ pointerEvents: 'none' }}
                    >
                      {region.labels.map(l => l.replace(/^UX/, '').replace('inProgress', ' In Progress')).join(' · ')}
                    </text>
                  )}

                  <defs>
                    <radialGradient id={`fcub-region-glow-${region.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
                      <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.1" />
                      <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </g>
              )
            })}
          </svg>
        </div>

        {/* ── Ticket panel ── */}
        <div style={{
          flex: '0 0 340px',
          borderLeft: '1px solid var(--es-border-str)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {selected ? (
            <>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--es-border-str)',
                background: `linear-gradient(135deg, ${activeColor}10 0%, transparent 100%)`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {selectedLabels.map(label => (
                      <span key={label} style={{
                        fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 3,
                        background: `${COLORS[label]?.h}18`,
                        color: getTextColor(label),
                        border: `1px solid ${COLORS[label]?.h}35`,
                        fontWeight: 600,
                      }}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <div style={{
                    fontFamily: SANS, fontSize: 24, fontWeight: 300,
                    color: activeColor, letterSpacing: '-0.04em', lineHeight: 1,
                  }}>
                    {selectedTickets.length}
                    <span style={{
                      fontSize: 10, fontFamily: MONO, fontWeight: 400,
                      color: 'var(--es-text-3)', letterSpacing: '0.06em', marginLeft: 6,
                    }}>
                      ticket{selectedTickets.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {Array.isArray(selected) && selected.length > 1 && (
                    <div style={{
                      fontSize: 10, color: 'var(--es-text-3)', marginTop: 6,
                      fontFamily: SANS, lineHeight: 1.4,
                    }}>
                      Tickets with exactly these {selected.length} component labels
                    </div>
                  )}
                  {!Array.isArray(selected) && selectedTickets.filter(t => t.labels.length > 1).length > 0 && (
                    <div style={{
                      fontSize: 10, color: 'var(--es-text-3)', marginTop: 6,
                      fontFamily: SANS, lineHeight: 1.4,
                    }}>
                      Including {selectedTickets.filter(t => t.labels.length > 1).length} with multiple component labels
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: '1px solid var(--es-border-str)',
                    color: 'var(--es-text-3)', cursor: 'pointer',
                    fontFamily: MONO, fontSize: 10,
                    width: 28, height: 28, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedTickets.map((t, i) => (
                  <a
                    key={t.id}
                    href={getJiraBrowseUrl(t.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '12px 20px', textDecoration: 'none',
                      borderBottom: i < selectedTickets.length - 1 ? '1px solid var(--es-border-str)' : 'none',
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      fontSize: 9, color: activeColor, letterSpacing: '0.06em',
                      fontWeight: 600, flexShrink: 0, marginTop: 2, fontFamily: MONO,
                    }}>
                      {t.id}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.55,
                        fontFamily: SANS,
                      }}>
                        {t.name}
                      </div>
                      {t.labels.length > 1 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
                          {t.labels.map(l => (
                            <span key={l} style={{
                              fontSize: 7, letterSpacing: '0.06em', textTransform: 'uppercase',
                              padding: '2px 6px', borderRadius: 3,
                              background: `${COLORS[l]?.h ?? '#666'}15`,
                              color: getTextColor(l),
                              border: `1px solid ${COLORS[l]?.h ?? '#666'}30`,
                              fontWeight: 600,
                            }}>
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: 32,
            }}>
              <svg width="48" height="48" viewBox="0 0 48 48" style={{ opacity: 0.15 }}>
                <circle cx="18" cy="20" r="14" fill="none" stroke={isDark ? 'white' : 'black'} strokeWidth="1.5" />
                <circle cx="30" cy="20" r="14" fill="none" stroke={isDark ? 'white' : 'black'} strokeWidth="1.5" />
                <circle cx="24" cy="32" r="14" fill="none" stroke={isDark ? 'white' : 'black'} strokeWidth="1.5" />
              </svg>
              <div style={{
                fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
                color: 'var(--es-text-3)',
              }}>
                Select a stage
              </div>
              <div style={{
                fontSize: 11, color: 'var(--es-text-3)', textAlign: 'center',
                lineHeight: 1.6, maxWidth: 240, fontFamily: SANS, opacity: 0.7,
              }}>
                Click any circle to see tickets at that UX workflow stage
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
