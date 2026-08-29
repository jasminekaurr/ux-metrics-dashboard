import { labels } from '../config/orgLabels'
import {
  ALL_TICKETS,
  LABEL_DEFINITIONS,
  VENN_ICONS,
} from '../data/uxLabelTickets'

const STORAGE_KEY = 'ux-executive-sandbox-layout-v11'

const PRODUCT_NAMES = ['Feed', 'Reels', 'DMs', 'Explore', 'Creator']
const PRODUCT_COLORS = ['#E1306C', '#833AB4', '#3898ec', '#f59e0b', '#00a896']
const PRODUCT_PREFIXES = {
  Feed: 'FEED',
  Reels: 'REEL',
  DMs: 'DM',
  Explore: 'EXPL',
  Creator: 'CRE',
}

const STANDALONE_PROJECTS = [
  { name: 'Spark AI', prefix: 'CRE', color: '#0071e3', detail: 'Generative AI for creators' },
  { name: 'Reels Remix', prefix: 'REEL', color: '#7c3aed', detail: 'Creator collaboration initiative' },
]

export function buildEntityDefinitions() {
  const products = PRODUCT_NAMES.map((name, index) => ({
    id: `product-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    type: 'product',
    detail: 'Instagram product surface',
    color: PRODUCT_COLORS[index],
  }))

  const projects = STANDALONE_PROJECTS.map(project => ({
    id: `project-${project.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: project.name,
    type: 'project',
    detail: project.detail,
    color: project.color,
  }))

  const uxLabels = LABEL_DEFINITIONS.map(def => ({
    id: def.key.toLowerCase().replace(/\s+/g, '-'),
    name: def.key,
    type: 'label',
    detail: def.desc,
    color: def.color,
    emoji: VENN_ICONS[def.key],
    labelKey: def.key,
  }))

  return [...products, ...projects, ...uxLabels]
}

export function buildPrefixByEntity(entityDefinitions) {
  const map = {}
  for (const entity of entityDefinitions) {
    if (entity.type === 'product') {
      map[entity.id] = PRODUCT_PREFIXES[entity.name]
    } else if (entity.type === 'project') {
      const project = STANDALONE_PROJECTS.find(item => item.name === entity.name)
      if (project) map[entity.id] = project.prefix
    }
  }
  return map
}

const PROJECT_BY_PREFIX = {
  FEED: 'Feed',
  REEL: 'Reels',
  DM: 'DMs',
  EXPL: 'Explore',
  CRE: 'Creator',
  PROF: 'Profile',
  STOR: 'Stories',
  SUB: 'Subscriptions',
  DS: labels.designSystemFull,
}

const STAGE_PROGRESS = { discovery: 25, validation: 50, execution: 75, optimization: 90 }

const APEX_BY_TICKET = {
  'FEED-2201': { status: 'custom', detail: `Custom feed card pattern outside ${labels.designSystemName}` },
  'DS-505': { status: 'used', detail: `${labels.designSystemName} component applied` },
  'REEL-912': { status: 'pending', detail: `${labels.designSystemName} timeline component pending` },
  'CRE-101': { status: 'custom', detail: `Custom ${labels.aiLayer} interface reported` },
}

export function buildPlaygroundContext(roadmap) {
  const entityDefinitions = buildEntityDefinitions()
  const prefixByEntity = buildPrefixByEntity(entityDefinitions)

  const evidenceByKey = new Map()

  for (const feature of roadmap.features) {
    for (const key of feature.tickets.split(', ').filter(Boolean)) {
      evidenceByKey.set(key, {
        key,
        title: feature.name,
        labels: [],
        source: 'Roadmap data',
      })
    }
  }

  for (const ticket of ALL_TICKETS) {
    const existing = evidenceByKey.get(ticket.id)
    evidenceByKey.set(ticket.id, {
      ...existing,
      key: ticket.id,
      title: existing?.title ?? ticket.name,
      source: existing?.source ?? 'Jira label data',
      labels: [...new Set([...(existing?.labels ?? []), ...ticket.labels])],
    })
  }

  const completeEvidence = [...evidenceByKey.values()]
  const featureByTicket = new Map(roadmap.features.flatMap(feature =>
    feature.tickets.split(', ').filter(Boolean).map(key => [key, feature]),
  ))

  function evidenceFor(entity) {
    if (!entity) return completeEvidence
    if (entity.type === 'label') {
      return completeEvidence.filter(item => item.labels.includes(entity.labelKey))
    }
    const prefix = prefixByEntity[entity.id]
    return prefix
      ? completeEvidence.filter(item => item.key.startsWith(`${prefix}-`))
      : []
  }

  function sharedEvidence(first, second) {
    const secondKeys = new Set(evidenceFor(second).map(item => item.key))
    return evidenceFor(first).filter(item => secondKeys.has(item.key))
  }

  function areCompatible(first, second) {
    const crossesDivider = (first.type === 'label') !== (second.type === 'label')
    return first.id !== second.id && crossesDivider && sharedEvidence(first, second).length > 0
  }

  function getConnectionStrength(first, second) {
    const count = sharedEvidence(first, second).length
    if (count >= 6) return { level: 'strong', label: 'Strong', count }
    if (count >= 3) return { level: 'established', label: 'Established', count }
    return { level: 'emerging', label: 'Emerging', count }
  }

  function getTicketSummary(item) {
    const feature = featureByTicket.get(item.key)
    const prefix = item.key.split('-')[0]
    const project = feature?.project ?? PROJECT_BY_PREFIX[prefix] ?? 'Project not reported'
    const activeBlocker = roadmap.blockerIntelligence.active.find(blocker =>
      blocker.affectedFeatures.includes(item.key),
    )
    const risk = roadmap.atRiskFeatures?.find(entry => entry.key === item.key)
    const progress = feature?.actualShipDate
      ? 100
      : STAGE_PROGRESS[feature?.currentStage] ?? null
    const progressBasis = feature
      ? feature.actualShipDate ? 'Released' : 'Stage estimate'
      : 'Not reported'
    const needsEscalation = Boolean(activeBlocker || ['blocked', 'overdue', 'stale'].includes(risk?.riskType))
    const apex = APEX_BY_TICKET[item.key] ?? { status: 'unknown', detail: `Ticket-level ${labels.designSystemName} usage was not reported` }
    const status = activeBlocker
      ? 'Blocked'
      : feature?.actualShipDate
        ? 'Released'
        : feature?.currentStage
          ? `${feature.currentStage[0].toUpperCase()}${feature.currentStage.slice(1)}`
          : 'Not reported'

    return {
      ...item,
      project,
      feature: feature?.name ?? item.title,
      progress,
      progressBasis,
      status,
      apex,
      needsEscalation,
      escalationDetail: activeBlocker
        ? `${activeBlocker.priority} · ${activeBlocker.blocker} · ${activeBlocker.owner}`
        : risk?.riskReason ?? 'No active escalation signal',
      targetDate: feature?.plannedShipDate ?? null,
    }
  }

  function getPieceOverview(entity) {
    const tickets = evidenceFor(entity).map(getTicketSummary)
    const measured = tickets.filter(ticket => ticket.progress !== null)
    return {
      tickets: tickets.length,
      progress: measured.length
        ? Math.round(measured.reduce((total, ticket) => total + ticket.progress, 0) / measured.length)
        : null,
      escalations: tickets.filter(ticket => ticket.needsEscalation).length,
    }
  }

  function getPieceSeverity(entity) {
    if (entity.type === 'label') return { level: 'signal', label: 'UX signal', color: entity.color }
    const escalations = getPieceOverview(entity).escalations
    if (escalations >= 2) return { level: 'critical', label: 'High severity', color: '#ef4444' }
    if (escalations === 1) return { level: 'watch', label: 'Watch', color: '#f59e0b' }
    return { level: 'stable', label: 'Stable', color: '#22c55e' }
  }

  function getConnectionProfile(entity) {
    const count = entityDefinitions.filter(candidate => areCompatible(entity, candidate)).length
    if (count >= 5) return { count, level: 'many', label: `${count} connections` }
    if (count >= 3) return { count, level: 'several', label: `${count} connections` }
    return { count, level: 'few', label: `${count} ${count === 1 ? 'connection' : 'connections'}` }
  }

  function getPipeline(entity, idx, pipelineMetrics) {
    if (!entity) return pipelineMetrics

    if (entity.type !== 'label') {
      const project = roadmap.projects.find(item => item.name === entity.name)
        ?? roadmap.projects.find(item => item.name === entity.name.replace('Spark AI', 'Creator'))
      if (project) {
        return {
          shipped: project.shipped ?? 0,
          todo: project.stageBreakdown?.discovery ?? 0,
          progress: (project.stageBreakdown?.validation ?? 0) + (project.stageBreakdown?.execution ?? 0),
          review: project.stageBreakdown?.optimization ?? 0,
          hold: project.blockedItems ?? 0,
        }
      }
      const prefix = prefixByEntity[entity.id]
      const keys = new Set(completeEvidence.filter(item => item.key.startsWith(`${prefix}-`)).map(item => item.key))
      const features = roadmap.features.filter(feature =>
        feature.tickets.split(', ').some(key => keys.has(key)),
      )
      return {
        shipped: features.filter(feature => feature.actualShipDate).length,
        todo: features.filter(feature => feature.currentStage === 'discovery').length,
        progress: features.filter(feature => ['validation', 'execution'].includes(feature.currentStage)).length,
        review: features.filter(feature => feature.currentStage === 'optimization').length,
        hold: features.filter(feature => feature.blockers.length > 0).length,
      }
    }

    const keys = new Set(evidenceFor(entity).map(item => item.key))
    const features = roadmap.features.filter(feature =>
      feature.tickets.split(', ').some(key => keys.has(key)),
    )
    return {
      shipped: features.filter(feature => feature.actualShipDate).length,
      todo: features.filter(feature => feature.currentStage === 'discovery').length,
      progress: features.filter(feature => ['validation', 'execution'].includes(feature.currentStage)).length,
      review: features.filter(feature => feature.currentStage === 'optimization').length,
      hold: features.filter(feature => feature.blockers.length > 0).length,
    }
  }

  function relationshipCopy(first, second, count) {
    const subject = first.type === 'label' ? second : first
    const label = first.type === 'label' ? first : second.type === 'label' ? second : null
    if (label) {
      return `${count} shared ${count === 1 ? 'record shows' : 'records show'} how ${label.name.toLowerCase()} appears within ${subject.name}. This view joins delivery context to the underlying UX signal without implying causation.`
    }
    return `${first.name} and ${second.name} share ${count} underlying delivery ${count === 1 ? 'record' : 'records'} in the selected month context.`
  }

  function leadershipActions(pair, evidence) {
    const labelIds = pair.filter(item => item.type === 'label').map(item => item.id)
    const actions = []
    if (labelIds.includes('post-handoff')) actions.push('Assign an accountable owner and confirm the decision or dependency needed to restore progress.')
    if (labelIds.includes('design-revision')) actions.push('Review whether repeated revisions indicate a requirements, quality, or approval gap.')
    if (labelIds.includes('requirements-update')) actions.push('Confirm expected customer value and prioritize the improvement against committed delivery.')
    if (labelIds.includes('scope-expansion')) actions.push('Validate the unmet need and size its potential value before committing scope.')
    if (labelIds.includes('stakeholder-feedback')) actions.push('Review feedback quality and identify the decision the critique or demo should inform.')
    if (labelIds.includes('usability-fix')) actions.push('Establish the accessibility or task-completion baseline this change should improve.')
    if (labelIds.includes('research-driven')) actions.push('Review the evidence quality and identify the decision the research or test should inform.')
    if (evidence.length >= 4) actions.push('Review the concentration of signals with the product lead at the next portfolio check-in.')
    return actions
  }

  return {
    STORAGE_KEY,
    entityDefinitions,
    prefixByEntity,
    completeEvidence,
    evidenceFor,
    sharedEvidence,
    areCompatible,
    getConnectionStrength,
    getTicketSummary,
    getPieceOverview,
    getPieceSeverity,
    getConnectionProfile,
    getPipeline,
    relationshipCopy,
    leadershipActions,
  }
}

const LANE_TOP_PCT = 11
const LANE_BOTTOM_PCT = 4
const ENTITY_COLUMNS = 2

export function getLayoutMetrics(entityDefinitions) {
  const entities = entityDefinitions.filter(entity => entity.type !== 'label')
  const labels = entityDefinitions.filter(entity => entity.type === 'label')
  const entityRows = Math.ceil(entities.length / ENTITY_COLUMNS)
  const usableHeight = 100 - LANE_TOP_PCT - LANE_BOTTOM_PCT

  return {
    entityCount: entities.length,
    entityRows,
    labelCount: labels.length,
    entitySlotPct: usableHeight / Math.max(entityRows, 1),
    labelSlotPct: usableHeight / Math.max(labels.length, 1),
    maxEntityY: LANE_TOP_PCT + Math.max(entityRows - 1, 0) * (usableHeight / Math.max(entityRows, 1)) + 2,
    maxLabelY: LANE_TOP_PCT + Math.max(labels.length - 1, 0) * (usableHeight / Math.max(labels.length, 1)) + 2,
  }
}

export function getDefaultPositions(entityDefinitions) {
  const entities = entityDefinitions.filter(entity => entity.type !== 'label')
  const labels = entityDefinitions.filter(entity => entity.type === 'label')
  const { entitySlotPct, labelSlotPct } = getLayoutMetrics(entityDefinitions)
  const positions = {}

  entities.forEach((entity, index) => {
    const row = Math.floor(index / ENTITY_COLUMNS)
    const col = index % ENTITY_COLUMNS
    positions[entity.id] = {
      x: 3 + col * 29,
      y: LANE_TOP_PCT + row * entitySlotPct + 1.2,
    }
  })

  labels.forEach((entity, index) => {
    positions[entity.id] = {
      x: 64,
      y: LANE_TOP_PCT + index * labelSlotPct + 0.8,
    }
  })

  return positions
}

export function getStoredPositions(entityDefinitions, storageKey) {
  const laneBounds = {
    entity: { min: 1, max: 29 },
    label: { min: 63, max: 63 },
  }
  const metrics = getLayoutMetrics(entityDefinitions)
  const getLaneBounds = entity => (entity.type === 'label' ? laneBounds.label : laneBounds.entity)

  try {
    const stored = { ...getDefaultPositions(entityDefinitions), ...JSON.parse(localStorage.getItem(storageKey) || '{}') }
    return Object.fromEntries(Object.entries(stored).map(([id, position]) => {
      const entity = entityDefinitions.find(candidate => candidate.id === id)
      const bounds = entity ? getLaneBounds(entity) : laneBounds.entity
      const maxY = entity?.type === 'label' ? metrics.maxLabelY : metrics.maxEntityY
      return [id, {
        x: Math.max(bounds.min, Math.min(bounds.max, position.x)),
        y: Math.max(LANE_TOP_PCT, Math.min(maxY, position.y)),
      }]
    }))
  } catch {
    return getDefaultPositions(entityDefinitions)
  }
}

export const TYPE_META = {
  product: { label: 'Product', icon: 'package' },
  project: { label: 'Project', icon: 'folder' },
  label: { label: 'UX label', icon: 'tags' },
}
