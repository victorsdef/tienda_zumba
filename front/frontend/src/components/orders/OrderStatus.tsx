import type { EstadoOrden } from '../../types'

const PASOS: EstadoOrden[] = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO']
const LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', PAGADO: 'Pagado', EN_PREPARACION: 'Preparando',
  ENVIADO: 'Enviado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
}
const PASO_COLOR: Record<EstadoOrden, string> = {
  PENDIENTE: 'bg-amber-500',
  PAGADO: 'bg-blue-500',
  EN_PREPARACION: 'bg-yellow-500',
  ENVIADO: 'bg-emerald-500',
  ENTREGADO: 'bg-green-600',
  CANCELADO: 'bg-red-600',
}
const PASO_TEXTO: Record<EstadoOrden, string> = {
  PENDIENTE: 'text-amber-700',
  PAGADO: 'text-blue-700',
  EN_PREPARACION: 'text-yellow-700',
  ENVIADO: 'text-emerald-700',
  ENTREGADO: 'text-green-700',
  CANCELADO: 'text-red-700',
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
              i <= currentIdx ? `${PASO_COLOR[paso]} text-white` : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${i <= currentIdx ? PASO_TEXTO[paso] : 'text-gray-500'}`}>{LABELS[paso]}</span>
          </div>
          {i < PASOS.length - 1 && (
            <div className={`h-0.5 w-8 mb-4 ${i < currentIdx ? PASO_COLOR[PASOS[i + 1]] : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
