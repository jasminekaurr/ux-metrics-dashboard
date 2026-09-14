/**
 * RoadmapDark.jsx — delivery/roadmap health route (/roadmap).
 *
 * Visualizes projects, velocity, blockers, and epic status for the selected
 * month. Related: data/sample/roadmap.json.
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, getChartColors } from '../utils/chartTheme'
import SectionHelp from '../components/SectionHelp'
import SplitText from '../components/SplitText'
import { FONT_MONO as MONO } from '../config/typography'
import './ExecutiveSummary.css'
import './RoadmapDark.css'

ChartJS.register(ArcElement, Tooltip, Legend)

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

export default function RoadmapDark({ selectedMonthIndex }) {
  const { roadmap, MONTHS } = useDashboardData()
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

  const [kpiRef, kpiVisible] = useReveal()
  const [velocityRef, velocityVisible] = useReveal()
  const [reworkRef, reworkVisible] = useReveal()
  const [timelineRef, timelineVisible] = useReveal()

  const {
    monthlySummary, projects,
    throughput, blockerIntelligence, featureRefinement,
  } = roadmap
  const idx = selectedMonthIndex
  const m = monthlySummary[idx]
  const refinementInProgress = roadmap.featureGroomingProgression?.weekly?.at(-1)?.inProgress ?? Math.round(featureRefinement.inRefinement / 2)
  const refinementInReview = Math.max(featureRefinement.inRefinement - refinementInProgress, 0)

  const shippedAnim  = useCountUp(m.shipped,                              kpiVisible, 900,  40)
  const newFeatAnim  = useCountUp(featureRefinement.newFeatures,           kpiVisible, 900, 110)
  const inProgressAnim = useCountUp(refinementInProgress,                  kpiVisible, 900, 180)
  const inReviewAnim = useCountUp(refinementInReview,                      kpiVisible, 900, 250)
  const blockersAnim = useCountUp(blockerIntelligence.active.length || 0, kpiVisible, 700, 320)

  const throughputByProject = useMemo(() => (
    throughput.byProject.map(projectFlow => {
      const ratio = projectFlow.opened > 0 ? projectFlow.closed / projectFlow.opened : 1
      return {
        ...projectFlow,
        ratio,
        ratioPct: Math.round(ratio * 100),
        barPct: Math.min(Math.round(ratio * 100), 100),
      }
    })
  ), [throughput.byProject])

  const blockerReasonCategories = useMemo(() => {
    const byKey = new Map()

    blockerIntelligence.active.forEach(blocker => {
      let key = 'other'
      let label = 'Other'

      if (/api|endpoint|integration/i.test(blocker.blocker)) {
        key = 'api-dependency'
        label = 'API / Technical dependency'
      } else if (/design system|component/i.test(blocker.blocker)) {
        key = 'design-system'
        label = 'Design system dependency'
      } else if (/approval|stakeholder/i.test(blocker.blocker)) {
        key = 'stakeholder'
        label = 'Stakeholder / approval'
      } else if (/resource|availability|capacity|resourcing/i.test(blocker.blocker)) {
        key = 'resourcing'
        label = 'Resourcing / capacity'
      }

      const existing = byKey.get(key)
      if (existing) {
        existing.count += 1
        existing.avgAgeDays = Math.round(((existing.avgAgeDays * (existing.count - 1)) + blocker.ageInDays) / existing.count)
        existing.reasons.push(blocker.blocker)
      } else {
        byKey.set(key, {
          key,
          label,
          count: 1,
          avgAgeDays: blocker.ageInDays,
          reasons: [blocker.blocker],
        })
      }
    })

    return Array.from(byKey.values()).sort((a, b) => b.count - a.count)
  }, [blockerIntelligence.active])

  const blockerReasonTotal = blockerReasonCategories.reduce((sum, cat) => sum + cat.count, 0)

  const blockerReasonPieData = useMemo(() => ({
    labels: blockerReasonCategories.map(cat => cat.label),
    datasets: [{
      data: blockerReasonCategories.map(cat => cat.count),
      backgroundColor: [chartColors.redFill, chartColors.amberFill, chartColors.blueFill, chartColors.grayFill],
      borderColor: [chartColors.red, chartColors.amber, chartColors.blue, chartColors.gray],
      borderWidth: 1,
    }],
  }), [blockerReasonCategories, chartColors])

  const blockerValueClass = blockerIntelligence.active.length > 0 ? 'red' : 'green'

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">
            Delivery & Roadmap
          </div>
          <h1 className="es-title">Project Roadmap<span className="es-cursor" /></h1>
        </div>
      </div>

      <div className="es-content">

        {/* ── Delivery Health KPIs ──────────────────────────────────────────── */}
        <div ref={kpiRef} className={`bq-reveal${kpiVisible ? ' visible' : ''} rm-section--pt40`}>
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow rm-eyebrow--flush">
                  {/* Source: roadmap.json (Jira capture) */}
                  Delivery Health
                </div>
                <SectionHelp>
                  Tracking shipped work, refinement progress, and on-hold items gives leadership visibility into
                  delivery predictability and team health.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Delivery health</SplitText>
            </div>
          </div>

          <div className="es-kpi-grid">
            {[
              { label: 'Shipped', value: shippedAnim,  sub: MONTHS[idx],         cls: 'green' },
              { label: 'To Do',                    value: newFeatAnim,  sub: 'Backlog items',     cls: '' },
              { label: 'In Progress',              value: inProgressAnim, sub: 'Refinement split', cls: 'amber' },
              { label: 'In Review',                value: inReviewAnim,  sub: 'Refinement split',  cls: '' },
              {
                label: 'On Hold',
                value: blockerIntelligence.active.length === 0 ? blockersAnim : blockerIntelligence.active.length,
                sub: blockerIntelligence.active.length === 0 ? 'Nothing on hold' : 'Needs attention',
                cls: blockerValueClass,
              },
            ].map((kpi, i) => (
              <div key={i} className="bq-stagger-item es-kpi">
                <div className="es-kpi-glow-bar" />
                <div className="es-kpi-label">{kpi.label}</div>
                <div className={`es-kpi-value ${kpi.cls}`}>{kpi.value}</div>
                <div className="es-kpi-sub">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Velocity & Throughput ─────────────────────────────────────────── */}
        <div ref={velocityRef} className={`bq-reveal${velocityVisible ? ' visible' : ''} rm-section--pt52`}>
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow rm-eyebrow--flush">
                  {/* Source: roadmap.json velocity / throughput */}
                  Velocity & Throughput
                </div>
                <SectionHelp title="This period">
                  Throughput is improving as blockers decline; commitment accuracy is at{' '}
                  {roadmap.velocity.monthly[idx].achievement}% for {MONTHS[idx]}.
                  Team delivered {roadmap.velocity.monthly[idx].delivered} of {roadmap.velocity.monthly[idx].committed} committed story points.
                  Ticket flow is {throughput.monthly[idx].netFlow >= 0 ? 'positive' : 'negative'} (
                  {Math.abs(throughput.monthly[idx].netFlow)} net {throughput.monthly[idx].netFlow >= 0 ? 'closed' : 'opened'}).
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Ticket flow and delivery velocity</SplitText>
            </div>
          </div>

          <div className="bq-stagger-item rm-chart-card">
            <div className="rm-chart-hd">
              <div className="rm-chart-title">Project throughput ratio — Closed vs Opened</div>
              <div className="rm-chart-sub">Project-wise progress bars with close/open ratio</div>
            </div>
            <div className="rm-chart-body">
              <div className="rm-prog-stack">
                {throughputByProject.map(projectFlow => (
                  <div key={projectFlow.project} className="es-prog-row" style={{ alignItems: 'center' }}>
                    <div className="es-prog-label" style={{ width: 170, flexShrink: 0 }}>{projectFlow.project}</div>
                    <div className="es-prog-track" style={{ flex: 1 }}>
                      {velocityVisible && (
                        <div
                          className="es-prog-fill"
                          style={{
                            background: projectFlow.ratio >= 1 ? 'var(--es-green)' : 'var(--es-blue)',
                            '--fill-pct': `${projectFlow.barPct}%`,
                          }}
                        />
                      )}
                    </div>
                    <div className="es-prog-val" style={{ minWidth: 88, textAlign: 'right' }}>
                      {projectFlow.closed}/{projectFlow.opened}
                    </div>
                    <div className="rm-ratio" style={{ color: projectFlow.ratio >= 1 ? 'var(--es-green)' : 'var(--es-text-3)' }}>
                      {projectFlow.ratioPct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Rework + Blockers ─────────────────────────────────────────────── */}
        <div ref={reworkRef} className={`bq-reveal${reworkVisible ? ' visible' : ''} rm-section--pt52`}>
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow rm-eyebrow--flush">
                  {/* Source: roadmap.json blockerIntelligence — user-maintained qualitative input */}
                  Rework + Blockers
                </div>
                <SectionHelp>
                  Blockers are most actionable when grouped by reason category. Category trends show where to
                  focus intervention first (dependency, approval, or capacity) to unblock more work faster.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Rework prevention and active blockers</SplitText>
            </div>
          </div>

          <div className="bq-stagger-item rm-chart-card">
            <div className="rm-chart-hd">
              <div className="rm-chart-title">Active blocker categories — {MONTHS[idx]}</div>
              <div className="rm-chart-sub">Distribution, age, and example reasons by category</div>
            </div>
            <div style={{ padding: '24px 24px 20px', display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--es-border)' }}>
              <div className="rm-donut-wrap">
                {reworkVisible && (
                  <Doughnut
                    data={blockerReasonPieData}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      animation: { animateRotate: true, animateScale: true, duration: 900, easing: 'easeOutQuart' },
                      plugins: {
                        legend: { display: false },
                        tooltip: CHART_TOOLTIP,
                      },
                      cutout: '58%',
                    }}
                  />
                )}
                <div className="rm-donut-center">
                  <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 300, color: 'var(--es-text-1)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                    {blockerReasonTotal}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Active
                  </div>
                </div>
              </div>
              <div className="rm-legend-col">
                {blockerReasonCategories.map((category, i) => {
                  const colors = [chartColors.red, chartColors.amber, chartColors.blue, chartColors.gray]
                  const color = colors[i % colors.length]
                  return (
                  <div key={category.key}>
                    <div className="rm-legend-row">
                      <div className="rm-legend-left">
                        <div className="rm-swatch" style={{ background: color }} />
                        <span className="rm-mono-label" style={{ letterSpacing: '0.08em' }}>{category.label}</span>
                      </div>
                      <span className="rm-detail-meta" style={{ fontSize: 13, fontWeight: 300, color: 'var(--es-text-1)' }}>{category.count}</span>
                    </div>
                    <div className="es-prog-track">
                      {reworkVisible && (
                        <div
                          className="es-prog-fill"
                          style={{ background: color, '--fill-pct': `${(category.count / blockerReasonTotal) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
            <div className="rm-detail-pad">
              {blockerReasonCategories.map(category => (
                <div key={`${category.key}-detail`} className="rm-detail-block">
                  <div className="rm-detail-head">
                    <div className="rm-detail-title">{category.label}</div>
                    <div className="rm-detail-meta">
                      {category.count} blockers · avg age {category.avgAgeDays}d
                    </div>
                  </div>
                  <div className="rm-detail-meta" style={{ lineHeight: 1.5 }}>
                    Reasons: {category.reasons.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Release Timeline ──────────────────────────────────────────────── */}
        <div ref={timelineRef} className={`bq-reveal${timelineVisible ? ' visible' : ''} rm-section--pt52`}>
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow rm-eyebrow--flush">Release Timeline</div>
                <SectionHelp>
                  Phase progress and milestone tracking gives stakeholders confidence in release predictability.
                  Consistent phase movement supports committing to roadmap timelines with higher certainty.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Project release progress</SplitText>
            </div>
          </div>

          <div className="rm-projects-grid">
            {projects.map((p) => (
              <div key={p.name} className="bq-stagger-item rm-project-card">
                <div>
                  <div className="rm-project-name">{p.name}</div>
                  <div className="rm-project-phase">
                    Phase {p.currentPhase || 2} — In progress
                  </div>
                </div>

                <div>
                  <div className="rm-progress-head">
                    <span className="rm-progress-label">Phase Progress</span>
                    <span className="rm-progress-pct">{p.phaseProgress || 65}%</span>
                  </div>
                  <div className="es-prog-track">
                    {timelineVisible && (
                      <div
                        className="es-prog-fill"
                        style={{ background: 'var(--es-blue)', '--fill-pct': `${p.phaseProgress || 65}%` }}
                      />
                    )}
                  </div>
                </div>

                <div className="rm-phase-chips">
                  {['P1','P2','P3','P4'].map((ph, pi) => (
                    <span key={ph} className="es-chip">
                      {ph}: {[p.phaseDistribution?.phase1, p.phaseDistribution?.phase2, p.phaseDistribution?.phase3, p.phaseDistribution?.phase4][pi] || [2,5,8,3][pi]}
                    </span>
                  ))}
                  <span className="es-chip">Unassigned: {p.phaseDistribution?.notAssigned || 1}</span>
                </div>

                <button
                  className="rm-jira-btn"
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--es-surface-2)'; e.currentTarget.style.borderColor = 'var(--es-text-3)' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--es-border-str)' }}
                  onClick={() => window.open('https://jira.example.com', '_blank')}
                >
                  View in Jira →
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
