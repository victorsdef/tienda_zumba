const NOMBRES_COLOR: Record<string, string> = {
  '#000000': 'Negro',
  '#ffffff': 'Blanco',
  '#9ca3af': 'Gris',
  '#808080': 'Gris',
  '#ff0000': 'Rojo',
  '#ef4444': 'Rojo',
  '#ffc0cb': 'Rosa',
  '#f9a8d4': 'Rosa',
  '#ff69b4': 'Rosa fuerte',
  '#ec4899': 'Fucsia',
  '#f97316': 'Naranja',
  '#facc15': 'Amarillo',
  '#eab308': 'Amarillo',
  '#22c55e': 'Verde',
  '#3b82f6': 'Azul',
  '#1e3a5f': 'Marino',
  '#a855f7': 'Morado',
  '#8b5cf6': 'Morado',
  '#92400e': 'Café',
  '#d4b896': 'Beige',
  '#d4a96a': 'Beige',
  '#fef3c7': 'Crema',
  '#fef9c3': 'Crema',
}

function nombreColor(hex: string) {
  return NOMBRES_COLOR[hex.toLowerCase()] ?? NOMBRES_COLOR[hex] ?? 'Color'
}

interface Props {
  colores: string[]
  selected?: string
  onSelect: (c: string) => void
  /** Si se pasa, solo estos colores son seleccionables; el resto aparece opaco y sin stock */
  coloresDisponibles?: string[]
}

export default function ColorSelector({ colores, selected, onSelect, coloresDisponibles }: Props) {
  if (colores.length === 0) return null

  const hayFiltro = coloresDisponibles !== undefined

  return (
    <div>
      <p className="text-sm font-semibold mb-2">
        Color:{' '}
        <span className="font-normal text-gray-600">
          {selected ? nombreColor(selected) : 'Selecciona un color'}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {colores.map(c => {
          const disponible = !hayFiltro || coloresDisponibles!.includes(c)
          const seleccionado = selected === c

          return (
            <button
              key={c}
              title={disponible ? nombreColor(c) : `${nombreColor(c)} — sin stock en esta talla`}
              onClick={() => disponible && onSelect(c)}
              disabled={!disponible}
              className={`relative w-8 h-8 rounded-full border-4 transition-all ${
                seleccionado
                  ? 'border-black scale-110'
                  : disponible
                  ? 'border-gray-200 hover:border-gray-400'
                  : 'border-gray-100 opacity-30 cursor-not-allowed'
              }`}
              style={{ backgroundColor: c }}
            >
              {/* Línea diagonal cuando no hay stock */}
              {!disponible && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 32 32" className="w-full h-full absolute inset-0 rounded-full overflow-hidden">
                    <line x1="6" y1="6" x2="26" y2="26" stroke="rgba(100,100,100,0.6)" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Aviso cuando la talla filtra colores */}
      {hayFiltro && coloresDisponibles!.length < colores.length && (
        <p className="mt-2 text-xs text-gray-400">
          Los colores opacos no tienen stock en la talla seleccionada.
        </p>
      )}
    </div>
  )
}
