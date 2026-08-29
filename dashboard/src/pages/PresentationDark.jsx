import { useTheme } from '../context/ThemeContext'
import './ExecutiveSummary.css'
import { labels } from '../config/orgLabels'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

export default function PresentationDark() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gradientBg = isDark
    ? 'linear-gradient(135deg, rgba(0,191,42,0.15) 0%, rgba(56,152,236,0.15) 100%)'
    : 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(37,99,235,0.12) 100%)'

  return (
    <div className="es-page" style={{ padding: 0 }}>

      {/* ── Slide 1: Title ───────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 60px',
        background: 'var(--es-bg)',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', textAlign: 'center' }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--es-green)',
            marginBottom: 32,
          }}>
            UX METRICS DASHBOARD
          </div>

          <h1 style={{
            fontSize: 72,
            fontWeight: 300,
            color: 'var(--es-text-1)',
            lineHeight: 1.1,
            marginBottom: 48,
            letterSpacing: '-0.02em',
          }}>
            Measuring what matters
          </h1>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
            {['DESIGN SYSTEM', 'UX RESEARCH', 'PRODUCT ANALYSIS', 'DELIVERY AND ROADMAP', 'STRATEGIC CONTRIBUTION'].map(tag => (
              <span key={tag} style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--es-blue)',
                borderRadius: 'var(--es-r-sm)',
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: '0.08em',
                color: 'var(--es-blue)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--es-green)',
          }}>
            UX METRICS DASHBOARD · OPEN SOURCE DEMO
          </div>
        </div>
      </section>

      {/* ── Slide 2: What is it? ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 60px',
        background: 'var(--es-bg)',
        borderTop: '1px solid var(--es-border-str)',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--es-green)',
            marginBottom: 16,
          }}>
            WHAT IS IT?
          </div>

          <h2 style={{
            fontSize: 48,
            fontWeight: 300,
            color: 'var(--es-text-1)',
            lineHeight: 1.2,
            marginBottom: 16,
            letterSpacing: '-0.01em',
          }}>
            A live UX impact dashboard
          </h2>

          <p style={{
            fontSize: 16,
            color: 'var(--es-text-3)',
            marginBottom: 48,
            lineHeight: 1.6,
          }}>
            UX Metrics Dashboard providing leadership a clear, monthly view of design impact and performance
          </p>

          {/* Feature Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
            {[
              { icon: '◻', label: 'Design system health' },
              { icon: '◎', label: 'Research impact' },
              { icon: '◬', label: 'Product analysis' },
              { icon: '◷', label: 'Delivery and roadmap' },
              { icon: '◈', label: 'Strategic contribution' },
              { icon: '◉', label: 'Executive summary' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderRadius: 'var(--es-r)',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  fontFamily: MONO,
                  fontSize: 24,
                  color: 'var(--es-green)',
                  lineHeight: 1,
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: 15,
                  color: 'var(--es-text-1)',
                  fontWeight: 400,
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Who is it for? */}
          <div style={{
            background: 'var(--es-surface)',
            border: '1px solid var(--es-border-str)',
            borderRadius: 'var(--es-r)',
            padding: '28px 32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                fontFamily: MONO,
                fontSize: 18,
                color: 'var(--es-green)',
                lineHeight: 1,
              }}>
                ◎
              </div>
              <div style={{
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--es-text-1)',
              }}>
                Who is it for?
              </div>
            </div>
            <p style={{
              fontSize: 14,
              color: 'var(--es-text-2)',
              marginBottom: 16,
              lineHeight: 1.6,
            }}>
              Built by the UX team, for everyone who needs to understand and act on UX contribution.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['UX LEADERS', 'PRODUCT MANAGERS', 'ENGINEERING LEADS', 'EXECUTIVES', 'DESIGN TEAM'].map(tag => (
                <span key={tag} style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid var(--es-blue)',
                  borderRadius: 'var(--es-r-sm)',
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  color: 'var(--es-blue)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Slide 3: The Problem ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 60px',
        background: 'var(--es-bg)',
        borderTop: '1px solid var(--es-border-str)',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--es-green)',
            marginBottom: 16,
          }}>
            THE PROBLEM
          </div>

          <h2 style={{
            fontSize: 48,
            fontWeight: 300,
            color: 'var(--es-text-1)',
            lineHeight: 1.2,
            marginBottom: 48,
            letterSpacing: '-0.01em',
          }}>
            What are we trying to solve?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <div key={i} style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderRadius: 'var(--es-r)',
                padding: '24px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 24,
              }}>
                <div style={{
                  fontSize: 16,
                  color: 'var(--es-text-1)',
                  fontWeight: 400,
                  flex: 1,
                }}>
                  {item.problem}
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid var(--es-blue)',
                  borderRadius: 'var(--es-r-sm)',
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  color: 'var(--es-blue)',
                  whiteSpace: 'nowrap',
                }}>
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slide 4: How We Built It ─────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 60px',
        background: 'var(--es-bg)',
        borderTop: '1px solid var(--es-border-str)',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--es-green)',
            marginBottom: 16,
          }}>
            HOW WE BUILT IT
          </div>

          <h2 style={{
            fontSize: 48,
            fontWeight: 300,
            color: 'var(--es-text-1)',
            lineHeight: 1.2,
            marginBottom: 48,
            letterSpacing: '-0.01em',
          }}>
            Information flow
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', maxWidth: '100%', overflow: 'hidden' }}>
            {/* Data Sources Column */}
            <div style={{ flex: '0 0 220px', minWidth: 0 }}>
              <div style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'var(--es-green)',
                marginBottom: 16,
              }}>
                Data sources
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '◎', label: 'User input', color: 'var(--es-green)' },
                  { icon: '◷', label: 'Jira API', color: 'var(--es-blue)' },
                  { icon: '◻', label: 'Figma API', color: 'var(--es-amber)' },
                  { icon: '◬', label: 'Analytics API', color: 'var(--es-green)' },
                ].map((source, i) => (
                  <div key={i} style={{
                    background: 'var(--es-surface)',
                    border: '1px solid var(--es-border-str)',
                    borderRadius: 'var(--es-r)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <div style={{
                      fontFamily: MONO,
                      fontSize: 16,
                      color: source.color,
                      lineHeight: 1,
                    }}>
                      {source.icon}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'var(--es-text-1)',
                    }}>
                      {source.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 28, color: 'var(--es-text-3)' }}>→</div>
              <div style={{
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: '0.08em',
                color: 'var(--es-text-3)',
              }}>
                Ingest
              </div>
            </div>

            {/* Processing Column */}
            <div style={{ flex: '0 0 240px', minWidth: 0 }}>
              <div style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'var(--es-green)',
                marginBottom: 16,
              }}>
                Processing
              </div>
              <div style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderRadius: 'var(--es-r)',
                padding: '24px 20px',
                textAlign: 'center',
              }}>
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
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 28, color: 'var(--es-text-3)' }}>→</div>
              <div style={{
                fontFamily: MONO,
                fontSize: 8,
                letterSpacing: '0.08em',
                color: 'var(--es-text-3)',
              }}>
                Output
              </div>
            </div>

            {/* Visualization Column */}
            <div style={{ flex: '0 0 220px', minWidth: 0 }}>
              <div style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'var(--es-green)',
                marginBottom: 16,
              }}>
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
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 60px',
        background: 'var(--es-bg)',
        borderTop: '1px solid var(--es-border-str)',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--es-green)',
            marginBottom: 16,
          }}>
            ROADMAP
          </div>

          <h2 style={{
            fontSize: 48,
            fontWeight: 300,
            color: 'var(--es-text-1)',
            lineHeight: 1.2,
            marginBottom: 16,
            letterSpacing: '-0.01em',
          }}>
            Next steps
          </h2>

          <p style={{
            fontSize: 16,
            color: 'var(--es-text-3)',
            marginBottom: 48,
            lineHeight: 1.6,
          }}>
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
