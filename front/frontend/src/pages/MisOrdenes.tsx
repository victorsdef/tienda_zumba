import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMisOrdenes } from '../api/ordenes'
import { useAuthStore } from '../store/useAuthStore'
import OrderStatus from '../components/orders/OrderStatus'

export default function MisOrdenes() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated) { navigate('/login'); return null }

  const { data, isLoading } = useQuery({ queryKey: ['mis-ordenes'], queryFn: () => getMisOrdenes() })

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8 text-center">Cargando...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Mis órdenes</h1>

      {!data?.content.length ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No tienes órdenes aún</p>
          <Link to="/catalogo" className="btn-primary">Empezar a comprar</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.content.map(orden => (
            <Link key={orden.id} to={`/ordenes/${orden.id}`} className="block border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold">Orden #{orden.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(orden.fechaCreacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-red-600 font-bold text-lg">${orden.total.toFixed(2)}</span>
              </div>
              <OrderStatus estado={orden.estado} />
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {orden.items.slice(0, 5).map(item => (
                  <img
                    key={item.id}
                    src={item.productoImagen || 'https://placehold.co/60x75/f3f4f6/9ca3af'}
                    alt={item.nombreProducto}
                    className="w-14 h-18 object-cover rounded flex-shrink-0"
                  />
                ))}
                {orden.items.length > 5 && (
                  <div className="w-14 h-18 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                    +{orden.items.length - 5}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
