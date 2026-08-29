import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function SectionHelp({ title = 'Why it matters', children, label = 'Section help' }) {
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState(null)

  const positionTooltip = useCallback(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const width = Math.min(300, window.innerWidth - 24)
    const height = tooltip?.offsetHeight ?? 120
    const gap = 10

    let top = rect.bottom + gap
    if (top + height > window.innerHeight - 12 && rect.top - height - gap > 12) {
      top = rect.top - height - gap
    }

    let left = rect.left + rect.width / 2 - width / 2
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12))
    top = Math.max(12, Math.min(top, window.innerHeight - height - 12))

    setStyle({ top, left, width })
  }, [])

  const show = () => {
    setOpen(true)
    setStyle(null)
  }

  const hide = () => {
    setOpen(false)
    setStyle(null)
  }

  useLayoutEffect(() => {
    if (!open) return undefined
    positionTooltip()
    const frame = window.requestAnimationFrame(() => positionTooltip())
    const reposition = () => positionTooltip()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, positionTooltip, children, title])

  const tooltip = open && typeof document !== 'undefined'
    ? createPortal(
      <span
        ref={tooltipRef}
        className={`es-section-help-tooltip es-section-help-tooltip--fixed${style ? ' is-visible' : ''}`}
        style={style ?? { visibility: 'hidden', top: 0, left: 0, width: Math.min(300, window.innerWidth - 24) }}
        role="tooltip"
      >
        {title ? <strong>{title}</strong> : null}
        <span>{children}</span>
      </span>,
      document.body,
    )
    : null

  return (
    <>
      <span className="es-section-help">
        <button
          ref={triggerRef}
          type="button"
          className="es-section-help-trigger"
          aria-label={label}
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          <span className="es-section-help-emoji" aria-hidden="true">🤔</span>
        </button>
      </span>
      {tooltip}
    </>
  )
}
