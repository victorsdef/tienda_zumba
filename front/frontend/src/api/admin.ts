import api from './axios'
import type { Page, Producto, Orden, EstadoOrden } from '../types'

export interface DashboardStats {
  totalProductos: number
  totalCategorias: number
  totalClientes: number
  totalOrdenes: number
  ventasTotales: number
  ventasHoy: number
  ventasSemana: number
  ventasMes: number
  ordenesHoy: number
  ordenesSemana: number
  ordenesMes: number
  ordenesPorEstado: Record<string, number>
  productosStockBajo: { id: number; nombre: string; stock: number }[]
  topProductos: { id: number; nombre: string; unidadesVendidas: number; ingresos: number }[]
}

export const getDashboard = () =>
  api.get<DashboardStats>('/admin/dashboard').then(r => r.data)

export const getProductosAdmin = (page = 0, size = 20) =>
  api.get<Page<Producto>>(`/admin/productos?page=${page}&size=${size}`).then(r => r.data)

export const toggleActivo = (id: number) =>
  api.patch<Producto>(`/admin/productos/${id}/toggle`).then(r => r.data)

export const actualizarStock = (id: number, stock: number) =>
  api.patch<Producto>(`/admin/productos/${id}/stock`, { stock }).then(r => r.data)

export const getOrdenesAdmin = (page = 0, estado?: string) => {
  const params = new URLSearchParams({ page: String(page) })
  if (estado) params.set('estado', estado)
  return api.get<Page<Orden>>(`/admin/ordenes?${params}`).then(r => r.data)
}

export const getUsuariosAdmin = (page = 0) =>
  api.get(`/admin/usuarios?page=${page}`).then(r => r.data)

export const cambiarRolUsuario = (id: number, rol: string) =>
  api.patch(`/admin/usuarios/${id}/rol`, { rol }).then(r => r.data)
