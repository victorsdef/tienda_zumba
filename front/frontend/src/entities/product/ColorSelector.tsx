// Mapa de colores conocidos para mostrar nombre en lugar del hex
const NOMBRES_COLOR: Record<string, string> = {
  '#000000': 'Negro',
  '#ffffff': 'Blanco',
  '#808080': 'Gris',
  '#ff0000': 'Rojo',
  '#ffc0cb': 'Rosa',
  '#ff69b4': 'Rosa fuerte',
  '#ec4899': 'Rosa',
  '#f97316': 'Naranja',
  '#eab308': 'Amarillo',
  '#22c55e': 'Verde',
  '#3b82f6': 'Azul',
  '#1e3a5f': 'Azul marino',
  '#8b5cf6': 'Morado',
  '#92400e': 'Café',
  '#d4a96a': 'Beige',
  '#fef9c3': 'Crema',
}

function nombreColor(hex: string) {
  return NOMBRES_COLOR[hex.toLowerCase()] ?? 'Color seleccionado'
}

interface Props {
  colores: string[]
  selected?: string
  onSelect: (c: string) => void
}

export default function ColorSelector({ colores, selected, onSelect }: Props) {
  if (colores.length === 0) return null
  return (
    <div>
      <p className="text-sm font-semibold mb-2">
        Color:{' '}
        <span className="font-normal text-gray-600">
          {selected ? nombreColor(selected) : 'Selecciona un color'}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {colores.map(c => (
          <button
            key={c}
            title={nombreColor(c)}
            onClick={() => onSelect(c)}
            className={`w-8 h-8 rounded-full border-4 transition-transform ${
              selected === c ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )
}
