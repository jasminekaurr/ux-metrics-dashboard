/**
 * chartTheme.js — Chart.js tooltip/scale colors for light and dark themes.
 *
 * Shared helpers so doughnut/line charts match dashboard tokens.
 * Related: context/ThemeContext.jsx.
 *
 * Exports:
 *   - getChartTheme(isDark)     — tooltip, scales, legend, hoverOverlay tokens
 *   - SEMANTIC_COLORS           — success/warning/danger/info/purple/cyan per theme
 *   - getSemanticColor(name, isDark)
 *   - getChartColors(isDark)    — stroke/fill pairs for line/bar series
 *   - getImpactThemes(isDark)   — Risk / Speed / Revenue chip styles
 *   - getTypeColors(isDark)     — donut palette (colors, fills, hover)
 *   - STATUS_PIPELINE           — ordered executive delivery-status stage labels
 */
export function getChartTheme(isDark) {
  return {
    tooltip: {
      backgroundColor: isDark ? '#232325' : '#ffffff',
      titleColor: isDark ? '#bfbfbf' : '#1d1d1f',
      bodyColor: isDark ? '#ffffff' : '#3a3a3c',
      borderColor: isDark ? '#3a3a3e' : '#d2d2d7',
      borderWidth: 1,
      padding: { top: 10, bottom: 10, left: 14, right: 14 },
      cornerRadius: 6,
      titleFont: { family: '"Gt America Mono", monospace', size: 10, weight: 400 },
      bodyFont: { family: '"Alliance No. 2", sans-serif', size: 13, weight: 500 },
      displayColors: false,
    },
    scales: {
      x: {
        ticks: { color: isDark ? '#6b6b6e' : '#6e6e73' },
        grid: { color: isDark ? 'rgba(39,39,42,0.55)' : 'rgba(0,0,0,0.06)' },
        border: { color: isDark ? '#3a3a3e' : '#d2d2d7' },
      },
      y: {
        ticks: { color: isDark ? '#6b6b6e' : '#6e6e73' },
        grid: { color: isDark ? 'rgba(39,39,42,0.55)' : 'rgba(0,0,0,0.06)' },
        border: { color: isDark ? '#3a3a3e' : '#d2d2d7' },
      },
    },
    legend: {
      labels: {
        color: isDark ? '#6b6b6e' : '#6e6e73',
        font: { family: '"Gt America Mono", monospace', size: 10 },
        boxWidth: 10,
        boxHeight: 10,
        padding: 16,
      },
    },
    hoverOverlay: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  }
}

export const SEMANTIC_COLORS = {
  dark: {
    success: '#00bf2a',
    warning: '#f59e0b',
    danger: '#ff2d2d',
    info: '#3898ec',
    purple: '#a78bfa',
    cyan: '#0dc2d6',
  },
  light: {
    success: '#15803d',
    warning: '#92400e',
    danger: '#b91c1c',
    info: '#1d4ed8',
    purple: '#6d28d9',
    cyan: '#0e7490',
  },
}

export function getSemanticColor(name, isDark) {
  return isDark ? SEMANTIC_COLORS.dark[name] : SEMANTIC_COLORS.light[name]
}

export function getChartColors(isDark) {
  return {
    green: isDark ? '#00bf2a' : '#16a34a',
    greenFill: isDark ? 'rgba(0,191,42,0.22)' : 'rgba(22,163,74,0.15)',
    amber: isDark ? '#f59e0b' : '#d97706',
    amberFill: isDark ? 'rgba(245,158,11,0.22)' : 'rgba(217,119,6,0.15)',
    red: isDark ? '#ff2d2d' : '#dc2626',
    redFill: isDark ? 'rgba(255,45,45,0.22)' : 'rgba(220,38,38,0.15)',
    blue: isDark ? '#3898ec' : '#2563eb',
    blueFill: isDark ? 'rgba(56,152,236,0.22)' : 'rgba(37,99,235,0.15)',
    purple: isDark ? '#a78bfa' : '#7c3aed',
    purpleFill: isDark ? 'rgba(167,139,250,0.22)' : 'rgba(124,58,237,0.15)',
  }
}

/** Research impact theme chips (Risk / Speed / Revenue). */
export function getImpactThemes(isDark) {
  return {
    'Risk Reduction': {
      color: isDark ? '#ff2d2d' : '#dc2626',
      tint: isDark ? 'rgba(255,45,45,0.06)' : 'rgba(220,38,38,0.06)',
      border: isDark ? 'rgba(255,45,45,0.25)' : 'rgba(220,38,38,0.25)',
      icon: '◎',
      desc: 'Catching issues before development begins',
    },
    'Speed/Acceleration': {
      color: isDark ? '#3898ec' : '#2563eb',
      tint: isDark ? 'rgba(56,152,236,0.06)' : 'rgba(37,99,235,0.06)',
      border: isDark ? 'rgba(56,152,236,0.25)' : 'rgba(37,99,235,0.25)',
      icon: '◈',
      desc: 'Reducing ambiguity and faster handoff to dev',
    },
    'Revenue Influence': {
      color: isDark ? '#00bf2a' : '#16a34a',
      tint: isDark ? 'rgba(0,191,42,0.06)' : 'rgba(22,163,74,0.06)',
      border: isDark ? 'rgba(0,191,42,0.25)' : 'rgba(22,163,74,0.25)',
      icon: '◷',
      desc: 'Conversion, retention, and new capability',
    },
  }
}

/** Donut palette for research type breakdown. */
export function getTypeColors(isDark) {
  return {
    colors: isDark
      ? ['#3898ec', '#00bf2a', '#f59e0b', '#a78bfa', '#ff2d2d', '#0891b2']
      : ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0e7490'],
    fills: isDark
      ? ['rgba(56,152,236,0.22)', 'rgba(0,191,42,0.22)', 'rgba(245,158,11,0.22)', 'rgba(167,139,250,0.22)', 'rgba(255,45,45,0.22)', 'rgba(8,145,178,0.22)']
      : ['rgba(37,99,235,0.15)', 'rgba(22,163,74,0.15)', 'rgba(217,119,6,0.15)', 'rgba(124,58,237,0.15)', 'rgba(220,38,38,0.15)', 'rgba(14,116,144,0.15)'],
    hover: isDark
      ? ['rgba(56,152,236,0.50)', 'rgba(0,191,42,0.50)', 'rgba(245,158,11,0.50)', 'rgba(167,139,250,0.50)', 'rgba(255,45,45,0.50)', 'rgba(8,145,178,0.50)']
      : ['rgba(37,99,235,0.40)', 'rgba(22,163,74,0.40)', 'rgba(217,119,6,0.40)', 'rgba(124,58,237,0.40)', 'rgba(220,38,38,0.40)', 'rgba(14,116,144,0.40)'],
  }
}

/** Ordered status stages for the executive delivery pipeline. */
export const STATUS_PIPELINE = [
  'Early exploration',
  'Risk reduction phase',
  'Learning investment',
  'Actively delivering ROI',
  'Scaling or improving ROI',
]
