import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getConfiguracion } from '../../api/configuracion'

interface Props {
  precioBase: number        // el precio que el admin escribió en el campo PRECIO
  onChange: (precioFinal: number, precioOriginal: number | undefined) => void
  initialPrecioOriginal?: number
}

const COMISION_DEFAULT = 5.75

type Modo = 'ninguno' | 'porcentaje' | 'manual'

export default function PrecioDescuento({ precioBase, onChange, initialPrecioOriginal }: Props) {
  const [modo, setModo] = useState<Modo>(() => initialPrecioOriginal ? 'manual' : 'ninguno')
  const [pct, setPct] = useState<string>('')
  const [manualFinal, setManualFinal] = useState<string>('')

  const { data: config } = useQuery({ queryKey: ['configuracion'], queryFn: getConfiguracion, staleTime: 60_000 })
  const comisionPct = Number(config?.find(c => c.clave === 'comision_payphone')?.valor ?? COMISION_DEFAULT)

  // Sin descuento: precio final = precioBase
  // Con %: precio final = precioBase * (1 - pct/100), precioOriginal = precioBase
  // Manual: admin escribe precio final directamente, precioOriginal = precioBase

  useEffect(() => {
    if (modo === 'ninguno') {
      onChange(precioBase, undefined)
    } else if (modo === 'porcentaje' && pct) {
      const p = Number(pct)
      if (p > 0 && p < 100 && precioBase > 0) {
        const final = precioBase * (1 - p / 100)
        onChange(Math.round(final * 100) / 100, precioBase)
      }
    } else if (modo === 'manual' && manualFinal) {
      const f = Number(manualFinal)
      if (f > 0 && f < precioBase) {
        onChange(f, precioBase)
      }
    }
  }, [precioBase, pct, manualFinal, modo])

  const handleModo = (m: Modo) => {
    setModo(m)
    if (m === 'ninguno') { setPct(''); setManualFinal(''); onChange(precioBase, undefined) }
  }

  // Calcular valores para el preview
  const precioFinal = (() => {
    if (modo === 'ninguno') return null
    if (modo === 'porcentaje' && pct) {
      const p = Number(pct)
      if (p > 0 && p < 100 && precioBase > 0) return Math.round(precioBase * (1 - p / 100) * 100) / 100
    }
    if (modo === 'manual' && manualFinal) {
      const f = Number(manualFinal)
      if (f > 0 && f < precioBase) return f
    }
    return null
  })()

  const descuentoPct = precioFinal !== null && precioBase > 0
    ? Math.round((1 - precioFinal / precioBase) * 100)
    : null

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase">Descuento</label>

      <div className="flex gap-1.5">
        {([
          { value: 'ninguno',    label: 'Sin descuento' },
          { value: 'porcentaje', label: '% Descuento'   },
          { value: 'manual',     label: 'Precio final'  },
        ] as { value: Modo; label: string }[]).map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleModo(opt.value)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              modo === opt.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {modo === 'porcentaje' && (
        <div className="flex items-center gap-3">
          <div className="relative w-36">
            <input
              type="number" min="1" max="99"
              value={pct}
              onChange={e => setPct(e.target.value)}
              className="input-field pr-8"
              placeholder="Ej: 50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
          </div>
          {precioFinal !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 line-through">${precioBase.toFixed(2)}</span>
              <span className="text-white bg-red-500 font-bold px-2 py-0.5 rounded text-xs">-{descuentoPct}%</span>
              <span className="text-xs text-gray-500">cliente paga: <strong className="text-gray-800">${precioFinal.toFixed(2)}</strong></span>
            </div>
          )}
          {pct && (Number(pct) <= 0 || Number(pct) >= 100) && (
            <p className="text-xs text-red-500">El % debe estar entre 1 y 99</p>
          )}
        </div>
      )}

      {modo === 'manual' && (
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Precio final que pagará el cliente</p>
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number" step="0.01" min="0"
                value={manualFinal}
                onChange={e => setManualFinal(e.target.value)}
                className="input-field pl-7"
                placeholder="Ej: 75.00"
              />
            </div>
          </div>
          {precioFinal !== null && (
            <div className="flex items-center gap-2 text-sm mt-5">
              <span className="text-gray-400 line-through">${precioBase.toFixed(2)}</span>
              <span className="text-white bg-red-500 font-bold px-2 py-0.5 rounded text-xs">-{descuentoPct}%</span>
            </div>
          )}
          {manualFinal && Number(manualFinal) >= precioBase && precioBase > 0 && (
            <p className="text-xs text-red-500 mt-5">Debe ser menor al precio base (${precioBase})</p>
          )}
        </div>
      )}

      {/* Preview final */}
      {precioFinal !== null && descuentoPct !== null && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-xs text-gray-500">Así se verá en la tienda:</span>
          <span className="text-gray-400 line-through text-sm">${precioBase.toFixed(2)}</span>
          <span className="text-red-500 font-bold text-sm">${precioFinal.toFixed(2)}</span>
          <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">-{descuentoPct}%</span>
        </div>
      )}

      {/* Comisión Payphone */}
      {(() => {
        const precioParaCalculo = precioFinal ?? (precioBase > 0 ? precioBase : null)
        if (!precioParaCalculo) return null
        const comisionMonto = precioParaCalculo * (comisionPct / 100)
        const recibes = precioParaCalculo - comisionMonto
        return (
          <div className="flex items-center gap-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <span className="text-amber-700">💳 Payphone cobra {comisionPct}%</span>
            <span className="text-amber-600">− ${comisionMonto.toFixed(2)}</span>
            <span className="ml-auto font-bold text-green-700">Recibirás: ${recibes.toFixed(2)}</span>
          </div>
        )
      })()}
    </div>
  )
}
