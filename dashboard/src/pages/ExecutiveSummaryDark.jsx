import { useState, useEffect, useRef, useMemo } from 'react'
import { useDashboardData } from '../context/DataContext'
import { labels, countKeyProducts } from '../config/orgLabels'
import LabelAdoptionDark from '../components/LabelAdoptionDark'
import LabelAdoptionVennDark from '../components/LabelAdoptionVennDark'
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
  const { roadmap, strategic, MONTHS, projectComponents, apexData } = useDashboardData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const STATUS_STAGE_COLOR = useMemo(() => getStatusStageColors(isDark), [isDark])

  const [barChartExpanded, setBarChartExpanded] = useState(false)
  const idx = selectedMonthIndex
  const { monthlySummary, featureRefinement, blockerIntelligence } = roadmap

  const aprMonth = projectComponents.monthly[3]
  const aprInsertions = apexData.weeklyTotals.reduce((sum, w) => sum + w.components, 0)
  const estimatedLocalInstances = (aprMonth.simple * 3) + (aprMonth.medium * 5) + (aprMonth.complex * 8) + (aprMonth.custom * 10)
  const reuseRate = Math.round((aprInsertions / (aprInsertions + estimatedLocalInstances)) * 100)

  const marMonth = projectComponents.monthly[2]
  const marInsertions = apexData.weeklyTotals.slice(0, -4).reduce((sum, w) => sum + w.components, 0)
  const marLocalInstances = (marMonth.simple * 3) + (marMonth.medium * 5) + (marMonth.complex * 8) + (marMonth.custom * 10)
  const reuseRatePrev = Math.round((marInsertions / (marInsertions + marLocalInstances)) * 100)
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
  const [vennRef, vennVisible] = useReveal()
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

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">
            Executive Summary
          </div>
          <h1 className="es-title">UX Impact — {MONTHS[idx]}<span className="es-cursor" /></h1>
          <p className="es-subtitle">
            A comprehensive view of UX contribution across delivery, data integrity, blockers,
            strategic initiatives, and design system adoption.
          </p>
        </div>
      </div>

      <div className="es-content">

        {/* ── A) Delivery Pipeline Overview ───────────────────────────────────── */}
        <div
          ref={deliveryRef}
          className={`bq-reveal${deliveryVisible ? ' visible' : ''}`}
          style={{ paddingTop: 40 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Delivery Pipeline Overview
                <span className="es-src-tag">From Roadmap</span>
              </div>
              <SplitText className="bq-section-h">What shipped and what's in motion</SplitText>
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
            ].map((s, i) => (
              <div
                key={i}
                className="bq-stat-item bq-stagger-item"
                style={{
                  borderRight: i < 4 ? '1px dashed var(--es-border-str)' : 'none',
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

        {/* ── B) Data Trust & Instrumentation ─────────────────────────────────── */}
        <div
          ref={vennRef}
          className={`bq-reveal${vennVisible ? ' visible' : ''}`}
          style={{ paddingTop: 52 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Data Trust &amp; Instrumentation
                <span className="es-src-tag">From Roadmap</span>
              </div>
              <SplitText className="bq-section-h">UX label adoption — overlapping categories</SplitText>
            </div>
          </div>

          <div style={{
            background: 'var(--es-surface)',
            border: '1px solid var(--es-border-str)',
            borderRadius: 'var(--es-r)',
            overflow: 'hidden',
          }}>
            {/* Collapsible header for bar chart */}
            <div
              onClick={() => setBarChartExpanded(!barChartExpanded)}
              style={{
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderBottom: barChartExpanded ? '1px solid var(--es-border-str)' : 'none',
                background: 'var(--es-surface-2)',
              }}
            >
              <div style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'var(--es-text-3)',
              }}>
                Bar Chart View
              </div>
              <span style={{
                fontSize: 14,
                color: 'var(--es-text-3)',
                transition: 'transform 200ms ease',
                transform: barChartExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }}>
                ›
              </span>
            </div>
            {barChartExpanded && <LabelAdoptionDark />}
          </div>

          <div style={{
            background: 'var(--es-surface)',
            border: '1px solid var(--es-border-str)',
            borderRadius: 'var(--es-r)',
            overflow: 'hidden',
            marginTop: 16,
          }}>
            <LabelAdoptionVennDark />
          </div>
        </div>

        {/* ── C) Active Blockers ───────────────────────────────────────────────── */}
        {blockerIntelligence.active.length > 0 && (
          <div
            ref={blockersRef}
            className={`bq-reveal${blockersVisible ? ' visible' : ''}`}
            style={{ paddingTop: 52 }}
          >
            <div className="bq-section-top">
              <div>
                <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                  Active Blockers with Impact
                  <span className="es-src-tag">From Roadmap</span>
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
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Initiative Status Pipeline
                <span className="es-src-tag">From Strategic Contribution</span>
              </div>
              <SplitText className="bq-section-h">Strategic initiatives across the innovation lifecycle</SplitText>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--es-text-3)', marginBottom: 16, lineHeight: 1.6 }}>
            Quick glance at status of all strategic initiatives — from early exploration through scaling ROI
          </p>

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
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Design System Adoption
                <span className="es-src-tag">From Design System Page</span>
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
              <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 10, fontStyle: 'italic', color: 'var(--es-text-3)' }}>
                Indicates where {labels.designSystemName} needs to grow richer
              </div>
            </div>
          </div>
        </div>

        {/* ── F) Analytics Coming Soon ─────────────────────────────────────────── */}
        <div
          ref={analyticsRef}
          className={`bq-reveal${analyticsVisible ? ' visible' : ''}`}
          style={{ paddingTop: 52, paddingBottom: 60 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Analytics
                <span style={{
                  fontFamily: MONO, fontSize: 9, letterSpacing: '0.07em',
                  padding: '2px 8px', borderRadius: 12, marginLeft: 10,
                  background: 'rgba(124,58,237,0.12)', color: '#a78bfa',
                  border: '1px dashed rgba(167,139,250,0.40)',
                }}>Coming Soon</span>
              </div>
              <SplitText className="bq-section-h">Advanced analytics platform</SplitText>
            </div>
          </div>

          <div className="bq-callout bq-stagger-item" style={{
            borderColor: 'rgba(167,139,250,0.35)',
            borderStyle: 'dashed',
          }}>
            <div className="bq-callout-icon" style={{ color: '#a78bfa' }}>◎</div>
            <div>
              <div className="bq-callout-title" style={{ color: '#a78bfa' }}>In-depth analytics capabilities</div>
              <div className="bq-callout-body">
                Trend analysis, comparative metrics, predictive insights, and custom reporting will be available soon.
                This will enable deeper understanding of UX impact across time and projects.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
