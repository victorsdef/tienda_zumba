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

// ── Árbol jerárquico de categorías (padre → hijas) ──────────
function CategoriaArbol({ todas, seleccionadas, onToggle, onClear }: {
  todas: Categoria[]; seleccionadas: number[]; onToggle: (id: number) => void; onClear: () => void
}) {
  const raices = todas.filter(c => !c.categoriaPadreId)
  const hijasDe = (padreId: number) => todas.filter(c => c.categoriaPadreId === padreId)
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    // Auto-expandir padres con hijas seleccionadas
    const s = new Set<number>()
    seleccionadas.forEach(id => {
      const cat = todas.find(c => c.id === id)
      if (cat?.categoriaPadreId) s.add(cat.categoriaPadreId)
    })
    return s
  })
  const toggleExpand = (id: number) => setExpanded(prev => {
    const n = new Set(prev)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  const Fila = ({ c, nivel }: { c: Categoria; nivel: number }) => {
    const hijas = hijasDe(c.id)
    const tieneHijas = hijas.length > 0
    const activa = seleccionadas.includes(c.id)
    const abierta = expanded.has(c.id)
    return (
      <li>
        <div className="flex items-center gap-1 group">
          {tieneHijas ? (
            <button onClick={() => toggleExpand(c.id)}
              className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-[#4a3728]">
              <svg className={`w-3 h-3 transition-transform ${abierta ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : <span className="w-4 h-4 flex-shrink-0" />}
          <button
            onClick={() => onToggle(c.id)}
            className={`flex-1 text-xs text-left py-1.5 rounded px-2 transition-colors flex items-center gap-2 ${
              activa ? 'bg-[#f0ebe4] text-[#4a3728] font-semibold' : 'text-gray-500 hover:text-[#4a3728] hover:bg-[#faf7f2]'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${activa ? 'bg-[#4a3728] border-[#4a3728]' : 'border-[#c9b8a8]'}`}>
              {activa && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </span>
            <span className="flex-1 truncate">{c.nombre}</span>
            {tieneHijas && <span className="text-[10px] text-gray-400">({hijas.length})</span>}
          </button>
        </div>
        {tieneHijas && abierta && (
          <ul className="ml-4 border-l border-[#ede8df] pl-1 space-y-0.5 mt-0.5">
            {hijas.map(h => <Fila key={h.id} c={h} nivel={nivel + 1} />)}
          </ul>
        )}
      </li>
    )
  }

  return (
    <ul className="space-y-0.5">
      <li>
        <button onClick={onClear}
          className={`text-xs w-full text-left py-1.5 rounded px-2 ml-5 transition-colors ${
            seleccionadas.length === 0 ? 'bg-[#f0ebe4] text-[#4a3728] font-semibold' : 'text-gray-500 hover:text-[#4a3728] hover:bg-[#faf7f2]'
          }`}>Todas</button>
      </li>
      {raices.map(c => <Fila key={c.id} c={c} nivel={0} />)}
    </ul>
  )
}

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

  const categoriaIds = filter.categoriaIds ?? (filter.categoriaId ? [filter.categoriaId] : [])
  const tallas = filter.tallas ?? (filter.talla ? [filter.talla] : [])
  const colores = filter.colores ?? (filter.color ? [filter.color] : [])

  // Toggle: agrega/quita del array
  const toggleItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]

  const setMulti = (key: 'categoriaIds' | 'tallas' | 'colores', arr: any[]) => {
    // Limpia también el campo singular para evitar duplicados en la URL
    const clean = { ...filter } as any
    if (key === 'categoriaIds') clean.categoriaId = undefined
    if (key === 'tallas') clean.talla = undefined
    if (key === 'colores') clean.color = undefined
    onChange({ ...clean, [key]: arr.length > 0 ? arr : undefined, page: 0 })
  }

  const applyPrices = () =>
    onChange({
      ...filter,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      page: 0,
    })

  // Tallas dinámicas: usa las categorías seleccionadas, o todas las activas
  const catsSeleccionadas = cats.filter(c => categoriaIds.includes(c.id))
  const tallasRaw: string[] = catsSeleccionadas.length
    ? Array.from(new Set(catsSeleccionadas.flatMap(c => c.tallasDisponibles ?? [])))
    : Array.from(new Set(cats.flatMap(c => c.tallasDisponibles ?? [])))

  // Categorías filtradas por género si hay uno activo
  const categoriasFiltradas = filter.genero
    ? cats.filter(c => c.genero === filter.genero)
    : cats

  const hasFilters = categoriaIds.length > 0 || filter.precioMin || filter.precioMax || tallas.length > 0 || colores.length > 0

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
        {/* ── Categoría (jerárquica multi-select) ──────────── */}
        {categoriasFiltradas.length > 0 && (
          <Section title={`Categoría${categoriaIds.length > 0 ? ` · ${categoriaIds.length}` : ''}`}>
            <CategoriaArbol
              todas={categoriasFiltradas}
              seleccionadas={categoriaIds}
              onToggle={(id) => setMulti('categoriaIds', toggleItem(categoriaIds, id))}
              onClear={() => setMulti('categoriaIds', [])}
            />
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

        {/* ── Talla (multi-select) ─────────────────────────── */}
        {tallasRaw.length > 0 && (
          <Section title={`Talla${tallas.length > 0 ? ` · ${tallas.length}` : ''}`}>
            <div className="flex flex-wrap gap-1.5">
              {tallasRaw.map(t => {
                const activa = tallas.includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => setMulti('tallas', toggleItem(tallas, t))}
                    className={`border rounded-lg text-xs px-2.5 py-1 transition-colors font-semibold ${
                      activa
                        ? 'border-[#4a3728] bg-[#4a3728] text-white shadow-sm'
                        : 'border-[#e2d9ce] text-gray-500 hover:border-[#7d5c48] hover:text-[#4a3728]'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── Color (multi-select) ─────────────────────────── */}
        <Section title={`Color${colores.length > 0 ? ` · ${colores.length}` : ''}`}>
          <div className="grid grid-cols-6 gap-2">
            {COLORES.map(c => {
              const activo = colores.includes(c.hex)
              return (
                <button
                  key={c.hex}
                  title={c.label}
                  onClick={() => setMulti('colores', toggleItem(colores, c.hex))}
                  className={`w-7 h-7 rounded-full border-2 mx-auto transition-all relative ${
                    activo
                      ? 'border-[#4a3728] scale-110 shadow-md'
                      : 'border-[#e2d9ce] hover:border-[#7d5c48]'
                  } ${c.hex === '#f5f5f5' ? 'ring-1 ring-[#e2d9ce]' : ''}`}
                  style={{ backgroundColor: c.hex }}
                >
                  {activo && (
                    <svg className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
          {colores.length > 0 && (
            <p className="text-[10px] text-[#7d5c48] mt-2 flex flex-wrap gap-1">
              {colores.map(hex => (
                <span key={hex} className="bg-[#f0ebe4] px-1.5 py-0.5 rounded">
                  {COLORES.find(c => c.hex === hex)?.label ?? hex}
                </span>
              ))}
            </p>
          )}
        </Section>
      </div>
    </div>
  )
}
