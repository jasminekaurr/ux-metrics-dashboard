/**
 * AnalyticsDark.jsx — product analytics route (/analytics).
 *
 * Shows task success, funnels, adoption, and satisfaction from analytics JSON.
 * Related: data/sample/analytics.json.
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import SectionHelp from '../components/SectionHelp'
import SplitText from '../components/SplitText'
import { FONT_MONO as MONO } from '../config/typography'
import './ExecutiveSummary.css'
import './AnalyticsDark.css'

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
        <div ref={overviewRef} className={`bq-reveal${overviewVisible ? ' visible' : ''} an-section--pt40`}>
          <div className="bq-section-top">
            <div>
              <div className="es-section-heading-row">
                <div className="es-eyebrow an-eyebrow--flush">
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

          <div className="an-stats-row">
            {overviewStats.map((s) => (
              <div
                key={s.caption}
                className="bq-stat-item bq-stagger-item"
              >
                <div className={`bq-stat-num ${s.cls}`}>{s.num}</div>
                <div className="bq-stat-caption">{s.caption}</div>
                <div className="an-stat-sub">{s.sub}</div>
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

        <div ref={metricsRef} className={`bq-reveal${metricsVisible ? ' visible' : ''} an-section--pt52`}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow an-eyebrow--spaced">Metrics Framework</div>
              <SplitText className="bq-section-h">Tracked usability signals</SplitText>
            </div>
          </div>
          <div className="an-metrics-grid">
            {analytics.metrics.map((metric) => {
              const value = current[metric.field]
              const prevValue = previous[metric.field]
              const delta = getDelta(value, prevValue, metric.direction)
              return (
                <div key={metric.id} className="bq-stagger-item an-metric-card">
                  <div className="an-metric-head">
                    <div className="an-metric-title">{metric.title}</div>
                    <div className="an-metric-value">
                      {formatMetricValue(value, metric.unit)}
                    </div>
                  </div>
                  <div className="an-metric-desc">{metric.description}</div>
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

        <div ref={funnelRef} className={`bq-reveal${funnelVisible ? ' visible' : ''} an-section--pt52`}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow an-eyebrow--spaced">Funnel Analysis</div>
              <SplitText className="bq-section-h">{primaryFunnel.name} — {primaryFunnel.product}</SplitText>
            </div>
          </div>
          <div className="an-funnel-shell">
            {primaryFunnel.steps.map((step) => (
              <div key={step.name} className="an-funnel-row">
                <div className="an-funnel-name">{step.name}</div>
                <div className="an-funnel-track">
                  <div style={{
                    width: `${Math.max(8, 100 - step.exitRate)}%`,
                    height: '100%',
                    background: step.exitRate >= 18 ? 'var(--es-red)' : step.exitRate >= 14 ? 'var(--es-amber)' : 'var(--es-green)',
                    borderRadius: 99,
                  }} />
                </div>
                <div className="an-funnel-meta">
                  {step.exitRate}% exit · {step.entered.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={adoptionRef} className={`bq-reveal${adoptionVisible ? ' visible' : ''} an-section--pt52`}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow an-eyebrow--spaced">Feature Adoption</div>
              <SplitText className="bq-section-h">Shipped features in use</SplitText>
            </div>
          </div>
          <table className="bq-feature-table">
            <thead>
              <tr>
                <th className="bq-th">Feature</th>
                <th className="bq-th bq-th-center">Product</th>
                <th className="bq-th bq-th-center">Adoption</th>
                <th className="bq-th bq-th-last bq-th-center">Days live</th>
              </tr>
            </thead>
            <tbody>
              {analytics.featureAdoption.map((row) => (
                <tr key={row.feature} className="bq-feature-tr">
                  <td className="bq-td bq-td-feature">{row.feature}</td>
                  <td className="bq-td bq-td-center"><span className="es-chip blue">{row.product}</span></td>
                  <td className="bq-td bq-td-center an-adoption-mono">
                    {row.adoptionRate}% <span className="an-muted">({(row.adoptedUsers / 1000000).toFixed(1)}M)</span>
                  </td>
                  <td className="bq-td bq-td-purpose bq-td-center">{row.daysSinceLaunch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={pagesRef} className={`bq-reveal${pagesVisible ? ' visible' : ''} an-section--pt52`}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow an-eyebrow--spaced">Page Engagement</div>
              <SplitText className="bq-section-h">High-traffic screens</SplitText>
            </div>
          </div>
          <div className="an-pages-grid">
            {analytics.topPages.map((page) => (
              <div key={page.page} className="bq-stagger-item an-page-card">
                <div className="an-page-head">
                  <div className="an-page-title">{page.page}</div>
                  <span className={`es-chip ${page.trend === 'up' ? 'green' : page.trend === 'down' ? 'red' : ''}`}>
                    {page.trend === 'up' ? '↑' : page.trend === 'down' ? '↓' : '→'} {page.trend}
                  </span>
                </div>
                <div className="an-page-meta">
                  <span>{(page.sessions / 1000000).toFixed(1)}M sessions</span>
                  <span>{page.avgTimeSec}s avg</span>
                  <span>{page.bounceRate}% bounce</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={insightsRef} className={`bq-reveal${insightsVisible ? ' visible' : ''} an-section--pt52-pb60`}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow an-eyebrow--spaced">Insights</div>
              <SplitText className="bq-section-h">What the data is saying</SplitText>
            </div>
          </div>
          <div className="an-stack--tight">
            {analytics.insights.map((insight) => (
              <div key={insight.title} className="bq-stagger-item" style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderLeft: `3px solid ${severityColor(insight.severity, isDark)}`,
                borderRadius: 'var(--es-r)',
                padding: '16px 18px',
              }}>
                <div className="an-insight-title">{insight.title}</div>
                <div className="an-insight-body">{insight.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
