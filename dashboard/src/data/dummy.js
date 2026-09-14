/**
 * dummy.js — backward-compatible named exports of sample data.
 *
 * Re-exports keys from sample/index.js for legacy imports. Prefer
 * useDashboardData() from context/DataContext.jsx in new code.
 */
import sample from './sample/index.js'

export const MONTHS = sample.MONTHS
export const executive = sample.executive
export const roadmap = sample.roadmap
export const research = sample.research
export const cost = sample.cost
export const projectComponents = sample.projectComponents
export const strategic = sample.strategic
export const researchInitiatives = sample.researchInitiatives
export const panelHealth = sample.panelHealth
export const ubaIASpotlight = sample.ubaIASpotlight
export const researchAsks = sample.researchAsks
export const strategicContributions = sample.strategicContributions
