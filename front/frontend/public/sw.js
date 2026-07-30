// Service Worker mínimo — permite que el navegador reconozca la app como instalable (PWA).
// No cachea nada — solo pasa las peticiones directo a la red.
// En el futuro se puede agregar cache offline.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // Pass-through: no interceptamos nada por ahora
})
