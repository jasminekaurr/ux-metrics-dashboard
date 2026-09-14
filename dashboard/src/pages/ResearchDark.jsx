/**
 * ResearchDark.jsx — UX research impact route (/research).
 *
 * Renders research coverage, panel health, and initiative spotlights from
 * context data. Related: data/sample/research.json.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, getImpactThemes, getTypeColors } from '../utils/chartTheme'
import { FONT_MONO as MONO } from '../config/typography'
import SectionHelp from '../components/SectionHelp'
import SplitText from '../components/SplitText'
import './ExecutiveSummary.css'
import './ResearchDark.css'

ChartJS.register(ArcElement, Tooltip, Legend)

/** Resolve initiative.detailedSummary.dataRef → live context payloads. */
function resolveInitiatives(raw, refs) {
  return (raw || []).map((item) => {
    const summary = item.detailedSummary
    if (!summary?.dataRef) return item
    return {
      ...item,
      detailedSummary: {
        type: summary.type,
        data: refs[summary.dataRef],
      },
    }
  })
}

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
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

export default function ResearchDark({ selectedMonthIndex: _selectedMonthIndex }) {
  const { research, panelHealth, ubaIASpotlight, researchInitiatives } = useDashboardData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartTheme = useMemo(() => getChartTheme(isDark), [isDark])
  const IMPACT_THEMES = useMemo(() => getImpactThemes(isDark), [isDark])
  const typeColors = useMemo(() => getTypeColors(isDark), [isDark])

  const CHART_TOOLTIP = useMemo(() => ({
    ...chartTheme.tooltip,
    cornerRadius: 4,
    titleFont: { size: 10, family: MONO },
    bodyFont: { size: 12, weight: '300', family: MONO },
  }), [chartTheme])

  const [expanded, setExpanded] = useState({})
  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const [statsRef, statsVisible] = useReveal()
  const [initiativesRef, initiativesVisible] = useReveal()
  const [donutRef, donutVisible] = useReveal()

  const { researchTypes } = research
  const typeLabels = Object.keys(researchTypes)
  const typeValues = Object.values(researchTypes)

  // @CUSTOMIZE — edit sample/researchInitiatives.json (dataRef resolves panelHealth / ubaIASpotlight)
  const allInitiatives = useMemo(
    () => resolveInitiatives(researchInitiatives, { panelHealth, ubaIASpotlight }),
    [researchInitiatives, panelHealth, ubaIASpotlight],
  )

  const initiativesByImpact = {
    'Risk Reduction': allInitiatives.filter(i => i.impactTag === 'Risk Reduction'),
    'Speed/Acceleration': allInitiatives.filter(i => i.impactTag === 'Speed/Acceleration'),
    'Revenue Influence': allInitiatives.filter(i => i.impactTag === 'Revenue Influence'),
  }

  const totalParticipants = allInitiatives.reduce((s, i) => s + i.participants, 0)

  const totalStudiesAnim = useCountUp(allInitiatives.length, statsVisible,  700,  40)
  const participantsAnim = useCountUp(totalParticipants,     statsVisible, 1200, 110)
  const issuesCaughtAnim = useCountUp(5,                     statsVisible,  900, 180)
  const activePanelsAnim = useCountUp(2,                     statsVisible,  700, 250)

  const donutData = {
    labels: typeLabels,
    datasets: [{
      data: typeValues,
      backgroundColor: typeColors.fills,
      borderColor: typeColors.colors,
      hoverBackgroundColor: typeColors.hover,
      borderWidth: 3,
      hoverOffset: 8,
    }],
  }

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">
            UX Research
          </div>
          <h1 className="es-title">Research Impact<span className="es-cursor" /></h1>
        </div>
      </div>

      <div className="es-content">

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div
          ref={statsRef}
          className={`bq-reveal${statsVisible ? ' visible' : ''} bq-section-pad-top`}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow rd-eyebrow--flush">
                  {/* Source: research.json (cumulative totals) */}
                  Research Overview
                </div>
              </div>
              <SplitText className="bq-section-h">Research impact at a glance</SplitText>
            </div>
          </div>

          <div className="bq-stats-strip">
            {[
              { num: totalStudiesAnim, caption: 'Active Studies',    sub: 'This quarter',         cls: '' },
              { num: participantsAnim, caption: 'Total Participants', sub: 'Across all studies',   cls: 'green' },
              { num: issuesCaughtAnim, caption: 'Issues Caught',      sub: 'Before development',   cls: 'amber' },
              { num: activePanelsAnim, caption: 'Advisory Panels',    sub: 'Same-week validation', cls: 'blue' },
            ].map((s, i) => (
              <div
                key={s.caption}
                className="bq-stats-cell bq-stat-item bq-stagger-item"
              >
                <div className={`bq-stat-num ${s.cls}`}>{s.num}</div>
                <div className="bq-stat-caption">{s.caption}</div>
                <div className="rd-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active Research Initiatives ───────────────────────────────────── */}
        <div
          ref={initiativesRef}
          className={`bq-reveal${initiativesVisible ? ' visible' : ''} rd-section--pt52`}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow rd-eyebrow--spaced">
                Active Studies
              </div>
              <SplitText className="bq-section-h">Active research initiatives</SplitText>
            </div>
          </div>

          {/* Stacked theme cards — each contains all initiatives for that theme */}
          <div className="rd-stack">
            {Object.entries(IMPACT_THEMES).map(([tagName, theme]) => {
              const initiatives = initiativesByImpact[tagName]
              return (
                <div
                  key={tagName}
                  className="bq-stagger-item rd-theme-card"
                >
                  {/* Theme header */}
                  <div className="rd-theme-header">
                    <span className="rd-theme-icon">{theme.icon}</span>
                    <div className="rd-theme-copy">
                      <div className="rd-theme-title">{tagName}</div>
                      <div className="rd-theme-desc">{theme.desc}</div>
                    </div>
                    <div className="rd-theme-count">
                      {initiatives.length}
                    </div>
                  </div>

                  {/* Initiative rows */}
                  {initiatives.length === 0 ? (
                    <div className="rd-empty">
                      No active initiatives
                    </div>
                  ) : initiatives.map((init, idx) => {
                    const isOpen = !!expanded[init.id]
                    return (
                      <div
                        key={init.id}
                        style={{
                          borderTop: idx > 0 ? '1px solid var(--es-border-str)' : 'none',
                        }}
                      >
                        {/* Initiative summary row — entire card is clickable */}
                        <div
                          onClick={() => toggleExpand(init.id)}
                          className="rd-init-row"
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="rd-row-between">
                            <div style={{ flex: 1 }}>
                              <div className="rd-init-title">
                                {init.study}
                              </div>
                              <div className="rd-init-meta">
                                {init.product} · {init.participants} participants
                              </div>
                              <div className="rd-init-purpose">
                                {init.purpose}
                              </div>
                              <div className="rd-chip-row">
                                <span className={`es-chip ${init.status === 'Active' ? 'green' : init.status === 'Complete' ? 'blue' : ''}`}>
                                  {init.status}
                                </span>
                                <span className="es-chip">{init.category}</span>
                              </div>
                            </div>
                            {/* Chevron indicator */}
                            <div className="rd-expand-btn" style={{
                              borderRadius: 4,
                              background: isOpen ? 'var(--es-surface-2)' : 'transparent',
                              border: '1px solid var(--es-border-str)',
                              color: 'var(--es-text-3)',
                              transition: 'all 150ms',
                            }}>
                              <span style={{
                                display: 'inline-block',
                                transition: 'transform 200ms ease',
                                transform: isOpen ? 'rotate(180deg)' : 'none',
                                fontSize: 11,
                              }}>▾</span>
                            </div>
                          </div>

                          {/* Inline expanded detail */}
                          {isOpen && (
                            <div className="rd-detail-panel">
                              {/* UBA IA */}
                              {init.detailedSummary.type === 'uba' && (
                                <div className="rd-detail-stack">
                                  {/* Study Progression — top priority */}
                                  <div>
                                    <div className="rd-mono-label--mb10">Study Progression</div>
                                    <div className="rd-rounds-grid">
                                      {init.detailedSummary.data.rounds?.map((round, i) => (
                                        <div key={i} className="rd-round-card">
                                          <div className="rd-round-ver">{round.version}</div>
                                          <div className="rd-round-rate">{round.successRate}%</div>
                                          <div className="rd-round-n">n={round.n}</div>
                                          {round.improvement && (
                                            <div className="rd-round-delta">{round.improvement}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Supporting details below */}
                                  <div className="rd-detail-cols">
                                    <div className="rd-detail-col">
                                      <div className="rd-label-row">
                                        <span className="rd-mono-label">Business Impact</span>
                                        <SectionHelp title="Business Impact">
                                          Reduced IA ambiguity for member workflows, lowering training and navigation risk for product surfaces.
                                        </SectionHelp>
                                      </div>
                                      <div className="rd-label-row">
                                        <span className="rd-mono-label">ROI</span>
                                        <SectionHelp title="ROI">
                                          3 rounds of validation replaced 6+ months of post-launch IA iteration.
                                          Achieved {init.detailedSummary.data.rounds?.[2]?.successRate}% task success before engineering began.
                                        </SectionHelp>
                                      </div>
                                    </div>
                                    <div className="rd-detail-col">
                                      <div className="rd-chip-row">
                                        {init.detailedSummary.data.domains?.map((domain, i) => (
                                          <span key={i} className="es-chip blue">{domain.name}</span>
                                        ))}
                                      </div>
                                      {init.detailedSummary.data.finding && (
                                        <div className="rd-finding-quote">
                                          "{init.detailedSummary.data.finding}"
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Task Assignment */}
                              {init.detailedSummary.type === 'task-assignment' && (
                                <div className="rd-detail-cols">
                                  <div className="rd-detail-col--narrow">
                                    <div className="rd-label-row">
                                      <span className="rd-mono-label">Business Impact</span>
                                      <SectionHelp title="Business Impact">
                                        Identified critical mental model mismatches in task assignment flow before development, preventing user confusion and support tickets.
                                      </SectionHelp>
                                    </div>
                                    <div className="rd-label-row">
                                      <span className="rd-mono-label">ROI</span>
                                      <SectionHelp title="ROI">
                                        {init.detailedSummary.data.issuesCaught} medium-severity usability issues caught before development — avoiding costly post-launch iterations.
                                      </SectionHelp>
                                    </div>
                                  </div>
                                  <div style={{ flex: '1 1 240px' }}>
                                    <div className="rd-mono-label--mb10">Key Findings</div>
                                    {init.detailedSummary.data.keyFindings?.map((finding, i) => (
                                      <div key={i} className="rd-finding-row" style={{ borderBottom: i < init.detailedSummary.data.keyFindings.length - 1 ? '1px dashed var(--es-border-str)' : 'none' }}>
                                        <span className="rd-finding-bullet">▶</span>
                                        <span className="rd-finding-text">{finding}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Panel Health */}
                              {init.detailedSummary.type === 'panel' && (
                                <div className="rd-detail-stack">
                                  {/* Panel stats — top priority */}
                                  <div>
                                    <div className="rd-mono-label--mb10">Panel Health Overview</div>
                                    <div className="rd-panel-stats">
                                      <div className="rd-panel-stat rd-panel-stat--blue">
                                        <div className="rd-panel-stat-label">Feed Panel</div>
                                        <div className="rd-panel-stat-value rd-panel-stat-value--blue">
                                          {init.detailedSummary.data.coreAdvance?.totalMembers}
                                        </div>
                                        <div className="rd-panel-stat-sub">
                                          {init.detailedSummary.data.coreAdvance?.totalBanks} creator cohorts
                                        </div>
                                        <div className="rd-engagement-pill">
                                          {init.detailedSummary.data.coreAdvance?.engagementRate}% engagement
                                        </div>
                                      </div>
                                      <div className="rd-panel-stat rd-panel-stat--purple">
                                        <div className="rd-panel-stat-label">Reels Panel</div>
                                        <div className="rd-panel-stat-value rd-panel-stat-value--purple">
                                          {init.detailedSummary.data.dnaUX?.totalMembers}
                                        </div>
                                        <div className="rd-panel-stat-sub rd-panel-stat-sub--green">
                                          {init.detailedSummary.data.dnaUX?.janFIs} → {init.detailedSummary.data.dnaUX?.febFIs} cohorts
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* ROI details below */}
                                  <div className="rd-label-row">
                                    <span className="rd-mono-label">ROI</span>
                                    <SectionHelp title="ROI">
                                      Panels enabled same-week validation for 6 initiatives, replacing multi-month recruiting cycles.
                                    </SectionHelp>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Research Types Donut ─────────────────────────────────────────── */}
        <div
          ref={donutRef}
          className={`bq-reveal${donutVisible ? ' visible' : ''} rd-section--pt52-pb60`}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow rd-eyebrow--flush">
                  {/* Source: research.json researchTypes */}
                  Research Types
                </div>
                <SectionHelp>
                  A balanced portfolio of research methods — qualitative and evaluative — ensures we are both discovering
                  and validating the right problems before engineering investment.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Distribution of research methods</SplitText>
            </div>
          </div>

          <div className="rd-donut-layout">
            {/* Donut — conditional mount so Chart.js entrance animation fires on scroll */}
            <div className="bq-stagger-item rd-donut-wrap">
              {donutVisible && (
                <Doughnut
                  data={donutData}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutQuart' },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        ...CHART_TOOLTIP,
                        callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` },
                      },
                    },
                    cutout: '62%',
                  }}
                />
              )}
            </div>

            {/* Legend — bq-feature-row style with dashed separators */}
            <div className="rd-donut-legend">
              {typeLabels.map((label, i) => (
                <div key={label} className="bq-feature-row bq-stagger-item">
                  <div className="rd-legend-swatch" style={{ background: typeColors.colors[i] }} />
                  <div className="rd-legend-label">{label}</div>
                  <div className="rd-legend-value" style={{ color: typeColors.colors[i] }}>
                    {typeValues[i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
