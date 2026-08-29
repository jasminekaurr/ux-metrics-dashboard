import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { DataProvider, useDashboardData } from './context/DataContext'
import { getLatestMonthIndex } from './utils/monthLabels'
import Nav from './components/Nav'
import ExecutiveSummaryDark from './pages/ExecutiveSummaryDark'
import APEXDark from './pages/APEXDark'
import ResearchDark from './pages/ResearchDark'
import AnalyticsDark from './pages/AnalyticsDark'
import RoadmapDark from './pages/RoadmapDark'
import StrategicDark from './pages/StrategicDark'
import DataSettings from './pages/DataSettings'
import './index.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppShell() {
  const { MONTHS } = useDashboardData()
  const latestIdx = getLatestMonthIndex(MONTHS.length)
  const [selectedMonthRange, setSelectedMonthRange] = useState([latestIdx, latestIdx])

  const maxIdx = getLatestMonthIndex(MONTHS.length)
  const clampedRange = [
    Math.min(selectedMonthRange[0], maxIdx),
    Math.min(selectedMonthRange[1], maxIdx),
  ]
  const selectedMonthIndex = clampedRange[0]

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="app">
        <Nav
          selectedMonthRange={clampedRange}
          onMonthRangeChange={setSelectedMonthRange}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ExecutiveSummaryDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={clampedRange} />} />
            <Route path="/apex" element={<APEXDark />} />
            <Route path="/research" element={<ResearchDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={clampedRange} />} />
            <Route path="/analytics" element={<AnalyticsDark selectedMonthIndex={selectedMonthIndex} />} />
            <Route path="/roadmap" element={<RoadmapDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={clampedRange} />} />
            <Route path="/strategic" element={<StrategicDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={clampedRange} />} />
            <Route path="/data" element={<DataSettings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </ThemeProvider>
  )
}
