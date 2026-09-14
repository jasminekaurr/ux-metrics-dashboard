/**
 * apexBands.js — Health-band labels and presentation for APEX detachment charts.
 *
 * Band thresholds are encoded in labels; colors come from getChartColors(isDark).
 * Related: pages/APEXDark.jsx
 */

import { getChartColors } from '../utils/chartTheme.js'

export const APEX_LIST_INITIAL_SHOW = 3
export const APEX_LIST_LOAD_MORE_STEP = 3

/**
 * Build band config for charts and expandable lists.
 * Keys: healthy | watch | risk | critical
 */
export function getApexBandConfig(isDark) {
  const chartColors = getChartColors(isDark)
  return {
    healthy: {
      label: 'Healthy (0–1%)',
      color: chartColors.green,
      fill: chartColors.greenFill,
      darkBg: isDark ? 'rgba(0,191,42,0.08)' : 'rgba(22,163,74,0.06)',
    },
    watch: {
      label: 'Watch (1–3%)',
      color: chartColors.blue,
      fill: chartColors.blueFill,
      darkBg: isDark ? 'rgba(56,152,236,0.08)' : 'rgba(37,99,235,0.06)',
    },
    risk: {
      label: 'Risk (3–8%)',
      color: chartColors.amber,
      fill: chartColors.amberFill,
      darkBg: isDark ? 'rgba(245,217,11,0.08)' : 'rgba(217,119,6,0.06)',
    },
    critical: {
      label: 'Critical (>8%)',
      color: chartColors.red,
      fill: chartColors.redFill,
      darkBg: isDark ? 'rgba(255,45,45,0.08)' : 'rgba(220,38,38,0.06)',
    },
  }
}
