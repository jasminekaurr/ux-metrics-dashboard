/**
 * APEXDark.jsx — design-system metrics route (/apex).
 *
 * Charts adoption, component growth, and project coverage from apexData and
 * projectComponents. Related: config/orgLabels.js.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  LineElement, PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, getChartColors } from '../utils/chartTheme'
import { labels, filterKeyProducts } from '../config/orgLabels'
import { getApexBandConfig, APEX_LIST_INITIAL_SHOW, APEX_LIST_LOAD_MORE_STEP } from '../config/apexBands'
import { computeReuseRate } from '../config/reuseWeights'
import { FONT_MONO as MONO } from '../config/typography'
import SectionHelp from '../components/SectionHelp'
import SplitText from '../components/SplitText'
import './ExecutiveSummary.css'
import './APEXDark.css'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)

function fmtWeek(w) {
  const d = new Date(w)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtMonth(w) {
  const d = new Date(w)
  return d.toLocaleDateString('en-US', { month: 'short' })
}

function weeklyToMonthly(weeklyTotals, field) {
  const monthly = {}
  for (const w of weeklyTotals) {
    const month = fmtMonth(w.week)
    monthly[month] = (monthly[month] || 0) + w[field]
  }
  return monthly
}

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // threshold: 0 fires as soon as the first pixel enters viewport — matches Bequant's "top bottom" ScrollTrigger
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function useCountUp(target, shouldStart, duration = 1100, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!shouldStart || !target) return
    let raf, tid
    tid = setTimeout(() => {
      const start = performance.now()
      function tick(now) {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setValue(Math.round(eased * target))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => { clearTimeout(tid); cancelAnimationFrame(raf) }
  }, [target, shouldStart, duration, delay])
  return value
}

export default function APEXDark() {
  const { projectComponents, apexData, MONTHS } = useDashboardData()
  const [openBands, setOpenBands] = useState({})
  const [loadMoreCounts, setLoadMoreCounts] = useState({})
  const [activeTab, setActiveTab] = useState(0)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartTheme = useMemo(() => getChartTheme(isDark), [isDark])
  const chartColors = useMemo(() => getChartColors(isDark), [isDark])

  const CHART_TOOLTIP = useMemo(() => ({
    ...chartTheme.tooltip,
    cornerRadius: 4,
    titleFont: { size: 10, family: MONO },
    bodyFont: { size: 12, weight: '300', family: MONO },
  }), [chartTheme])

  const CHART_SCALE = useMemo(() => ({
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 10, family: MONO }, color: chartTheme.scales.x.ticks.color },
    },
    y: {
      grid: { color: chartTheme.scales.y.grid.color, lineWidth: 0.5 },
      border: { display: false },
      ticks: { font: { size: 10, family: MONO }, color: chartTheme.scales.y.ticks.color },
    },
  }), [chartTheme])

  const BAND_CONFIG = useMemo(() => getApexBandConfig(isDark), [isDark])
  const INITIAL_SHOW = APEX_LIST_INITIAL_SHOW
  const LOAD_MORE_STEP = APEX_LIST_LOAD_MORE_STEP

  const toggleBand = key => setOpenBands(prev => ({ ...prev, [key]: !prev[key] }))
  const loadMore = (key, total) => setLoadMoreCounts(prev => ({
    ...prev, [key]: Math.min((prev[key] || INITIAL_SHOW) + LOAD_MORE_STEP, total),
  }))

  const { summary, weeks, weeklyTotals, teamWeekly, detachments } = apexData
  const latestIdx = Math.max(0, MONTHS.length - 1)
  const prevIdx = Math.max(0, latestIdx - 1)

  const weekLabels = weeks.map(fmtWeek)
  const monthlyInsertions = weeklyToMonthly(weeklyTotals, 'components')
  const months = Object.keys(monthlyInsertions)
  const lastMonthVal = monthlyInsertions[months[months.length - 1]]
  const prevMonthVal = monthlyInsertions[months[months.length - 2]]
  const momChange = prevMonthVal ? Math.round(((lastMonthVal - prevMonthVal) / prevMonthVal) * 100) : 0

  const last3Vals = months.slice(-3).map(m => monthlyInsertions[m])
  const insertionTrend = last3Vals[2] > last3Vals[0] * 1.05 ? '↑' : last3Vals[2] < last3Vals[0] * 0.95 ? '↓' : '→'

  const WEEK_MONTHS = ['Dec','Jan','Jan','Jan','Jan','Feb','Feb','Feb','Feb','Mar','Mar','Mar','Mar','Mar','Apr','Apr','Apr']
  const monthlyTeamSets = {}
  for (const [team, data] of Object.entries(teamWeekly)) {
    data.components.forEach((val, wi) => {
      if (val > 0) {
        const m = WEEK_MONTHS[wi]
        if (!monthlyTeamSets[m]) monthlyTeamSets[m] = new Set()
        monthlyTeamSets[m].add(team)
      }
    })
  }

  const aprMonth = projectComponents.monthly[latestIdx] ?? projectComponents.monthly.at(-1)
  const aprInsertions = monthlyInsertions[months[months.length - 1]] || 0
  const reuseRate = computeReuseRate(aprInsertions, aprMonth)
  const marMonth = projectComponents.monthly[prevIdx]
  const prevMonthKey = months[months.length - 2]
  const marIns = prevMonthKey ? (monthlyInsertions[prevMonthKey] || 0) : 0
  const reuseRatePrev = computeReuseRate(marIns, marMonth)
  const reuseMoM = reuseRatePrev ? reuseRate - reuseRatePrev : 0

  const rollingAvg = weeklyTotals.map((_, i) => {
    if (i < 3) return null
    const window = weeklyTotals.slice(i - 3, i + 1)
    return Math.round(window.reduce((sum, w) => sum + w.components, 0) / 4)
  })

  const maxWeekIdx = weeklyTotals.reduce((max, w, i) => w.components > weeklyTotals[max].components ? i : max, 0)
  const avgValue = weeklyTotals.reduce((sum, w) => sum + w.components, 0) / weeklyTotals.length
  const spikePercent = Math.round(((weeklyTotals[maxWeekIdx].components - avgValue) / avgValue) * 100)
  const ds = labels.designSystemName
  const narrative = {
    whatChanged: `${spikePercent}% activity spike on ${fmtWeek(weeks[maxWeekIdx])} — highest week on record`,
    whyMatters: maxWeekIdx >= 8 && maxWeekIdx <= 10
      ? `Aligned with ${labels.launchProduct} redesign launch — teams pulled heavily from ${ds}`
      : `Indicates strong team alignment with ${ds} patterns across portfolios`,
    whatNext: momChange < 0
      ? 'Investigate potential blockers or competing priorities in lower-adoption teams'
      : `Momentum is sustained — priority is expanding ${ds} coverage to the remaining teams`,
  }

  const detEntries = Object.entries(detachments)
  const bandCategories = {
    healthy:  detEntries.filter(([, v]) => v.rate <= 1),
    watch:    detEntries.filter(([, v]) => v.rate > 1 && v.rate <= 3),
    risk:     detEntries.filter(([, v]) => v.rate > 3 && v.rate <= 8),
    critical: detEntries.filter(([, v]) => v.rate > 8),
  }

  const momentumData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Weekly insertions',
        data: weeklyTotals.map(w => w.components),
        borderColor: chartColors.green,
        backgroundColor: chartColors.greenFill,
        fill: true, tension: 0.3, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2,
      },
      {
        label: '4-week rolling avg',
        data: rollingAvg,
        borderColor: chartTheme.scales.x.ticks.color,
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        fill: false, tension: 0.3, pointRadius: 0, borderWidth: 1.5,
      },
    ],
  }

  const donutData = {
    labels: Object.keys(BAND_CONFIG).map(k => BAND_CONFIG[k].label),
    datasets: [{
      data: Object.keys(BAND_CONFIG).map(k => bandCategories[k].length),
      backgroundColor: Object.keys(BAND_CONFIG).map(k => BAND_CONFIG[k].fill),
      borderColor: Object.keys(BAND_CONFIG).map(k => BAND_CONFIG[k].color),
      hoverBackgroundColor: isDark
        ? ['rgba(0,191,42,0.50)', 'rgba(56,152,236,0.50)', 'rgba(245,217,11,0.50)', 'rgba(255,45,45,0.50)']
        : ['rgba(22,163,74,0.40)', 'rgba(37,99,235,0.40)', 'rgba(217,119,6,0.40)', 'rgba(220,38,38,0.40)'],
      borderWidth: 3,
      hoverOffset: 8,
    }],
  }

  const reuseColorClass = reuseRate >= 80 ? 'green' : reuseRate >= 60 ? 'amber' : 'red'

  const filteredComponents = filterKeyProducts(projectComponents.components)
  const groupedByProject = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.project]) acc[comp.project] = []
    acc[comp.project].push(comp)
    return acc
  }, {})

  const narrativeTabs = [
    { icon: '◎', title: 'What changed', body: narrative.whatChanged },
    { icon: '◈', title: 'Why it matters', body: narrative.whyMatters },
    { icon: '◷', title: "What's next", body: narrative.whatNext },
  ]

  const [statsRef, statsVisible] = useReveal()
  const [chartRef, chartVisible] = useReveal()
  const [featuresRef, featuresVisible] = useReveal()
  const [integrityRef, integrityVisible] = useReveal()

  // Count-up animations: start when stats section enters viewport, staggered per stat
  const reuseRateAnim    = useCountUp(reuseRate,                    statsVisible, 1000,  40)
  const activeTeamsAnim  = useCountUp(summary.activeTeams,          statsVisible,  900, 110)
  const totalInsAnim     = useCountUp(summary.totalInsertions ?? 0, statsVisible, 1300, 180)
  const momChangeAnim    = useCountUp(Math.abs(momChange),          statsVisible,  900, 250)

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">
            Design System
          </div>
          <h1 className="es-title">{labels.designSystemFull}<span className="es-cursor" /></h1>
        </div>
      </div>

      <div className="es-content">

        {/* ── Adoption stats row ─────────────────────────────────────────────── */}
        <div
          ref={statsRef}
          className={`bq-reveal${statsVisible ? ' visible' : ''} apex-section--pt40`}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow apex-eyebrow--spaced">
                {/* Source: apex.json (Figma analytics capture) */}
                Adoption
              </div>
              <SplitText className="bq-section-h">Component adoption across teams</SplitText>            </div>
          </div>

          <div className="apex-stats-row">
            {[
              { num: `${reuseRateAnim}%`, caption: 'Reuse Rate', delta: reuseMoM, deltaLabel: '', cls: reuseColorClass },
              { num: activeTeamsAnim, caption: 'Active Teams', cls: 'amber' },
              { num: totalInsAnim.toLocaleString(), caption: 'Total Insertions', sub: 'All time', cls: '' },
              {
                num: momChange >= 0 ? `+${momChangeAnim}%` : `-${momChangeAnim}%`,
                caption: 'Insertion Trend',
                sub: insertionTrend === '↑' ? '↑ accelerating' : insertionTrend === '↓' ? '↓ declining' : '→ stable',
                cls: insertionTrend === '↑' ? 'green' : insertionTrend === '↓' ? 'red' : 'amber',
              },
            ].map((s, i) => (
              <div key={i} className="bq-stat-item bq-stagger-item">
                <div className={`bq-stat-num ${s.cls}`}>{s.num}</div>
                <div className="bq-stat-caption">{s.caption}</div>
                <div className="apex-stat-sub">{s.sub}</div>
                {s.delta !== undefined && (
                  <div className={`bq-stat-delta ${s.delta >= 0 ? 'up' : 'down'}`}>
                    {s.delta > 0 ? '↑' : '↓'} {Math.abs(s.delta)}{s.deltaLabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Component Momentum ─────────────────────────────────────────────── */}
        <div
          ref={chartRef}
          className={`bq-reveal${chartVisible ? ' visible' : ''} apex-section--pt52`}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow apex-eyebrow--spaced">
                {/* Source: apex.json weeklyTotals */}
                Component Momentum
              </div>
              <SplitText className="bq-section-h">Teams are building with {labels.designSystemName}</SplitText>
            </div>
          </div>

          <div className="apex-momentum-layout">
            <div className="apex-tab-col">
              {narrativeTabs.map((tab, i) => (
                <div
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`bq-insight-tab bq-stagger-item${activeTab === i ? ' active' : ''}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="bq-tab-icon">{tab.icon}</div>
                  <div>
                    <div className="bq-tab-title">{tab.title}</div>
                    {activeTab === i && <div className="bq-tab-body">{tab.body}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="apex-chart-col">
              <Line
                data={momentumData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  animation: { duration: 1000, easing: 'easeOutQuart' },
                  plugins: {
                    legend: {
                      display: true, position: 'bottom',
                      labels: { color: chartTheme.legend.labels.color, font: { size: 10, family: MONO }, boxWidth: 10, padding: 16 },
                    },
                    tooltip: CHART_TOOLTIP,
                  },
                  scales: CHART_SCALE,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Design System Integrity ────────────────────────────────────────── */}
        <div
          ref={integrityRef}
          className={`bq-reveal${integrityVisible ? ' visible' : ''} apex-section--pt52`}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow apex-eyebrow--flush">
                  {/* Source: apex.json detachments */}
                  Design System Integrity
                </div>
                <SectionHelp title="Why design system integrity matters">
                  High detachment fragments the {labels.portfolioCohesion}. Users notice when products do not feel connected.
                  Detachment shows where {labels.designSystemName} needs to grow while maintaining one visual language.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Detachment health — team distribution</SplitText>
            </div>
          </div>

          <div className="apex-integrity-layout">
            {/* Donut chart */}
            <div className="bq-stagger-item apex-donut-wrap">
              {integrityVisible && (
                <Doughnut
                  data={donutData}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutQuart' },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        ...CHART_TOOLTIP,
                        callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} ${ctx.parsed === 1 ? 'team' : 'teams'}` },
                      },
                    },
                    cutout: '55%',
                  }}
                />
              )}
              <div className="apex-donut-center">
                <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 300, color: 'var(--es-text-1)', lineHeight: 1 }}>
                  {Object.values(bandCategories).reduce((s, t) => s + t.length, 0)}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Teams
                </div>
              </div>
            </div>

            {/* Band accordions */}
            <div className="apex-band-list">
              {Object.entries(BAND_CONFIG).map(([key, cfg], i) => {
                const teams = bandCategories[key].sort((a, b) => b[1].rate - a[1].rate)
                const isOpen = !!openBands[key]
                const showCount = loadMoreCounts[key] || INITIAL_SHOW
                const visible = teams.slice(0, showCount)
                const hasMore = showCount < teams.length
                return (
                  <div key={key} className="bq-stagger-item" style={{ transitionDelay: `${i * 60}ms` }}>
                    {/* Band header row — clickable */}
                    <div
                      onClick={() => toggleBand(key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px',
                        background: isOpen ? 'var(--es-surface-2)' : 'var(--es-surface)',
                        border: `1px solid ${isOpen ? cfg.color : 'var(--es-border-str)'}`,
                        borderRadius: isOpen ? 'var(--es-r-sm) var(--es-r-sm) 0 0' : 'var(--es-r-sm)',
                        cursor: 'pointer',
                        transition: 'background 150ms, border-color 150ms',
                      }}
                    >
                      <div className="apex-band-swatch" style={{ background: cfg.color }} />
                      <div className="apex-band-label">
                        {cfg.label}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 300, color: cfg.color, letterSpacing: '-0.08em', lineHeight: 1, marginRight: 10 }}>
                        {teams.length}
                      </div>
                      <svg
                        width="18" height="18" viewBox="0 0 18 18" fill="none"
                        style={{
                          transition: 'transform 200ms ease', flexShrink: 0,
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                        }}
                      >
                        <polyline points="4,6 9,12 14,6" stroke="var(--es-text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {/* Inline expanded team list */}
                    {isOpen && teams.length > 0 && (
                      <div style={{
                        background: 'var(--es-surface)',
                        border: `1px solid ${cfg.color}`,
                        borderTop: 'none',
                        borderRadius: '0 0 var(--es-r-sm) var(--es-r-sm)',
                        padding: '4px 14px 12px',
                        animation: 'es-fade-in-up 0.2s ease-out both',
                      }}>
                        {visible.map(([team, v], idx) => (
                          <div key={team} className="apex-team-row" style={{ borderBottom: idx < visible.length - 1 ? '1px dashed var(--es-border-str)' : 'none' }}>
                            <span className="apex-team-name">{team}</span>
                            <span className="apex-team-rate">
                              {v.rate}%
                            </span>
                          </div>
                        ))}
                        {hasMore && (
                          <button
                            onClick={e => { e.stopPropagation(); loadMore(key, teams.length) }}
                            style={{
                              marginTop: 10, width: '100%',
                              padding: '6px 0', borderRadius: 4,
                              fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                              background: 'transparent',
                              border: `1px solid ${cfg.color}40`,
                              color: cfg.color, cursor: 'pointer',
                              transition: 'border-color 150ms',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = `${cfg.color}40` }}
                          >
                            Load more — {teams.length - showCount} remaining
                          </button>
                        )}
                      </div>
                    )}
                    {isOpen && teams.length === 0 && (
                      <div style={{
                        background: 'var(--es-surface)',
                        border: `1px solid ${cfg.color}`,
                        borderTop: 'none',
                        borderRadius: '0 0 var(--es-r-sm) var(--es-r-sm)',
                        padding: '12px 14px',
                        fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                      }}>
                        No teams in this band
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Custom Features ────────────────────────────────────────────────── */}
        <div
          ref={featuresRef}
          className={`bq-reveal${featuresVisible ? ' visible' : ''} apex-section--pt52-pb60`}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow apex-eyebrow--flush">
                  {/* Source: projectComponents.json components — user-maintained inventory */}
                  Where Teams Build Beyond {labels.designSystemName}
                </div>
                <SectionHelp title={`Custom features and ${labels.designSystemName}`}>
                  These {filteredComponents.length} features show where teams needed flexibility beyond current {labels.designSystemName} patterns —
                  candidates for future system expansion and portfolio consistency.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Custom features map system growth</SplitText>
            </div>
          </div>

          <table className="bq-feature-table">
            <thead>
              <tr>
                <th className="bq-th">Feature</th>
                <th className="bq-th">Domain</th>
                <th className="bq-th bq-th-last">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByProject).map(([project, features]) => (
                <React.Fragment key={project}>
                  <tr key={`${project}-header`} className="bq-project-row">
                    <td colSpan={3} className="bq-project-cell">
                      <div className="bq-project-cell-inner">
                        <span className="bq-project-name">{project}</span>
                        <span className="bq-project-count">{features.length}</span>
                      </div>
                    </td>
                  </tr>
                  {features.map((feat, idx) => (
                    <tr key={idx} className="bq-feature-tr">
                      <td className="bq-td bq-td-feature">{feat.name}</td>
                      <td className="bq-td bq-td-domain">
                        <span className="es-chip blue">{feat.domainCategory}</span>
                      </td>
                      <td className="bq-td bq-td-purpose">{feat.purpose}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

        </div>

      </div>
    </div>
  )
}
