import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrden } from '../api/ordenes'
import OrderStatus from '../components/orders/OrderStatus'

export default function DetalleOrden() {
  const { id } = useParams<{ id: string }>()
  const { data: orden, isLoading } = useQuery({
    queryKey: ['orden', id],
    queryFn: () => getOrden(Number(id)),
  })

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8 text-center">Cargando...</div>
  if (!orden) return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">Orden no encontrada</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/ordenes" className="text-red-600 hover:underline text-sm">← Mis órdenes</Link>
        <h1 className="text-2xl font-bold">Orden #{orden.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-4">
            <h2 className="font-bold mb-4">Estado del pedido</h2>
            <OrderStatus estado={orden.estado} />
            <p className="text-sm text-gray-500 mt-4">
              Fecha: {new Date(orden.fechaCreacion).toLocaleString('es-ES')}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-bold mb-4">Dirección de envío</h2>
            <p className="text-sm">{orden.calleEnvio}</p>
            <p className="text-sm text-gray-600">{orden.ciudadEnvio}{orden.provinciaEnvio && `, ${orden.provinciaEnvio}`} {orden.codigoPostalEnvio}</p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <h2 className="font-bold p-4 border-b">Artículos</h2>
            {orden.items.map(item => (
              <div key={item.id} className="flex gap-3 p-4 border-b last:border-b-0">
                <img
                  src={item.productoImagen || 'https://placehold.co/70x90/f3f4f6/9ca3af'}
                  alt={item.nombreProducto}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.nombreProducto}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.talla && `Talla: ${item.talla}`}
                    {item.talla && item.color && ' · '}
                    {item.color && `Color: ${item.color}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">x{item.cantidad}</p>
                </div>
                <span className="font-bold text-sm">${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="font-bold mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${orden.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Envío</span><span className="text-green-600">Gratis</span></div>
              <hr />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-red-600">${orden.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
