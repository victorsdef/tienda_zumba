import api from './axios'
import type { AuthResponse } from '../types'

export interface RegisterResponse {
  mensaje: string
  id: number
  nombre: string
  email: string
  rol: 'CLIENTE' | 'VENDEDOR' | 'BODEGUERO' | 'ADMIN'
}

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data)

export const register = (nombre: string, email: string, password: string) =>
  api.post<RegisterResponse>('/auth/register', { nombre, email, password }).then(r => r.data)

export const verificarEmail = (token: string) =>
  api.get<string>(`/auth/verificar?token=${token}`).then(r => r.data)
