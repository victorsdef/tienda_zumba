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
  stockPorColor: Record<string, number>
  onChange: (colores: string[]) => void
  onStockChange: (stockPorColor: Record<string, number>) => void
}

export default function ColoresSelector({ value, stockPorColor, onChange, onStockChange }: Props) {
  const [pickerColor, setPickerColor] = useState('#000000')

  const toggle = (hex: string) => {
    if (value.includes(hex)) {
      onChange(value.filter(c => c !== hex))
      const nuevo = { ...stockPorColor }
      delete nuevo[hex]
      onStockChange(nuevo)
    } else {
      onChange([...value, hex])
      onStockChange({ ...stockPorColor, [hex]: 0 })
    }
  }

  const addPicker = () => {
    if (!value.includes(pickerColor)) {
      onChange([...value, pickerColor])
      onStockChange({ ...stockPorColor, [pickerColor]: 0 })
    }
  }

  const setStock = (hex: string, stock: number) => {
    onStockChange({ ...stockPorColor, [hex]: Math.max(0, stock) })
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase">Colores y stock por color</label>

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
            <div key={hex} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: hex }} />
              <span className="text-[11px] font-mono text-gray-500 w-16">{hex}</span>
              <input
                type="number"
                min="0"
                value={stockPorColor[hex] ?? 0}
                onChange={e => setStock(hex, Number(e.target.value))}
                className="w-20 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-red-400"
                placeholder="Stock"
              />
              <span className="text-xs text-gray-400">unidades</span>
              <button type="button" onClick={() => toggle(hex)} className="ml-auto text-gray-300 hover:text-red-500 text-sm leading-none">×</button>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 flex justify-between text-xs text-gray-500">
            <span>Total stock</span>
            <span className="font-bold text-gray-700">
              {Object.values(stockPorColor).reduce((a, b) => a + b, 0)} unidades
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
