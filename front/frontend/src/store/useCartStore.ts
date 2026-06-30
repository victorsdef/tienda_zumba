import { create } from 'zustand'
import type { Carrito, ItemCarrito } from '../types'
import * as carritoApi from '../api/carrito'

interface CartState {
  carrito: Carrito | null
  isOpen: boolean
  loading: boolean
  fetchCarrito: () => Promise<void>
  agregarItem: (productoId: number, cantidad: number, talla?: string, color?: string) => Promise<void>
  actualizarItem: (itemId: number, cantidad: number) => Promise<void>
  eliminarItem: (itemId: number) => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  reset: () => void
}

export const useCartStore = create<CartState>((set) => ({
  carrito: null,
  isOpen: false,
  loading: false,

  fetchCarrito: async () => {
    try {
      const data = await carritoApi.getCarrito()
      set({ carrito: data })
    } catch {
      set({ carrito: null })
    }
  },

  agregarItem: async (productoId, cantidad, talla, color) => {
    set({ loading: true })
    try {
      const data = await carritoApi.agregarItem(productoId, cantidad, talla, color)
      set({ carrito: data, isOpen: true })
    } finally {
      set({ loading: false })
    }
  },

  actualizarItem: async (itemId, cantidad) => {
    const data = await carritoApi.actualizarItem(itemId, cantidad)
    set({ carrito: data })
  },

  eliminarItem: async (itemId) => {
    const data = await carritoApi.eliminarItem(itemId)
    set({ carrito: data })
  },

  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  reset: () => set({ carrito: null, isOpen: false }),
}))
