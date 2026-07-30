import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_DISMISSED = 'pwa-install-dismissed'
const STORAGE_IOS_SHOWN_AT = 'pwa-ios-hint-shown-at'

function isIOS(): boolean {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [modoIOS, setModoIOS] = useState(false)

  useEffect(() => {
    // Si ya está instalada, no mostrar nada
    if (isStandalone()) return

    // Si el usuario ya cerró el prompt antes, respetar 30 días
    const dismissedAt = localStorage.getItem(STORAGE_DISMISSED)
    if (dismissedAt) {
      const diasDesde = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (diasDesde < 30) return
    }

    // Android/Chrome: escucha el evento del navegador
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Mostrar el banner después de 3 segundos para no ser invasivo
      setTimeout(() => setVisible(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari: no dispara ese evento; mostramos hint manual una sola vez cada 30 días
    if (isIOS()) {
      const ultimaVez = localStorage.getItem(STORAGE_IOS_SHOWN_AT)
      const diasDesde = ultimaVez ? (Date.now() - Number(ultimaVez)) / (1000 * 60 * 60 * 24) : 999
      if (diasDesde >= 30) {
        setModoIOS(true)
        setTimeout(() => setVisible(true), 5000)
        localStorage.setItem(STORAGE_IOS_SHOWN_AT, String(Date.now()))
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalar = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDeferredPrompt(null)
  }

  const cerrar = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_DISMISSED, String(Date.now()))
  }

  if (!visible) return null

  // Banner iOS (Safari)
  if (modoIOS) {
    return (
      <div className="fixed bottom-20 left-3 right-3 z-[60] bg-white rounded-2xl border border-gray-200 shadow-2xl p-4 animate-slide-up md:max-w-sm md:left-auto md:right-6 md:bottom-6">
        <div className="flex items-start gap-3">
          <img src="/favicon.png" alt="" className="w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-800">Instala Sofia Couture</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">
              Toca <svg className="inline w-3.5 h-3.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" /></svg> y luego <strong>Agregar a pantalla de inicio</strong> para verla como app.
            </p>
          </div>
          <button onClick={cerrar} className="flex-shrink-0 text-gray-400 hover:text-gray-700 text-lg leading-none p-1">✕</button>
        </div>
      </div>
    )
  }

  // Banner Android (Chrome, etc.)
  return (
    <div className="fixed bottom-20 left-3 right-3 z-[60] bg-white rounded-2xl border border-gray-200 shadow-2xl p-4 animate-slide-up md:max-w-sm md:left-auto md:right-6 md:bottom-6">
      <div className="flex items-start gap-3">
        <img src="/favicon.png" alt="" className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-800">¿Instalar Sofia Couture?</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Acceso rápido desde tu pantalla de inicio, sin barra del navegador.
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={instalar}
              className="bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              Instalar
            </button>
            <button onClick={cerrar}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-2">
              Ahora no
            </button>
          </div>
        </div>
        <button onClick={cerrar} className="flex-shrink-0 text-gray-400 hover:text-gray-700 text-lg leading-none p-1">✕</button>
      </div>
    </div>
  )
}
