import { create } from 'zustand'
import type { AuthResponse } from '../types'

type AppRole = AuthResponse['rol']

export type AdminPermission =
  | 'dashboard'
  | 'reportes'
  | 'productos'
  | 'ordenes'
  | 'usuarios'
  | 'categorias'
  | 'banners'
  | 'configuracion'

interface AuthState {
  user: AuthResponse | null
  isAuthenticated: boolean
  isAdmin: boolean
  role: AppRole | null
  canAccessAdmin: boolean
  hasPermission: (permission: AdminPermission) => boolean
  setUser: (user: AuthResponse) => void
  logout: () => void
}

const stored = localStorage.getItem('user')
const parsedUser: AuthResponse | null = stored ? JSON.parse(stored) : null

const rolePermissions: Record<AppRole, AdminPermission[]> = {
  ADMIN: ['dashboard', 'reportes', 'productos', 'ordenes', 'usuarios', 'categorias', 'banners', 'configuracion'],
  VENDEDOR: ['dashboard', 'ordenes'],
  BODEGUERO: ['dashboard', 'productos'],
  CLIENTE: [],
}

const hasPermissionForRole = (role: AppRole | null, permission: AdminPermission) =>
  !!role && rolePermissions[role].includes(permission)

export const useAuthStore = create<AuthState>((set) => ({
  user: parsedUser,
  isAuthenticated: !!parsedUser,
  isAdmin: parsedUser?.rol === 'ADMIN',
  role: parsedUser?.rol ?? null,
  canAccessAdmin: parsedUser ? parsedUser.rol !== 'CLIENTE' : false,
  hasPermission: (permission) => hasPermissionForRole(parsedUser?.rol ?? null, permission),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('accessToken', user.accessToken)
    localStorage.setItem('refreshToken', user.refreshToken)
    set({
      user,
      isAuthenticated: true,
      isAdmin: user.rol === 'ADMIN',
      role: user.rol,
      canAccessAdmin: user.rol !== 'CLIENTE',
      hasPermission: (permission) => hasPermissionForRole(user.rol, permission),
    })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      role: null,
      canAccessAdmin: false,
      hasPermission: () => false,
    })
  },
}))
