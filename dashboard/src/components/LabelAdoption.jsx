import { useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import jiraLabelAdoption from '../data/jiraLabelAdoption.json'
import { getJiraBrowseUrl } from '../utils/jira'
import './LabelAdoption.css'

ChartJS.register(ArcElement, Tooltip, Legend)

// Updated label data with new taxonomy
const LABEL_DATA = {
  'UXR Identified': {
    color: '#0071e3',
    description: 'Changes originating from user research findings',
    tickets: [
      { id: 'FEED-2201', name: 'Creator Studio multi-select actions — users expect select-all functionality' },
      { id: 'REEL-945', name: 'Search refinement needed — 78% of users couldn\'t find creators' },
      { id: 'REEL-345', name: 'Reels analytics lacks filtering — panel feedback unanimous' },
      { id: 'DS-418', name: 'Carousel swipe timing confusing — usability test identified issue' },
      { id: 'EXPL-167', name: 'Inbox status indicators unclear — research surfaced confusion' },
      { id: 'CRE-58', name: 'Spark AI feedback mechanism missing — users need transparency' },
      { id: 'STOR-128', name: 'Empty state guidance insufficient — testing revealed dead ends' },
      { id: 'FEED-2310', name: 'Mobile nav discoverability low — 6/10 participants struggled' },
      { id: 'REEL-1002', name: 'Comment thread sorting expectations misaligned with behavior' },
      { id: 'REEL-402', name: 'Share actions menu placement — 85% looked in wrong location' },
    ]
  },
  'Design Rework': {
    color: '#f59e0b',
    description: 'Revisions to previously completed or approved design',
    tickets: [
      { id: 'FEED-2245', name: 'Creator Studio card layout redesign after stakeholder review' },
      { id: 'REEL-901', name: 'Feed module arrangement revised for consistency' },
      { id: 'REEL-362', name: 'Share actions menu — design reversed after handoff' },
      { id: 'DS-505', name: 'Button hierarchy rework across pattern library' },
      { id: 'EXPL-182', name: 'Activity center layout revised for clarity' },
      { id: 'CRE-72', name: 'Suggested post cards redesigned for scan-ability' },
      { id: 'STOR-141', name: 'Error state improvements after design critique' },
    ]
  },
  'PM Change Request': {
    color: '#7c3aed',
    description: 'Updates requested by a PM after initial definition',
    tickets: [
      { id: 'FEED-2208', name: 'Additional field required for creator verification' },
      { id: 'REEL-923', name: 'PM requested profile type filter in search results' },
      { id: 'REEL-378', name: 'Engagement approval levels need third tier' },
      { id: 'EXPL-145', name: 'Inbox assignment rules expanded per PM request' },
      { id: 'STOR-115', name: 'Stories API parameters changed after scoping session' },
      { id: 'CRE-44', name: 'Sign-up steps added per PM requirements doc' },
    ]
  },
  'Post-Handoff Change': {
    color: '#dc2626',
    description: 'Changes identified after design handoff to engineering',
    tickets: [
      { id: 'FEED-2289', name: 'API constraint discovered — bulk action limit to 50 items' },
      { id: 'REEL-956', name: 'Backend limitation found — search can\'t filter by date range' },
      { id: 'REEL-390', name: 'Reels analytics endpoint missing status field' },
      { id: 'DS-521', name: 'Component detachment required for theme override' },
      { id: 'EXPL-194', name: 'Real-time updates blocked by server limitations' },
      { id: 'CRE-81', name: 'AI response format differs from design assumptions' },
      { id: 'STOR-152', name: 'Data latency issue requires loading state redesign' },
      { id: 'FEED-2334', name: 'Mobile viewport breakpoint conflicts with framework' },
    ]
  },
  'Iteration Feedback': {
    color: '#34a853',
    description: 'Changes resulting from internal or stakeholder feedback',
    tickets: [
      { id: 'FEED-2256', name: 'Product lead requested priority indicator on task cards' },
      { id: 'REEL-978', name: 'PM feedback — add share sheet to insights' },
      { id: 'REEL-410', name: 'Design review identified missing confirmation dialog' },
      { id: 'DS-542', name: 'Accessibility review surfaced contrast improvements' },
      { id: 'EXPL-203', name: 'Demo feedback — users want keyboard shortcuts visible' },
      { id: 'CRE-96', name: 'Stakeholder requested confidence indicator on captions' },
    ]
  },
  'Usability Issue': {
    color: '#0891b2',
    description: 'Fixes addressing usability or accessibility concerns',
    tickets: [
      { id: 'FEED-2267', name: 'Focus indicator missing on story controls — WCAG fail' },
      { id: 'REEL-989', name: 'Tab order incorrect in modal dialogs' },
      { id: 'REEL-425', name: 'Button text contrast below 4.5:1 ratio' },
      { id: 'DS-558', name: 'Story sticker tray broken in narrow viewports' },
      { id: 'EXPL-218', name: 'Screen reader announces wrong label for status icons' },
      { id: 'CRE-107', name: 'Error messages lack clear recovery action' },
      { id: 'STOR-163', name: 'Dropdown menu items not clickable on touch devices' },
      { id: 'FEED-2345', name: 'Upload progress blocks interaction unnecessarily' },
    ]
  },
  'Scope Change': {
    color: '#d97706',
    description: 'Changes that expand or materially alter original scope',
    tickets: [
      { id: 'FEED-2278', name: 'Bulk actions expanded to include collab publish flow' },
      { id: 'REEL-995', name: 'Search scope expanded to include archived creators' },
      { id: 'REEL-438', name: 'Reels analytics now includes pending engagements' },
      { id: 'CRE-118', name: 'Recommendation engine scope expanded to 3 new use cases' },
      { id: 'STOR-174', name: 'Feed modules now support custom date ranges' },
    ]
  }
}

const JIRA_ISSUES = jiraLabelAdoption.issues?.length ? jiraLabelAdoption.issues : null

const LABELS = Object.keys(LABEL_DATA)
const ACTIVE_LABEL_DATA = JIRA_ISSUES
  ? LABELS.reduce((data, label) => {
      data[label] = {
        ...LABEL_DATA[label],
        tickets: JIRA_ISSUES
          .filter(issue => issue.labels.includes(label))
          .map(issue => ({ id: issue.id, name: issue.name })),
      }
      return data
    }, {})
  : LABEL_DATA

export default function LabelAdoption() {
  const [selectedLabel, setSelectedLabel] = useState(null)

  const labels = Object.keys(ACTIVE_LABEL_DATA)
  const counts = labels.map(label => ACTIVE_LABEL_DATA[label].tickets.length)
  const colors = labels.map(label => ACTIVE_LABEL_DATA[label].color)

  // Calculate total for percentage display
  const total = counts.reduce((sum, count) => sum + count, 0)

  const chartData = {
    labels,
    datasets: [{
      data: counts,
      backgroundColor: colors,
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderWidth: 3,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return context[0].label
          },
          label: function(context) {
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.parsed} tickets (${percentage}%)`
          },
          afterLabel: function(context) {
            const label = labels[context.dataIndex]
            return `\n${LABEL_DATA[label].description}\n\nClick to view details`
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index
        setSelectedLabel(labels[index])
      }
    },
  }

  return (
    <div className="label-adoption-container">
      <div className="chart-wrapper">
        <div className="chart-header">
          <div className="chart-title">UX Label Adoption</div>
          <div className="chart-subtitle">Feature classification across the UX contribution lifecycle — {total} total tickets labeled</div>
        </div>

        <div className="layout-row">
          <div className="pie-section">
            <div className="pie-chart-container">
              <Pie data={chartData} options={chartOptions} />
            </div>

            <div className="legend-container">
              {labels.map((label) => {
                const percentage = ((ACTIVE_LABEL_DATA[label].tickets.length / total) * 100).toFixed(1)
                return (
                  <div
                    key={label}
                    className={`legend-item ${selectedLabel === label ? 'active' : ''}`}
                    onClick={() => setSelectedLabel(label)}
                  >
                    <div
                      className="legend-color"
                      style={{ backgroundColor: LABEL_DATA[label].color }}
                    />
                    <div className="legend-text">
                      <div className="legend-label">{label}</div>
                      <div className="legend-count">{ACTIVE_LABEL_DATA[label].tickets.length} ({percentage}%)</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="divider" />

          {/* Tickets Panel */}
          <div className="tickets-section">
            {selectedLabel ? (
              <div className="panel-content">
                <div className="panel-header">
                  <div className="panel-title-group">
                    <div
                      className="panel-color-indicator"
                      style={{ backgroundColor: ACTIVE_LABEL_DATA[selectedLabel].color }}
                    />
                    <div>
                      <div className="panel-title">{selectedLabel}</div>
                      <div className="panel-count">{ACTIVE_LABEL_DATA[selectedLabel].tickets.length} tickets</div>
                      <div style={{ fontSize: 11, color: '#6e6e73', marginTop: 4, fontStyle: 'italic' }}>
                        {ACTIVE_LABEL_DATA[selectedLabel].description}
                      </div>
                    </div>
                  </div>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedLabel(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="panel-tickets">
                  {ACTIVE_LABEL_DATA[selectedLabel].tickets.map((ticket) => (
                    <a
                      key={ticket.id}
                      href={getJiraBrowseUrl(ticket.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ticket-link"
                    >
                      <div className="ticket-id">{ticket.id}</div>
                      <div className="ticket-name">{ticket.name}</div>
                      <div className="ticket-arrow">→</div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">Select a category to view tickets</div>
                <div style={{ fontSize: 12, color: '#6e6e73', marginTop: 8, maxWidth: 280, textAlign: 'center' }}>
                  Click on a category in the chart or legend to see detailed ticket breakdowns
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
