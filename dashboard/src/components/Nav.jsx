/**
 * Nav.jsx — top navigation and month-range controls.
 *
 * Renders route links, theme toggle, and MonthRangePicker; labels pull from
 * orgLabels for design-system naming. Related: components/MonthRangePicker.jsx.
 */
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useDashboardData } from '../context/DataContext'
import { labels } from '../config/orgLabels'
import MonthRangePicker from './MonthRangePicker'
import './Nav.css'

const pages = [
  { to: '/', label: 'Executive Summary', icon: '◈' },
  { to: '/apex', label: labels.designSystemFull, icon: '◻' },
  { to: '/research', label: 'UX Research', icon: '◎' },
  { to: '/analytics', label: 'Analytics', icon: '◬' },
  { to: '/roadmap', label: 'Roadmap', icon: '◷' },
  { to: '/strategic', label: 'Strategic Design Contribution', icon: '◈' },
]

const navClass = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '')

function NavList({ items, onNavigate }) {
  return (
    <ul className="nav-list">
      {items.map(p => (
        <li key={p.to}>
          <NavLink to={p.to} end={p.to === '/'} className={navClass} onClick={onNavigate}>
            {p.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export default function Nav({ selectedMonthRange, onMonthRangeChange }) {
  const { theme, toggleTheme } = useTheme()
  const { MONTHS } = useDashboardData()
  const [menuOpen, setMenuOpen] = useState(false)

  // Escape dismisses the drawer without changing the current route.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onEscape = event => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [menuOpen])

  return (
    <>
      <header className="mobile-nav-bar">
        <span className="brand-title">Impact Dashboard</span>
        <button type="button" className="mobile-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="dashboard-navigation" onClick={() => setMenuOpen(open => !open)}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </header>
      <button type="button" className={`mobile-nav-backdrop${menuOpen ? ' mobile-nav-backdrop--open' : ''}`} aria-label="Close menu" aria-hidden={!menuOpen} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
      <nav id="dashboard-navigation" className={`sidenav${menuOpen ? ' sidenav--open' : ''}`} aria-label="Dashboard sections">
      <div className="sidenav-brand">
        <div className="brand-text">
          <div className="brand-title">Impact Dashboard</div>
        </div>
      </div>

      <NavList items={pages} onNavigate={() => setMenuOpen(false)} />

      <div className="nav-footer">
        <MonthRangePicker months={MONTHS} selectedRange={selectedMonthRange} onChange={onMonthRangeChange} />
        <div className="theme-toggle">
          <span className="theme-toggle-label">
            <span className="theme-toggle-icon">{theme === 'dark' ? '◐' : '○'}</span>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
          <button
            type="button"
            className="theme-toggle-switch"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-pressed={theme === 'dark'}
          />
        </div>
      </div>
      </nav>
    </>
  )
}
