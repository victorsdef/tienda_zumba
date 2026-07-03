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
  api.get<Direccion[]>('/direcciones').then(r => r.data)

export const crearDireccion = (data: DireccionRequest) =>
  api.post<Direccion>('/direcciones', data).then(r => r.data)

export const actualizarDireccion = (id: number, data: DireccionRequest) =>
  api.put<Direccion>(`/direcciones/${id}`, data).then(r => r.data)

export const eliminarDireccion = (id: number) =>
  api.delete(`/direcciones/${id}`)

export const setPredeterminada = (id: number) =>
  api.patch<Direccion>(`/direcciones/${id}/predeterminada`).then(r => r.data)
