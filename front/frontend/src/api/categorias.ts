import api from './axios'
import type { Categoria } from '../types'

export const getCategorias = () =>
  api.get<Categoria[]>('/categorias').then(r => r.data)

export const getCategoriasAdmin = () =>
  api.get<Categoria[]>('/admin/categorias').then(r => r.data)

export const getCategoria = (id: number) =>
  api.get<Categoria>(`/categorias/${id}`).then(r => r.data)

export const crearCategoria = (data: Partial<Categoria>) =>
  api.post<Categoria>('/admin/categorias', data).then(r => r.data)

export const actualizarCategoria = (id: number, data: Partial<Categoria>) =>
  api.put<Categoria>(`/admin/categorias/${id}`, data).then(r => r.data)

export const toggleCategoria = (id: number) =>
  api.patch<Categoria>(`/admin/categorias/${id}/toggle`).then(r => r.data)

export const eliminarCategoria = (id: number) =>
  api.delete(`/admin/categorias/${id}`)
