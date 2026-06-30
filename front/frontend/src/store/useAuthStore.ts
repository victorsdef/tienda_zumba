import { create } from 'zustand'
import type { AuthResponse } from '../types'

interface AuthState {
  user: AuthResponse | null
  isAuthenticated: boolean
  isAdmin: boolean
  setUser: (user: AuthResponse) => void
  logout: () => void
}

const stored = localStorage.getItem('user')

export const useAuthStore = create<AuthState>((set) => ({
  user: stored ? JSON.parse(stored) : null,
  isAuthenticated: !!stored,
  isAdmin: stored ? JSON.parse(stored).rol === 'ADMIN' : false,
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('accessToken', user.accessToken)
    localStorage.setItem('refreshToken', user.refreshToken)
    set({ user, isAuthenticated: true, isAdmin: user.rol === 'ADMIN' })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false, isAdmin: false })
  },
}))
