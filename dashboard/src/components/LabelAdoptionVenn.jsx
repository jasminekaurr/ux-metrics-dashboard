import { useState } from 'react'
import jiraLabelAdoption from '../data/jiraLabelAdoption.json'
import { getJiraBrowseUrl } from '../utils/jira'
import './LabelAdoption.css'

// Restructured data to show tickets with multiple labels (overlaps)
const ALL_TICKETS = [
  // UXR Identified only
  { id: 'FEED-2201', name: 'Creator Studio multi-select actions — users expect select-all functionality', labels: ['UXR Identified'] },
  { id: 'REEL-945', name: 'Search refinement needed — 78% of users couldn\'t find creators', labels: ['UXR Identified'] },
  { id: 'EXPL-167', name: 'Inbox status indicators unclear — research surfaced confusion', labels: ['UXR Identified'] },

  // Design Rework only
  { id: 'REEL-901', name: 'Feed module arrangement revised for consistency', labels: ['Design Rework'] },
  { id: 'DS-505', name: 'Button hierarchy rework across pattern library', labels: ['Design Rework'] },

  // Post-Handoff Change only
  { id: 'REEL-956', name: 'Backend limitation found — search can\'t filter by date range', labels: ['Post-Handoff Change'] },
  { id: 'EXPL-194', name: 'Real-time updates blocked by server limitations', labels: ['Post-Handoff Change'] },

  // Usability Issue only
  { id: 'REEL-989', name: 'Tab order incorrect in modal dialogs', labels: ['Usability Issue'] },
  { id: 'REEL-425', name: 'Button text contrast below 4.5:1 ratio', labels: ['Usability Issue'] },

  // UXR + Design Rework (research led to design revision)
  { id: 'REEL-345', name: 'Reels analytics redesign based on panel feedback', labels: ['UXR Identified', 'Design Rework'] },
  { id: 'DS-418', name: 'Carousel swipe timing revised after usability testing', labels: ['UXR Identified', 'Design Rework'] },
  { id: 'CRE-58', name: 'Spark AI feedback mechanism redesigned per user research', labels: ['UXR Identified', 'Design Rework'] },

  // UXR + Usability Issue (research found usability problem)
  { id: 'FEED-2310', name: 'Mobile nav discoverability improved — accessibility + research', labels: ['UXR Identified', 'Usability Issue'] },
  { id: 'STOR-128', name: 'Empty state guidance insufficient — testing + WCAG issue', labels: ['UXR Identified', 'Usability Issue'] },
  { id: 'REEL-402', name: 'Share actions menu placement — research + accessibility fix', labels: ['UXR Identified', 'Usability Issue'] },

  // Design Rework + Post-Handoff Change (design changed after handoff)
  { id: 'FEED-2245', name: 'Creator Studio card layout redesigned due to API constraints', labels: ['Design Rework', 'Post-Handoff Change'] },
  { id: 'REEL-362', name: 'Share actions menu reversed after backend limitations found', labels: ['Design Rework', 'Post-Handoff Change'] },
  { id: 'CRE-72', name: 'Suggested post cards reworked after data format issues', labels: ['Design Rework', 'Post-Handoff Change'] },

  // Design Rework + Usability Issue (rework addressed usability)
  { id: 'EXPL-182', name: 'Activity center layout revised for clarity and contrast', labels: ['Design Rework', 'Usability Issue'] },
  { id: 'STOR-141', name: 'Error state improvements after accessibility critique', labels: ['Design Rework', 'Usability Issue'] },

  // Post-Handoff + Usability Issue (handoff revealed usability issue)
  { id: 'FEED-2289', name: 'Bulk action limit required loading state for accessibility', labels: ['Post-Handoff Change', 'Usability Issue'] },
  { id: 'DS-521', name: 'Component detachment exposed focus indicator issue', labels: ['Post-Handoff Change', 'Usability Issue'] },

  // UXR + Design Rework + Usability Issue (all three)
  { id: 'REEL-1002', name: 'Comment thread sorting — research + redesign + WCAG compliance', labels: ['UXR Identified', 'Design Rework', 'Usability Issue'] },
  { id: 'FEED-2267', name: 'Form inputs redesigned based on research and accessibility audit', labels: ['UXR Identified', 'Design Rework', 'Usability Issue'] },

  // PM Change Request (separate)
  { id: 'FEED-2208', name: 'Additional field required for creator verification', labels: ['PM Change Request'] },
  { id: 'REEL-923', name: 'PM requested profile type filter in search results', labels: ['PM Change Request'] },
  { id: 'REEL-378', name: 'Engagement approval levels need third tier', labels: ['PM Change Request'] },

  // Iteration Feedback (separate)
  { id: 'FEED-2256', name: 'Product lead requested priority indicator on task cards', labels: ['Iteration Feedback'] },
  { id: 'REEL-978', name: 'PM feedback — add share sheet to insights', labels: ['Iteration Feedback'] },
  { id: 'REEL-410', name: 'Design review identified missing confirmation dialog', labels: ['Iteration Feedback'] },

  // Scope Change (separate)
  { id: 'FEED-2278', name: 'Bulk actions expanded to include collab publish flow', labels: ['Scope Change'] },
  { id: 'REEL-995', name: 'Search scope expanded to include archived creators', labels: ['Scope Change'] },
  { id: 'REEL-438', name: 'Reels analytics now includes pending engagements', labels: ['Scope Change'] },
]

const LABEL_INFO = {
  'UXR Identified': { color: '#0071e3', description: 'Changes originating from user research findings' },
  'Design Rework': { color: '#f59e0b', description: 'Revisions to previously completed or approved design' },
  'Post-Handoff Change': { color: '#dc2626', description: 'Changes identified after design handoff to engineering' },
  'Usability Issue': { color: '#0891b2', description: 'Fixes addressing usability or accessibility concerns' },
  'PM Change Request': { color: '#7c3aed', description: 'Updates requested by a PM after initial definition' },
  'Iteration Feedback': { color: '#34a853', description: 'Changes resulting from internal or stakeholder feedback' },
  'Scope Change': { color: '#d97706', description: 'Changes that expand or materially alter original scope' },
}

const JIRA_TICKETS = jiraLabelAdoption.issues?.length ? jiraLabelAdoption.issues : null
const ACTIVE_TICKETS = JIRA_TICKETS || ALL_TICKETS

export default function LabelAdoptionVenn() {
  const [selectedLabels, setSelectedLabels] = useState(null)
  const [hoveredRegion, setHoveredRegion] = useState(null)

  const total = ACTIVE_TICKETS.length

  // Helper to get tickets by label combination
  const getTicketsByLabels = (labels) => {
    return ACTIVE_TICKETS.filter(ticket => {
      const ticketLabels = ticket.labels.sort().join(',')
      const searchLabels = labels.sort().join(',')
      return ticketLabels === searchLabels
    })
  }

  // Calculate counts for each region
  const counts = {
    uxr_only: getTicketsByLabels(['UXR Identified']).length,
    design_only: getTicketsByLabels(['Design Rework']).length,
    handoff_only: getTicketsByLabels(['Post-Handoff Change']).length,
    usability_only: getTicketsByLabels(['Usability Issue']).length,
    uxr_design: getTicketsByLabels(['UXR Identified', 'Design Rework']).length,
    uxr_usability: getTicketsByLabels(['UXR Identified', 'Usability Issue']).length,
    design_handoff: getTicketsByLabels(['Design Rework', 'Post-Handoff Change']).length,
    design_usability: getTicketsByLabels(['Design Rework', 'Usability Issue']).length,
    handoff_usability: getTicketsByLabels(['Post-Handoff Change', 'Usability Issue']).length,
    uxr_design_usability: getTicketsByLabels(['UXR Identified', 'Design Rework', 'Usability Issue']).length,
    ba: getTicketsByLabels(['PM Change Request']).length,
    feedback: getTicketsByLabels(['Iteration Feedback']).length,
    scope: getTicketsByLabels(['Scope Change']).length,
  }

  const handleRegionClick = (labels) => {
    const labelKey = Array.isArray(labels) ? labels.sort().join(',') : labels
    setSelectedLabels(selectedLabels === labelKey ? null : labelKey)
  }

  const getSelectedTickets = () => {
    if (!selectedLabels) return []
    const labels = selectedLabels.split(',')
    return getTicketsByLabels(labels)
  }

  const getSelectedLabelNames = () => {
    if (!selectedLabels) return ''
    return selectedLabels
  }

  return (
    <div className="label-adoption-container">
      <div className="chart-wrapper">
        <div className="chart-header">
          <div className="chart-title">UX Label Adoption — Overlapping Categories</div>
          <div className="chart-subtitle">
            Interactive Venn diagram showing {total} labeled tickets with overlaps between categories — click regions to view details
          </div>
        </div>

        <div className="layout-row">
          {/* Venn Diagram Section */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              position: 'relative',
              background: '#fafafa',
              borderRadius: 12,
              padding: 24,
              border: '2px solid #e5e7eb'
            }}>
              {/* Outer box label */}
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontSize: 11,
                fontWeight: 600,
                color: '#6e6e73',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                All UX Stories ({total} total)
              </div>

              {/* SVG Venn Diagram - 4 overlapping circles + 3 separate */}
              <svg
                width="100%"
                height="600"
                viewBox="0 0 800 600"
                style={{ display: 'block' }}
              >
                <defs>
                  {/* Define clip paths for intersection regions */}
                  <clipPath id="clip-uxr">
                    <circle cx="300" cy="200" r="120" />
                  </clipPath>
                  <clipPath id="clip-design">
                    <circle cx="500" cy="200" r="120" />
                  </clipPath>
                  <clipPath id="clip-handoff">
                    <circle cx="300" cy="360" r="120" />
                  </clipPath>
                  <clipPath id="clip-usability">
                    <circle cx="500" cy="360" r="120" />
                  </clipPath>
                </defs>

                {/* Main 4 overlapping circles */}
                <circle cx="300" cy="200" r="120" fill={LABEL_INFO['UXR Identified'].color} fillOpacity="0.25" stroke={LABEL_INFO['UXR Identified'].color} strokeWidth="2" />
                <circle cx="500" cy="200" r="120" fill={LABEL_INFO['Design Rework'].color} fillOpacity="0.25" stroke={LABEL_INFO['Design Rework'].color} strokeWidth="2" />
                <circle cx="300" cy="360" r="120" fill={LABEL_INFO['Post-Handoff Change'].color} fillOpacity="0.25" stroke={LABEL_INFO['Post-Handoff Change'].color} strokeWidth="2" />
                <circle cx="500" cy="360" r="120" fill={LABEL_INFO['Usability Issue'].color} fillOpacity="0.25" stroke={LABEL_INFO['Usability Issue'].color} strokeWidth="2" />

                {/* Interactive regions for each section */}

                {/* UXR only (top-left, outside overlaps) */}
                <circle
                  cx="240" cy="150" r="30"
                  fill={LABEL_INFO['UXR Identified'].color}
                  fillOpacity={selectedLabels === 'UXR Identified' ? 0.8 : hoveredRegion === 'uxr_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['UXR Identified'])}
                  onMouseEnter={() => setHoveredRegion('uxr_only')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="240" y="155" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.uxr_only}
                </text>

                {/* Design only (top-right, outside overlaps) */}
                <circle
                  cx="560" cy="150" r="30"
                  fill={LABEL_INFO['Design Rework'].color}
                  fillOpacity={selectedLabels === 'Design Rework' ? 0.8 : hoveredRegion === 'design_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Design Rework'])}
                  onMouseEnter={() => setHoveredRegion('design_only')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="560" y="155" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.design_only}
                </text>

                {/* Handoff only (bottom-left, outside overlaps) */}
                <circle
                  cx="240" cy="410" r="30"
                  fill={LABEL_INFO['Post-Handoff Change'].color}
                  fillOpacity={selectedLabels === 'Post-Handoff Change' ? 0.8 : hoveredRegion === 'handoff_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Post-Handoff Change'])}
                  onMouseEnter={() => setHoveredRegion('handoff_only')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="240" y="415" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.handoff_only}
                </text>

                {/* Usability only (bottom-right, outside overlaps) */}
                <circle
                  cx="560" cy="410" r="30"
                  fill={LABEL_INFO['Usability Issue'].color}
                  fillOpacity={selectedLabels === 'Usability Issue' ? 0.8 : hoveredRegion === 'usability_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Usability Issue'])}
                  onMouseEnter={() => setHoveredRegion('usability_only')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="560" y="415" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.usability_only}
                </text>

                {/* UXR + Design (top center overlap) */}
                <circle
                  cx="400" cy="200" r="25"
                  fill="#8b5cf6"
                  fillOpacity={selectedLabels === 'Design Rework,UXR Identified' ? 0.9 : hoveredRegion === 'uxr_design' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['UXR Identified', 'Design Rework'])}
                  onMouseEnter={() => setHoveredRegion('uxr_design')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="400" y="206" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.uxr_design}
                </text>

                {/* UXR + Usability (left center overlap) */}
                <circle
                  cx="340" cy="280" r="25"
                  fill="#0891b2"
                  fillOpacity={selectedLabels === 'UXR Identified,Usability Issue' ? 0.9 : hoveredRegion === 'uxr_usability' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['UXR Identified', 'Usability Issue'])}
                  onMouseEnter={() => setHoveredRegion('uxr_usability')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="340" y="286" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.uxr_usability}
                </text>

                {/* Design + Handoff (right side overlap) */}
                <circle
                  cx="460" cy="280" r="25"
                  fill="#f97316"
                  fillOpacity={selectedLabels === 'Design Rework,Post-Handoff Change' ? 0.9 : hoveredRegion === 'design_handoff' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Design Rework', 'Post-Handoff Change'])}
                  onMouseEnter={() => setHoveredRegion('design_handoff')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="460" y="286" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.design_handoff}
                </text>

                {/* Design + Usability (right overlap) */}
                <circle
                  cx="540" cy="280" r="25"
                  fill="#16a34a"
                  fillOpacity={selectedLabels === 'Design Rework,Usability Issue' ? 0.9 : hoveredRegion === 'design_usability' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Design Rework', 'Usability Issue'])}
                  onMouseEnter={() => setHoveredRegion('design_usability')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="540" y="286" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.design_usability}
                </text>

                {/* Handoff + Usability (bottom center overlap) */}
                <circle
                  cx="400" cy="360" r="25"
                  fill="#be123c"
                  fillOpacity={selectedLabels === 'Post-Handoff Change,Usability Issue' ? 0.9 : hoveredRegion === 'handoff_usability' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Post-Handoff Change', 'Usability Issue'])}
                  onMouseEnter={() => setHoveredRegion('handoff_usability')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="400" y="366" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.handoff_usability}
                </text>

                {/* UXR + Design + Usability (center of all) */}
                <circle
                  cx="400" cy="280" r="20"
                  fill="#1d4ed8"
                  fillOpacity={selectedLabels === 'Design Rework,UXR Identified,Usability Issue' ? 0.95 : hoveredRegion === 'uxr_design_usability' ? 0.8 : 0.7}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['UXR Identified', 'Design Rework', 'Usability Issue'])}
                  onMouseEnter={() => setHoveredRegion('uxr_design_usability')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="400" y="286" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.uxr_design_usability}
                </text>

                {/* Labels for main circles */}
                <text x="300" y="120" textAnchor="middle" fill={LABEL_INFO['UXR Identified'].color} fontSize="12" fontWeight="700">UXR Identified</text>
                <text x="500" y="120" textAnchor="middle" fill={LABEL_INFO['Design Rework'].color} fontSize="12" fontWeight="700">Design Rework</text>
                <text x="300" y="465" textAnchor="middle" fill={LABEL_INFO['Post-Handoff Change'].color} fontSize="12" fontWeight="700">Post-Handoff</text>
                <text x="500" y="465" textAnchor="middle" fill={LABEL_INFO['Usability Issue'].color} fontSize="12" fontWeight="700">Usability Issue</text>

                {/* Separate circles for BA, Feedback, Scope */}
                <g transform="translate(100, 520)">
                  <circle cx="100" cy="0" r="35" fill={LABEL_INFO['PM Change Request'].color} fillOpacity={selectedLabels === 'PM Change Request' ? 0.8 : 0.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(['PM Change Request'])}
                  />
                  <text x="100" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">PM Change</text>
                  <text x="100" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{counts.ba}</text>

                  <circle cx="300" cy="0" r="35" fill={LABEL_INFO['Iteration Feedback'].color} fillOpacity={selectedLabels === 'Iteration Feedback' ? 0.8 : 0.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(['Iteration Feedback'])}
                  />
                  <text x="300" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Iteration</text>
                  <text x="300" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{counts.feedback}</text>

                  <circle cx="500" cy="0" r="35" fill={LABEL_INFO['Scope Change'].color} fillOpacity={selectedLabels === 'Scope Change' ? 0.8 : 0.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(['Scope Change'])}
                  />
                  <text x="500" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Scope</text>
                  <text x="500" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{counts.scope}</text>
                </g>
              </svg>
            </div>
          </div>

          <div className="divider" />

          {/* Tickets Panel */}
          <div className="tickets-section">
            {selectedLabels ? (
              <div className="panel-content">
                <div className="panel-header">
                  <div className="panel-title-group">
                    <div>
                      <div className="panel-title">{getSelectedLabelNames()}</div>
                      <div className="panel-count">{getSelectedTickets().length} tickets</div>
                      {selectedLabels.includes(',') && (
                        <div style={{ fontSize: 11, color: '#6e6e73', marginTop: 4, fontStyle: 'italic' }}>
                          Tickets with multiple labels (overlap region)
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedLabels(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="panel-tickets">
                  {getSelectedTickets().map((ticket) => (
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
                <div className="empty-state-icon">🎯</div>
                <div className="empty-state-text">Click a region to view tickets</div>
                <div style={{ fontSize: 12, color: '#6e6e73', marginTop: 8, maxWidth: 280, textAlign: 'center' }}>
                  Click on circles or overlap regions to see tickets. Overlaps show tickets with multiple labels.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
