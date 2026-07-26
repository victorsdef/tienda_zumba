import { useState } from 'react'

interface Props {
  imagenes: string[]
  nombre: string
}

function SinImagen({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-[#f5ede6] text-[#c4a882] gap-2 ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </svg>
      <span className="text-xs font-medium opacity-60">Sin imagen</span>
    </div>
  )
}

export default function ImageGallery({ imagenes, nombre }: Props) {
  const [selected, setSelected] = useState(0)
  const sinImagen = imagenes.length === 0

  return (
    <div className="flex gap-3">
      {!sinImagen && (
        <div className="flex flex-col gap-2 w-16">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`border-2 rounded overflow-hidden ${i === selected ? 'border-red-600' : 'border-gray-200'}`}
            >
              <img src={img} alt={`${nombre} ${i + 1}`} className="w-full aspect-square object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-hidden rounded-lg bg-gray-100">
        {sinImagen ? (
          <SinImagen className="w-full h-full min-h-[320px]" />
        ) : (
          <img
            src={imagenes[selected]}
            alt={nombre}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
          />
        )}
      </div>
    </div>
  )
}
