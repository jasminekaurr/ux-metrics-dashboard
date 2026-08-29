import { useState } from 'react'
import './MonthRangePicker.css'

export default function MonthRangePicker({ months, selectedRange, onChange }) {
  const MONTHS = months
  const [isExpanded, setIsExpanded] = useState(false)
  const [rangeStart, setRangeStart] = useState(null)

  // Preset ranges
  const presets = [
    { label: 'Last 3 months', range: [1, 3] },
    { label: 'All months', range: [0, 3] },
    { label: 'Current month', range: [3, 3] },
  ]

  // selectedRange is [startIdx, endIdx] where both same = single month
  const isSingleMonth = selectedRange[0] === selectedRange[1]

  const handleMonthClick = (monthIdx) => {
    if (rangeStart === null) {
      // First click - start a potential range
      setRangeStart(monthIdx)
      onChange([monthIdx, monthIdx])
    } else {
      // Second click - complete the range
      const start = Math.min(rangeStart, monthIdx)
      const end = Math.max(rangeStart, monthIdx)
      onChange([start, end])
      setRangeStart(null)
    }
  }

  const handleClearRange = () => {
    setRangeStart(null)
    onChange([3, 3]) // Reset to April (latest month)
  }

  const getDisplayText = () => {
    if (isSingleMonth) {
      return MONTHS[selectedRange[0]]
    }
    return `${MONTHS[selectedRange[0]].split(' ')[0]} - ${MONTHS[selectedRange[1]].split(' ')[0]}`
  }

  const isMonthInRange = (idx) => {
    return idx >= selectedRange[0] && idx <= selectedRange[1]
  }

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
      >
        <span className="range-text">{getDisplayText()}</span>
        <svg
          className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isExpanded && (
        <div className="month-calendar">
          <div className="calendar-header">
            <span className="calendar-title">2026 Months</span>
            {!isSingleMonth && (
              <button className="clear-btn" onClick={handleClearRange}>
                Clear range
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="preset-section">
            {presets.map((preset, idx) => (
              <button
                key={idx}
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
                key={idx}
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
                : 'Click another month to complete range'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
