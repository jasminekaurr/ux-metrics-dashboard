import { useState, useEffect, useRef, useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useDashboardData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme } from '../utils/chartTheme'
import './ExecutiveSummary.css'

ChartJS.register(ArcElement, Tooltip, Legend)

const MONO = '"Gt America Mono", ui-monospace, Consolas, monospace'

function getImpactThemes(isDark) {
  return {
    'Risk Reduction': {
      color: isDark ? '#ff2d2d' : '#dc2626',
      tint: isDark ? 'rgba(255,45,45,0.06)' : 'rgba(220,38,38,0.06)',
      border: isDark ? 'rgba(255,45,45,0.25)' : 'rgba(220,38,38,0.25)',
      icon: '◎',
      desc: 'Catching issues before development begins',
    },
    'Speed/Acceleration': {
      color: isDark ? '#3898ec' : '#2563eb',
      tint: isDark ? 'rgba(56,152,236,0.06)' : 'rgba(37,99,235,0.06)',
      border: isDark ? 'rgba(56,152,236,0.25)' : 'rgba(37,99,235,0.25)',
      icon: '◈',
      desc: 'Reducing ambiguity and faster handoff to dev',
    },
    'Revenue Influence': {
      color: isDark ? '#00bf2a' : '#16a34a',
      tint: isDark ? 'rgba(0,191,42,0.06)' : 'rgba(22,163,74,0.06)',
      border: isDark ? 'rgba(0,191,42,0.25)' : 'rgba(22,163,74,0.25)',
      icon: '◷',
      desc: 'Conversion, retention, and new capability',
    },
  }
}

function getTypeColors(isDark) {
  return {
    colors: isDark
      ? ['#3898ec', '#00bf2a', '#f59e0b', '#a78bfa', '#ff2d2d', '#0891b2']
      : ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0e7490'],
    fills: isDark
      ? ['rgba(56,152,236,0.22)', 'rgba(0,191,42,0.22)', 'rgba(245,158,11,0.22)', 'rgba(167,139,250,0.22)', 'rgba(255,45,45,0.22)', 'rgba(8,145,178,0.22)']
      : ['rgba(37,99,235,0.15)', 'rgba(22,163,74,0.15)', 'rgba(217,119,6,0.15)', 'rgba(124,58,237,0.15)', 'rgba(220,38,38,0.15)', 'rgba(14,116,144,0.15)'],
    hover: isDark
      ? ['rgba(56,152,236,0.50)', 'rgba(0,191,42,0.50)', 'rgba(245,158,11,0.50)', 'rgba(167,139,250,0.50)', 'rgba(255,45,45,0.50)', 'rgba(8,145,178,0.50)']
      : ['rgba(37,99,235,0.40)', 'rgba(22,163,74,0.40)', 'rgba(217,119,6,0.40)', 'rgba(124,58,237,0.40)', 'rgba(220,38,38,0.40)', 'rgba(14,116,144,0.40)'],
  }
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

export default function ResearchDark({ selectedMonthIndex: _selectedMonthIndex }) {
  const { research, panelHealth, ubaIASpotlight } = useDashboardData()
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

  const allInitiatives = [
    {
      id: 'uba-ia',
      product: 'Jobs',
      study: 'UBA Information Architecture',
      category: 'Risk & Compliance',
      purpose: 'Validate domain model and navigation structure for member workflows',
      status: 'Complete',
      impactTag: 'Risk Reduction',
      participants: 18,
      detailedSummary: { type: 'uba', data: ubaIASpotlight },
    },
    {
      id: 'task-assignment',
      product: 'Feed',
      study: 'Task Assignment Study',
      category: 'Efficiency & Workflow',
      purpose: 'Validate task assignment interaction model and mental models for group/user selection',
      status: 'Complete',
      impactTag: 'Risk Reduction',
      participants: 10,
      detailedSummary: {
        type: 'task-assignment',
        data: {
          methodology: 'Usability testing with general population',
          keyFindings: [
            "Participants' mental models leaned towards assigning users within a group rather than selecting a group and a user separately",
            'Group and User were understood as valid options, but their relationship was unclear',
            'Search behavior often preceded filtering - users began typing directly into the dropdown before applying a filter',
            'Confirmation cues (tags) were helpful but subtle, influencing recognition speed',
            'Prototype constraints influenced clarity - single selection limitation caused confusion',
          ],
          issuesCaught: 5,
          severity: 'Medium',
        },
      },
    },
    {
      id: 'panel-health',
      product: 'Multiple',
      study: 'Client Panel Health',
      category: 'Strategic Exploration',
      purpose: 'Maintain advisory panels for same-week validation capability',
      status: 'Active',
      impactTag: 'Speed/Acceleration',
      participants: 109,
      detailedSummary: { type: 'panel', data: panelHealth },
    },
  ]

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
          <p className="es-subtitle">
            Three ways UXR creates value: reducing risk, accelerating delivery, and influencing revenue
          </p>
        </div>
      </div>

      <div className="es-content">

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div
          ref={statsRef}
          className={`bq-reveal${statsVisible ? ' visible' : ''}`}
          style={{ paddingTop: 40 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Research Overview
                <span className="es-src-tag">Cumulative</span>
              </div>
              <SplitText className="bq-section-h">Research impact at a glance</SplitText>
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
              { num: totalStudiesAnim, caption: 'Active Studies',    sub: 'This quarter',         cls: '' },
              { num: participantsAnim, caption: 'Total Participants', sub: 'Across all studies',   cls: 'green' },
              { num: issuesCaughtAnim, caption: 'Issues Caught',      sub: 'Before development',   cls: 'amber' },
              { num: activePanelsAnim, caption: 'Advisory Panels',    sub: 'Same-week validation', cls: 'blue' },
            ].map((s, i) => (
              <div
                key={i}
                className="bq-stat-item bq-stagger-item"
                style={{ borderRight: i < 3 ? '1px dashed var(--es-border-str)' : 'none' }}
              >
                <div className={`bq-stat-num ${s.cls}`}>{s.num}</div>
                <div className="bq-stat-caption">{s.caption}</div>
                <div style={{ fontSize: 11, color: 'var(--es-text-3)', marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Active Research Initiatives ───────────────────────────────────── */}
        <div
          ref={initiativesRef}
          className={`bq-reveal${initiativesVisible ? ' visible' : ''}`}
          style={{ paddingTop: 52 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Active Studies
              </div>
              <SplitText className="bq-section-h">Active research initiatives</SplitText>
            </div>
          </div>

          {/* Stacked theme cards — each contains all initiatives for that theme */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(IMPACT_THEMES).map(([tagName, theme]) => {
              const initiatives = initiativesByImpact[tagName]
              return (
                <div
                  key={tagName}
                  className="bq-stagger-item"
                  style={{
                    background: 'var(--es-surface)',
                    border: '1px solid var(--es-border-str)',
                    borderRadius: 'var(--es-r)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Theme header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 20px',
                    background: 'var(--es-surface-2)',
                    borderBottom: '1px solid var(--es-border-str)',
                  }}>
                    <span style={{ color: 'var(--es-text-2)', fontSize: 16, lineHeight: 1 }}>{theme.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--es-text-1)', lineHeight: 1.3 }}>{tagName}</div>
                      <div style={{ fontSize: 11, color: 'var(--es-text-3)', marginTop: 2 }}>{theme.desc}</div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--es-sans)', fontSize: 22, fontWeight: 300,
                      color: 'var(--es-text-1)', letterSpacing: '-0.10em', lineHeight: 1, flexShrink: 0,
                    }}>
                      {initiatives.length}
                    </div>
                  </div>

                  {/* Initiative rows */}
                  {initiatives.length === 0 ? (
                    <div style={{
                      padding: '22px 20px', textAlign: 'center',
                      fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'var(--es-text-3)',
                    }}>
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
                          style={{
                            padding: '16px 20px',
                            cursor: 'pointer',
                            transition: 'background 150ms',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--es-text-1)', marginBottom: 3, lineHeight: 1.3 }}>
                                {init.study}
                              </div>
                              <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)', marginBottom: 8, letterSpacing: '0.06em' }}>
                                {init.product} · {init.participants} participants
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.55, marginBottom: 10 }}>
                                {init.purpose}
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span className={`es-chip ${init.status === 'Active' ? 'green' : init.status === 'Complete' ? 'blue' : ''}`}>
                                  {init.status}
                                </span>
                                <span className="es-chip">{init.category}</span>
                              </div>
                            </div>
                            {/* Chevron indicator */}
                            <div style={{
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
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
                            <div style={{
                              marginTop: 16,
                              padding: '18px 18px',
                              background: 'var(--es-surface-2)',
                              borderRadius: 'var(--es-r-sm)',
                              animation: 'es-fade-in-up 0.2s ease-out both',
                            }}>
                              {/* UBA IA */}
                              {init.detailedSummary.type === 'uba' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                  {/* Study Progression — top priority */}
                                  <div>
                                    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--es-text-3)', marginBottom: 10 }}>Study Progression</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                      {init.detailedSummary.data.rounds?.map((round, i) => (
                                        <div key={i} style={{
                                          padding: 16, textAlign: 'center',
                                          background: 'var(--es-surface)',
                                          borderRadius: 'var(--es-r-sm)',
                                          border: '1px solid var(--es-border-str)',
                                          borderTop: '2px solid var(--es-blue)',
                                        }}>
                                          <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)', marginBottom: 6 }}>{round.version}</div>
                                          <div style={{ fontFamily: 'var(--es-sans)', fontSize: 32, fontWeight: 300, color: 'var(--es-blue)', letterSpacing: '-0.10em', lineHeight: 1 }}>{round.successRate}%</div>
                                          <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)', marginTop: 4 }}>n={round.n}</div>
                                          {round.improvement && (
                                            <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-green)', marginTop: 4 }}>{round.improvement}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Supporting details below */}
                                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                      <div className="bq-callout">
                                        <div className="bq-callout-icon" style={{ color: 'var(--es-blue)' }}>◎</div>
                                        <div>
                                          <div className="bq-callout-title">Business Impact</div>
                                          <div className="bq-callout-body">
                                            Reduced IA ambiguity for member workflows, lowering training and navigation risk for product surfaces.
                                          </div>
                                        </div>
                                      </div>
                                      <div className="bq-callout">
                                        <div className="bq-callout-icon">◎</div>
                                        <div>
                                          <div className="bq-callout-title">ROI</div>
                                          <div className="bq-callout-body">
                                            3 rounds of validation replaced 6+ months of post-launch IA iteration.
                                            Achieved {init.detailedSummary.data.rounds?.[2]?.successRate}% task success before engineering began.
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {init.detailedSummary.data.domains?.map((domain, i) => (
                                          <span key={i} className="es-chip blue">{domain.name}</span>
                                        ))}
                                      </div>
                                      {init.detailedSummary.data.finding && (
                                        <div style={{
                                          fontSize: 12, fontStyle: 'italic', color: 'var(--es-blue)',
                                          padding: '10px 14px',
                                          background: 'var(--es-surface)',
                                          border: '1px dashed var(--es-border-str)',
                                          borderRadius: 'var(--es-r-sm)',
                                          lineHeight: 1.6,
                                        }}>
                                          "{init.detailedSummary.data.finding}"
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Task Assignment */}
                              {init.detailedSummary.type === 'task-assignment' && (
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                  <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div className="bq-callout">
                                      <div className="bq-callout-icon" style={{ color: 'var(--es-red)' }}>◎</div>
                                      <div>
                                        <div className="bq-callout-title">Business Impact</div>
                                        <div className="bq-callout-body">
                                          Identified critical mental model mismatches in task assignment flow before development, preventing user confusion and support tickets.
                                        </div>
                                      </div>
                                    </div>
                                    <div className="bq-callout">
                                      <div className="bq-callout-icon">◎</div>
                                      <div>
                                        <div className="bq-callout-title">ROI</div>
                                        <div className="bq-callout-body">
                                          {init.detailedSummary.data.issuesCaught} medium-severity usability issues caught before development — avoiding costly post-launch iterations.
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ flex: '1 1 240px' }}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--es-text-3)', marginBottom: 10 }}>Key Findings</div>
                                    {init.detailedSummary.data.keyFindings?.map((finding, i) => (
                                      <div key={i} style={{
                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                        padding: '9px 0',
                                        borderBottom: i < init.detailedSummary.data.keyFindings.length - 1
                                          ? '1px dashed var(--es-border-str)' : 'none',
                                      }}>
                                        <span style={{ color: 'var(--es-red)', flexShrink: 0, fontSize: 9, marginTop: 3 }}>▶</span>
                                        <span style={{ fontSize: 12, color: 'var(--es-text-2)', lineHeight: 1.6 }}>{finding}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Panel Health */}
                              {init.detailedSummary.type === 'panel' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                  {/* Panel stats — top priority */}
                                  <div>
                                    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--es-text-3)', marginBottom: 10 }}>Panel Health Overview</div>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                      <div style={{
                                        flex: '1 1 200px', padding: 18,
                                        background: 'var(--es-surface)',
                                        border: '1px solid var(--es-border-str)',
                                        borderTop: '2px solid var(--es-blue)',
                                        borderRadius: 'var(--es-r-sm)',
                                      }}>
                                        <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Feed Panel</div>
                                        <div style={{ fontFamily: 'var(--es-sans)', fontSize: 32, fontWeight: 300, color: 'var(--es-blue)', letterSpacing: '-0.10em', lineHeight: 1, marginBottom: 4 }}>
                                          {init.detailedSummary.data.coreAdvance?.totalMembers}
                                        </div>
                                        <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)' }}>
                                          {init.detailedSummary.data.coreAdvance?.totalBanks} banks
                                        </div>
                                        <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(0,191,42,0.15)', borderRadius: 3, fontFamily: MONO, fontSize: 9, color: 'var(--es-green)', border: '1px solid rgba(0,191,42,0.30)' }}>
                                          {init.detailedSummary.data.coreAdvance?.engagementRate}% engagement
                                        </div>
                                      </div>
                                      <div style={{
                                        flex: '1 1 200px', padding: 18,
                                        background: 'var(--es-surface)',
                                        border: '1px solid var(--es-border-str)',
                                        borderTop: '2px solid #a78bfa',
                                        borderRadius: 'var(--es-r-sm)',
                                      }}>
                                        <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Messaging Panel</div>
                                        <div style={{ fontFamily: 'var(--es-sans)', fontSize: 32, fontWeight: 300, color: '#a78bfa', letterSpacing: '-0.10em', lineHeight: 1, marginBottom: 4 }}>
                                          {init.detailedSummary.data.dnaUX?.totalMembers}
                                        </div>
                                        <div style={{ fontFamily: MONO, fontSize: 9, color: 'var(--es-green)' }}>
                                          {init.detailedSummary.data.dnaUX?.janFIs} → {init.detailedSummary.data.dnaUX?.febFIs} FIs
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* ROI details below */}
                                  <div className="bq-callout">
                                    <div className="bq-callout-icon">◎</div>
                                    <div>
                                      <div className="bq-callout-title">ROI</div>
                                      <div className="bq-callout-body">
                                        Panels enabled same-week validation for 6 initiatives, replacing multi-month recruiting cycles.
                                      </div>
                                    </div>
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
          className={`bq-reveal${donutVisible ? ' visible' : ''}`}
          style={{ paddingTop: 52, paddingBottom: 60 }}
        >
          <div className="bq-section-top">
            <div>
              <div className="es-eyebrow" style={{ marginBottom: 8 }}>
                Research Types
                <span className="es-src-tag">Cumulative</span>
              </div>
              <SplitText className="bq-section-h">Distribution of research methods</SplitText>
            </div>
          </div>

          <div className="bq-callout" style={{ marginBottom: 28 }}>
            <div className="bq-callout-icon">◎</div>
            <div>
              <div className="bq-callout-title">Research method mix across all initiatives</div>
              <div className="bq-callout-body">
                A balanced portfolio of research methods — qualitative and evaluative — ensures we're both discovering
                and validating the right problems before engineering investment.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40 }}>
            {/* Donut — conditional mount so Chart.js entrance animation fires on scroll */}
            <div className="bq-stagger-item" style={{ width: 240, height: 240, flexShrink: 0, position: 'relative' }}>
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
            <div style={{ flex: 1, alignSelf: 'center' }}>
              {typeLabels.map((label, i) => (
                <div key={label} className="bq-feature-row bq-stagger-item">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: typeColors.colors[i], flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--es-text-2)' }}>{label}</div>
                  <div style={{
                    fontFamily: MONO, fontSize: 20, fontWeight: 300,
                    color: typeColors.colors[i], letterSpacing: '-0.05em', lineHeight: 1,
                  }}>
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
