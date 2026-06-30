import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCategorias } from '../../api/categorias'
import type { ProductoFilter } from '../../types'

interface Props {
  filter: ProductoFilter
  onChange: (f: ProductoFilter) => void
}

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42']
const COLORES = [
  { label: 'Negro', hex: '#000000' }, { label: 'Blanco', hex: '#FFFFFF' },
  { label: 'Rojo', hex: '#ef4444' }, { label: 'Azul', hex: '#3b82f6' },
  { label: 'Verde', hex: '#22c55e' }, { label: 'Rosa', hex: '#ec4899' },
  { label: 'Amarillo', hex: '#eab308' }, { label: 'Gris', hex: '#9ca3af' },
  { label: 'Naranja', hex: '#f97316' }, { label: 'Morado', hex: '#a855f7' },
]

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-100">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-800 hover:text-red-500">
        {title}
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

export default function FilterSidebar({ filter, onChange }: Props) {
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const [precioMin, setPrecioMin] = useState(filter.precioMin?.toString() ?? '')
  const [precioMax, setPrecioMax] = useState(filter.precioMax?.toString() ?? '')

  const set = (key: keyof ProductoFilter, value: unknown) =>
    onChange({ ...filter, [key]: value || undefined, page: 0 })

  const applyPrices = () =>
    onChange({ ...filter, precioMin: precioMin ? Number(precioMin) : undefined, precioMax: precioMax ? Number(precioMax) : undefined, page: 0 })

  const hasFilters = filter.categoriaId || filter.precioMin || filter.precioMax || filter.talla || filter.color

  return (
    <div className="bg-white rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-800">Filtrar</span>
        {hasFilters && (
          <button onClick={() => onChange({ page: 0, size: filter.size })} className="text-xs text-red-500 hover:underline">
            Limpiar todo
          </button>
        )}
      </div>

      <div className="px-3">
        <AccordionSection title="Categoría">
          <ul className="space-y-1">
            <li>
              <button onClick={() => set('categoriaId', undefined)}
                className={`text-xs w-full text-left py-1 hover:text-red-500 ${!filter.categoriaId ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                Todas las categorías
              </button>
            </li>
            {categorias?.map(c => (
              <li key={c.id}>
                <button onClick={() => set('categoriaId', c.id)}
                  className={`text-xs w-full text-left py-1 hover:text-red-500 ${filter.categoriaId === c.id ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
                  {c.nombre}
                </button>
              </li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection title="Precio">
          <div className="flex gap-2 items-center">
            <input type="number" placeholder="Mín" value={precioMin} onChange={e => setPrecioMin(e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400" />
            <span className="text-gray-300 text-xs">–</span>
            <input type="number" placeholder="Máx" value={precioMax} onChange={e => setPrecioMax(e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400" />
          </div>
          <button onClick={applyPrices} className="mt-2 w-full bg-gray-900 text-white text-xs py-1.5 rounded hover:bg-gray-700">
            Aplicar
          </button>
        </AccordionSection>

        <AccordionSection title="Talla">
          <div className="flex flex-wrap gap-1.5">
            {TALLAS.map(t => (
              <button key={t} onClick={() => set('talla', filter.talla === t ? undefined : t)}
                className={`border rounded text-xs px-2 py-1 transition-colors ${filter.talla === t ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 hover:border-gray-400 text-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="Color">
          <div className="grid grid-cols-5 gap-2">
            {COLORES.map(c => (
              <button key={c.hex} title={c.label} onClick={() => set('color', filter.color === c.hex ? undefined : c.hex)}
                className={`w-7 h-7 rounded-full border-2 mx-auto transition-all ${filter.color === c.hex ? 'border-red-500 scale-110 shadow' : 'border-gray-200 hover:border-gray-400'} ${c.hex === '#FFFFFF' ? 'ring-1 ring-gray-200' : ''}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </AccordionSection>
      </div>
    </div>
  )
}
