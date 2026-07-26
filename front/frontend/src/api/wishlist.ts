import api from './axios'

export interface WishlistProducto {
  id: number
  nombre: string
  precio: number
  precioOriginal?: number
  slug?: string
  imagenes?: string[]
}

export interface WishlistItem {
  id: number
  usuarioId: number
  productoId: number
  fechaAgregado: string
  producto?: WishlistProducto
}

export const getWishlist = (usuarioId: number) =>
  api.get<WishlistItem[]>(`/wishlist/${usuarioId}`).then(r => r.data)

export const toggleWishlist = (usuarioId: number, productoId: number) =>
  api.post<{ enWishlist: boolean }>(`/wishlist/toggle?usuarioId=${usuarioId}&productoId=${productoId}`).then(r => r.data)

export const checkWishlist = (usuarioId: number, productoId: number) =>
  api.get<{ enWishlist: boolean }>(`/wishlist/check?usuarioId=${usuarioId}&productoId=${productoId}`).then(r => r.data)
