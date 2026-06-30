import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { crearOrden } from '../api/ordenes'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

interface FormData {
  calleEnvio: string
  ciudadEnvio: string
  provinciaEnvio: string
  codigoPostalEnvio: string
}

export default function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { carrito, fetchCarrito } = useCartStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    fetchCarrito()
  }, [isAuthenticated])

  if (!carrito || carrito.items.length === 0) {
    navigate('/carrito')
    return null
  }

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const orden = await crearOrden(data)
      navigate(`/ordenes/${orden.id}`)
    } catch {
      setError('Error al procesar el pedido. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-bold text-lg mb-4">Dirección de envío</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calle y número *</label>
              <input {...register('calleEnvio', { required: 'Requerido' })} className="input-field" placeholder="Av. Principal 123" />
              {errors.calleEnvio && <p className="text-red-600 text-xs mt-1">{errors.calleEnvio.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
              <input {...register('ciudadEnvio', { required: 'Requerido' })} className="input-field" placeholder="Ciudad" />
              {errors.ciudadEnvio && <p className="text-red-600 text-xs mt-1">{errors.ciudadEnvio.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                <input {...register('provinciaEnvio')} className="input-field" placeholder="Provincia" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código postal</label>
                <input {...register('codigoPostalEnvio')} className="input-field" placeholder="EC010101" />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2 text-sm">Pago</h3>
              <p className="text-sm text-gray-600 mb-4">El pago se procesará de forma segura a través de PayPhone.</p>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 text-sm">
                💳 Integración PayPhone<br />
                <span className="text-xs">(configurar credenciales PayPhone para activar)</span>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-4">
              {isSubmitting ? 'Procesando...' : `Confirmar pedido - $${carrito.total.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-4">Resumen</h2>
          <div className="border rounded-lg overflow-hidden">
            {carrito.items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 border-b last:border-b-0">
                <img
                  src={item.productoImagen || 'https://placehold.co/60x80/f3f4f6/9ca3af'}
                  alt={item.productoNombre}
                  className="w-14 h-18 object-cover rounded"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.productoNombre}</p>
                  <p className="text-gray-500 text-xs">x{item.cantidad}{item.talla && ` · ${item.talla}`}</p>
                </div>
                <span className="text-sm font-bold">${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <div className="p-4 bg-gray-50">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-red-600">${carrito.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
