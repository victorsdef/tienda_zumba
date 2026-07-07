import { useState } from 'react'

const COLORES_COMUNES = [
  { nombre: 'Negro',    hex: '#000000' },
  { nombre: 'Blanco',   hex: '#FFFFFF' },
  { nombre: 'Gris',     hex: '#9CA3AF' },
  { nombre: 'Rojo',     hex: '#EF4444' },
  { nombre: 'Rosa',     hex: '#F9A8D4' },
  { nombre: 'Fucsia',   hex: '#EC4899' },
  { nombre: 'Naranja',  hex: '#F97316' },
  { nombre: 'Amarillo', hex: '#FACC15' },
  { nombre: 'Verde',    hex: '#22C55E' },
  { nombre: 'Azul',     hex: '#3B82F6' },
  { nombre: 'Marino',   hex: '#1E3A5F' },
  { nombre: 'Morado',   hex: '#A855F7' },
  { nombre: 'Café',     hex: '#92400E' },
  { nombre: 'Beige',    hex: '#D4B896' },
  { nombre: 'Crema',    hex: '#FEF3C7' },
]

interface Props {
  value: string[]
  tallas?: string[]
  stockPorColor: Record<string, number>
  stockPorColorTalla?: Record<string, Record<string, number>>
  onChange: (colores: string[]) => void
  onStockChange: (stockPorColor: Record<string, number>) => void
  onStockMatrixChange?: (stockPorColorTalla: Record<string, Record<string, number>>) => void
}

function getColorLabel(hex: string) {
  return COLORES_COMUNES.find(c => c.hex.toLowerCase() === hex.toLowerCase())?.nombre ?? hex.toUpperCase()
}

function sumStockMap(map: Record<string, number>) {
  return Object.values(map).reduce((a, b) => a + b, 0)
}

function sumStockMatrix(matrix: Record<string, Record<string, number>>) {
  return Object.values(matrix).reduce((acc, tallas) => acc + sumStockMap(tallas), 0)
}

export default function ColoresSelector({
  value,
  tallas = [],
  stockPorColor,
  stockPorColorTalla = {},
  onChange,
  onStockChange,
  onStockMatrixChange,
}: Props) {
  const [pickerColor, setPickerColor] = useState('#000000')
  const usaStockPorTalla = tallas.length > 0 && !!onStockMatrixChange

  const ensureColorMatrix = (hex: string) => {
    if (!onStockMatrixChange) return
    const actual = stockPorColorTalla[hex] ?? {}
    const next = { ...stockPorColorTalla, [hex]: { ...actual } }
    tallas.forEach(talla => {
      next[hex][talla] = Math.max(0, next[hex][talla] ?? 0)
    })
    onStockMatrixChange(next)
    onStockChange({
      ...stockPorColor,
      [hex]: sumStockMap(next[hex]),
    })
  }

  const toggle = (hex: string) => {
    if (value.includes(hex)) {
      onChange(value.filter(c => c !== hex))
      const nuevo = { ...stockPorColor }
      delete nuevo[hex]
      onStockChange(nuevo)
      if (onStockMatrixChange) {
        const nuevoMatrix = { ...stockPorColorTalla }
        delete nuevoMatrix[hex]
        onStockMatrixChange(nuevoMatrix)
      }
    } else {
      onChange([...value, hex])
      onStockChange({ ...stockPorColor, [hex]: 0 })
      if (usaStockPorTalla) {
        ensureColorMatrix(hex)
      }
    }
  }

  const addPicker = () => {
    if (!value.includes(pickerColor)) {
      onChange([...value, pickerColor])
      onStockChange({ ...stockPorColor, [pickerColor]: 0 })
      if (usaStockPorTalla) {
        ensureColorMatrix(pickerColor)
      }
    }
  }

  const setStock = (hex: string, stock: number) => {
    onStockChange({ ...stockPorColor, [hex]: Math.max(0, stock) })
  }

  const setStockTalla = (hex: string, talla: string, stock: number) => {
    if (!onStockMatrixChange) return
    const next = {
      ...stockPorColorTalla,
      [hex]: {
        ...(stockPorColorTalla[hex] ?? {}),
        [talla]: Math.max(0, stock),
      },
    }
    onStockMatrixChange(next)
    onStockChange({
      ...stockPorColor,
      [hex]: sumStockMap(next[hex]),
    })
  }

  const totalStock = usaStockPorTalla ? sumStockMatrix(stockPorColorTalla) : sumStockMap(stockPorColor)

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase">Colores y stock por color</label>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        {tallas.length > 0
          ? 'Define cuántas unidades tienes por cada color y por cada talla. Ejemplo: rosa -> S: 5, M: 12.'
          : 'Agrega colores para definir el stock por color. Si luego eliges tallas, esas tallas aplicarán a cada color.'}
      </div>

      {/* Paleta predefinida */}
      <div className="flex flex-wrap gap-2">
        {COLORES_COMUNES.map(c => (
          <button
            key={c.hex}
            type="button"
            title={c.nombre}
            onClick={() => toggle(c.hex)}
            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
              value.includes(c.hex) ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1' : 'border-gray-300'
            } ${c.hex === '#FFFFFF' ? 'shadow-sm' : ''}`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      {/* Color picker personalizado */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={pickerColor}
          onChange={e => setPickerColor(e.target.value)}
          className="w-9 h-9 rounded border border-gray-200 cursor-pointer p-0.5"
        />
        <span className="text-xs text-gray-500 font-mono">{pickerColor}</span>
        <button type="button" onClick={addPicker}
          className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600">
          + Agregar color
        </button>
      </div>

      {/* Seleccionados con stock */}
      {value.length > 0 && (
        <div className="space-y-2 p-3 bg-gray-50 rounded border">
          <p className="text-[11px] text-gray-400 uppercase font-semibold">Stock por color</p>
          {value.map(hex => (
            <div key={hex} className="rounded-lg border border-gray-200 bg-white px-3 py-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: hex }} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">{getColorLabel(hex)}</p>
                  <p className="text-[11px] font-mono text-gray-400">{hex.toUpperCase()}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {!usaStockPorTalla && (
                    <>
                      <input
                        type="number"
                        min="0"
                        value={stockPorColor[hex] ?? 0}
                        onChange={e => setStock(hex, Number(e.target.value))}
                        className="w-20 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-red-400"
                        placeholder="Stock"
                      />
                      <span className="text-xs text-gray-400">unidades</span>
                    </>
                  )}
                  {usaStockPorTalla && (
                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      Total: {sumStockMap(stockPorColorTalla[hex] ?? {})}
                    </div>
                  )}
                  <button type="button" onClick={() => toggle(hex)} className="text-gray-300 hover:text-red-500 text-sm leading-none">×</button>
                </div>
              </div>
              {tallas.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Tallas para este color
                  </p>
                  {!usaStockPorTalla ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tallas.map(talla => (
                        <span key={`${hex}-${talla}`} className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                          {talla}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {tallas.map(talla => (
                        <label
                          key={`${hex}-${talla}`}
                          className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2"
                        >
                          <span className="text-xs font-semibold text-gray-700">{talla}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={stockPorColorTalla[hex]?.[talla] ?? 0}
                              onChange={e => setStockTalla(hex, talla, Number(e.target.value))}
                              className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-center text-xs focus:outline-none focus:border-red-400"
                            />
                            <span className="text-[11px] text-gray-400">uds</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 flex justify-between text-xs text-gray-500">
            <span>Total stock</span>
            <span className="font-bold text-gray-700">
              {totalStock} unidades
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
