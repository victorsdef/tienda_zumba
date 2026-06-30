interface Props {
  tallas: string[]
  selected?: string
  onSelect: (t: string) => void
}

export default function SizeSelector({ tallas, selected, onSelect }: Props) {
  if (tallas.length === 0) return null
  return (
    <div>
      <p className="text-sm font-semibold mb-2">Talla: <span className="font-normal">{selected ?? 'Selecciona una talla'}</span></p>
      <div className="flex flex-wrap gap-2">
        {tallas.map(t => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`border-2 rounded px-3 py-1 text-sm font-medium transition-colors ${
              selected === t ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-gray-500'
            }`}
          >{t}</button>
        ))}
      </div>
    </div>
  )
}
