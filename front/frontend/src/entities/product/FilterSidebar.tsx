import { useState } from 'react'
import type { ProductoFilter, Categoria } from '../../types'

interface Props {
  filter: ProductoFilter
  onChange: (f: ProductoFilter) => void
  cats: Categoria[]
}

const COLORES = [
  { label: 'Negro',    hex: '#1a1a1a' },
  { label: 'Blanco',   hex: '#f5f5f5' },
  { label: 'Rojo',     hex: '#c0392b' },
  { label: 'Azul',     hex: '#2980b9' },
  { label: 'Verde',    hex: '#27ae60' },
  { label: 'Rosa',     hex: '#e91e8c' },
  { label: 'Beige',    hex: '#d4b896' },
  { label: 'Gris',     hex: '#7f8c8d' },
  { label: 'Naranja',  hex: '#e67e22' },
  { label: 'Morado',   hex: '#8e44ad' },
  { label: 'Café',     hex: '#6d4c41' },
  { label: 'Camel',    hex: '#c49a6c' },
]

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#ede8df] last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 text-xs font-semibold text-[#2c1a10] uppercase tracking-wide hover:text-[#7d5c48] transition-colors"
      >
        {title}
        <svg className={`w-3.5 h-3.5 transition-transform text-[#7d5c48] ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export default function FilterSidebar({ filter, onChange, cats }: Props) {
  const [precioMin, setPrecioMin] = useState(filter.precioMin?.toString() ?? '')
  const [precioMax, setPrecioMax] = useState(filter.precioMax?.toString() ?? '')

  const set = (key: keyof ProductoFilter, value: unknown) =>
    onChange({ ...filter, [key]: value || undefined, page: 0 })

  const applyPrices = () =>
    onChange({
      ...filter,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      page: 0,
    })

  // Tallas dinámicas: usa la categoría seleccionada, o todas las activas
  const catSeleccionada = cats.find(c => c.id === filter.categoriaId)
  const tallasRaw: string[] = catSeleccionada?.tallasDisponibles?.length
    ? catSeleccionada.tallasDisponibles
    : Array.from(new Set(cats.flatMap(c => c.tallasDisponibles ?? [])))

  // Categorías filtradas por género si hay uno activo
  const categoriasFiltradas = filter.genero
    ? cats.filter(c => c.genero === filter.genero)
    : cats

  const hasFilters = filter.categoriaId || filter.precioMin || filter.precioMax || filter.talla || filter.color

  return (
    <div className="bg-white rounded-xl border border-[#ede8df] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#ede8df] bg-[#faf8f5]">
        <span className="text-xs font-bold text-[#2c1a10] uppercase tracking-widest">Filtros</span>
        {hasFilters && (
          <button
            onClick={() => onChange({ page: 0, size: filter.size })}
            className="text-[10px] text-[#7d5c48] hover:text-[#4a3728] hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div className="px-4 divide-y divide-[#f0ebe4]">
        {/* ── Categoría ─────────────────────────────────────── */}
        {categoriasFiltradas.length > 0 && (
          <Section title="Categoría">
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => set('categoriaId', undefined)}
                  className={`text-xs w-full text-left py-1.5 rounded px-2 transition-colors ${
                    !filter.categoriaId
                      ? 'bg-[#f0ebe4] text-[#4a3728] font-semibold'
                      : 'text-gray-500 hover:text-[#4a3728] hover:bg-[#faf7f2]'
                  }`}
                >
                  Todas
                </button>
              </li>
              {categoriasFiltradas.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => set('categoriaId', c.id)}
                    className={`text-xs w-full text-left py-1.5 rounded px-2 transition-colors ${
                      filter.categoriaId === c.id
                        ? 'bg-[#f0ebe4] text-[#4a3728] font-semibold'
                        : 'text-gray-500 hover:text-[#4a3728] hover:bg-[#faf7f2]'
                    }`}
                  >
                    {c.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ── Precio ────────────────────────────────────────── */}
        <Section title="Precio">
          <div className="flex gap-2 items-center mb-2">
            <input
              type="number"
              placeholder="Mín"
              value={precioMin}
              onChange={e => setPrecioMin(e.target.value)}
              className="w-full border border-[#e2d9ce] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#7d5c48] text-[#2c1a10]"
            />
            <span className="text-gray-300 text-xs flex-shrink-0">–</span>
            <input
              type="number"
              placeholder="Máx"
              value={precioMax}
              onChange={e => setPrecioMax(e.target.value)}
              className="w-full border border-[#e2d9ce] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#7d5c48] text-[#2c1a10]"
            />
          </div>
          <button
            onClick={applyPrices}
            className="w-full bg-[#4a3728] text-white text-xs py-1.5 rounded-lg hover:bg-[#3a2a1e] transition-colors"
          >
            Aplicar
          </button>
        </Section>

        {/* ── Talla ─────────────────────────────────────────── */}
        {tallasRaw.length > 0 && (
          <Section title="Talla">
            <div className="flex flex-wrap gap-1.5">
              {tallasRaw.map(t => (
                <button
                  key={t}
                  onClick={() => set('talla', filter.talla === t ? undefined : t)}
                  className={`border rounded-lg text-xs px-2.5 py-1 transition-colors ${
                    filter.talla === t
                      ? 'border-[#4a3728] bg-[#4a3728] text-white'
                      : 'border-[#e2d9ce] text-gray-500 hover:border-[#7d5c48] hover:text-[#4a3728]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* ── Color ─────────────────────────────────────────── */}
        <Section title="Color">
          <div className="grid grid-cols-6 gap-2">
            {COLORES.map(c => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => set('color', filter.color === c.hex ? undefined : c.hex)}
                className={`w-7 h-7 rounded-full border-2 mx-auto transition-all ${
                  filter.color === c.hex
                    ? 'border-[#4a3728] scale-110 shadow-md'
                    : 'border-[#e2d9ce] hover:border-[#7d5c48]'
                } ${c.hex === '#f5f5f5' ? 'ring-1 ring-[#e2d9ce]' : ''}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          {filter.color && (
            <p className="text-[10px] text-[#7d5c48] mt-2">
              {COLORES.find(c => c.hex === filter.color)?.label ?? 'Color seleccionado'}
            </p>
          )}
        </Section>
      </div>
    </div>
  )
}
