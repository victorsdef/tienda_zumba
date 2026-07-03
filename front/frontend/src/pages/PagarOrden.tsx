import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { prepararPago } from '../api/payphone'

export default function PagarOrden() {
  const [params] = useSearchParams()
  const ordenId = Number(params.get('ordenId'))
  const codigoOrden = params.get('codigoOrden')
  const total = Number(params.get('total'))
  const email = params.get('email') ?? undefined
  const celular = params.get('celular') ?? undefined
  const [error, setError] = useState<string | null>(null)
  const iniciadoRef = useRef(false)

  useEffect(() => {
    if (!ordenId || iniciadoRef.current) return
    iniciadoRef.current = true

    prepararPago({ ordenId, email, celular })
      .then(data => {
        window.location.assign(data.redirectUrl)
      })
      .catch(err => {
        const message = err.response?.data?.error ?? 'No se pudo iniciar el pago. Intentá de nuevo.'
        setError(message)
      })
  }, [ordenId, email, celular])

  if (!ordenId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Enlace de pago inválido.
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f0e8]">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-center">
          <p className="text-xl font-bold text-[#4a3728] mb-2">No se pudo iniciar el pago</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={() => window.close()} className="btn-outline text-sm">Cerrar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-center">
        <p className="text-2xl font-black text-[#4a3728]">sofia couture ec</p>
        <p className="text-sm text-gray-500 mt-1">
          {codigoOrden || `Pedido #${ordenId}`}{total ? ` · $${total.toFixed(2)}` : ''}
        </p>
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-8 h-8 border-4 border-[#7d5c48] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Redirigiendo a Payphone...</p>
        </div>
      </div>
    </div>
  )
}
