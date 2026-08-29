const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

/** Rolling month labels ending at the reference date (index 0 = oldest). */
export function buildRollingMonthLabels(count = 4, referenceDate = new Date()) {
  const safeCount = Math.max(1, count)
  const labels = []

  for (let offset = safeCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1)
    labels.push(MONTH_FORMAT.format(date))
  }

  return labels
}

export function getLatestMonthIndex(monthCount) {
  return Math.max(0, monthCount - 1)
}

export function buildMonthPresets(monthCount) {
  const latest = getLatestMonthIndex(monthCount)
  const lastThreeStart = Math.max(0, latest - 2)

  return [
    { label: 'Last 3 months', range: [lastThreeStart, latest] },
    { label: 'All months', range: [0, latest] },
    { label: 'Current month', range: [latest, latest] },
  ]
}

export function getCalendarYear(monthLabels, referenceDate = new Date()) {
  const lastLabel = monthLabels?.[monthLabels.length - 1]
  if (lastLabel) {
    const parsedYear = Number.parseInt(lastLabel.split(' ').pop(), 10)
    if (Number.isFinite(parsedYear)) return parsedYear
  }
  return referenceDate.getFullYear()
}
