const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export function IconX({ size = 19 }) {
  return <svg {...iconProps} width={size} height={size}><path d="M18 6 6 18M6 6l12 12" /></svg>
}

export function IconHistory({ size = 16 }) {
  return <svg {...iconProps} width={size} height={size}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v5h5" /></svg>
}

export function IconRotateCcw({ size = 17 }) {
  return <svg {...iconProps} width={size} height={size}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
}

export function IconLink({ size = 11 }) {
  return <svg {...iconProps} width={size} height={size}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
}

export function IconPackage({ size = 14 }) {
  return <svg {...iconProps} width={size} height={size}><path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></svg>
}

export function IconFolder({ size = 14 }) {
  return <svg {...iconProps} width={size} height={size}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
}

export function IconTags({ size = 14 }) {
  return <svg {...iconProps} width={size} height={size}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></svg>
}

export function IconCalendar({ size = 14 }) {
  return <svg {...iconProps} width={size} height={size}><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
}

export function IconDatabase({ size = 14 }) {
  return <svg {...iconProps} width={size} height={size}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></svg>
}

export function IconCompare({ size = 13 }) {
  return <svg {...iconProps} width={size} height={size}><path d="m18 8 4 4-4 4" /><path d="M6 8l-4 4 4 4" /><path d="M2 12h20" /></svg>
}

export function IconAlert({ size = 14 }) {
  return <svg {...iconProps} width={size} height={size}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4M12 17h.01" /></svg>
}