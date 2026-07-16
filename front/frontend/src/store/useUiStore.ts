import { create } from 'zustand'

interface UiState {
  secuenciasActivas: boolean
  toggleSecuencias: () => void
}

const stored = localStorage.getItem('secuenciasActivas')
const initial = stored === null ? true : stored === 'true'

export const useUiStore = create<UiState>((set) => ({
  secuenciasActivas: initial,
  toggleSecuencias: () =>
    set((s) => {
      const next = !s.secuenciasActivas
      localStorage.setItem('secuenciasActivas', String(next))
      return { secuenciasActivas: next }
    }),
}))
