/**
 * reuseWeights.js — Complexity multipliers for design-system reuse estimates.
 *
 * Used by Executive Summary and APEX to convert monthly simple/medium/complex/custom
 * counts into an estimated “local” instance footprint vs design-system insertions.
 *
 * @CUSTOMIZE — Adjust weights if your team uses a different complexity model.
 */

export const REUSE_WEIGHTS = {
  simple: 3,
  medium: 5,
  complex: 8,
  custom: 10,
}

/** Sum weighted local instances for one month row `{ simple, medium, complex, custom }`. */
export function estimatedLocalInstances(month) {
  if (!month) return 0
  return (
    (month.simple || 0) * REUSE_WEIGHTS.simple
    + (month.medium || 0) * REUSE_WEIGHTS.medium
    + (month.complex || 0) * REUSE_WEIGHTS.complex
    + (month.custom || 0) * REUSE_WEIGHTS.custom
  )
}

/** Reuse rate as integer percent: insertions / (insertions + estimated local). */
export function computeReuseRate(insertions, month) {
  const local = estimatedLocalInstances(month)
  const total = insertions + local
  if (!total) return 0
  return Math.round((insertions / total) * 100)
}
