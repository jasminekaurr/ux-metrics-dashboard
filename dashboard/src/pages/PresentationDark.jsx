/**
 * PresentationDark.jsx — full-bleed presentation slides (standalone).
 *
 * Slide-style narrative layouts using org labels; not wired into the main
 * HashRouter by default. Related: config/orgLabels.js.
 */
import { useTheme } from '../context/ThemeContext'
import { labels } from '../config/orgLabels'
import { FONT_MONO as MONO } from '../config/typography'
import './ExecutiveSummary.css'
import './PresentationDark.css'

export default function PresentationDark() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gradientBg = isDark
    ? 'linear-gradient(135deg, rgba(0,191,42,0.15) 0%, rgba(56,152,236,0.15) 100%)'
    : 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(37,99,235,0.12) 100%)'

  return (
    <div className="es-page pres-page">

      {/* ── Slide 1: Title ───────────────────────────────────────────────── */}
      <section className="pres-slide pres-slide--center">
        <div className="pres-inner pres-inner--center">
          <div className="pres-eyebrow pres-eyebrow--hero">
            UX METRICS DASHBOARD
          </div>

          <h1 className="pres-h1">
            Measuring what matters
          </h1>

          <div className="pres-tag-row">
            {['DESIGN SYSTEM', 'UX RESEARCH', 'PRODUCT ANALYSIS', 'DELIVERY AND ROADMAP', 'STRATEGIC CONTRIBUTION'].map(tag => (
              <span key={tag} className="pres-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="pres-eyebrow pres-eyebrow--footer">
            UX METRICS DASHBOARD · OPEN SOURCE DEMO
          </div>
        </div>
      </section>

      {/* ── Slide 2: What is it? ─────────────────────────────────────────── */}
      <section className="pres-slide pres-slide--border">
        <div className="pres-inner">
          <div className="pres-eyebrow">
            WHAT IS IT?
          </div>

          <h2 className="pres-h2 pres-h2--tight">
            A live UX impact dashboard
          </h2>

          <p className="pres-lede">
            UX Metrics Dashboard providing leadership a clear, monthly view of design impact and performance
          </p>

          {/* Feature Cards Grid */}
          <div className="pres-feature-grid">
            {[
              { icon: '◻', label: 'Design system health' },
              { icon: '◎', label: 'Research impact' },
              { icon: '◬', label: 'Product analysis' },
              { icon: '◷', label: 'Delivery and roadmap' },
              { icon: '◈', label: 'Strategic contribution' },
              { icon: '◉', label: 'Executive summary' },
            ].map((item, i) => (
              <div key={i} className="pres-feature-card">
                <div className="pres-feature-icon">
                  {item.icon}
                </div>
                <div className="pres-feature-label">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Who is it for? */}
          <div className="pres-panel">
            <div className="pres-panel-head">
              <div className="pres-panel-icon">
                ◎
              </div>
              <div className="pres-panel-title">
                Who is it for?
              </div>
            </div>
            <p className="pres-panel-body">
              Built by the UX team, for everyone who needs to understand and act on UX contribution.
            </p>
            <div className="pres-chip-row">
              {['UX LEADERS', 'PRODUCT MANAGERS', 'ENGINEERING LEADS', 'EXECUTIVES', 'DESIGN TEAM'].map(tag => (
                <span key={tag} className="pres-tag pres-tag--sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Slide 3: The Problem ─────────────────────────────────────────── */}
      <section className="pres-slide pres-slide--border">
        <div className="pres-inner">
          <div className="pres-eyebrow">
            THE PROBLEM
          </div>

          <h2 className="pres-h2">
            What are we trying to solve?
          </h2>

          <div className="pres-problem-stack">
            {[
              {
                problem: 'UX value has been invisible',
                detail: 'VAGUE NUMBERS ARE HARD TO DEFEND'
              },
              {
                problem: 'Data lives in many disconnected tools',
                detail: '4-5 HOURS OF MANUAL GATHERING TIME'
              },
              {
                problem: 'No before/ after comparison',
                detail: 'NO MECHANISM TO SHOW MEASURABLE IMPACT'
              },
              {
                problem: 'Research coverage is unmeasured',
                detail: 'RESEARCH TO IMPLEMENTATION PIPELINE IS UNCLEAR'
              },
              {
                problem: 'Design system adoption is guesstimated',
                detail: 'LACK OF VISIBILITY ON TEAM ALIGNMENT & TECHNICAL DEBT'
              }
            ].map((item, i) => (
              <div key={i} className="pres-problem-row">
                <div className="pres-problem-text">
                  {item.problem}
                </div>
                <div className="pres-problem-tag">
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slide 4: How We Built It ─────────────────────────────────────── */}
      <section className="pres-slide pres-slide--border">
        <div className="pres-inner">
          <div className="pres-eyebrow">
            HOW WE BUILT IT
          </div>

          <h2 className="pres-h2">
            Information flow
          </h2>

          <div className="pres-flow">
            {/* Data Sources Column */}
            <div className="pres-flow-col pres-flow-col--src">
              <div className="pres-flow-col-label">
                Data sources
              </div>
              <div className="pres-flow-stack">
                {[
                  { icon: '◎', label: 'User input', color: 'var(--es-green)' },
                  { icon: '◷', label: 'Jira API', color: 'var(--es-blue)' },
                  { icon: '◻', label: 'Figma API', color: 'var(--es-amber)' },
                  { icon: '◬', label: 'Analytics API', color: 'var(--es-green)' },
                ].map((source, i) => (
                  <div key={i} className="pres-flow-card">
                    <div className="pres-flow-card-icon" style={{ color: source.color }}>
                      {source.icon}
                    </div>
                    <div className="pres-flow-card-label">
                      {source.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="pres-flow-arrow">
              <div className="pres-flow-arrow-glyph">→</div>
              <div className="pres-flow-arrow-label">
                Ingest
              </div>
            </div>

            {/* Processing Column */}
            <div className="pres-flow-col pres-flow-col--proc">
              <div className="pres-flow-col-label">
                Processing
              </div>
              <div className="pres-proc-card">
                <div style={{
                  fontSize: 10,
                  color: 'var(--es-text-3)',
                  marginBottom: 10,
                }}>
                  {labels.aiLayerDescription}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--es-text-1)',
                  marginBottom: 16,
                }}>
                  {labels.aiLayer}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['AGGREGATION', 'ANALYSIS', 'INSIGHTS'].map(tag => (
                    <span key={tag} style={{
                      padding: '4px 10px',
                      background: 'transparent',
                      border: '1px solid var(--es-blue)',
                      borderRadius: 'var(--es-r-sm)',
                      fontFamily: MONO,
                      fontSize: 7,
                      letterSpacing: '0.08em',
                      color: 'var(--es-blue)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="pres-flow-arrow">
              <div className="pres-flow-arrow-glyph">→</div>
              <div className="pres-flow-arrow-label">
                Output
              </div>
            </div>

            {/* Visualization Column */}
            <div className="pres-flow-col pres-flow-col--src">
              <div className="pres-flow-col-label">
                Visualization
              </div>
              <div style={{
                background: gradientBg,
                border: '2px solid var(--es-green)',
                borderRadius: 'var(--es-r)',
                padding: '24px 20px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 24,
                  marginBottom: 10,
                }}>
                  ◉
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--es-green)',
                  marginBottom: 6,
                }}>
                  Dashboard
                </div>
                <div style={{
                  fontSize: 10,
                  color: 'var(--es-text-3)',
                }}>
                  Live actionable insights
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Slide 5: Roadmap ─────────────────────────────────────────────── */}
      <section className="pres-slide pres-slide--border">
        <div className="pres-inner">
          <div className="pres-eyebrow">
            ROADMAP
          </div>

          <h2 className="pres-h2 pres-h2--tight">
            Next steps
          </h2>

          <p className="pres-lede">
            The aim is to fully automate the dashboard with live data, gap analysis and recommendations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                badge: 'NOW',
                badgeColor: 'var(--es-green)',
                title: 'Active now',
                items: [
                  'Monthly manual data updates dedicated update session each month',
                  'Share dashboard with leadership as the single source of UX truth',
                  'Real (but static) data from Confluence research repository and Figma API.'
                ]
              },
              {
                badge: 'NEXT',
                badgeColor: 'var(--es-blue)',
                title: 'Planned',
                items: [
                  'Jira API integration - live roadmap and research repository data updates.',
                  'Real time updates using Figma API for component insertion and team adoption',
                  'Showing trends as a part of the executive summary'
                ]
              },
              {
                badge: 'LATER',
                badgeColor: 'var(--es-amber)',
                title: 'Future',
                items: [
                  'Expand to additional products and teams',
                  'Product analytics instrumentation (task completion, error rate, funnel drop-off)',
                  'SUS baseline measurement wired directly into the dashboard',
                  'Automated monthly report generation and email distribution to stakeholders'
                ]
              }
            ].map((column, i) => (
              <div key={i} style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderRadius: 'var(--es-r)',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: 'var(--es-surface-2)',
                  borderBottom: '1px solid var(--es-border-str)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: column.badgeColor,
                    color: 'var(--es-bg)',
                    borderRadius: 'var(--es-r-sm)',
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    alignSelf: 'flex-start',
                  }}>
                    {column.badge}
                  </span>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: 'var(--es-text-1)',
                  }}>
                    {column.title}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {column.items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                      }}>
                        <span style={{
                          fontFamily: MONO,
                          fontSize: 12,
                          color: column.badgeColor,
                          flexShrink: 0,
                          marginTop: 2,
                        }}>
                          →
                        </span>
                        <span style={{
                          fontSize: 13,
                          color: 'var(--es-text-2)',
                          lineHeight: 1.6,
                        }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
