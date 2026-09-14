/**
 * main.jsx — React DOM entry point.
 *
 * Mounts <App /> into #root under StrictMode. Related: App.jsx.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
