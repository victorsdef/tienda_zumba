import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { confirmarPago } from '../api/payphone'
import type { Orden } from '../types'
import { IconAlertTriangle, IconShield, IconX } from '@shared/Icon'

type Estado = 'cargando' | 'aprobado' | 'rechazado' | 'error'

function codigoVisible(orden: Orden) {
  return orden.codigoOrden || `#${orden.id}`
}

export default function PagoConfirmado() {
  const [params] = useSearchParams()
  const [estado, setEstado] = useState<Estado>('cargando')
  const [orden, setOrden] = useState<Orden | null>(null)

  useEffect(() => {
    const id = params.get('id')
    const clientTransactionId = params.get('clientTransactionId')

    if (!id || !clientTransactionId) {
      setEstado('error')
      return
    }

    let cancelado = false
    const timeoutId = window.setTimeout(() => {
      if (!cancelado) setEstado('error')
    }, 15000)

    confirmarPago(id, clientTransactionId)
      .then(o => {
        if (cancelado) return
        window.clearTimeout(timeoutId)
        setOrden(o)
        setEstado(o.estado === 'PAGADO' ? 'aprobado' : 'rechazado')
      })
      .catch(() => {
        if (cancelado) return
        window.clearTimeout(timeoutId)
        setEstado('error')
      })

    return () => {
      cancelado = true
      window.clearTimeout(timeoutId)
    }
  }, [])

  if (estado === 'cargando') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-12 h-12 border-4 border-[#7d5c48] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#7d5c48] font-medium">Confirmando tu pago con Payphone...</p>
        <p className="text-xs text-gray-400">Esto tarda unos segundos</p>
      </div>
    )
  }

  if (estado === 'aprobado' && orden) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-700">
          <IconShield size={30} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#4a3728]">¡Pago aprobado!</h1>
          <p className="text-gray-500 mt-1 text-sm">Tu pedido {codigoVisible(orden)} fue confirmado exitosamente.</p>
        </div>

        <div className="bg-[#f5f0e8] border border-[#ddd8d0] rounded-lg p-4 w-full text-sm text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Total pagado</span>
            <span className="font-bold text-[#4a3728]">${Number(orden.total).toFixed(2)}</span>
          </div>
          {orden.marcaTarjeta && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tarjeta</span>
              <span>{orden.marcaTarjeta}</span>
            </div>
          )}
          {orden.codigoAutorizacion && (
            <div className="flex justify-between">
              <span className="text-gray-500">Autorización</span>
              <span className="font-mono text-xs">{orden.codigoAutorizacion}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to={`/ordenes/${orden.codigoOrden || orden.id}`} className="btn-primary flex-1 text-center">
            Ver mi pedido
          </Link>
          <Link to="/catalogo" className="btn-outline flex-1 text-center">
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  if (estado === 'rechazado') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-700">
          <IconX size={30} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pago no aprobado</h1>
          <p className="text-gray-500 mt-1 text-sm">La tarjeta fue rechazada o cancelaste el pago.</p>
        </div>
        {orden && (
          <p className="text-xs text-gray-400">Pedido {codigoVisible(orden)} — podés intentar pagar nuevamente</p>
        )}
        <div className="flex gap-3">
          <Link to="/checkout" className="btn-primary">Intentar de nuevo</Link>
          <Link to="/" className="btn-outline">Ir al inicio</Link>
        </div>
      </div>
    )
  }

  // error
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
        <IconAlertTriangle size={30} />
      </div>
      <h1 className="text-xl font-bold text-gray-900">Algo salió mal</h1>
      <p className="text-gray-500 text-sm">No pudimos confirmar tu pago automáticamente. Si el cobro sí se realizó, recargá esta página o revisá tu pedido.</p>
      <Link to="/" className="btn-primary">Volver al inicio</Link>
    </div>
  )
}
