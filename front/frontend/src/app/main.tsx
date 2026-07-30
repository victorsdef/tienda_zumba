import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@app/styles/main.scss'
import App from '@app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registro del Service Worker (PWA) — solo en producción
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
