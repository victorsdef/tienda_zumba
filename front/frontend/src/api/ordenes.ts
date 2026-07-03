import api from './axios'
import type { Orden, Page } from '../types'

export const crearOrden = (data: {
  direccionId?: number
  nombreEnvio?: string
  celularEnvio?: string
  provinciaEnvio?: string
  cantonEnvio?: string
  ciudadEnvio?: string
  calleEnvio?: string
  conEnvio: boolean
}) => api.post<Orden>('/ordenes', data).then(r => r.data)

export const crearOrdenInvitado = (data: {
  nombre: string
  email: string
  nombreCompleto?: string
  celular?: string
  provincia?: string
  canton?: string
  ciudad?: string
  direccion?: string
  conEnvio: boolean
  items: { productoId: number; cantidad: number; talla?: string; color?: string }[]
}) => api.post<Orden>('/ordenes/invitado', data).then(r => r.data)

export const getMisOrdenes = (page = 0) =>
  api.get<Page<Orden>>(`/ordenes?page=${page}`).then(r => r.data)

export const getOrden = (id: number) =>
  api.get<Orden>(`/ordenes/${id}`).then(r => r.data)

export const getOrdenPorCodigo = (codigoOrden: string) =>
  api.get<Orden>(`/ordenes/codigo/${encodeURIComponent(codigoOrden)}`).then(r => r.data)

export const descargarPedidoPdf = (codigoOrden: string) =>
  api.get(`/ordenes/codigo/${encodeURIComponent(codigoOrden)}/pdf`, { responseType: 'blob' }).then(r => r.data as Blob)

export const getTodasOrdenes = (page = 0) =>
  api.get<Page<Orden>>(`/admin/ordenes?page=${page}`).then(r => r.data)

export const cambiarEstadoOrden = (id: number, estado: string, numeroGuia?: string) =>
  api.patch<Orden>(`/admin/ordenes/${id}/estado`, { estado, numeroGuia }).then(r => r.data)

export const actualizarGuiaOrden = (id: number, data: { numeroGuia?: string; guiaImagenUrl?: string }) =>
  api.patch<Orden>(`/admin/ordenes/${id}/guia`, data).then(r => r.data)

export const cancelarOrden = (id: number) =>
  api.post<Orden>(`/ordenes/${id}/cancelar`).then(r => r.data)
