import api from './axios'
import type { Usuario, Direccion } from '../types'

export const getPerfil = () =>
  api.get<Usuario>('/usuario/perfil').then(r => r.data)

export const actualizarPerfil = (nombre: string) =>
  api.put<Usuario>('/usuario/perfil', { nombre }).then(r => r.data)

export const getDirecciones = () =>
  api.get<Direccion[]>('/usuario/direcciones').then(r => r.data)

export const agregarDireccion = (data: Omit<Direccion, 'id'>) =>
  api.post<Direccion>('/usuario/direcciones', data).then(r => r.data)

export const actualizarDireccion = (id: number, data: Omit<Direccion, 'id'>) =>
  api.put<Direccion>(`/usuario/direcciones/${id}`, data).then(r => r.data)

export const eliminarDireccion = (id: number) =>
  api.delete(`/usuario/direcciones/${id}`)
