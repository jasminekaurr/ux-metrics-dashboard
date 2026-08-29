import { useState, useEffect, useRef, useMemo } from 'react'
import { useDashboardData } from '../context/DataContext'
import { labels, countKeyProducts } from '../config/orgLabels'
import LabelAdoptionVennDark from '../components/LabelAdoptionVennDark'
import ExecutiveSummaryPlayground from '../components/ExecutiveSummaryPlayground'
import SectionHelp from '../components/SectionHelp'
import { useTheme } from '../context/ThemeContext'
import './ExecutiveSummary.css'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

const STATUS_PIPELINE = ['Early exploration', 'Risk reduction phase', 'Learning investment', 'Actively delivering ROI', 'Scaling or improving ROI']

function getStatusStageColors(isDark) {
  return isDark
    ? ['#6b6b6e', '#3898ec', '#f59e0b', '#00bf2a', '#00bf2a']
    : ['#6e6e73', '#2563eb', '#d97706', '#16a34a', '#16a34a']
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

function SplitText({ children, className }) {
  const text = String(children)
  return (
    <h2 className={className} aria-label={text}>
      {text.split('').map((ch, i, arr) => (
        <span
          key={i}
          className="bq-split-char"
          style={{ transitionDelay: `${Math.round((i / arr.length) * 700)}ms` }}
          aria-hidden="true"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </h2>
  )
}

export default function ExecutiveSummaryDark({ selectedMonthIndex }) {
  const { roadmap, strategic, MONTHS, projectComponents, apexData, analytics } = useDashboardData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const STATUS_STAGE_COLOR = useMemo(() => getStatusStageColors(isDark), [isDark])

  const idx = selectedMonthIndex
  const { monthlySummary, featureRefinement, blockerIntelligence } = roadmap

  const currentMonth = projectComponents.monthly[idx] ?? projectComponents.monthly.at(-1)
  const prevMonth = projectComponents.monthly[Math.max(0, idx - 1)]
  const weeksPerMonth = Math.max(1, Math.round(apexData.weeklyTotals.length / MONTHS.length))
  const currentWeeks = apexData.weeklyTotals.slice(idx * weeksPerMonth, (idx + 1) * weeksPerMonth)
  const prevWeeks = apexData.weeklyTotals.slice(Math.max(0, idx - 1) * weeksPerMonth, idx * weeksPerMonth)
  const monthInsertions = currentWeeks.reduce((sum, w) => sum + w.components, 0)
  const prevInsertions = prevWeeks.reduce((sum, w) => sum + w.components, 0)
  const estimatedLocalInstances = (currentMonth.simple * 3) + (currentMonth.medium * 5) + (currentMonth.complex * 8) + (currentMonth.custom * 10)
  const reuseRate = Math.round((monthInsertions / (monthInsertions + estimatedLocalInstances)) * 100)
  const prevLocalInstances = (prevMonth.simple * 3) + (prevMonth.medium * 5) + (prevMonth.complex * 8) + (prevMonth.custom * 10)
  const reuseRatePrev = Math.round((prevInsertions / (prevInsertions + prevLocalInstances)) * 100)
  const reuseMoM = reuseRate - reuseRatePrev

  const customFeaturesCount = countKeyProducts(projectComponents.components)

  const semanticColors = useMemo(() => ({
    green: isDark ? '#00bf2a' : '#16a34a',
    amber: isDark ? '#f59e0b' : '#d97706',
    red: isDark ? '#ff2d2d' : '#dc2626',
  }), [isDark])

  const reuseColor = reuseRate >= 80 ? semanticColors.green : reuseRate >= 60 ? semanticColors.amber : semanticColors.red
  const blockerColor = blockerIntelligence.active.length > 0 ? semanticColors.red : semanticColors.green

  const [deliveryRef, deliveryVisible] = useReveal()
  const [blockersRef, blockersVisible] = useReveal()
  const [pipelineRef, pipelineVisible] = useReveal()
  const [apexRef, apexVisible] = useReveal()
  const [analyticsRef, analyticsVisible] = useReveal()

  const refinementInProgress = roadmap.featureGroomingProgression?.weekly?.at(-1)?.inProgress ?? Math.round(featureRefinement.inRefinement / 2)
  const refinementInReview = Math.max(featureRefinement.inRefinement - refinementInProgress, 0)

  const shippedAnim     = useCountUp(monthlySummary[idx].shipped,          deliveryVisible, 700,  40)
  const newFeatAnim     = useCountUp(featureRefinement.newFeatures,         deliveryVisible, 900, 110)
  const inProgressAnim  = useCountUp(refinementInProgress,                  deliveryVisible, 900, 180)
  const inReviewAnim    = useCountUp(refinementInReview,                    deliveryVisible, 900, 250)
  const blockersAnim    = useCountUp(blockerIntelligence.active.length || 0, deliveryVisible, 700, 320)
  const reuseAnim       = useCountUp(reuseRate,   apexVisible, 1000,  40)
  const customFeatAnim  = useCountUp(customFeaturesCount, apexVisible, 900, 110)

  const analyticsMonth = analytics.monthlySummary[idx] ?? analytics.monthlySummary.at(-1)
  const taskCompletionAnim = useCountUp(analyticsMonth.taskCompletionRate, analyticsVisible, 900, 40)
  const analyticsErrorAnim = useCountUp(analyticsMonth.errorRate, analyticsVisible, 900, 110)
  const susScoreAnim = useCountUp(analyticsMonth.susScore, analyticsVisible, 900, 180)
  const npsAnim = useCountUp(analyticsMonth.nps, analyticsVisible, 900, 250)

  const [viewMode, setViewMode] = useState('full')

  const pipelineMetrics = useMemo(() => ({
    shipped: monthlySummary[idx].shipped,
    todo: featureRefinement.newFeatures,
    progress: refinementInProgress,
    review: refinementInReview,
    hold: blockerIntelligence.active.length,
  }), [monthlySummary, idx, featureRefinement.newFeatures, refinementInProgress, refinementInReview, blockerIntelligence.active.length])

  return (
    <div className={`es-page es-page--executive-summary${viewMode === 'playground' ? ' es-page--playground' : ''}`}>
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-header-row">
            <div className="es-header-copy">
              <div className="es-eyebrow">
                Executive Summary
              </div>
              <h1 className="es-title">UX Impact<span className="es-cursor" /></h1>
            </div>
            <div className="es-view-toggle" role="tablist" aria-label="Executive summary view">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'full'}
                className={`es-view-toggle-btn${viewMode === 'full' ? ' active' : ''}`}
                onClick={() => setViewMode('full')}
              >
                Full view
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'playground'}
                className={`es-view-toggle-btn${viewMode === 'playground' ? ' active' : ''}`}
                onClick={() => setViewMode('playground')}
              >
                Playground
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'playground' ? (
        <div className="es-content es-content-playground">
          <ExecutiveSummaryPlayground
            selectedMonthIndex={idx}
            pipelineMetrics={pipelineMetrics}
            reuseRate={reuseRate}
          />
        </div>
      ) : (
      <div className="es-content">

        {/* ── A) Delivery pipeline & label adoption ───────────────────────────── */}
        <div
          ref={deliveryRef}
          className={`bq-reveal${deliveryVisible ? ' visible' : ''}`}
          style={{ paddingTop: 40 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow" style={{ marginBottom: 0 }}>
                  {/* Source: roadmap.json + jiraLabelAdoption.json */}
                  Delivery &amp; Data Integrity
                </div>
                <SectionHelp title="Why it matters">
                  Pipeline metrics show what shipped and what is in motion. Label adoption shows whether teams
                  instrument and trust UX taxonomy in delivery — together they answer if work is moving and measurable.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">What shipped and how teams label work</SplitText>
            </div>
          </div>

          <div style={{
            background: 'var(--es-surface)',
            borderRadius: 'var(--es-r)',
            border: '1px solid var(--es-border-str)',
            overflow: 'hidden',
          }}>
            <div className="es-combined-section-block">
              <div style={{ display: 'flex', overflow: 'hidden' }}>
                {[
                  { num: shippedAnim,    caption: 'Shipped',      sub: MONTHS[idx],             cls: 'green' },
                  { num: newFeatAnim,    caption: 'To Do',        sub: 'Backlog items',         cls: 'blue' },
                  { num: inProgressAnim, caption: 'In Progress',  sub: 'Refinement split',      cls: 'amber' },
                  { num: inReviewAnim,   caption: 'In Review',    sub: 'Refinement split',      cls: '' },
                  {
                    num: blockersAnim,
                    caption: 'On Hold',
                    sub: blockerIntelligence.active.length === 0 ? 'Nothing on hold' : 'Needs attention',
                    cls: blockerIntelligence.active.length > 0 ? 'red' : 'green',
                    accentColor: blockerColor,
                  },
                ].map((s, i, arr) => (
                  <div
                    key={s.caption}
                    className="bq-stat-item bq-stagger-item"
                    style={{
                      borderRight: i < arr.length - 1 ? '1px dashed var(--es-border-str)' : 'none',
                      borderTop: s.accentColor ? `3px solid ${s.accentColor}` : undefined,
                    }}
                  >
                    <div className={`bq-stat-num ${s.cls}`}>{s.num}</div>
                    <div className="bq-stat-caption">{s.caption}</div>
                    <div style={{ fontSize: 11, color: 'var(--es-text-3)', marginTop: 3 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="es-combined-section-block">
              <div className="es-combined-section-label">UX label adoption</div>
              <LabelAdoptionVennDark />
            </div>
          </div>
        </div>

        {/* ── B) Active Blockers ───────────────────────────────────────────────── */}
        {blockerIntelligence.active.length > 0 && (
          <div
            ref={blockersRef}
            className={`bq-reveal${blockersVisible ? ' visible' : ''}`}
            style={{ paddingTop: 52 }}
          >
            <div className="bq-section-top">
              <div>
                <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                  {/* Source: roadmap.json blockerIntelligence */}
                  Active Blockers with Impact
                </div>
                <SplitText className="bq-section-h">Blockers requiring leadership attention</SplitText>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {blockerIntelligence.active.map((b, i) => (
                <div
                  key={i}
                  className="bq-stagger-item"
                  style={{
                    background: 'var(--es-surface)',
                    border: '1px solid var(--es-border-str)',
                    borderLeft: `3px solid ${b.priority === 'critical' ? semanticColors.red : semanticColors.amber}`,
                    borderRadius: 'var(--es-r)',
                    padding: '16px 20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--es-text-1)', lineHeight: 1.4 }}>{b.blocker}</div>
                    <span style={{
                      fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: 12, flexShrink: 0, marginLeft: 12,
                      background: b.priority === 'critical'
                        ? (isDark ? 'rgba(255,45,45,0.12)' : 'rgba(220,38,38,0.10)')
                        : (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(217,119,6,0.10)'),
                      color: b.priority === 'critical' ? semanticColors.red : semanticColors.amber,
                      border: `1px solid ${b.priority === 'critical'
                        ? (isDark ? 'rgba(255,45,45,0.30)' : 'rgba(220,38,38,0.25)')
                        : (isDark ? 'rgba(245,158,11,0.30)' : 'rgba(217,119,6,0.25)')}`,
                    }}>
                      {b.priority}
                    </span>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--es-text-3)', marginBottom: 6, letterSpacing: '0.04em' }}>
                    Age: {b.ageInDays} days · Owner: {b.owner}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.5 }}>
                    Blocking: {b.affectedFeatures.join(', ')}
                    <span style={{ color: 'var(--es-text-3)' }}> ({b.affectedProjects.join(', ')})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── D) Initiative Status Pipeline ────────────────────────────────────── */}
        <div
          ref={pipelineRef}
          className={`bq-reveal${pipelineVisible ? ' visible' : ''}`}
          style={{ paddingTop: 52 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow" style={{ marginBottom: 0 }}>
                  {/* Source: strategic.json */}
                  Initiative Status Pipeline
                </div>
                <SectionHelp>
                  Quick glance at status of all strategic initiatives — from early exploration through scaling ROI.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Strategic initiatives across the innovation lifecycle</SplitText>
            </div>
          </div>

          {/* Stage headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 6 }}>
            {STATUS_PIPELINE.map((stage, i) => (
              <div
                key={stage}
                className="bq-stagger-item"
                style={{
                  textAlign: 'center',
                  fontFamily: MONO, fontSize: 8, fontWeight: 400,
                  letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: STATUS_STAGE_COLOR[i],
                  padding: '6px 8px',
                  background: 'var(--es-surface-2)',
                  borderRadius: 'var(--es-r-sm)',
                  border: '1px solid var(--es-border-str)',
                  lineHeight: 1.4,
                }}
              >
                {stage}
              </div>
            ))}
          </div>

          {/* Kanban columns */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
            background: 'var(--es-border-str)',
            border: '1px solid var(--es-border-str)',
            borderRadius: 'var(--es-r)', padding: 1,
          }}>
            {STATUS_PIPELINE.map((stage, stageIdx) => {
              const stageItems = strategic.initiatives.filter(i => i.statusIndex === stageIdx)
              return (
                <div
                  key={stage}
                  className="bq-stagger-item"
                  style={{
                    background: 'var(--es-surface)',
                    padding: 8,
                    display: 'flex', flexDirection: 'column', gap: 6,
                    minHeight: 80,
                  }}
                >
                  {stageItems.length === 0 ? (
                    <div style={{
                      height: 48,
                      border: '1px dashed var(--es-border-str)',
                      borderRadius: 'var(--es-r-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)' }}>—</span>
                    </div>
                  ) : stageItems.map(initiative => (
                    <div
                      key={initiative.name}
                      style={{
                        background: 'var(--es-surface-2)',
                        border: '1px solid var(--es-border-str)',
                        borderRadius: 'var(--es-r-sm)',
                        padding: '10px 10px 8px',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'border-color 150ms ease, background 150ms ease',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--es-text-1)', marginBottom: 2, lineHeight: 1.3 }}>
                        {initiative.name}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.06em', color: 'var(--es-text-3)', textTransform: 'uppercase' }}>
                        {initiative.shortType}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── E) Design System Adoption ────────────────────────────────────────── */}
        <div
          ref={apexRef}
          className={`bq-reveal${apexVisible ? ' visible' : ''}`}
          style={{ paddingTop: 52 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow" style={{ marginBottom: 0 }}>
                  {/* Source: projectComponents.json / apex.json */}
                  Design System Adoption
                </div>
                <SectionHelp>
                  Reuse rate shows pattern adoption; custom feature count indicates where {labels.designSystemName} needs to grow richer.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">{labels.designSystemName} reuse rate and custom feature footprint</SplitText>
            </div>
          </div>

          <div style={{
            display: 'flex',
            background: 'var(--es-surface)',
            borderRadius: 'var(--es-r)',
            border: '1px solid var(--es-border-str)',
            overflow: 'hidden',
          }}>
            <div className="bq-stat-item bq-stagger-item" style={{ borderRight: '1px dashed var(--es-border-str)' }}>
              <div className="bq-stat-num" style={{ color: reuseColor }}>{reuseAnim}%</div>
              <div className="bq-stat-caption">{labels.designSystemName} Reuse Rate</div>
              <div style={{ fontSize: 11, color: 'var(--es-text-3)', marginTop: 3 }}>
                {labels.uiFromPatterns}
              </div>
              <div style={{
                marginTop: 8, fontFamily: MONO, fontSize: 10,
                color: reuseMoM >= 0 ? semanticColors.green : semanticColors.red,
              }}>
                {reuseMoM > 0 ? '↑ +' : reuseMoM < 0 ? '↓ ' : '→ '}{Math.abs(reuseMoM)}pp vs last month
              </div>
            </div>
            <div className="bq-stat-item bq-stagger-item">
              <div className="bq-stat-num amber">{customFeatAnim}</div>
              <div className="bq-stat-caption">Custom Features Built</div>
              <div style={{ fontSize: 11, color: 'var(--es-text-3)', marginTop: 3 }}>
                Across {labels.portfolioProducts} this month
              </div>
            </div>
          </div>
        </div>

        {/* ── F) Product Analytics ─────────────────────────────────────────────── */}
        <div
          ref={analyticsRef}
          className={`bq-reveal${analyticsVisible ? ' visible' : ''}`}
          style={{ paddingTop: 52, paddingBottom: 60 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                {/* Source: analytics.json — replace with your analytics platform export */}
                Analytics
              </div>
              <SplitText className="bq-section-h">Product analytics at a glance</SplitText>
            </div>
          </div>

          <div style={{
            display: 'flex',
            background: 'var(--es-surface)',
            borderRadius: 'var(--es-r)',
            border: '1px solid var(--es-border-str)',
            overflow: 'hidden',
          }}>
            {[
              { num: `${Math.round(taskCompletionAnim)}%`, caption: 'Task Completion', sub: MONTHS[idx], cls: analyticsMonth.taskCompletionRate >= 70 ? 'green' : 'amber' },
              { num: `${analyticsErrorAnim.toFixed(1)}%`, caption: 'Error Rate', sub: 'Critical flows', cls: analyticsMonth.errorRate <= 8 ? 'green' : 'red' },
              { num: Math.round(susScoreAnim), caption: 'SUS Score', sub: 'Live baseline', cls: analyticsMonth.susScore >= 68 ? 'green' : 'amber' },
              { num: Math.round(npsAnim), caption: 'NPS', sub: 'Product sentiment', cls: 'blue' },
            ].map((s, i, arr) => (
              <div
                key={s.caption}
                className="bq-stat-item bq-stagger-item"
                style={{ borderRight: i < arr.length - 1 ? '1px dashed var(--es-border-str)' : 'none' }}
              >
                <div className={`bq-stat-num ${s.cls}`}>{s.num}</div>
                <div className="bq-stat-caption">{s.caption}</div>
                <div style={{ fontSize: 11, color: 'var(--es-text-3)', marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
      )}
    </div>
  )
}
