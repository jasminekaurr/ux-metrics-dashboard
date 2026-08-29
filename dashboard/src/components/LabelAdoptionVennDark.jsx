import { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getJiraBrowseUrl } from '../utils/jira'
import { useDashboardData } from '../context/DataContext'
import {
  ALL_TICKETS,
  UX_LABELS,
  VENN_COLORS,
  VENN_DESCRIPTIONS,
  VENN_ICONS,
  intersectionDescription,
} from '../data/uxLabelTickets'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'
const SANS = '"Alliance No. 2", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif'

const COLORS = VENN_COLORS
const DESCRIPTIONS = VENN_DESCRIPTIONS
const ICONS = VENN_ICONS

function pointInCircle(px, py, c) {
  const dx = px - c.cx
  const dy = py - c.cy
  return dx * dx + dy * dy < c.r * c.r
}

function getRegionCentroid(circles, insideIndices, outsideIndices, samplePoints = 50) {
  // Sample points and find approximate centroid of the region
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


function radiusFromCount(count, scale) {
  return Math.sqrt(count / Math.PI) * scale
}

export default function LabelAdoptionVennDark() {
  const { jiraLabelAdoption } = useDashboardData()
  const ACTIVE_TICKETS = jiraLabelAdoption?.issues?.length ? jiraLabelAdoption.issues : ALL_TICKETS

  // selected can be: null, a single category string, or an array of labels for region selection
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
      uxr:       totalFor(UX_LABELS.RESEARCH_DRIVEN),
      design:    totalFor(UX_LABELS.DESIGN_REVISION),
      handoff:   totalFor(UX_LABELS.POST_HANDOFF),
      usability: totalFor(UX_LABELS.USABILITY_FIX),
      ba:        totalFor(UX_LABELS.REQUIREMENTS_UPDATE),
      feedback:  totalFor(UX_LABELS.STAKEHOLDER_FEEDBACK),
      scope:     totalFor(UX_LABELS.SCOPE_EXPANSION),
    }

    const mainScale = 38
    const sepScale = 20
    const radii = {
      uxr:       radiusFromCount(totals.uxr, mainScale),
      design:    radiusFromCount(totals.design, mainScale),
      handoff:   radiusFromCount(totals.handoff, mainScale),
      usability: radiusFromCount(totals.usability, mainScale),
      ba:        radiusFromCount(totals.ba, sepScale),
      feedback:  radiusFromCount(totals.feedback, sepScale),
      scope:     radiusFromCount(totals.scope, sepScale),
    }

    return { totals, exactCount, getExactTickets, radii }
  }, [ACTIVE_TICKETS])

  const total = ACTIVE_TICKETS.length
  const { totals, exactCount, getExactTickets, radii } = data

  // Circle positions — close enough to create real overlaps (memoized to prevent re-renders)
  const circles = useMemo(() => [
    { id: 'uxr',       name: UX_LABELS.RESEARCH_DRIVEN,     cx: 270, cy: 200, r: radii.uxr },
    { id: 'design',    name: UX_LABELS.DESIGN_REVISION,      cx: 430, cy: 200, r: radii.design },
    { id: 'handoff',   name: UX_LABELS.POST_HANDOFF,         cx: 290, cy: 340, r: radii.handoff },
    { id: 'usability', name: UX_LABELS.USABILITY_FIX,        cx: 420, cy: 340, r: radii.usability },
  ], [radii])

  // Define all possible regions with their label combinations
  // inside: indices of circles the region is inside
  // outside: indices of circles the region is outside
  const regionDefs = useMemo(() => {
    const names = circles.map(c => c.name)
    const defs = []

    // Single-only regions (8 tickets each from data)
    defs.push({ id: 'uxr_only', labels: [names[0]], inside: [0], outside: [1, 2, 3] })
    defs.push({ id: 'design_only', labels: [names[1]], inside: [1], outside: [0, 2, 3] })
    defs.push({ id: 'handoff_only', labels: [names[2]], inside: [2], outside: [0, 1, 3] })
    defs.push({ id: 'usability_only', labels: [names[3]], inside: [3], outside: [0, 1, 2] })

    // Two-way overlaps
    defs.push({ id: 'uxr_design', labels: [names[0], names[1]], inside: [0, 1], outside: [2, 3] })
    defs.push({ id: 'uxr_handoff', labels: [names[0], names[2]], inside: [0, 2], outside: [1, 3] })
    defs.push({ id: 'uxr_usability', labels: [names[0], names[3]], inside: [0, 3], outside: [1, 2] })
    defs.push({ id: 'design_handoff', labels: [names[1], names[2]], inside: [1, 2], outside: [0, 3] })
    defs.push({ id: 'design_usability', labels: [names[1], names[3]], inside: [1, 3], outside: [0, 2] })
    defs.push({ id: 'handoff_usability', labels: [names[2], names[3]], inside: [2, 3], outside: [0, 1] })

    // Three-way overlaps
    defs.push({ id: 'uxr_design_handoff', labels: [names[0], names[1], names[2]], inside: [0, 1, 2], outside: [3] })
    defs.push({ id: 'uxr_design_usability', labels: [names[0], names[1], names[3]], inside: [0, 1, 3], outside: [2] })
    defs.push({ id: 'uxr_handoff_usability', labels: [names[0], names[2], names[3]], inside: [0, 2, 3], outside: [1] })
    defs.push({ id: 'design_handoff_usability', labels: [names[1], names[2], names[3]], inside: [1, 2, 3], outside: [0] })

    // Four-way overlap
    defs.push({ id: 'all_four', labels: names.slice(), inside: [0, 1, 2, 3], outside: [] })

    return defs
  }, [circles])

  // Compute regions with ticket counts
  const regions = useMemo(() => {
    return regionDefs.map(def => ({
      ...def,
      count: exactCount(def.labels),
      tickets: getExactTickets(def.labels),
    })).filter(r => r.count > 0)
  }, [regionDefs, exactCount, getExactTickets])

  // Compute centroids for each region (for labels/tooltips)
  const regionCentroids = useMemo(() => {
    const centroids = {}
    regions.forEach(r => {
      const centroid = getRegionCentroid(circles, r.inside, r.outside, 40)
      if (centroid) {
        centroids[r.id] = centroid
      }
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
    if (Array.isArray(selected)) {
      // Region selection — exact match
      return getExactTickets(selected)
    }
    // Single category selection — all tickets with that label
    return ACTIVE_TICKETS.filter(t => t.labels.includes(selected))
  }, [selected, getExactTickets, ACTIVE_TICKETS])

  const selectedLabels = Array.isArray(selected) ? selected : (selected ? [selected] : [])
  const activeColor = selectedLabels.length > 0 ? getTextColor(selectedLabels[0]) : null

  const isRegionSelected = (labels) => {
    if (!selected || !Array.isArray(selected)) return false
    const key = [...labels].sort().join(',')
    const currentKey = [...selected].sort().join(',')
    return key === currentKey
  }

  const somethingSelected = selected !== null

  const separates = [
    { id: 'ba',       name: UX_LABELS.REQUIREMENTS_UPDATE,   x: 80,  y: 350 },
    { id: 'feedback', name: UX_LABELS.STAKEHOLDER_FEEDBACK,  x: 600, y: 200 },
    { id: 'scope',    name: UX_LABELS.SCOPE_EXPANSION,       x: 600, y: 350 },
  ]

  // Resolve the hovered target (circle, separate, or overlap region) for the tooltip
  const hoverTip = (() => {
    if (!hovered) return null
    const c = circles.find(ci => ci.id === hovered)
    if (c) return { labels: [c.name], cx: c.cx, aboveY: c.cy - c.r, belowY: c.cy + c.r, title: c.name, desc: DESCRIPTIONS[c.name] }
    const s = separates.find(sp => sp.id === hovered)
    if (s) { const r = radii[s.id]; return { labels: [s.name], cx: s.x, aboveY: s.y - r, belowY: s.y + r, title: s.name, desc: DESCRIPTIONS[s.name] } }
    const region = regions.find(rg => rg.id === hovered)
    if (region) {
      const cen = regionCentroids[region.id]
      if (cen) return { labels: region.labels, cx: cen.x, aboveY: cen.y - 14, belowY: cen.y + 14, title: region.labels.join(' · '), desc: intersectionDescription(region.labels) }
    }
    return null
  })()

  const isCircleActive = (name) => selected === name
  const isCircleHovered = (id) => hovered === id

  return (
    <div style={{ fontFamily: MONO, background: 'var(--es-surface)' }}>

      {/* Header */}
      <div style={{
        padding: '18px 24px 14px',
        borderBottom: '1px solid var(--es-border-str)',
        background: 'linear-gradient(180deg, rgba(56,152,236,0.04) 0%, transparent 100%)',
      }}>
        <div style={{
          fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--es-text-3)', marginBottom: 6,
        }}>
          Interactive Venn Diagram
        </div>
        <div style={{
          fontFamily: SANS, fontSize: 14, fontWeight: 500,
          color: 'var(--es-text-1)', letterSpacing: '-0.01em',
        }}>
          {total} labeled tickets across {Object.keys(COLORS).length} categories
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
              {/* Glow filters per category */}
              {Object.entries(COLORS).map(([name, c]) => (
                <filter key={name} id={`glow-${name.replace(/\s/g, '')}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                  <feFlood floodColor={c.h} floodOpacity="0.7" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}

              {/* Radial gradients for main circles */}
              {circles.map(circle => {
                const c = COLORS[circle.name]
                return (
                  <radialGradient key={circle.id} id={`grad-${circle.id}`} cx="40%" cy="40%" r="65%">
                    <stop offset="0%" stopColor={c.g1} stopOpacity={isDark ? "0.40" : "0.50"} />
                    <stop offset="60%" stopColor={c.h} stopOpacity={isDark ? "0.22" : "0.30"} />
                    <stop offset="100%" stopColor={c.g2} stopOpacity={isDark ? "0.08" : "0.15"} />
                  </radialGradient>
                )
              })}

              {/* Gradients for separate circles */}
              {separates.map(s => {
                const c = COLORS[s.name]
                return (
                  <radialGradient key={s.id} id={`grad-${s.id}`} cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor={c.g1} stopOpacity={isDark ? "0.50" : "0.60"} />
                    <stop offset="100%" stopColor={c.g2} stopOpacity={isDark ? "0.15" : "0.25"} />
                  </radialGradient>
                )
              })}
            </defs>

            {/* ── 4 main overlapping circles ── */}
            <g style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}>
              {circles.map(circle => {
                const c = COLORS[circle.name]
                const active = isCircleActive(circle.name)
                const hov = isCircleHovered(circle.id)
                const dimmed = somethingSelected && !active

                return (
                  <g key={circle.id}>
                    {/* Glow ring on active — matches separate circles */}
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
                      fill={`url(#grad-${circle.id})`}
                      stroke={c.h}
                      strokeWidth={active ? 2.5 : hov ? 2 : 1.5}
                      strokeOpacity={active ? 1 : hov ? 0.8 : 0.5}
                      opacity={dimmed ? 0.25 : 1}
                      filter={active ? `url(#glow-${circle.name.replace(/\s/g, '')})` : undefined}
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
            {[
              { name: UX_LABELS.RESEARCH_DRIVEN,  total: totals.uxr,       x: circles[0].cx, y: circles[0].cy - circles[0].r - 14, anchor: 'middle' },
              { name: UX_LABELS.DESIGN_REVISION,   total: totals.design,    x: circles[1].cx, y: circles[1].cy - circles[1].r - 14, anchor: 'middle' },
              { name: UX_LABELS.POST_HANDOFF,      total: totals.handoff,   x: circles[2].cx - circles[2].r, y: circles[2].cy + circles[2].r + 16, anchor: 'start' },
              { name: UX_LABELS.USABILITY_FIX,     total: totals.usability, x: circles[3].cx + circles[3].r, y: circles[3].cy + circles[3].r + 16, anchor: 'end' },
            ].map((lbl, i) => {
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

              // Get theme-aware text colors
              const primaryTextColor = getTextColor(region.labels[0])
              const primaryColor = COLORS[region.labels[0]]?.h ?? '#fff'
              const secondaryColor = COLORS[region.labels[1]]?.h ?? primaryColor
              const dimmed = somethingSelected && !regSelected

              const hitRadius = 18

              return (
                <g key={region.id} opacity={dimmed ? 0.25 : 1} style={{ transition: 'opacity 0.3s' }}>
                  {/* Soft radial glow on hover/select — appears organically */}
                  {isActive && (
                    <circle
                      cx={centroid.x} cy={centroid.y}
                      r={regSelected ? 32 : 28}
                      fill={`url(#region-glow-${region.id})`}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {/* Animated ring on selected */}
                  {regSelected && (
                    <circle
                      cx={centroid.x} cy={centroid.y} r={24}
                      fill="none" stroke={primaryColor} strokeWidth="1"
                      strokeOpacity="0.6" strokeDasharray="4 4"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="24" dur="4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Invisible hit area for clicks */}
                  <circle
                    cx={centroid.x} cy={centroid.y} r={hitRadius}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(region.labels)}
                    onMouseEnter={() => setHovered(region.id)}
                    onMouseLeave={() => setHovered(null)}
                  />

                  {/* Count — clean floating number */}
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

                  {/* Gradient definition for this region's glow */}
                  <defs>
                    <radialGradient id={`region-glow-${region.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
                      <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.1" />
                      <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </g>
              )
            })}

            {/* ── Separate circles ── */}
            {separates.map(s => {
              const c = COLORS[s.name]
              const textColor = getTextColor(s.name)
              const r = radii[s.id]
              const active = isCircleActive(s.name)
              const hov = isCircleHovered(s.id)
              const dimmed = somethingSelected && !active

              // Label positioning: BA on left gets label on left, others on right
              const labelX = s.id === 'ba' ? s.x - r - 10 : s.x + r + 10
              const labelAnchor = s.id === 'ba' ? 'end' : 'start'

              return (
                <g key={s.id}>
                  {/* Glow ring on active */}
                  {active && (
                    <circle
                      cx={s.x} cy={s.y} r={r + 5}
                      fill="none" stroke={c.h} strokeWidth="1.5" strokeOpacity="0.4"
                      strokeDasharray="3 3"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="18" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  <circle
                    cx={s.x} cy={s.y} r={r}
                    fill={`url(#grad-${s.id})`}
                    stroke={c.h}
                    strokeWidth={active ? 2.5 : hov ? 2 : 1.5}
                    strokeOpacity={active ? 1 : hov ? 0.8 : 0.5}
                    opacity={dimmed ? 0.25 : 1}
                    filter={active ? `url(#glow-${s.name.replace(/\s/g, '')})` : undefined}
                    style={{ cursor: 'pointer', transition: 'opacity 0.3s, stroke-width 0.2s' }}
                    onClick={() => handleCircleClick(s.name)}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered(null)}
                  />

                  {/* External label — same pattern as main circles */}
                  <g opacity={dimmed ? 0.3 : 1} style={{ transition: 'opacity 0.3s' }}>
                    <text
                      x={labelX} y={s.y - 6}
                      textAnchor={labelAnchor}
                      fill={textColor} fontSize="10" fontWeight="600" fontFamily={MONO}
                      letterSpacing="0.04em"
                      style={{ pointerEvents: 'none' }}
                    >
                      {s.name}
                    </text>
                    <text
                      x={labelX} y={s.y + 6}
                      textAnchor={labelAnchor}
                      fill={textColor} fontSize="8" fontFamily={MONO}
                      letterSpacing="0.08em" opacity="0.8"
                      style={{ pointerEvents: 'none' }}
                    >
                      {data.totals[s.id]} TICKETS
                    </text>
                  </g>
                </g>
              )
            })}

            {/* ── Description tooltip ── */}
            {hoverTip && (() => {
              const single = hoverTip.labels.length === 1
              const TIP_W = single ? 200 : 224
              const TIP_H = 92 + (hoverTip.labels.length > 2 ? 16 : 0)
              const titleColor = single ? getTextColor(hoverTip.labels[0]) : 'var(--es-text-1)'
              let tx = hoverTip.cx - TIP_W / 2
              tx = Math.max(6, Math.min(tx, 700 - TIP_W - 6))
              let ty = hoverTip.aboveY - TIP_H - 6
              if (ty < 6) ty = hoverTip.belowY + 6
              return (
                <foreignObject x={tx} y={ty} width={TIP_W} height={TIP_H} style={{ pointerEvents: 'none', overflow: 'visible' }}>
                  <div style={{
                    fontFamily: MONO,
                    background: 'var(--es-surface)',
                    border: '1px solid var(--es-border-str)',
                    borderRadius: 6,
                    padding: '9px 11px',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)'
                      : '0 8px 24px rgba(0,0,0,0.12)',
                  }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                      {hoverTip.labels.map(l => {
                        const col = COLORS[l]?.h ?? '#888'
                        return (
                          <div key={l} style={{
                            width: 26, height: 26, borderRadius: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, lineHeight: 1,
                            background: `${col}1f`,
                            border: `1px solid ${col}40`,
                          }}>
                            {ICONS[l]}
                          </div>
                        )
                      })}
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: titleColor,
                    }}>
                      {hoverTip.title}
                    </div>
                    <div style={{
                      fontFamily: SANS, fontSize: 11, lineHeight: 1.45,
                      color: 'var(--es-text-2)', marginTop: 4,
                    }}>
                      {hoverTip.desc}
                    </div>
                  </div>
                </foreignObject>
              )
            })()}
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
                  {/* Label chips for selected region/category */}
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
                      Tickets with exactly these {selected.length} labels
                    </div>
                  )}
                  {!Array.isArray(selected) && selectedTickets.filter(t => t.labels.length > 1).length > 0 && (
                    <div style={{
                      fontSize: 10, color: 'var(--es-text-3)', marginTop: 6,
                      fontFamily: SANS, lineHeight: 1.4,
                    }}>
                      Including {selectedTickets.filter(t => t.labels.length > 1).length} with overlapping labels
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
                Select a category
              </div>
              <div style={{
                fontSize: 11, color: 'var(--es-text-3)', textAlign: 'center',
                lineHeight: 1.6, maxWidth: 240, fontFamily: SANS, opacity: 0.7,
              }}>
                Click any circle to see all tickets in that category, including those with overlapping labels
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
