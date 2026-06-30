import type { EstadoOrden } from '../../types'

const PASOS: EstadoOrden[] = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO']
const LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', PAGADO: 'Pagado', ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
}

interface Props {
  estado: EstadoOrden
}

export default function OrderStatus({ estado }: Props) {
  if (estado === 'CANCELADO') {
    return <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Cancelado</span>
  }

  const currentIdx = PASOS.indexOf(estado)

  return (
    <div className="flex items-center gap-2">
      {PASOS.map((paso, i) => (
        <div key={paso} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              i <= currentIdx ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < currentIdx ? '✓' : i + 1}
            </div>
            <span className="text-xs mt-1 text-gray-600 whitespace-nowrap">{LABELS[paso]}</span>
          </div>
          {i < PASOS.length - 1 && (
            <div className={`h-0.5 w-8 mb-4 ${i < currentIdx ? 'bg-red-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
