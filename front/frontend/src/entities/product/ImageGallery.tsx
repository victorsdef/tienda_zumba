import { useEffect, useState } from 'react'

interface Props {
  imagenes: string[]
  nombre: string
}

export default function ImageGallery({ imagenes, nombre }: Props) {
  const [selected, setSelected] = useState(0)
  const imgs = imagenes.length > 0 ? imagenes : ['https://placehold.co/600x750/f3f4f6/9ca3af?text=Sin+imagen']

  useEffect(() => {
    setSelected(0)
  }, [imagenes])

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-2 w-16">
        {imgs.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`border-2 rounded overflow-hidden ${i === selected ? 'border-red-600' : 'border-gray-200'}`}
          >
            <img src={img} alt={`${nombre} ${i + 1}`} className="w-full aspect-square object-cover" />
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={imgs[selected]}
          alt={nombre}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
        />
      </div>
    </div>
  )
}
