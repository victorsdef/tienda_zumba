import api from './axios'
import type { Producto, Page, ProductoFilter } from '../types'

export const getProductos = (filter: ProductoFilter = {}) => {
  const params = new URLSearchParams()
  Object.entries(filter).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  })
  return api.get<Page<Producto>>(`/productos?${params}`).then(r => r.data)
}

export const getProducto = (id: number) =>
  api.get<Producto>(`/productos/${id}`).then(r => r.data)

export const getProductoPorSlug = (slug: string) =>
  api.get<Producto>(`/productos/slug/${slug}`).then(r => r.data)

export const crearProducto = (data: Partial<Producto>) =>
  api.post<Producto>('/admin/productos', data).then(r => r.data)

export const actualizarProducto = (id: number, data: Partial<Producto>) =>
  api.put<Producto>(`/admin/productos/${id}`, data).then(r => r.data)

export const eliminarProducto = (id: number) =>
  api.delete(`/admin/productos/${id}`)

export const getProductosTrending = (limit = 10) =>
  api.get<Producto[]>(`/productos/trending?limit=${limit}`).then(r => r.data)
