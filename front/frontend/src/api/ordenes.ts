import api from './axios'
import type { Orden, Page } from '../types'

export const crearOrden = (data: {
  calleEnvio: string
  ciudadEnvio: string
  provinciaEnvio?: string
  codigoPostalEnvio?: string
}) => api.post<Orden>('/ordenes', data).then(r => r.data)

export const getMisOrdenes = (page = 0) =>
  api.get<Page<Orden>>(`/ordenes?page=${page}`).then(r => r.data)

export const getOrden = (id: number) =>
  api.get<Orden>(`/ordenes/${id}`).then(r => r.data)

export const getTodasOrdenes = (page = 0) =>
  api.get<Page<Orden>>(`/admin/ordenes?page=${page}`).then(r => r.data)

export const cambiarEstadoOrden = (id: number, estado: string) =>
  api.patch<Orden>(`/admin/ordenes/${id}/estado`, { estado }).then(r => r.data)
