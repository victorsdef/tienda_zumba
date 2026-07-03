import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'

export default function CartDrawer() {
  const { carrito, isOpen, closeCart, actualizarItem, eliminarItem, fetchCarrito, getCarritoActivo } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) fetchCarrito()
  }, [isAuthenticated])

  const carritoActivo = getCarritoActivo(isAuthenticated)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Carrito ({carrito?.cantidadItems ?? 0})</h2>
          <button onClick={closeCart} className="p-2 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!carritoActivo || carritoActivo.items.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500">Tu carrito está vacío</p>
              <Link to="/catalogo" onClick={closeCart} className="inline-block mt-4 text-red-600 hover:underline text-sm">
                Explorar productos
              </Link>
            </div>
          ) : (
            carritoActivo.items.map(item => (
              <div key={item.id} className="flex gap-3 py-3 border-b last:border-b-0">
                <img
                  src={item.productoImagen || 'https://placehold.co/80x100/f3f4f6/9ca3af'}
                  alt={item.productoNombre}
                  className="w-20 h-24 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.productoNombre}</p>
                  {(item.talla || item.color) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.talla && `Talla: ${item.talla}`}
                      {item.talla && item.color && ' · '}
                      {item.color && `Color: ${item.color}`}
                    </p>
                  )}
                  <p className="text-sm font-bold text-red-600 mt-1">${item.precio.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => item.cantidad > 1 ? actualizarItem(item.id, item.cantidad - 1) : eliminarItem(item.id)}
                      className="w-6 h-6 border rounded flex items-center justify-center text-sm hover:border-gray-400"
                    >-</button>
                    <span className="text-sm w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarItem(item.id, item.cantidad + 1)}
                      className="w-6 h-6 border rounded flex items-center justify-center text-sm hover:border-gray-400"
                    >+</button>
                    <button onClick={() => eliminarItem(item.id)} className="ml-auto text-gray-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {carritoActivo && carritoActivo.items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${carritoActivo.total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={closeCart} className="btn-primary block text-center w-full">
              Proceder al pago
            </Link>
            <Link to="/carrito" onClick={closeCart} className="block text-center text-sm text-gray-600 hover:text-red-600">
              Ver carrito completo
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
