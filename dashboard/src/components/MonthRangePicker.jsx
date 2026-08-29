import { useMemo, useState } from 'react'
import { buildMonthPresets, getCalendarYear, getLatestMonthIndex } from '../utils/monthLabels'
import './MonthRangePicker.css'

export default function MonthRangePicker({ months, selectedRange, onChange }) {
  const MONTHS = months
  const [isExpanded, setIsExpanded] = useState(false)
  const [rangeStart, setRangeStart] = useState(null)

  const latestIdx = getLatestMonthIndex(MONTHS.length)
  const presets = useMemo(() => buildMonthPresets(MONTHS.length), [MONTHS.length])
  const calendarYear = useMemo(() => getCalendarYear(MONTHS), [MONTHS])

  const isSingleMonth = selectedRange[0] === selectedRange[1]

  const handleMonthClick = (monthIdx) => {
    if (rangeStart === null) {
      setRangeStart(monthIdx)
      onChange([monthIdx, monthIdx])
      return
    }

    const start = Math.min(rangeStart, monthIdx)
    const end = Math.max(rangeStart, monthIdx)
    onChange([start, end])
    setRangeStart(null)
  }

  const handleClearRange = () => {
    setRangeStart(null)
    onChange([latestIdx, latestIdx])
  }

  const getDisplayText = () => {
    if (isSingleMonth) {
      return MONTHS[selectedRange[0]]
    }
    return `${MONTHS[selectedRange[0]].split(' ')[0]} - ${MONTHS[selectedRange[1]].split(' ')[0]}`
  }

  const isMonthInRange = (idx) => idx >= selectedRange[0] && idx <= selectedRange[1]

  const getMonthClassName = (idx) => {
    const classes = ['month-cell']
    if (isMonthInRange(idx)) {
      classes.push('selected')
      if (idx === selectedRange[0]) classes.push('range-start')
      if (idx === selectedRange[1]) classes.push('range-end')
      if (selectedRange[0] !== selectedRange[1]) classes.push('in-range')
    }
    if (rangeStart !== null && idx !== rangeStart) {
      const previewStart = Math.min(rangeStart, idx)
      const previewEnd = Math.max(rangeStart, idx)
      if (idx >= previewStart && idx <= previewEnd) {
        classes.push('preview')
      }
    }
    return classes.join(' ')
  }

  return (
    <div className="month-range-picker-section">
      <div className="month-range-picker-label">Viewing period</div>

      <button
        className="month-range-display"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-haspopup="dialog"
      >
        <span className="range-text">{getDisplayText()}</span>
        <svg
          className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isExpanded && (
        <div className="month-calendar" role="dialog" aria-label="Select viewing period">
          <div className="calendar-header">
            <span className="calendar-title">{calendarYear} months</span>
            {!isSingleMonth && (
              <button className="clear-btn" type="button" onClick={handleClearRange}>
                Clear range
              </button>
            )}
          </div>

          <div className="preset-section">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="preset-btn"
                onClick={() => {
                  onChange(preset.range)
                  setRangeStart(null)
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="month-grid">
            {MONTHS.map((month, idx) => (
              <button
                key={month}
                type="button"
                className={getMonthClassName(idx)}
                onClick={() => handleMonthClick(idx)}
              >
                <span className="month-label">{month.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="calendar-footer">
            <div className="instruction-text">
              {rangeStart === null
                ? 'Click a month to select, or click two months for a range'
                : 'Click another month to complete range'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
