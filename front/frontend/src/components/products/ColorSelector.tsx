interface Props {
  colores: string[]
  selected?: string
  onSelect: (c: string) => void
}

export default function ColorSelector({ colores, selected, onSelect }: Props) {
  if (colores.length === 0) return null
  return (
    <div>
      <p className="text-sm font-semibold mb-2">Color: <span className="font-normal">{selected ?? 'Selecciona un color'}</span></p>
      <div className="flex flex-wrap gap-2">
        {colores.map(c => (
          <button
            key={c}
            title={c}
            onClick={() => onSelect(c)}
            className={`w-8 h-8 rounded-full border-4 transition-transform ${
              selected === c ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: c.startsWith('#') ? c : c }}
          />
        ))}
      </div>
    </div>
  )
}
