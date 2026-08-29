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
  { to: '/data', label: 'Data Settings', icon: '⬆' },
]

const navClass = ({ isActive }) => 'nav-item' + (isActive ? ' active' : '')

function NavList({ items }) {
  return (
    <ul className="nav-list">
      {items.map(p => (
        <li key={p.to}>
          <NavLink to={p.to} end={p.to === '/'} className={navClass}>
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

  return (
    <nav className="sidenav">
      <div className="sidenav-brand">
        <div className="brand-text">
          <div className="brand-title">Impact Dashboard</div>
        </div>
      </div>

      <NavList items={pages} />

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
  )
}
