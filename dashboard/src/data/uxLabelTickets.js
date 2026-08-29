/**
 * UX label taxonomy and sample tickets for label-adoption visualizations.
 * Tickets imagine an Instagram product design team shipping creator-facing features.
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
  { key: UX_LABELS.RESEARCH_DRIVEN, color: '#3898ec', desc: 'Change triggered by user research, diary studies, or usability testing' },
  { key: UX_LABELS.DESIGN_REVISION, color: '#f59e0b', desc: 'Rework of design that was already reviewed, approved, or handed off' },
  { key: UX_LABELS.POST_HANDOFF, color: '#ff2d2d', desc: 'Change discovered after design was handed to engineering' },
  { key: UX_LABELS.USABILITY_FIX, color: '#0891b2', desc: 'Correction for a usability gap or accessibility failure' },
  { key: UX_LABELS.REQUIREMENTS_UPDATE, color: '#a78bfa', desc: 'PM update to requirements after initial scoping' },
  { key: UX_LABELS.STAKEHOLDER_FEEDBACK, color: '#00bf2a', desc: 'Change from design critique, demo, or leadership review' },
  { key: UX_LABELS.SCOPE_EXPANSION, color: '#f97316', desc: 'Material expansion or shift from the original feature scope' },
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
  { id: 'FEED-2201', name: 'Suggested posts indistinguishable from followed content — diary study flagged trust gap', labels: [L.RESEARCH_DRIVEN] },
  { id: 'DM-945', name: '72% of participants missed reply threading in group chats', labels: [L.RESEARCH_DRIVEN] },
  { id: 'PROF-167', name: 'Profile completeness nudges feel pushy — research surfaced trust concerns', labels: [L.RESEARCH_DRIVEN] },
  { id: 'REEL-2215', name: 'Reels audio sync controls misaligned with creator mental model in moderated tests', labels: [L.RESEARCH_DRIVEN] },
  { id: 'EXPL-967', name: 'Explore grid density causes scroll fatigue in unmoderated study', labels: [L.RESEARCH_DRIVEN] },
  { id: 'CRE-445', name: 'Creator analytics metrics prioritized wrong per creator panel feedback', labels: [L.RESEARCH_DRIVEN] },
  { id: 'STOR-189', name: 'Story sticker tray overwhelming — card sort with 24 creators', labels: [L.RESEARCH_DRIVEN] },
  { id: 'SUB-92', name: 'Subscription upsell prompts misaligned with creator expectations in concept test', labels: [L.RESEARCH_DRIVEN] },

  { id: 'FEED-901', name: 'Feed card spacing revised for consistency across mobile and web', labels: [L.DESIGN_REVISION] },
  { id: 'DS-505', name: 'Button hierarchy rework across Prism design system components', labels: [L.DESIGN_REVISION] },
  { id: 'PROF-2234', name: 'Profile header layout refinement for grid and bio alignment', labels: [L.DESIGN_REVISION] },
  { id: 'DM-456', name: 'Message bubble layout standardized across iOS, Android, and web', labels: [L.DESIGN_REVISION] },
  { id: 'REEL-912', name: 'Reels timeline scrubber overhaul for faster editing', labels: [L.DESIGN_REVISION] },
  { id: 'EXPL-201', name: 'Explore topic chip pattern updated to new discovery spec', labels: [L.DESIGN_REVISION] },

  { id: 'FEED-956', name: 'Like animation timing adjusted after post-handoff QA', labels: [L.POST_HANDOFF] },
  { id: 'DM-194', name: 'Read receipt placement wrong on tablet — caught in dogfood', labels: [L.POST_HANDOFF] },
  { id: 'REEL-2289', name: 'Cover image crop defaults incorrect on upload', labels: [L.POST_HANDOFF] },
  { id: 'STOR-78', name: 'Story reply bar overlaps home indicator on small phones', labels: [L.POST_HANDOFF] },

  { id: 'FEED-346', name: 'Carousel swipe affordance unclear — usability test identified issue', labels: [L.USABILITY_FIX] },
  { id: 'DM-418', name: 'Voice message scrubbing broken for screen reader users', labels: [L.USABILITY_FIX] },
  { id: 'PROF-58', name: 'Link in bio tap target below minimum touch size', labels: [L.USABILITY_FIX] },
  { id: 'REEL-2267', name: 'Caption editor contrast fails WCAG AA in dark mode', labels: [L.USABILITY_FIX] },

  { id: 'FEED-978', name: 'Hashtag requirements changed after PM scope review', labels: [L.REQUIREMENTS_UPDATE] },
  { id: 'CRE-212', name: 'Insights date range expanded per analytics team request', labels: [L.REQUIREMENTS_UPDATE] },
  { id: 'SUB-489', name: 'Badge eligibility rules updated after policy review', labels: [L.REQUIREMENTS_UPDATE] },

  { id: 'FEED-2310', name: 'Comment threading expanded after leadership demo feedback', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'REEL-128', name: 'Remix attribution label added after creator council review', labels: [L.STAKEHOLDER_FEEDBACK] },
  { id: 'EXPL-402', name: 'Explore filters simplified after VP product walkthrough', labels: [L.STAKEHOLDER_FEEDBACK] },

  { id: 'FEED-1034', name: 'Collab posts added beyond original single-author scope', labels: [L.SCOPE_EXPANSION] },
  { id: 'DM-223', name: 'Scheduled send added to compose after roadmap shift', labels: [L.SCOPE_EXPANSION] },
  { id: 'REEL-2245', name: 'Multi-clip editing expanded from MVP trim-only scope', labels: [L.SCOPE_EXPANSION] },

  { id: 'FEED-345', name: 'Carousel controls revised after usability testing', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'DS-418', name: 'Story sticker tray timing revised after creator usability study', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'CRE-58', name: 'Spark AI feedback controls redesigned per creator trust research', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION] },
  { id: 'REEL-521', name: 'Cover frame picker exposed focus issue post-handoff', labels: [L.POST_HANDOFF, L.USABILITY_FIX] },
  { id: 'FEED-2289', name: 'Collab publish flow required loading state for screen readers', labels: [L.POST_HANDOFF, L.USABILITY_FIX] },
  { id: 'DS-521', name: 'Prism modal detachment exposed focus indicator gap', labels: [L.POST_HANDOFF, L.USABILITY_FIX] },
  { id: 'DM-534', name: 'Polls in DMs redesigned from research and stakeholder input', labels: [L.RESEARCH_DRIVEN, L.STAKEHOLDER_FEEDBACK] },
  { id: 'FEED-2311', name: 'DM quick-reply discoverability improved — research + accessibility', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },
  { id: 'STOR-128', name: 'Story empty state guidance insufficient — testing + WCAG issue', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },
  { id: 'REEL-402', name: 'Remix share menu placement — research + accessibility fix', labels: [L.RESEARCH_DRIVEN, L.USABILITY_FIX] },
  { id: 'FEED-2245', name: 'Collab post card layout redesigned after API constraints surfaced', labels: [L.DESIGN_REVISION, L.POST_HANDOFF] },
  { id: 'REEL-362', name: 'Reels trim controls reversed after export pipeline limitations', labels: [L.DESIGN_REVISION, L.POST_HANDOFF] },
  { id: 'CRE-72', name: 'Suggested Reels cards reworked after metadata format issues', labels: [L.DESIGN_REVISION, L.POST_HANDOFF] },
  { id: 'EXPL-182', name: 'Explore topic rail revised for clarity and contrast', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'STOR-141', name: 'Story error states improved after accessibility critique', labels: [L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'CRE-101', name: 'Spark AI caption suggestions reworked after trust study', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'REEL-1002', name: 'Comment thread sorting — research + redesign + WCAG compliance', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION, L.USABILITY_FIX] },
  { id: 'FEED-2267', name: 'Collab invite form redesigned from research and accessibility audit', labels: [L.RESEARCH_DRIVEN, L.DESIGN_REVISION, L.USABILITY_FIX] },
]
