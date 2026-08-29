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
      { id: 'CORE-2201', name: 'Task Admin bulk actions — users expect select-all functionality' },
      { id: 'DNA-945', name: 'Search refinement needed — 78% of users couldn\'t find accounts' },
      { id: 'UBA-345', name: 'Transaction history lacks filtering — panel feedback unanimous' },
      { id: 'DS-418', name: 'Form validation timing confusing — usability test identified issue' },
      { id: 'PORT-167', name: 'Queue status indicators unclear — research surfaced confusion' },
      { id: 'AI-58', name: 'Prompt feedback mechanism missing — users need transparency' },
      { id: 'DA-128', name: 'Empty state guidance insufficient — testing revealed dead ends' },
      { id: 'CORE-2310', name: 'Mobile nav discoverability low — 6/10 participants struggled' },
      { id: 'DNA-1002', name: 'Data table sorting expectations misaligned with behavior' },
      { id: 'UBA-402', name: 'Quick actions menu placement — 85% looked in wrong location' },
    ]
  },
  'Design Rework': {
    color: '#f59e0b',
    description: 'Revisions to previously completed or approved design',
    tickets: [
      { id: 'CORE-2245', name: 'Task Admin card layout redesign after stakeholder review' },
      { id: 'DNA-901', name: 'Dashboard widget arrangement revised for consistency' },
      { id: 'UBA-362', name: 'Quick actions menu — design reversed after handoff' },
      { id: 'DS-505', name: 'Button hierarchy rework across pattern library' },
      { id: 'PORT-182', name: 'Notification center layout revised for clarity' },
      { id: 'AI-72', name: 'Recommendation cards redesigned for scan-ability' },
      { id: 'DA-141', name: 'Error state improvements after design critique' },
    ]
  },
  'BA Change Request': {
    color: '#7c3aed',
    description: 'Updates requested by a BA after initial definition',
    tickets: [
      { id: 'CORE-2208', name: 'Additional field required for compliance reporting' },
      { id: 'DNA-923', name: 'BA requested account type filter in search results' },
      { id: 'UBA-378', name: 'Transaction approval levels need third tier' },
      { id: 'PORT-145', name: 'Queue assignment rules expanded per BA request' },
      { id: 'DA-115', name: 'Widget API parameters changed after scoping session' },
      { id: 'AI-44', name: 'Onboarding steps added per BA requirements doc' },
    ]
  },
  'Post-Handoff Change': {
    color: '#dc2626',
    description: 'Changes identified after design handoff to engineering',
    tickets: [
      { id: 'CORE-2289', name: 'API constraint discovered — bulk action limit to 50 items' },
      { id: 'DNA-956', name: 'Backend limitation found — search can\'t filter by date range' },
      { id: 'UBA-390', name: 'Transaction history endpoint missing status field' },
      { id: 'DS-521', name: 'Component detachment required for theme override' },
      { id: 'PORT-194', name: 'Real-time updates blocked by server limitations' },
      { id: 'AI-81', name: 'Model response format differs from design assumptions' },
      { id: 'DA-152', name: 'Data latency issue requires loading state redesign' },
      { id: 'CORE-2334', name: 'Mobile viewport breakpoint conflicts with framework' },
    ]
  },
  'Iteration Feedback': {
    color: '#34a853',
    description: 'Changes resulting from internal or stakeholder feedback',
    tickets: [
      { id: 'CORE-2256', name: 'VP requested priority indicator on task cards' },
      { id: 'DNA-978', name: 'PM feedback — add export functionality to reports' },
      { id: 'UBA-410', name: 'Design review identified missing confirmation dialog' },
      { id: 'DS-542', name: 'Accessibility review surfaced contrast improvements' },
      { id: 'PORT-203', name: 'Demo feedback — users want keyboard shortcuts visible' },
      { id: 'AI-96', name: 'Stakeholder requested confidence indicator on predictions' },
    ]
  },
  'Usability Issue': {
    color: '#0891b2',
    description: 'Fixes addressing usability or accessibility concerns',
    tickets: [
      { id: 'CORE-2267', name: 'Focus indicator missing on form inputs — WCAG fail' },
      { id: 'DNA-989', name: 'Tab order incorrect in modal dialogs' },
      { id: 'UBA-425', name: 'Button text contrast below 4.5:1 ratio' },
      { id: 'DS-558', name: 'Tooltip positioning broken in narrow viewports' },
      { id: 'PORT-218', name: 'Screen reader announces wrong label for status icons' },
      { id: 'AI-107', name: 'Error messages lack clear recovery action' },
      { id: 'DA-163', name: 'Dropdown menu items not clickable on touch devices' },
      { id: 'CORE-2345', name: 'Loading spinner blocks interaction unnecessarily' },
    ]
  },
  'Scope Change': {
    color: '#d97706',
    description: 'Changes that expand or materially alter original scope',
    tickets: [
      { id: 'CORE-2278', name: 'Bulk actions expanded to include batch approval flow' },
      { id: 'DNA-995', name: 'Search scope expanded to include archived accounts' },
      { id: 'UBA-438', name: 'Transaction history now includes pending transactions' },
      { id: 'AI-118', name: 'Recommendation engine scope expanded to 3 new use cases' },
      { id: 'DA-174', name: 'Dashboard widgets now support custom date ranges' },
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
