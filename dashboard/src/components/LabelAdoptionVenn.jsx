/**
 * LabelAdoptionVenn.jsx — light-theme multi-label Venn of UX tickets.
 *
 * Legacy overlap visualization. Prefer LabelAdoptionVennDark for executive wiring.
 * Ticket fallbacks come from uxLabelTickets.js (single source of truth).
 * Related: data/uxLabelTickets.js, data/jiraLabelAdoption.json.
 */
import { useState } from 'react'
import jiraLabelAdoption from '../data/jiraLabelAdoption.json'
import { ALL_TICKETS, LABEL_DEFINITIONS, UX_LABELS } from '../data/uxLabelTickets'
import { getJiraBrowseUrl } from '../utils/jira'
import './LabelAdoption.css'

const LABEL_INFO = Object.fromEntries(
  LABEL_DEFINITIONS.map(({ key, color, desc }) => [key, { color, description: desc }]),
)

// Ensure every UX label key is present even if definitions drift
Object.values(UX_LABELS).forEach((key) => {
  if (!LABEL_INFO[key]) LABEL_INFO[key] = { color: '#6e6e73', description: key }
})

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
    uxr_only: getTicketsByLabels(['Research-Driven']).length,
    design_only: getTicketsByLabels(['Design Revision']).length,
    handoff_only: getTicketsByLabels(['Post-Handoff']).length,
    usability_only: getTicketsByLabels(['Usability Fix']).length,
    uxr_design: getTicketsByLabels(['Research-Driven', 'Design Revision']).length,
    uxr_usability: getTicketsByLabels(['Research-Driven', 'Usability Fix']).length,
    design_handoff: getTicketsByLabels(['Design Revision', 'Post-Handoff']).length,
    design_usability: getTicketsByLabels(['Design Revision', 'Usability Fix']).length,
    handoff_usability: getTicketsByLabels(['Post-Handoff', 'Usability Fix']).length,
    uxr_design_usability: getTicketsByLabels(['Research-Driven', 'Design Revision', 'Usability Fix']).length,
    ba: getTicketsByLabels(['Requirements Update']).length,
    feedback: getTicketsByLabels(['Stakeholder Feedback']).length,
    scope: getTicketsByLabels(['Scope Expansion']).length,
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
                <circle cx="300" cy="200" r="120" fill={LABEL_INFO['Research-Driven'].color} fillOpacity="0.25" stroke={LABEL_INFO['Research-Driven'].color} strokeWidth="2" />
                <circle cx="500" cy="200" r="120" fill={LABEL_INFO['Design Revision'].color} fillOpacity="0.25" stroke={LABEL_INFO['Design Revision'].color} strokeWidth="2" />
                <circle cx="300" cy="360" r="120" fill={LABEL_INFO['Post-Handoff'].color} fillOpacity="0.25" stroke={LABEL_INFO['Post-Handoff'].color} strokeWidth="2" />
                <circle cx="500" cy="360" r="120" fill={LABEL_INFO['Usability Fix'].color} fillOpacity="0.25" stroke={LABEL_INFO['Usability Fix'].color} strokeWidth="2" />

                {/* Interactive regions for each section */}

                {/* UXR only (top-left, outside overlaps) */}
                <circle
                  cx="240" cy="150" r="30"
                  fill={LABEL_INFO['Research-Driven'].color}
                  fillOpacity={selectedLabels === 'Research-Driven' ? 0.8 : hoveredRegion === 'uxr_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Research-Driven'])}
                  onMouseEnter={() => setHoveredRegion('uxr_only')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="240" y="155" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.uxr_only}
                </text>

                {/* Design only (top-right, outside overlaps) */}
                <circle
                  cx="560" cy="150" r="30"
                  fill={LABEL_INFO['Design Revision'].color}
                  fillOpacity={selectedLabels === 'Design Revision' ? 0.8 : hoveredRegion === 'design_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Design Revision'])}
                  onMouseEnter={() => setHoveredRegion('design_only')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="560" y="155" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.design_only}
                </text>

                {/* Handoff only (bottom-left, outside overlaps) */}
                <circle
                  cx="240" cy="410" r="30"
                  fill={LABEL_INFO['Post-Handoff'].color}
                  fillOpacity={selectedLabels === 'Post-Handoff' ? 0.8 : hoveredRegion === 'handoff_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Post-Handoff'])}
                  onMouseEnter={() => setHoveredRegion('handoff_only')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="240" y="415" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.handoff_only}
                </text>

                {/* Usability only (bottom-right, outside overlaps) */}
                <circle
                  cx="560" cy="410" r="30"
                  fill={LABEL_INFO['Usability Fix'].color}
                  fillOpacity={selectedLabels === 'Usability Fix' ? 0.8 : hoveredRegion === 'usability_only' ? 0.6 : 0.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Usability Fix'])}
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
                  fillOpacity={selectedLabels === 'Design Revision,Research-Driven' ? 0.9 : hoveredRegion === 'uxr_design' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Research-Driven', 'Design Revision'])}
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
                  fillOpacity={selectedLabels === 'Research-Driven,Usability Fix' ? 0.9 : hoveredRegion === 'uxr_usability' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Research-Driven', 'Usability Fix'])}
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
                  fillOpacity={selectedLabels === 'Design Revision,Post-Handoff' ? 0.9 : hoveredRegion === 'design_handoff' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Design Revision', 'Post-Handoff'])}
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
                  fillOpacity={selectedLabels === 'Design Revision,Usability Fix' ? 0.9 : hoveredRegion === 'design_usability' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Design Revision', 'Usability Fix'])}
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
                  fillOpacity={selectedLabels === 'Post-Handoff,Usability Fix' ? 0.9 : hoveredRegion === 'handoff_usability' ? 0.7 : 0.6}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Post-Handoff', 'Usability Fix'])}
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
                  fillOpacity={selectedLabels === 'Design Revision,Research-Driven,Usability Issue' ? 0.95 : hoveredRegion === 'uxr_design_usability' ? 0.8 : 0.7}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleRegionClick(['Research-Driven', 'Design Revision', 'Usability Fix'])}
                  onMouseEnter={() => setHoveredRegion('uxr_design_usability')}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                <text x="400" y="286" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" style={{ pointerEvents: 'none' }}>
                  {counts.uxr_design_usability}
                </text>

                {/* Labels for main circles */}
                <text x="300" y="120" textAnchor="middle" fill={LABEL_INFO['Research-Driven'].color} fontSize="12" fontWeight="700">Research-Driven</text>
                <text x="500" y="120" textAnchor="middle" fill={LABEL_INFO['Design Revision'].color} fontSize="12" fontWeight="700">Design Revision</text>
                <text x="300" y="465" textAnchor="middle" fill={LABEL_INFO['Post-Handoff'].color} fontSize="12" fontWeight="700">Post-Handoff</text>
                <text x="500" y="465" textAnchor="middle" fill={LABEL_INFO['Usability Fix'].color} fontSize="12" fontWeight="700">Usability Fix</text>

                {/* Separate circles for BA, Feedback, Scope */}
                <g transform="translate(100, 520)">
                  <circle cx="100" cy="0" r="35" fill={LABEL_INFO['Requirements Update'].color} fillOpacity={selectedLabels === 'Requirements Update' ? 0.8 : 0.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(['Requirements Update'])}
                  />
                  <text x="100" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">PM Change</text>
                  <text x="100" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{counts.ba}</text>

                  <circle cx="300" cy="0" r="35" fill={LABEL_INFO['Stakeholder Feedback'].color} fillOpacity={selectedLabels === 'Stakeholder Feedback' ? 0.8 : 0.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(['Stakeholder Feedback'])}
                  />
                  <text x="300" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">Iteration</text>
                  <text x="300" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">{counts.feedback}</text>

                  <circle cx="500" cy="0" r="35" fill={LABEL_INFO['Scope Expansion'].color} fillOpacity={selectedLabels === 'Scope Expansion' ? 0.8 : 0.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRegionClick(['Scope Expansion'])}
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
