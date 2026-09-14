/**
 * strategicQuadrants.js — Matrix quadrant styling and demo filters for Strategic page.
 *
 * Position on the maturity × impact matrix maps to a quadrant type.
 * Related: pages/StrategicDark.jsx, data/sample/strategicContributions.json
 */

export const QUADRANT_MIDPOINT = 50

export const QUADRANTS = {
  Blocker: { icon: '🚧', color: '#a78bfa', textLight: '#6d28d9' },
  Enhancement: { icon: '✨', color: '#0dc2d6', textLight: '#0e7490' },
  Opportunity: { icon: '🌱', color: '#34d058', textLight: '#15803d' },
  Optimization: { icon: '⚡', color: '#ff4d4d', textLight: '#dc2626' },
}

export const DETAIL_FIELDS = [
  ['Problem', 'problem'],
  ['Evidence', 'evidence'],
  ['Recommendation', 'recommendation'],
  ['Outcome', 'outcome'],
]

/**
 * @CUSTOMIZE — IDs from strategicContributions.json shown in the demo matrix.
 * Leave empty / show all by filtering differently in StrategicDark if desired.
 */
export const VISIBLE_IDS = [
  'reels-bulk-trim',
  'spark-confidence-labels',
  'creator-studio-groupings',
]

/** Map maturity (x) and impact (y) percentages to a quadrant key. */
export function quadrantOf(x, y, midpoint = QUADRANT_MIDPOINT) {
  if (y >= midpoint) return x < midpoint ? 'Blocker' : 'Enhancement'
  return x < midpoint ? 'Opportunity' : 'Optimization'
}
