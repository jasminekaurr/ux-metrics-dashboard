import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { DataProvider } from './context/DataContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import Nav from './components/Nav'
import ExecutiveSummaryDark from './pages/ExecutiveSummaryDark'
import APEXDark from './pages/APEXDark'
import ResearchDark from './pages/ResearchDark'
import AnalyticsDark from './pages/AnalyticsDark'
import RoadmapDark from './pages/RoadmapDark'
import StrategicDark from './pages/StrategicDark'
import PresentationDark from './pages/PresentationDark'
import DataSettings from './pages/DataSettings'
import './index.css'

export default function App() {
  // [startIdx, endIdx] - when both are same, it's a single month
  const [selectedMonthRange, setSelectedMonthRange] = useState([3, 3]) // default: Apr 2026

  // For backwards compatibility, also provide single month index
  const selectedMonthIndex = selectedMonthRange[0]

  return (
    <ThemeProvider>
      <DataProvider>
        <HashRouter>
          <ScrollToTop />
          <div className="app">
            <Nav
              selectedMonthRange={selectedMonthRange}
              onMonthRangeChange={setSelectedMonthRange}
              selectedMonthIndex={selectedMonthIndex}
            />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ExecutiveSummaryDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={selectedMonthRange} />} />
                <Route path="/about" element={<PresentationDark />} />
                <Route path="/apex" element={<APEXDark />} />
                <Route path="/research" element={<ResearchDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={selectedMonthRange} />} />
                <Route path="/analytics" element={<AnalyticsDark />} />
                <Route path="/roadmap" element={<RoadmapDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={selectedMonthRange} />} />
                <Route path="/strategic" element={<StrategicDark selectedMonthIndex={selectedMonthIndex} selectedMonthRange={selectedMonthRange} />} />
                <Route path="/data" element={<DataSettings />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </DataProvider>
    </ThemeProvider>
  )
}
