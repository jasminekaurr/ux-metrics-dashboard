/**
 * UX label taxonomy and sample tickets for label-adoption visualizations.
 * Tickets imagine a LinkedIn product design team shipping member-facing features.
 */

export const UX_LABELS = {
  RESEARCH_DRIVEN: 'Research-Driven',
  DESIGN_REVISION: 'Design Revision',
  POST_HANDOFF: 'Post-Handoff',
  USABILITY_FIX: 'Usability Fix',
  REQUIREMENTS_UPDATE: 'Requirements Update',
  STAKEHOLDER_FEEDBACK: 'Stakeholder Feedback',
  SCOPE_EXPANSION: 'Scope Expansion',
}

export const LABEL_DEFINITIONS = [
  {
    key: UX_LABELS.RESEARCH_DRIVEN,
    color: '#3898ec',
    desc: 'Change triggered by user research, diary studies, or usability testing',
  },
  {
    key: UX_LABELS.DESIGN_REVISION,
    color: '#f59e0b',
    desc: 'Rework of design that was already reviewed, approved, or handed off',
  },
  {
    key: UX_LABELS.POST_HANDOFF,
    color: '#ff2d2d',
    desc: 'Change discovered after design was handed to engineering',
  },
  {
    key: UX_LABELS.USABILITY_FIX,
    color: '#0891b2',
    desc: 'Correction for a usability gap or accessibility failure',
  },
  {
    key: UX_LABELS.REQUIREMENTS_UPDATE,
    color: '#a78bfa',
    desc: 'PM or BA update to requirements after initial scoping',
  },
  {
    key: UX_LABELS.STAKEHOLDER_FEEDBACK,
    color: '#00bf2a',
    desc: 'Change from design critique, demo, or leadership review',
  },
  {
    key: UX_LABELS.SCOPE_EXPANSION,
    color: '#f97316',
    desc: 'Material expansion or shift from the original feature scope',
  },
]

export const VENN_COLORS = {
  [UX_LABELS.RESEARCH_DRIVEN]:      { h: '#3898ec', g1: '#5eadff', g2: '#1a6dcc', textLight: '#1d4ed8' },
  [UX_LABELS.DESIGN_REVISION]:       { h: '#f59e0b', g1: '#ffc04d', g2: '#cc7a00', textLight: '#92400e' },
  [UX_LABELS.POST_HANDOFF]:          { h: '#ff4d4d', g1: '#ff7b7b', g2: '#cc2222', textLight: '#b91c1c' },
  [UX_LABELS.USABILITY_FIX]:         { h: '#0dc2d6', g1: '#3ee0ef', g2: '#0891b2', textLight: '#0e7490' },
  [UX_LABELS.REQUIREMENTS_UPDATE]:   { h: '#a78bfa', g1: '#c4b5fd', g2: '#7c3aed', textLight: '#6d28d9' },
  [UX_LABELS.STAKEHOLDER_FEEDBACK]:  { h: '#34d058', g1: '#6ee7a0', g2: '#16a34a', textLight: '#15803d' },
  [UX_LABELS.SCOPE_EXPANSION]:       { h: '#fb923c', g1: '#fdba74', g2: '#ea580c', textLight: '#9a3412' },
}

export const VENN_DESCRIPTIONS = {
  [UX_LABELS.RESEARCH_DRIVEN]: 'Research, testing, or experimentation drove the change.',
  [UX_LABELS.DESIGN_REVISION]: 'Existing experience needs design improvement.',
  [UX_LABELS.POST_HANDOFF]: 'Change discovered after design handoff.',
  [UX_LABELS.USABILITY_FIX]: 'Fix for a usability or accessibility gap.',
  [UX_LABELS.REQUIREMENTS_UPDATE]: 'Requirements update after initial scoping.',
  [UX_LABELS.STAKEHOLDER_FEEDBACK]: 'Feedback from critique, demo, or review.',
  [UX_LABELS.SCOPE_EXPANSION]: 'Material expansion beyond original scope.',
}

export const VENN_ICONS = {
  [UX_LABELS.RESEARCH_DRIVEN]: '🧪',
  [UX_LABELS.DESIGN_REVISION]: '🔁',
  [UX_LABELS.POST_HANDOFF]: '⚡',
  [UX_LABELS.USABILITY_FIX]: '✨',
  [UX_LABELS.REQUIREMENTS_UPDATE]: '🚧',
  [UX_LABELS.STAKEHOLDER_FEEDBACK]: '🌱',
  [UX_LABELS.SCOPE_EXPANSION]: '📈',
}

export const VENN_INTERSECTIONS = {
  [`${UX_LABELS.DESIGN_REVISION}|${UX_LABELS.RESEARCH_DRIVEN}`]: 'Research shows an existing experience needs rework.',
  [`${UX_LABELS.RESEARCH_DRIVEN}|${UX_LABELS.USABILITY_FIX}`]: 'Research points to a worthwhile enhancement.',
  [`${UX_LABELS.DESIGN_REVISION}|${UX_LABELS.POST_HANDOFF}`]: 'Rework aimed at speed, efficiency, or simplification.',
  [`${UX_LABELS.DESIGN_REVISION}|${UX_LABELS.USABILITY_FIX}`]: 'Rework that improves the existing experience.',
  [`${UX_LABELS.POST_HANDOFF}|${UX_LABELS.USABILITY_FIX}`]: 'An enhancement that also boosts efficiency.',
  [`${UX_LABELS.DESIGN_REVISION}|${UX_LABELS.RESEARCH_DRIVEN}|${UX_LABELS.USABILITY_FIX}`]: 'Research-driven rework that enhances the experience.',
}

export function intersectionDescription(labels) {
  const key = [...labels].sort().join('|')
  return VENN_INTERSECTIONS[key] ?? 'Tickets that share all of these labels.'
}

export const JIRA_BASE_URL = 'https://example.atlassian.net/browse'

const L = UX_LABELS

export const ALL_TICKETS = [
  // Research-Driven only
  { id: 'FEED-2201', name: 'Promoted posts indistinguishable from organic — diary study flagged trust gap', labels: [L.RESEARCH_DRIVEN] },
  { id: 'MSG-945', name: '72% of participants missed reply threading in group conversations', labels: [L.RESEARCH_DRIVEN] },
  { id: 'PROF-167', name: 'Profile completeness nudges feel pushy — research surfaced trust concerns', labels: [L.RESEARCH_DRIVEN] },
  { id: 'JOBS-2215', name: 'Easy Apply steps misaligned with candidate mental model in moderated tests', labels: [L.RESEARCH_DRIVEN] },
  { id: 'NET-967', name: 'Connection request copy causes uncertainty about relationship context', labels: [L.RESEARCH_DRIVEN] },
  { id: 'CRE-445', name: 'Creator analytics metrics prioritized wrong per creator panel feedback', labels: [L.RESEARCH_DRIVEN] },
  { id: 'NOTIF-189', name: 'Notification grouping logic confusing — card sort study with 24 members', labels: [L.RESEARCH_DRIVEN] },
  { id: 'PREM-92', name: 'Premium upsell prompts misaligned with member expectations in concept test', labels: [L.RESEARCH_DRIVEN] },

  // Design Revision only
  { id: 'FEED-901', name: 'Feed card spacing revised for consistency across mobile and web', labels: [L.DESIGN_REVISION] },
  { id: 'DS-505', name: 'Button hierarchy rework across Harmony design system components', labels: [L.DESIGN_REVISION] },
  { id: 'PROF-2234', name: 'Profile header layout refinement for brand and readability alignment', labels: [L.DESIGN_REVISION] },
  { id: 'MSG-456', name: 'Message bubble layout standardized across iOS, Android, and web', labels: [L.DESIGN_REVISION] },
  { id: 'JOBS-912', name: 'Job card typography overhaul for faster scan in search results', labels: [L.DESIGN_REVISION] },
  { id: 'NET-201', name: 'People You May Know card pattern updated to new networking spec', labels: [L.DESIGN_REVISION] },

  // Post-Handoff only
  { id: 'FEED-956', name: 'Graph API cannot return live reaction counts — skeleton state required', labels: [L.POST_HANDOFF] },
  { id: 'MSG-194', name: 'Read receipts blocked by message sync limitations on older clients', labels: [L.POST_HANDOFF] },
  { id: 'JOBS-2289', name: 'Job listing API pagination forces infinite scroll instead of paged design', labels: [L.POST_HANDOFF] },
  { id: 'REC-78', name: 'Recruiter InMail template latency exceeds assumed loading thresholds', labels: [L.POST_HANDOFF] },

  // Usability Fix only
  { id: 'MSG-989', name: 'Tab order incorrect in compose modal on desktop web', labels: [L.USABILITY_FIX] },
  { id: 'PROF-425', name: 'Profile edit button contrast below 4.5:1 on dark mode', labels: [L.USABILITY_FIX] },
  { id: 'FEED-2256', name: 'Focus indicators missing on reaction picker and overflow menu', labels: [L.USABILITY_FIX] },
  { id: 'JOBS-178', name: 'Screen reader announces wrong label for salary range chips', labels: [L.USABILITY_FIX] },
  { id: 'NET-998', name: 'Connection removal error messages lack clear recovery guidance', labels: [L.USABILITY_FIX] },
  { id: 'MSG-467', name: 'Reaction emoji touch targets below 44×44px on mobile', labels: [L.USABILITY_FIX] },
  { id: 'DS-534', name: 'Keyboard navigation skips filter chips on Jobs search', labels: [L.USABILITY_FIX] },
  { id: 'REC-101', name: 'InMail send loading state causes duplicate-send confusion', labels: [L.USABILITY_FIX] },
  { id: 'FEED-2298', name: 'Comment input validation timing disrupts posting flow', labels: [L.USABILITY_FIX] },
  { id: 'PROF-1023', name: 'Skill endorsement autocomplete missing required ARIA attributes', labels: [L.USABILITY_FIX] },

  // Research-Driven + Design Revision
  { id: 'FEED-345', name: 'Feed relevance controls redesigned after unmoderated study on control discoverability', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'JOBS-418', name: 'Easy Apply confirmation step revised after usability testing showed drop-off', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'CRE-58', name: 'Creator post scheduling flow redesigned per diary study on planning behavior', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'NET-2267', name: 'Connection filter interface rebuilt from card sorting and tree testing', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'JOBS-978', name: 'Job alert results layout revised based on eye-tracking in search sessions', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'NOTIF-212', name: 'Notification center redesign driven by member feedback and funnel analysis', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'PROF-489', name: 'Skills section restructured per open card sort with 30 professionals', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },

  // Research-Driven + Usability Fix
  { id: 'FEED-2310', name: 'Mobile feed filter discoverability improved — research plus WCAG audit', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },
  { id: 'MSG-128', name: 'Empty inbox state guidance insufficient — testing and accessibility review', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },
  { id: 'NET-402', name: 'Invite-to-connect placement fixed — research and keyboard trap failure', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },
  { id: 'JOBS-1034', name: 'Salary filter contrast issues found in research sessions and a11y audit', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },
  { id: 'PREM-223', name: 'Premium trial error recovery inadequate per testing and WCAG review', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },

  // Design Revision + Post-Handoff
  { id: 'FEED-2245', name: 'Feed video card layout redesigned after Graph API thumbnail constraints', labels: [L.DESIGN_REVISION, L.POST_HANDOFF] },
  { id: 'MSG-362', name: 'Voice message UI reversed after backend clip-length limitations found', labels: [L.DESIGN_REVISION, L.POST_HANDOFF] },

  // Design Revision + Usability Fix
  { id: 'NOTIF-182', name: 'Notification badge layout revised for clarity and contrast compliance', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'JOBS-141', name: 'Job save error states improved after accessibility critique', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'DS-545', name: 'Harmony component spacing adjusted for WCAG touch-target compliance', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'REC-112', name: 'InMail CTA button sizes increased to meet minimum touch targets', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'PROF-2312', name: 'Profile edit modals redesigned for full keyboard accessibility', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'NET-1045', name: 'Connection table headers restructured for screen reader support', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },

  // Post-Handoff + Usability Fix
  { id: 'FEED-2323', name: 'Reaction batch limit required accessible loading feedback after API discovery', labels: [L.POST_HANDOFF, L.USABILITY_FIX] },
  { id: 'DS-521', name: 'Detached Harmony component exposed missing focus indicator in production', labels: [L.POST_HANDOFF, L.USABILITY_FIX] },
  { id: 'JOBS-501', name: 'Job apply timeout handling needs accessible error feedback', labels: [L.POST_HANDOFF, L.USABILITY_FIX] },

  // Research-Driven + Design Revision + Usability Fix
  { id: 'JOBS-1002', name: 'Job search filters — research-led redesign with full WCAG compliance', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'PROF-2334', name: 'Open-to-work visibility controls redesigned from research and a11y audit', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'MSG-234', name: 'Messaging quick replies rebuilt from research with screen reader support', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'FEED-512', name: 'Comment thread overhaul — research, design revision, and accessibility pass', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION, L.USABILITY_FIX] },

  // Requirements Update (separate)
  { id: 'REC-2208', name: 'Compliance field required on recruiter outreach templates', labels: [L.REQUIREMENTS_UPDATE] },
  { id: 'JOBS-923', name: 'PM requested remote-only filter in job search results', labels: [L.REQUIREMENTS_UPDATE] },
  { id: 'NET-378', name: 'Connection approval workflow needs manager-visibility tier', labels: [L.REQUIREMENTS_UPDATE] },
  { id: 'PROF-245', name: 'New verification badge field required in profile editor', labels: [L.REQUIREMENTS_UPDATE] },
  { id: 'PREM-123', name: 'PM requires trial conversion event logging in checkout flow', labels: [L.REQUIREMENTS_UPDATE] },

  // Stakeholder Feedback (separate)
  { id: 'FEED-2256B', name: 'VP requested engagement indicator on feed post cards', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'CRE-978B', name: 'PM feedback — add export to creator analytics dashboard', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'MSG-410', name: 'Design review identified missing confirmation before deleting thread', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'DS-556', name: 'Leadership wants bulk moderation actions in admin tooling UI', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'NOTIF-256', name: 'Stakeholder requested read-state visibility in notification tray', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'REC-134', name: 'Recruiter team feedback on pipeline kanban column density', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'NET-2345', name: 'Internal demo feedback requires invite preview panel in connection flow', labels: [L.STAKEHOLDER_FEEDBACK] },

  // Scope Expansion (separate)
  { id: 'FEED-2278', name: 'Feed controls expanded to include topic mute and author mute', labels: [L.SCOPE_EXPANSION] },
  { id: 'JOBS-995', name: 'Job search scope expanded to include closed and archived listings', labels: [L.SCOPE_EXPANSION] },
  { id: 'MSG-438', name: 'Messaging now includes scheduled send within original compose scope', labels: [L.SCOPE_EXPANSION] },
  { id: 'NET-267', name: 'Additional connection types added beyond original networking MVP', labels: [L.SCOPE_EXPANSION] },
]
