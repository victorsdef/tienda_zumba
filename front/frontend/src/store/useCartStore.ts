import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Carrito, GuestItem } from '../types'
import * as carritoApi from '../api/carrito'

interface CartState {
  // Carrito del servidor (usuarios autenticados)
  carrito: Carrito | null
  // Carrito local (invitados)
  guestItems: GuestItem[]
  isOpen: boolean
  loading: boolean

  fetchCarrito: () => Promise<void>
  agregarItem: (
    productoId: number,
    cantidad: number,
    talla?: string,
    color?: string,
    productoData?: { nombre: string; precio: number; imagen?: string }
  ) => Promise<void>
  actualizarItem: (productoId: number, cantidad: number) => Promise<void>
  eliminarItem: (productoId: number) => Promise<void>
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  reset: () => void
  clearGuest: () => void

  // Carrito unificado para mostrar (guest o server)
  getCarritoActivo: (isAuthenticated: boolean) => Carrito | null
}

function guestToCarrito(items: GuestItem[]): Carrito {
  return {
    id: 0,
    items: items.map(gi => ({
      id: gi.productoId,
      productoId: gi.productoId,
      productoNombre: gi.productoNombre,
      productoImagen: gi.productoImagen,
      precio: gi.precio,
      cantidad: gi.cantidad,
      talla: gi.talla,
      color: gi.color,
    })),
    total: items.reduce((sum, gi) => sum + gi.precio * gi.cantidad, 0),
    cantidadItems: items.reduce((sum, gi) => sum + gi.cantidad, 0),
  }
}

const isAuth = () => !!localStorage.getItem('accessToken')

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carrito: null,
      guestItems: [],
      isOpen: false,
      loading: false,

      getCarritoActivo: (authenticated) => {
        if (authenticated) return get().carrito
        const items = get().guestItems
        return items.length > 0 ? guestToCarrito(items) : null
      },

      fetchCarrito: async () => {
        try {
          const data = await carritoApi.getCarrito()
          set({ carrito: data })
        } catch {
          set({ carrito: null })
        }
      },

      agregarItem: async (productoId, cantidad, talla, color, productoData) => {
        set({ loading: true })
        try {
          if (isAuth()) {
            const data = await carritoApi.agregarItem(productoId, cantidad, talla, color)
            set({ carrito: data, isOpen: true })
          } else {
            if (!productoData) return
            set(state => {
              const existing = state.guestItems.find(i => i.productoId === productoId)
              let guestItems: GuestItem[]
              if (existing) {
                guestItems = state.guestItems.map(i =>
                  i.productoId === productoId
                    ? { ...i, cantidad: i.cantidad + cantidad, talla: talla ?? i.talla, color: color ?? i.color }
                    : i
                )
              } else {
                guestItems = [...state.guestItems, {
                  productoId,
                  productoNombre: productoData.nombre,
                  productoImagen: productoData.imagen,
                  precio: productoData.precio,
                  cantidad,
                  talla,
                  color,
                }]
              }
              return { guestItems, isOpen: true }
            })
          }
        } finally {
          set({ loading: false })
        }
      },

      actualizarItem: async (productoId, cantidad) => {
        if (isAuth()) {
          const data = await carritoApi.actualizarItem(productoId, cantidad)
          set({ carrito: data })
        } else {
          if (cantidad <= 0) {
            set(state => ({ guestItems: state.guestItems.filter(i => i.productoId !== productoId) }))
          } else {
            set(state => ({
              guestItems: state.guestItems.map(i =>
                i.productoId === productoId ? { ...i, cantidad } : i
              ),
            }))
          }
        }
      },

      eliminarItem: async (productoId) => {
        if (isAuth()) {
          const data = await carritoApi.eliminarItem(productoId)
          set({ carrito: data })
        } else {
          set(state => ({ guestItems: state.guestItems.filter(i => i.productoId !== productoId) }))
        }
      },

      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      reset: () => set({ carrito: null, isOpen: false }),
      clearGuest: () => set({ guestItems: [] }),
    }),
    {
      name: 'guest-cart',
      partialize: (state) => ({ guestItems: state.guestItems }),
    }
  )
)
