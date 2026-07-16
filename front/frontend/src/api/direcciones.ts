import api from './axios'
import type { Direccion } from '../types'

export type DireccionRequest = {
  nombreCompleto: string
  cedula?: string
  celular: string
  provincia: string
  canton: string
  ciudad: string
  direccion: string
  predeterminada?: boolean
}

export const getDirecciones = () =>
  api.get<Direccion[]>('/usuario/direcciones').then(r => r.data)

export const crearDireccion = (data: DireccionRequest) =>
  api.post<Direccion>('/usuario/direcciones', data).then(r => r.data)

export const actualizarDireccion = (id: number, data: DireccionRequest) =>
  api.put<Direccion>(`/usuario/direcciones/${id}`, data).then(r => r.data)

export const eliminarDireccion = (id: number) =>
  api.delete(`/usuario/direcciones/${id}`)

export const setPredeterminada = (id: number) =>
  api.patch<Direccion>(`/usuario/direcciones/${id}/predeterminada`).then(r => r.data)
