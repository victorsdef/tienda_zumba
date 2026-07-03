import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

export default function CarritoPage() {
  const { fetchCarrito, actualizarItem, eliminarItem, getCarritoActivo } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) fetchCarrito()
  }, [isAuthenticated])

  const carrito = getCarritoActivo(isAuthenticated)

  if (!carrito || carrito.items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p className="text-2xl font-bold mb-2">Tu carrito está vacío</p>
      <p className="text-gray-500 mb-6">Agrega productos para continuar</p>
      <Link to="/catalogo" className="btn-primary">Explorar productos</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Mi carrito ({carrito.cantidadItems} artículos)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {carrito.items.map(item => (
            <div key={item.id} className="flex gap-4 border rounded-lg p-4">
              <img
                src={item.productoImagen || 'https://placehold.co/100x130/f3f4f6/9ca3af'}
                alt={item.productoNombre}
                className="w-24 h-32 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium mb-1">{item.productoNombre}</h3>
                {(item.talla || item.color) && (
                  <p className="text-sm text-gray-500 mb-2">
                    {item.talla && `Talla: ${item.talla}`}
                    {item.talla && item.color && '  ·  '}
                    {item.color && `Color: ${item.color}`}
                  </p>
                )}
                <p className="text-red-600 font-bold">${item.precio.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex border border-gray-300 rounded">
                    <button
                      onClick={() => item.cantidad > 1 ? actualizarItem(item.id, item.cantidad - 1) : eliminarItem(item.id)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >-</button>
                    <span className="px-3 py-1 border-x border-gray-300">{item.cantidad}</span>
                    <button onClick={() => actualizarItem(item.id, item.cantidad + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => eliminarItem(item.id)} className="text-sm text-red-600 hover:underline">Eliminar</button>
                </div>
              </div>
              <div className="text-right font-bold">${(item.precio * item.cantidad).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 h-fit">
          <h2 className="text-lg font-bold mb-4">Resumen del pedido</h2>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>${carrito.total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span className="text-green-600">Gratis</span></div>
            <hr />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${carrito.total.toFixed(2)}</span></div>
          </div>
          <Link to="/checkout" className="btn-primary block text-center">Proceder al pago</Link>
        </div>
      </div>
    </div>
  )
}
