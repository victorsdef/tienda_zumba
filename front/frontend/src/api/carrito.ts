import api from './axios'
import type { Carrito } from '../types'

export const getCarrito = () =>
  api.get<Carrito>('/carrito').then(r => r.data)

export const agregarItem = (productoId: number, cantidad: number, talla?: string, color?: string) =>
  api.post<Carrito>('/carrito/items', { productoId, cantidad, talla, color }).then(r => r.data)

export const actualizarItem = (itemId: number, cantidad: number) =>
  api.put<Carrito>(`/carrito/items/${itemId}`, { cantidad }).then(r => r.data)

export const eliminarItem = (itemId: number) =>
  api.delete<Carrito>(`/carrito/items/${itemId}`).then(r => r.data)
