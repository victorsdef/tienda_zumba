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
            className={`border rounded-lg px-4 py-2 text-sm font-semibold min-w-[52px] transition-all shadow-sm ${
              selected === t
                ? 'border-[#4a3728] bg-[#4a3728] text-white shadow-md scale-[1.02]'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#7d5c48] hover:bg-[#faf7f2]'
            }`}
          >{t}</button>
        ))}
      </div>
    </div>
  )
}
