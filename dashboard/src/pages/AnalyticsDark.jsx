import { useState, useEffect, useRef } from 'react'
import './ExecutiveSummary.css'

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

const METRICS = [
  { title: 'Task Completion Rate', desc: 'Can users actually accomplish what they came to do? The foundational usability metric.', why: 'A <70% task completion rate is a hard signal of UX failure. This is the first number executives should ask for.' },
  { title: 'Time on Task', desc: 'How long does it take to complete a critical flow? Shorter = more efficient design.', why: 'Baseline comparison before/after redesigns. Quantifies efficiency gains in seconds and dollars.' },
  { title: 'Error Rate', desc: 'How often do users make recoverable or unrecoverable mistakes in key flows?', why: 'High error rates mean higher support costs. Reducing errors = reducing ticket volume.' },
  { title: 'Funnel Drop-off', desc: 'Where are users abandoning key flows? Which step has the highest exit rate?', why: 'Identifies exactly where UX debt lives. Prioritises redesign effort by business impact.' },
  { title: 'Feature Adoption Rate', desc: 'Are shipped features actually being used? What % of eligible users engage within 30 days?', why: "Tells us if what we shipped mattered. Low adoption = the feature missed the user need." },
  { title: 'Page-level Engagement', desc: 'Which screens get traffic? Which are dead ends that nobody reaches?', why: 'Navigation design validation. High traffic to "wrong" screens signals IA problems.' },
  { title: 'NPS / CSAT', desc: 'Periodic user satisfaction signals tied to product interactions.', why: 'Executive-facing satisfaction number. Links UX investment to user sentiment over time.' },
  { title: 'SUS Score (Live Baseline)', desc: 'System Usability Scale as an ongoing benchmark — not just from discrete test sessions.', why: 'Standardised, comparable across quarters and against industry benchmarks (68 = industry average).' },
]

const UNLOCKS = [
  'Proves before/after impact of every redesign — in hard numbers, not just designer estimates',
  'Catches usability problems as they happen, not weeks later in a research study',
  'Gives executives a live view of whether shipped features are meeting user needs',
  'Connects design decisions directly to business outcomes (conversion, retention, support volume)',
]

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

export default function AnalyticsDark() {
  const [bannerRef, bannerVisible] = useReveal()
  const [metricsRef, metricsVisible] = useReveal()
  const [unlocksRef, unlocksVisible] = useReveal()

  return (
    <div className="es-page">
      <div className="es-header">
        <div className="es-header-inner">
          <div className="es-eyebrow">
            Analytics
          </div>
          <h1 className="es-title">Product Analytics<span className="es-cursor" /></h1>
          <p className="es-subtitle">
            Tracking not yet configured. This page defines what we want to measure — and why it matters.
          </p>
        </div>
      </div>

      <div className="es-content">
        {/* Status Banner */}
        <div ref={bannerRef} className={`bq-reveal${bannerVisible ? ' visible' : ''}`} style={{ paddingTop: 40 }}>
          <div className="bq-callout">
            <div className="bq-callout-icon">◎</div>
            <div>
              <div className="bq-callout-title">Analytics tracking is not yet configured</div>
              <div className="bq-callout-body">
                The metrics below represent what this team should be measuring. This page will populate
                automatically once event tracking is instrumented on critical user flows. Until then,
                usability data comes from discrete research sessions (see UX Research page).
              </div>
            </div>
          </div>
        </div>

        {/* Locked Metrics Grid */}
        <div ref={metricsRef} className={`bq-reveal${metricsVisible ? ' visible' : ''}`} style={{ paddingTop: 52 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Metrics Framework
              </div>
              <SplitText className="bq-section-h">Metrics we want to track</SplitText>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {METRICS.map((m, i) => (
              <div key={i} className="bq-stagger-item" style={{
                background: 'var(--es-surface)',
                border: '1px solid var(--es-border-str)',
                borderRadius: 'var(--es-r)',
                padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 9,
                opacity: 0.8,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: MONO, fontSize: 9, letterSpacing: '0.10em',
                  textTransform: 'uppercase', color: 'var(--es-text-3)',
                }}>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>🔒</span>
                  Awaiting instrumentation
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--es-text-1)', lineHeight: 1.45 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.65 }}>{m.desc}</div>
                <div style={{ fontSize: 11, color: 'var(--es-text-3)', fontStyle: 'italic', paddingTop: 6, borderTop: '1px solid var(--es-border)' }}>
                  <strong style={{ color: 'var(--es-text-2)', fontStyle: 'normal' }}>Why it matters:</strong> {m.why}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What This Unlocks */}
        <div ref={unlocksRef} className={`bq-reveal${unlocksVisible ? ' visible' : ''}`} style={{ paddingTop: 52, paddingBottom: 60 }}>
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Continuous Signal
              </div>
              <SplitText className="bq-section-h">What this unlocks</SplitText>
            </div>
          </div>
          <div className="bq-callout" style={{ marginBottom: 20 }}>
            <div className="bq-callout-icon">◎</div>
            <div>
              <div className="bq-callout-title">Continuous signal, not periodic snapshots</div>
              <div className="bq-callout-body">
                Right now, UX impact is measured through self-reported data and discrete research sessions.
                That's valuable — but it's periodic and manual. Product analytics would give us a continuous,
                objective signal that:
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {UNLOCKS.map((item, i) => (
              <div key={i} className="bq-stagger-item bq-feature-row">
                <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--es-text-3)', flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 13, color: 'var(--es-text-2)', lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
