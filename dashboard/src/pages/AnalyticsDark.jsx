import { useMemo, useState, useEffect, useRef } from 'react'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import SectionHelp from '../components/SectionHelp'
import './ExecutiveSummary.css'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

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
    if (!shouldStart || target === null || target === undefined) return
    const numericTarget = typeof target === 'number' ? target : Number.parseFloat(target)
    if (!Number.isFinite(numericTarget)) return
    let raf, tid
    tid = setTimeout(() => {
      const start = performance.now()
      function tick(now) {
        const t = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setValue(numericTarget * eased)
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

function formatMetricValue(value, unit) {
  if (value === null || value === undefined) return '—'
  if (unit === '%') return `${Math.round(value)}%`
  if (unit === 's') return `${Math.round(value)}s`
  if (unit === ' pages') return value.toFixed(1)
  return String(Math.round(value))
}

function getDelta(current, previous, direction) {
  if (current === undefined || previous === undefined) return null
  const raw = current - previous
  const improved = direction === 'higher' ? raw > 0 : raw < 0
  return { raw, improved }
}

function severityColor(severity, isDark) {
  if (severity === 'positive') return isDark ? '#00bf2a' : '#16a34a'
  if (severity === 'watch') return isDark ? '#f59e0b' : '#d97706'
  if (severity === 'critical') return isDark ? '#ff2d2d' : '#dc2626'
  return 'var(--es-text-2)'
}

export default function AnalyticsDark({ selectedMonthIndex }) {
  const { analytics, MONTHS } = useDashboardData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const idx = selectedMonthIndex

  const current = analytics.monthlySummary[idx] ?? analytics.monthlySummary.at(-1)
  const previous = analytics.monthlySummary[Math.max(0, idx - 1)]

  const [overviewRef, overviewVisible] = useReveal()
  const [metricsRef, metricsVisible] = useReveal()
  const [funnelRef, funnelVisible] = useReveal()
  const [adoptionRef, adoptionVisible] = useReveal()
  const [pagesRef, pagesVisible] = useReveal()
  const [insightsRef, insightsVisible] = useReveal()

  const taskCompletionAnim = useCountUp(current.taskCompletionRate, overviewVisible, 900, 40)
  const errorRateAnim = useCountUp(current.errorRate, overviewVisible, 900, 110)
  const funnelAnim = useCountUp(current.funnelCompletionRate, overviewVisible, 900, 180)
  const adoptionAnim = useCountUp(current.featureAdoptionRate, overviewVisible, 900, 250)

  const overviewStats = useMemo(() => [
    {
      num: `${Math.round(taskCompletionAnim)}%`,
      caption: 'Task Completion',
      sub: MONTHS[idx],
      cls: current.taskCompletionRate >= 70 ? 'green' : 'amber',
      delta: getDelta(current.taskCompletionRate, previous.taskCompletionRate, 'higher'),
    },
    {
      num: `${errorRateAnim.toFixed(1)}%`,
      caption: 'Error Rate',
      sub: 'Critical flows',
      cls: current.errorRate <= 8 ? 'green' : 'red',
      delta: getDelta(current.errorRate, previous.errorRate, 'lower'),
    },
    {
      num: `${Math.round(funnelAnim)}%`,
      caption: 'Funnel Completion',
      sub: 'Post creation',
      cls: 'blue',
      delta: getDelta(current.funnelCompletionRate, previous.funnelCompletionRate, 'higher'),
    },
    {
      num: `${Math.round(adoptionAnim)}%`,
      caption: 'Feature Adoption',
      sub: '30-day window',
      cls: 'amber',
      delta: getDelta(current.featureAdoptionRate, previous.featureAdoptionRate, 'higher'),
    },
  ], [current, previous, idx, MONTHS, taskCompletionAnim, errorRateAnim, funnelAnim, adoptionAnim])

  const primaryFunnel = analytics.funnels[0]

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">Analytics</div>
          <h1 className="es-title">Product Analytics<span className="es-cursor" /></h1>
        </div>
      </div>

      <div className="es-content">
        <div ref={overviewRef} className={`bq-reveal${overviewVisible ? ' visible' : ''}`} style={{ paddingTop: 40 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow" style={{ marginBottom: 0 }}>
                  {/* Source: analytics.json — replace with Amplitude, Mixpanel, GA4, Heap, Pendo, etc. */}
                  Product Health
                </div>
                <SectionHelp title="Sample analytics data">
                  Bundled metrics are fictional demo values. Replace analytics.json with exports or API output from
                  whatever analytics platform your team uses.
                </SectionHelp>
              </div>
              <SplitText className="bq-section-h">Usability and engagement at a glance</SplitText>
            </div>
          </div>

          <div style={{
            display: 'flex',
            background: 'var(--es-surface)',
            borderRadius: 'var(--es-r)',
            border: '1px solid var(--es-border-str)',
            overflow: 'hidden',
          }}>
            {overviewStats.map((s, i) => (
              <div
                key={s.caption}
                className="bq-stat-item bq-stagger-item"
                style={{ borderRight: i < overviewStats.length - 1 ? '1px dashed var(--es-border-str)' : 'none' }}
              >
                <div className={`bq-stat-num ${s.cls}`}>{s.num}</div>
                <div className="bq-stat-caption">{s.caption}</div>
                <div style={{ fontSize: 11, color: 'var(--es-text-3)', marginTop: 3 }}>{s.sub}</div>
                {s.delta && (
                  <div style={{
                    marginTop: 6,
                    fontFamily: MONO,
                    fontSize: 10,
                    color: s.delta.improved ? 'var(--es-green)' : 'var(--es-red)',
                  }}>
                    {s.delta.improved ? '↑' : '↓'} {Math.abs(s.delta.raw).toFixed(s.caption === 'Error Rate' ? 1 : 0)}
                    {s.caption === 'Error Rate' ? ' pts' : s.caption.includes('%') || s.num.includes('%') ? ' pts' : ''} vs prior month
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div ref={metricsRef} className={`bq-reveal${metricsVisible ? ' visible' : ''}`} style={{ paddingTop: 52 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>Metrics Framework</div>
              <SplitText className="bq-section-h">Tracked usability signals</SplitText>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {analytics.metrics.map((metric) => {
              const value = current[metric.field]
              const prevValue = previous[metric.field]
              const delta = getDelta(value, prevValue, metric.direction)
              return (
                <div key={metric.id} className="bq-stagger-item" style={{
                  background: 'var(--es-surface)',
                  border: '1px solid var(--es-border-str)',
                  borderRadius: 'var(--es-r)',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--es-text-1)', lineHeight: 1.45 }}>{metric.title}</div>
                    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 300, color: 'var(--es-text-1)', flexShrink: 0 }}>
                      {formatMetricValue(value, metric.unit)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.65 }}>{metric.description}</div>
                  {delta && (
                    <div style={{ fontFamily: MONO, fontSize: 10, color: delta.improved ? 'var(--es-green)' : 'var(--es-amber)' }}>
                      {delta.improved ? 'Improving' : 'Watch'} · {Math.abs(delta.raw).toFixed(metric.unit === 's' ? 0 : 1)} {metric.unit === '%' ? 'pt' : metric.unit.trim()} MoM
                    </div>
                  )}
                  <div className="es-metric-help">
                    <SectionHelp title="Why it matters" label={`Why ${metric.title} matters`}>
                      {metric.whyItMatters}
                    </SectionHelp>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div ref={funnelRef} className={`bq-reveal${funnelVisible ? ' visible' : ''}`} style={{ paddingTop: 52 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>Funnel Analysis</div>
              <SplitText className="bq-section-h">{primaryFunnel.name} — {primaryFunnel.product}</SplitText>
            </div>
          </div>
          <div style={{
            background: 'var(--es-surface)',
            border: '1px solid var(--es-border-str)',
            borderRadius: 'var(--es-r)',
            overflow: 'hidden',
          }}>
            {primaryFunnel.steps.map((step, i) => (
              <div key={step.name} style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 2fr) auto',
                gap: 16,
                alignItems: 'center',
                padding: '14px 20px',
                borderTop: i > 0 ? '1px solid var(--es-border)' : 'none',
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--es-text-1)' }}>{step.name}</div>
                <div style={{ height: 8, background: 'var(--es-surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.max(8, 100 - step.exitRate)}%`,
                    height: '100%',
                    background: step.exitRate >= 18 ? 'var(--es-red)' : step.exitRate >= 14 ? 'var(--es-amber)' : 'var(--es-green)',
                    borderRadius: 99,
                  }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: 'var(--es-text-3)', textAlign: 'right', minWidth: 88 }}>
                  {step.exitRate}% exit · {step.entered.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={adoptionRef} className={`bq-reveal${adoptionVisible ? ' visible' : ''}`} style={{ paddingTop: 52 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>Feature Adoption</div>
              <SplitText className="bq-section-h">Shipped features in use</SplitText>
            </div>
          </div>
          <table className="bq-feature-table">
            <thead>
              <tr>
                <th className="bq-th">Feature</th>
                <th className="bq-th">Product</th>
                <th className="bq-th">Adoption</th>
                <th className="bq-th bq-th-last">Days live</th>
              </tr>
            </thead>
            <tbody>
              {analytics.featureAdoption.map((row) => (
                <tr key={row.feature} className="bq-feature-tr">
                  <td className="bq-td bq-td-feature">{row.feature}</td>
                  <td className="bq-td"><span className="es-chip blue">{row.product}</span></td>
                  <td className="bq-td" style={{ fontFamily: MONO, fontSize: 12 }}>
                    {row.adoptionRate}% <span style={{ color: 'var(--es-text-3)' }}>({(row.adoptedUsers / 1000000).toFixed(1)}M)</span>
                  </td>
                  <td className="bq-td bq-td-purpose">{row.daysSinceLaunch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={pagesRef} className={`bq-reveal${pagesVisible ? ' visible' : ''}`} style={{ paddingTop: 52 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>Page Engagement</div>
              <SplitText className="bq-section-h">High-traffic screens</SplitText>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {analytics.topPages.map((page) => (
              <div key={page.page} className="bq-stagger-item" style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderRadius: 'var(--es-r)',
                padding: '18px 20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--es-text-1)' }}>{page.page}</div>
                  <span className={`es-chip ${page.trend === 'up' ? 'green' : page.trend === 'down' ? 'red' : ''}`}>
                    {page.trend === 'up' ? '↑' : page.trend === 'down' ? '↓' : '→'} {page.trend}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 20, fontFamily: MONO, fontSize: 10, color: 'var(--es-text-3)' }}>
                  <span>{(page.sessions / 1000000).toFixed(1)}M sessions</span>
                  <span>{page.avgTimeSec}s avg</span>
                  <span>{page.bounceRate}% bounce</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={insightsRef} className={`bq-reveal${insightsVisible ? ' visible' : ''}`} style={{ paddingTop: 52, paddingBottom: 60 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>Insights</div>
              <SplitText className="bq-section-h">What the data is saying</SplitText>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {analytics.insights.map((insight) => (
              <div key={insight.title} className="bq-stagger-item" style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderLeft: `3px solid ${severityColor(insight.severity, isDark)}`,
                borderRadius: 'var(--es-r)',
                padding: '16px 18px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--es-text-1)', marginBottom: 6 }}>{insight.title}</div>
                <div style={{ fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.65 }}>{insight.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
