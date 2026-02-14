import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { zzfx } from 'zzfx'
import App from './App'

// Make zzfx available globally
window.zzfx = zzfx

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
