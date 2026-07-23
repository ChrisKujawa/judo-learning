import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerAnalytics } from './analytics'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './pwa.ts'

registerServiceWorker()

registerAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
