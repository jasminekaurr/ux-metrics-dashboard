import { useEffect, useMemo, useRef, useState } from 'react'
import { useDashboardData } from '../context/DataContext'
import { labels } from '../config/orgLabels'
import {
  IconAlert,
  IconCalendar,
  IconCompare,
  IconDatabase,
  IconFolder,
  IconHistory,
  IconLink,
  IconPackage,
  IconRotateCcw,
  IconTags,
  IconX,
} from '../components/PlaygroundIcons'
import {
  TYPE_META,
  buildPlaygroundContext,
  getDefaultPositions,
  getLayoutMetrics,
  getStoredPositions,
} from '../utils/executivePlaygroundModel'
import './ExecutiveSummaryPlayground.css'

let sessionCompletedConnections = []

function AnimatedMetricValue({ value, tone }) {
  const previousValueRef = useRef(0)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : Number.parseInt(value, 10)
    if (!Number.isFinite(numericValue)) {
      const frame = window.requestAnimationFrame(() => setDisplayValue(value))
      return () => window.cancelAnimationFrame(frame)
    }

    const suffix = typeof value === 'string' && value.endsWith('%') ? '%' : ''
    const startValue = previousValueRef.current
    previousValueRef.current = numericValue
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = window.requestAnimationFrame(() => setDisplayValue(`${numericValue}${suffix}`))
      return () => window.cancelAnimationFrame(frame)
    }

    const duration = 420
    let animationFrame
    let startTime
    const animate = timestamp => {
      startTime ??= timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + (numericValue - startValue) * easedProgress)
      setDisplayValue(`${currentValue}${suffix}`)
      if (progress < 1) animationFrame = window.requestAnimationFrame(animate)
    }
    animationFrame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [value])

  return <strong className={`es-animated-metric ${tone}`} aria-label={String(value)}>{displayValue}</strong>
}

function PipelineOverview({ entity, idx, months, pipelineMetrics, reuseRate }) {
  const values = pipelineMetrics
  const metrics = [
    ['Shipped', values.shipped, months[idx], 'green'],
    ['To Do', values.todo, 'Backlog items', 'blue'],
    ['In Progress', values.progress, 'Refinement split', 'amber'],
    ['In Review', values.review, 'Refinement split', ''],
    ['On Hold', values.hold, values.hold ? 'Needs attention' : 'Nothing on hold', values.hold ? 'red' : 'green'],
    [`${labels.designSystemName} Reuse`, reuseRate === null ? '—' : `${reuseRate}%`, reuseRate === null ? 'Not reported' : labels.uiFromPatterns, 'blue'],
  ]

  return (
    <section className="es-sandbox-pipeline" aria-live="polite">
      <div className="es-sandbox-section-head">
        <div className="es-pipeline-heading">
          {/* Source: roadmap.json — month shown in metric captions */}
          <div className="es-eyebrow">Delivery Pipeline Overview</div>
          <h2>{entity ? `${entity.name} in motion` : "What shipped and what's in motion"}</h2>
        </div>
        <span className={`es-filter-chip${entity ? '' : ' is-placeholder'}`} style={{ '--piece-accent': entity?.color ?? 'var(--es-border-str)' }}>
          {entity ? `Filtered by ${TYPE_META[entity.type].label}` : 'All delivery'}
        </span>
      </div>
      <div className="es-sandbox-metrics">
        {metrics.map(([label, value, detail, tone]) => (
          <div className="es-sandbox-metric" key={label}>
            <AnimatedMetricValue value={value} tone={tone} />
            <span className="es-metric-caption">
              {label}
              <small>{detail}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FocusDialog({ pair, idx, months, model, onClose }) {
  const closeRef = useRef(null)
  const { sharedEvidence, getTicketSummary, relationshipCopy, leadershipActions } = model
  const evidence = useMemo(() => sharedEvidence(pair[0], pair[1]), [pair, sharedEvidence])
  const tickets = useMemo(() => evidence
    .map(getTicketSummary)
    .sort((first, second) => Number(second.needsEscalation) - Number(first.needsEscalation) || first.key.localeCompare(second.key)), [evidence, getTicketSummary])
  const actions = leadershipActions(pair, evidence)
  const escalations = tickets.filter(ticket => ticket.needsEscalation).length
  const apexReported = tickets.filter(ticket => ticket.apex.status !== 'unknown').length
  const knownProgress = tickets.filter(ticket => ticket.progress !== null)
  const averageProgress = knownProgress.length
    ? Math.round(knownProgress.reduce((total, ticket) => total + ticket.progress, 0) / knownProgress.length)
    : null

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = event => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="es-focus-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="es-focus-dialog" role="dialog" aria-modal="true" aria-labelledby="focus-title">
        <header className="es-focus-header">
          <div>
            <div className="es-eyebrow"><IconLink size={13} /> Connection established</div>
            <h2 id="focus-title">Signals in focus</h2>
          </div>
          <button ref={closeRef} className="es-icon-button" type="button" onClick={onClose} aria-label="Close focus view" title="Close focus view"><IconX /></button>
        </header>
        <div className="es-focus-pair">
          {pair.map(entity => {
            const severity = model.getPieceSeverity(entity)
            return (
              <article key={entity.id} style={{ '--piece-accent': severity.color }}>
                <div className="es-focus-entity-top">
                  <span>{entity.emoji ?? renderTypeIcon(TYPE_META[entity.type].icon, 18)}</span>
                  <small>{severity.label} · {TYPE_META[entity.type].label}</small>
                </div>
                <h3>{entity.name}</h3>
                <p>{entity.detail}</p>
              </article>
            )
          })}
        </div>
        <div className="es-focus-grid">
          <section className="es-focus-narrative">
            <div className="es-focus-label">Relationship narrative</div>
            <p>{relationshipCopy(pair[0], pair[1], evidence.length)}</p>
            <div className="es-provenance"><IconCalendar size={14} /> {months[idx]} context <span /> <IconDatabase size={14} /> Bundled sample data</div>
          </section>
          <section>
            <div className="es-focus-label">Leadership actions</div>
            {actions.length ? (
              <ul className="es-action-list">{actions.map(action => <li key={action}>{action}</li>)}</ul>
            ) : (
              <div className="es-empty-state">No leadership action is attached to this connection in the current dataset.</div>
            )}
          </section>
        </div>
        <section className="es-evidence-section">
          <div className="es-focus-label">Ticket portfolio <span>{tickets.length} tickets</span></div>
          {tickets.length ? (
            <>
              <div className="es-ticket-summary">
                <div><strong>{tickets.length}</strong><span>Related tickets</span><small>All matching local records</small></div>
                <div><strong className={escalations ? 'red' : 'green'}>{escalations}</strong><span>Need escalation</span><small>Active blocker or risk signal</small></div>
                <div><strong>{apexReported}</strong><span>{labels.designSystemName} reported</span><small>{tickets.length - apexReported} not reported</small></div>
                <div><strong>{averageProgress === null ? '—' : `${averageProgress}%`}</strong><span>Average progress</span><small>{knownProgress.length} of {tickets.length} measured</small></div>
              </div>
              <div className="es-ticket-register">
                <div className="es-ticket-register-head" aria-hidden="true"><span>Ticket</span><span>Status &amp; progress</span><span>{labels.designSystemName} utilization</span><span>Escalation</span></div>
                {tickets.map(ticket => (
                  <article className="es-ticket-row" key={ticket.key}>
                    <div className="es-ticket-identity">
                      <div><strong>{ticket.key}</strong><span>{ticket.project}</span></div>
                      <h4>{ticket.title}</h4>
                      <small><IconDatabase size={12} /> {ticket.source} · {ticket.targetDate ? `Target ${ticket.targetDate}` : `Viewed in ${months[idx]} context`}</small>
                    </div>
                    <div className="es-ticket-status">
                      <span className={`es-status-pill ${ticket.status.toLowerCase().replaceAll(' ', '-')}`}>{ticket.status}</span>
                      <div className="es-ticket-progress">
                        <div><span style={{ width: `${ticket.progress ?? 0}%` }} /></div>
                        <strong>{ticket.progress === null ? 'Not reported' : `${ticket.progress}%`}</strong>
                        <small>{ticket.progressBasis}</small>
                      </div>
                    </div>
                    <div className="es-ticket-apex">
                      <span className={`es-data-pill ${ticket.apex.status}`}>
                        {ticket.apex.status === 'custom' ? 'No · custom' : ticket.apex.status === 'pending' ? 'Pending' : ticket.apex.status === 'used' ? `Yes · ${labels.designSystemName}` : 'Not reported'}
                      </span>
                      <small>{ticket.apex.detail}</small>
                    </div>
                    <div className="es-ticket-escalation">
                      <span className={`es-data-pill ${ticket.needsEscalation ? 'escalate' : 'clear'}`}>{ticket.needsEscalation ? 'Yes · escalate' : 'No escalation'}</span>
                      <small>{ticket.escalationDetail}</small>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="es-empty-state">No shared ticket-level evidence is available for this pair.</div>
          )}
        </section>
      </section>
    </div>
  )
}

function getComparisonSummary(connection, model) {
  const first = model.entityDefinitions.find(entity => entity.id === connection.firstId)
  const second = model.entityDefinitions.find(entity => entity.id === connection.secondId)
  if (!first || !second) return null
  const evidence = model.sharedEvidence(first, second)
  const tickets = evidence.map(model.getTicketSummary)
  const measured = tickets.filter(ticket => ticket.progress !== null)
  return {
    connection,
    pair: [first, second],
    strength: model.getConnectionStrength(first, second),
    tickets: tickets.length,
    escalations: tickets.filter(ticket => ticket.needsEscalation).length,
    apexReported: tickets.filter(ticket => ticket.apex.status !== 'unknown').length,
    progress: measured.length
      ? Math.round(measured.reduce((total, ticket) => total + ticket.progress, 0) / measured.length)
      : null,
    narrative: model.relationshipCopy(first, second, evidence.length),
  }
}

function ConnectionHistoryDialog({ connections, totalConnections, idx, months, model, onClose }) {
  const closeRef = useRef(null)
  const [selectedIds, setSelectedIds] = useState(() => connections.slice(0, 2).map(connection => connection.id))
  const summaries = connections.map(connection => getComparisonSummary(connection, model)).filter(Boolean)
  const compared = selectedIds.map(id => summaries.find(summary => summary.connection.id === id)).filter(Boolean)
  const completion = totalConnections ? Math.round((connections.length / totalConnections) * 100) : 0

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = event => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function toggleConnection(id) {
    setSelectedIds(current => current.includes(id)
      ? current.filter(selectedId => selectedId !== id)
      : current.length < 2 ? [...current, id] : [current[1], id])
  }

  return (
    <div className="es-focus-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <section className="es-focus-dialog es-history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <header className="es-focus-header">
          <div><div className="es-eyebrow"><IconHistory /> Exploration history</div><h2 id="history-title">Compare connections</h2></div>
          <button ref={closeRef} className="es-icon-button" type="button" onClick={onClose} aria-label="Close connection history" title="Close connection history"><IconX /></button>
        </header>
        <div className="es-history-progress">
          <div><strong>{connections.length}</strong><span>of {totalConnections} connections explored</span></div>
          <div className="es-history-progress-track"><span style={{ width: `${completion}%` }} /></div>
          <small>{completion}% complete</small>
        </div>
        {summaries.length ? (
          <div className="es-history-layout">
            <aside className="es-history-list" aria-label="Explored connections">
              <div className="es-focus-label">History <span>Select two</span></div>
              {summaries.map(summary => {
                const selectedIndex = selectedIds.indexOf(summary.connection.id)
                return (
                  <button key={summary.connection.id} type="button" className={`es-history-item${selectedIndex >= 0 ? ' selected' : ''}`} onClick={() => toggleConnection(summary.connection.id)} aria-pressed={selectedIndex >= 0}>
                    <span className="es-history-selection">{selectedIndex >= 0 ? selectedIndex + 1 : ''}</span>
                    <span><strong>{summary.pair[0].emoji ?? ''} {summary.pair[0].name}</strong><small>{summary.pair[1].emoji ?? ''} {summary.pair[1].name} · {summary.strength.label}</small></span>
                    <time>{summary.connection.exploredAt ? new Date(summary.connection.exploredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : months[idx]}</time>
                  </button>
                )
              })}
            </aside>
            <section className="es-comparison-area" aria-live="polite">
              <div className="es-focus-label"><span className="es-comparison-label"><IconCompare /> Side-by-side comparison</span><span>{compared.length} / 2 selected</span></div>
              <div className="es-comparison-grid">
                {[0, 1].map(column => {
                  const summary = compared[column]
                  if (!summary) return <div className="es-comparison-empty" key={column}>Select connection {column + 1} from the history.</div>
                  return (
                    <article className="es-comparison-card" key={summary.connection.id}>
                      <div className="es-comparison-heading"><small>Connection {column + 1}</small><h3>{summary.pair[0].emoji ?? ''} {summary.pair[0].name}</h3><span>{summary.pair[1].emoji ?? ''} {summary.pair[1].name}</span></div>
                      <div className="es-comparison-metrics">
                        <div><strong>{summary.strength.label}</strong><span>Strength</span></div>
                        <div><strong>{summary.tickets}</strong><span>Shared tickets</span></div>
                        <div><strong className={summary.escalations ? 'red' : ''}>{summary.escalations}</strong><span>Escalations</span></div>
                        <div><strong>{summary.progress === null ? '—' : `${summary.progress}%`}</strong><span>Avg. progress</span></div>
                        <div><strong>{summary.apexReported}</strong><span>{labels.designSystemName} reported</span></div>
                      </div>
                      <p>{summary.narrative}</p>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        ) : (
          <div className="es-empty-state es-history-empty">Connect two pieces to begin building exploration history.</div>
        )}
      </section>
    </div>
  )
}

function renderTypeIcon(name, size) {
  if (name === 'package') return <IconPackage size={size} />
  if (name === 'folder') return <IconFolder size={size} />
  return <IconTags size={size} />
}

const LANE_BOUNDS = {
  entity: { min: 1, max: 29 },
  label: { min: 63, max: 63 },
}

function getLaneBounds(entity) {
  return entity.type === 'label' ? LANE_BOUNDS.label : LANE_BOUNDS.entity
}

export default function ExecutiveSummaryPlayground({ selectedMonthIndex, pipelineMetrics, reuseRate }) {
  const { roadmap, MONTHS } = useDashboardData()
  const model = useMemo(() => buildPlaygroundContext(roadmap), [roadmap])
  const { entityDefinitions, STORAGE_KEY } = model

  const [positions, setPositions] = useState(() => getStoredPositions(entityDefinitions, STORAGE_KEY))
  const [selectedId, setSelectedId] = useState(null)
  const [focusPair, setFocusPair] = useState(null)
  const [mismatchId, setMismatchId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)
  const [lastDraggedId, setLastDraggedId] = useState(null)
  const [joinedPair, setJoinedPair] = useState(null)
  const [completedConnections, setCompletedConnections] = useState(() => sessionCompletedConnections)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [connectionLines, setConnectionLines] = useState({ width: 1, height: 1, items: [] })
  const fieldRef = useRef(null)
  const dragRef = useRef(null)
  const focusTimerRef = useRef(null)
  const suppressClickRef = useRef(false)

  const selected = entityDefinitions.find(entity => entity.id === selectedId) ?? null
  const compatibleIds = useMemo(
    () => selected ? new Set(entityDefinitions.filter(entity => model.areCompatible(selected, entity)).map(entity => entity.id)) : new Set(),
    [selected, entityDefinitions, model],
  )
  const totalConnections = useMemo(
    () => entityDefinitions.reduce((total, entity, index) =>
      total + entityDefinitions.slice(index + 1).filter(candidate => model.areCompatible(entity, candidate)).length, 0),
    [entityDefinitions, model],
  )

  const filteredPipeline = useMemo(() => {
    if (!selected) return pipelineMetrics
    return model.getPipeline(selected, selectedMonthIndex, pipelineMetrics)
  }, [selected, selectedMonthIndex, pipelineMetrics, model])

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(positions)) }, [positions, STORAGE_KEY])
  useEffect(() => { sessionCompletedConnections = completedConnections }, [completedConnections])
  useEffect(() => () => window.clearTimeout(focusTimerRef.current), [])

  useEffect(() => {
    const field = fieldRef.current
    const activeEntity = entityDefinitions.find(entity => entity.id === (draggingId ?? selectedId))
    if (!field || !activeEntity) {
      const frame = window.requestAnimationFrame(() => setConnectionLines(current => current.items.length ? { ...current, items: [] } : current))
      return () => window.cancelAnimationFrame(frame)
    }

    const updateLines = () => {
      const fieldRect = field.getBoundingClientRect()
      const getLine = (first, second, completed = false) => {
        const source = first.type === 'label' ? second : first
        const target = first.type === 'label' ? first : second
        const sourceElement = field.querySelector(`[data-entity-id="${source.id}"]`)
        const targetElement = field.querySelector(`[data-entity-id="${target.id}"]`)
        if (!sourceElement || !targetElement) return null
        const sourceRect = sourceElement.getBoundingClientRect()
        const targetRect = targetElement.getBoundingClientRect()
        const targetProfile = model.getConnectionProfile(target)
        const targetInset = targetProfile.level === 'several' ? 10 : targetProfile.level === 'many' ? 9 : 0
        return {
          id: [source.id, target.id].sort().join('::'),
          completed,
          strength: model.getConnectionStrength(source, target),
          x1: sourceRect.right - fieldRect.left,
          y1: sourceRect.top + sourceRect.height / 2 - fieldRect.top,
          x2: targetRect.left + targetInset - fieldRect.left,
          y2: targetRect.top + targetRect.height / 2 - fieldRect.top,
        }
      }

      const completedItems = completedConnections
        .filter(connection => connection.firstId === activeEntity.id || connection.secondId === activeEntity.id)
        .map(connection => getLine(
          entityDefinitions.find(entity => entity.id === connection.firstId),
          entityDefinitions.find(entity => entity.id === connection.secondId),
          true,
        ))
        .filter(Boolean)
      const completedIds = new Set(completedItems.map(item => item.id))
      const activeItems = ENTITY_DEFINITIONS_ACTIVE(entityDefinitions, activeEntity, model, completedIds, getLine)
      const items = [...completedItems, ...activeItems]
      setConnectionLines({ width: fieldRect.width, height: fieldRect.height, items })
    }

    const frame = window.requestAnimationFrame(updateLines)
    const observer = new ResizeObserver(updateLines)
    observer.observe(field)
    window.addEventListener('resize', updateLines)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', updateLines)
    }
  }, [completedConnections, draggingId, joinedPair, positions, selectedId, entityDefinitions, model])

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key !== 'Escape') return
      window.clearTimeout(focusTimerRef.current)
      dragRef.current = null
      suppressClickRef.current = false
      setSelectedId(null)
      setMismatchId(null)
      setDraggingId(null)
      setDropTargetId(null)
      setJoinedPair(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function resetSelection() {
    window.clearTimeout(focusTimerRef.current)
    setSelectedId(null)
    setFocusPair(null)
    setMismatchId(null)
    setDraggingId(null)
    setDropTargetId(null)
    setJoinedPair(null)
  }

  function resetLayout() {
    const defaults = getDefaultPositions(entityDefinitions)
    setPositions(defaults)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  }

  function markConnectionCompleted(first, second) {
    const connectionId = [first.id, second.id].sort().join('::')
    const connection = { id: connectionId, firstId: first.id, secondId: second.id, exploredAt: new Date().toISOString() }
    setCompletedConnections(current => [connection, ...current.filter(item => (item.id ?? [item.firstId, item.secondId].sort().join('::')) !== connectionId)])
  }

  function handlePieceClick(entity) {
    if (suppressClickRef.current) return
    if (!selected) { setSelectedId(entity.id); return }
    if (selected.id === entity.id) { resetSelection(); return }
    if (!model.areCompatible(selected, entity)) {
      setMismatchId(entity.id)
      window.setTimeout(() => setMismatchId(null), 700)
      return
    }
    markConnectionCompleted(selected, entity)
    setFocusPair([selected, entity])
  }

  function startDrag(event, entity) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const field = fieldRef.current
    if (!field || window.matchMedia('(max-width: 760px)').matches) return
    window.clearTimeout(focusTimerRef.current)
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      id: entity.id,
      wasSelected: selectedId === entity.id,
      startX: event.clientX,
      startY: event.clientY,
      origin: positions[entity.id],
      width: field.clientWidth,
      height: field.clientHeight,
      minX: 1,
      maxX: ((field.clientWidth - event.currentTarget.offsetWidth - 18) / field.clientWidth) * 100,
      maxY: ((field.clientHeight - event.currentTarget.offsetHeight - 18) / field.clientHeight) * 100,
    }
    setDraggingId(entity.id)
    setDropTargetId(null)
    setJoinedPair(null)
    suppressClickRef.current = false
  }

  function findConnectionCandidate(entity, draggedElement) {
    const field = fieldRef.current
    if (!field) return null
    const draggedRect = draggedElement.getBoundingClientRect()
    const draggedCenter = { x: draggedRect.left + draggedRect.width / 2, y: draggedRect.top + draggedRect.height / 2 }
    return entityDefinitions
      .filter(candidate => model.areCompatible(entity, candidate))
      .map(candidate => {
        const element = field.querySelector(`[data-entity-id="${candidate.id}"]`)
        if (!element) return null
        const rect = element.getBoundingClientRect()
        const centerDistance = Math.hypot(draggedCenter.x - (rect.left + rect.width / 2), draggedCenter.y - (rect.top + rect.height / 2))
        const verticalOverlap = Math.max(0, Math.min(draggedRect.bottom, rect.bottom) - Math.max(draggedRect.top, rect.top))
        const horizontalOverlap = Math.max(0, Math.min(draggedRect.right, rect.right) - Math.max(draggedRect.left, rect.left))
        return { candidate, element, rect, verticalOverlap, horizontalOverlap, centerDistance }
      })
      .filter(Boolean)
      .filter(match => match.horizontalOverlap > 0 && match.verticalOverlap > 0)
      .sort((first, second) => first.centerDistance - second.centerDistance)[0] ?? null
  }

  function moveDrag(event) {
    const drag = dragRef.current
    if (!drag) return
    const dx = ((event.clientX - drag.startX) / drag.width) * 100
    const dy = ((event.clientY - drag.startY) / drag.height) * 100
    if (Math.abs(dx) + Math.abs(dy) > 0.8 && !suppressClickRef.current) {
      suppressClickRef.current = true
      setLastDraggedId(drag.id)
      setSelectedId(drag.id)
    }
    setPositions(current => ({ ...current, [drag.id]: {
      x: Math.max(drag.minX, Math.min(drag.maxX, drag.origin.x + dx)),
      y: Math.max(1, Math.min(drag.maxY, drag.origin.y + dy)),
    } }))
    const draggedEntity = entityDefinitions.find(entity => entity.id === drag.id)
    const match = draggedEntity ? findConnectionCandidate(draggedEntity, event.currentTarget) : null
    setDropTargetId(match?.candidate.id ?? null)
  }

  function cancelDrag() {
    const drag = dragRef.current
    dragRef.current = null
    if (drag) setPositions(current => ({ ...current, [drag.id]: drag.origin }))
    setSelectedId(drag?.wasSelected ? drag.id : null)
    setDraggingId(null)
    setDropTargetId(null)
    window.setTimeout(() => { suppressClickRef.current = false }, 0)
  }

  function endDrag(event, entity) {
    const drag = dragRef.current
    dragRef.current = null
    setDraggingId(null)
    setDropTargetId(null)
    if (!drag || !suppressClickRef.current) {
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
      return
    }

    const dx = ((event.clientX - drag.startX) / drag.width) * 100
    const dy = ((event.clientY - drag.startY) / drag.height) * 100
    const droppedPosition = {
      x: Math.max(drag.minX, Math.min(drag.maxX, drag.origin.x + dx)),
      y: Math.max(1, Math.min(drag.maxY, drag.origin.y + dy)),
    }

    const field = fieldRef.current
    const match = findConnectionCandidate(entity, event.currentTarget)
    if (!match || !field) {
      const homeBounds = getLaneBounds(entity)
      const isInHomeLane = droppedPosition.x >= homeBounds.min && droppedPosition.x <= homeBounds.max
      setPositions(current => ({ ...current, [entity.id]: isInHomeLane ? droppedPosition : getDefaultPositions(entityDefinitions)[entity.id] }))
      setSelectedId(null)
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
      return
    }

    const deliveryEntity = entity.type === 'label' ? match.candidate : entity
    const labelEntity = entity.type === 'label' ? entity : match.candidate
    const candidatePosition = positions[match.candidate.id]
    const deliveryElement = entity.type === 'label' ? match.element : event.currentTarget
    const pairedY = Math.max(1, ((field.clientHeight - deliveryElement.offsetHeight) / 2 / field.clientHeight) * 100)
    setPositions(current => ({
      ...current,
      [deliveryEntity.id]: { x: 23, y: pairedY },
      [labelEntity.id]: { x: 50, y: pairedY },
    }))
    setSelectedId(null)
    setJoinedPair({ firstId: entity.id, secondId: match.candidate.id, strength: model.getConnectionStrength(entity, match.candidate) })
    focusTimerRef.current = window.setTimeout(() => {
      setPositions(current => ({
        ...current,
        [entity.id]: drag.origin,
        [match.candidate.id]: candidatePosition,
      }))
      markConnectionCompleted(entity, match.candidate)
      setJoinedPair(null)
      setFocusPair([entity, match.candidate])
    }, 900)
    window.setTimeout(() => { suppressClickRef.current = false }, 0)
  }

  function renderPiece(entity) {
    const isSelected = selectedId === entity.id
    const isCompatible = compatibleIds.has(entity.id)
    const isDimmed = selected && !isSelected && !isCompatible
    const isDragging = draggingId === entity.id
    const isDropTarget = dropTargetId === entity.id
    const isLastDragged = lastDraggedId === entity.id
    const isJoined = joinedPair && (joinedPair.firstId === entity.id || joinedPair.secondId === entity.id)
    const strength = isJoined
      ? joinedPair.strength
      : isCompatible
        ? model.getConnectionStrength(selected, entity)
        : null
    const overview = model.getPieceOverview(entity)
    const severity = model.getPieceSeverity(entity)
    const connectionProfile = model.getConnectionProfile(entity)
    const isLabel = entity.type === 'label'

    return (
      <button
        key={entity.id}
        type="button"
        data-entity-id={entity.id}
        className={`es-puzzle-piece type-${entity.type} severity-${severity.level} connections-${connectionProfile.level}${strength ? ` strength-${strength.level}` : ''}${isSelected ? ' selected' : ''}${isCompatible ? ' compatible' : ''}${isJoined ? ' joined' : ''}${isDimmed ? ' dimmed' : ''}${isDragging ? ' dragging' : ''}${isDropTarget ? ' drop-target' : ''}${mismatchId === entity.id ? ' mismatch' : ''}`}
        style={{
          '--piece-accent': severity.color,
          left: `${positions[entity.id].x}%`,
          top: `${positions[entity.id].y}%`,
          zIndex: isDragging ? 100 : isDropTarget ? 20 : isJoined ? 15 : isLastDragged ? 10 : isSelected || isCompatible ? 4 : 1,
        }}
        onClick={() => handlePieceClick(entity)}
        onPointerDown={event => startDrag(event, entity)}
        onPointerMove={moveDrag}
        onPointerUp={event => endDrag(event, entity)}
        onPointerCancel={cancelDrag}
        aria-pressed={isSelected}
      >
        {isDropTarget && <span className="es-connect-cue" role="status"><IconLink /> Release to connect</span>}
        <span className="es-piece-copy">
          {!isLabel && <span>{severity.label} · {TYPE_META[entity.type].label}</span>}
          <strong>{entity.emoji ? `${entity.emoji} ` : ''}{entity.name}</strong>
          <small>{entity.detail}</small>
        </span>
        {!isLabel && (
          <span className="es-piece-overview">
            <span><strong>{overview.tickets}</strong> Tickets</span>
            <span><strong>{overview.progress === null ? '—' : `${overview.progress}%`}</strong> Progress</span>
            <span className={overview.escalations ? 'has-risk' : ''}><strong>{overview.escalations}</strong> Escalate</span>
          </span>
        )}
      </button>
    )
  }

  const labelCount = entityDefinitions.filter(entity => entity.type === 'label').length
  const layoutMetrics = useMemo(() => getLayoutMetrics(entityDefinitions), [entityDefinitions])

  return (
    <div className="es-playground es-sandbox-page">
      <section className="es-workspace" aria-labelledby="workspace-title">
          <header className="es-workspace-header">
            <div className="es-workspace-intro"><h1 id="workspace-title">Connect delivery work to UX signals</h1></div>
            <PipelineOverview
              entity={selected}
              idx={selectedMonthIndex}
              months={MONTHS}
              pipelineMetrics={filteredPipeline}
              reuseRate={reuseRate}
            />
            <div className="es-workspace-tools">
              <button className="es-history-button" type="button" onClick={() => setHistoryOpen(true)}>
                <IconHistory />
                <span><strong>{completedConnections.length}</strong> / {totalConnections} explored</span>
              </button>
              <div className="es-selection-count">{selected ? '1 / 2 selected' : '0 / 2 selected'}</div>
              <button className="es-icon-button" type="button" onClick={resetSelection} aria-label="Clear selection" title="Clear selection"><IconX size={17} /></button>
              <button className="es-icon-button" type="button" onClick={resetLayout} aria-label="Reset piece layout" title="Reset piece layout"><IconRotateCcw /></button>
            </div>
          </header>
          <div className="es-encoding-legend" aria-label="Visual encoding legend">
            <span className="es-legend-label">Delivery severity</span>
            <span><i className="severity stable" /> Stable</span>
            <span><i className="severity watch" /> Watch</span>
            <span><i className="severity critical" /> High</span>
            <span className="es-legend-divider" />
            <span className="es-legend-label">Shape · relationships</span>
            <span><i className="shape few" /> 1–2</span>
            <span><i className="shape several" /> 3–4</span>
            <span><i className="shape many" /> 5+</span>
            <span className="es-legend-divider" />
            <span className="es-legend-label">Line / lock strength</span>
            <span><i className="line emerging" /> Emerging</span>
            <span><i className="line established" /> Established</span>
            <span><i className="line strong" /> Strong</span>
          </div>
          <div
            ref={fieldRef}
            className="es-piece-field"
            style={{
              '--label-count': labelCount,
              '--entity-rows': layoutMetrics.entityRows,
            }}
            aria-live="polite"
          >
            <svg className={`es-connection-layer${connectionLines.items.length ? ' is-visible' : ''}`} viewBox={`0 0 ${connectionLines.width} ${connectionLines.height}`} preserveAspectRatio="none" aria-hidden="true">
              {connectionLines.items.map(line => {
                const midpoint = (line.x1 + line.x2) / 2
                const joinedId = joinedPair ? [joinedPair.firstId, joinedPair.secondId].sort().join('::') : null
                const isActive = joinedId === line.id
                return (
                  <g key={line.id} className={isActive ? 'is-active' : undefined}>
                    <path className={`es-connection-line strength-${line.strength.level}${line.completed ? ' is-completed' : ''}`} d={`M ${line.x1} ${line.y1} C ${midpoint} ${line.y1}, ${midpoint} ${line.y2}, ${line.x2} ${line.y2}`} />
                  </g>
                )
              })}
            </svg>
            <div className="es-lane-heading es-lane-heading-entities"><span><IconPackage /> Products</span><span><IconFolder /> Projects</span></div>
            {entityDefinitions.filter(entity => entity.type !== 'label').map(renderPiece)}
            <div className="es-lane-heading es-lane-heading-labels"><IconTags /> UX labels</div>
            {entityDefinitions.filter(entity => entity.type === 'label').map(renderPiece)}
          </div>
          {mismatchId && <div className="es-mismatch-note" role="status"><IconAlert /> No shared ticket or project evidence connects those pieces.</div>}
      </section>
      {focusPair && <FocusDialog pair={focusPair} idx={selectedMonthIndex} months={MONTHS} model={model} onClose={resetSelection} />}
      {historyOpen && <ConnectionHistoryDialog connections={completedConnections} totalConnections={totalConnections} idx={selectedMonthIndex} months={MONTHS} model={model} onClose={() => setHistoryOpen(false)} />}
    </div>
  )
}

function ENTITY_DEFINITIONS_ACTIVE(entityDefinitions, activeEntity, model, completedIds, getLine) {
  return entityDefinitions
    .filter(candidate => model.areCompatible(activeEntity, candidate))
    .map(candidate => getLine(activeEntity, candidate))
    .filter(item => item && !completedIds.has(item.id))
}
