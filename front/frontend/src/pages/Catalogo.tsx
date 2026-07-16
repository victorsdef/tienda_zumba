import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProductos } from '@api/productos'
import { getCategorias } from '@api/categorias'
import FilterSidebar from '@entities/product/FilterSidebar'
import ProductCard from '@entities/product/ProductCard'
import { ProductGridSkeleton } from '@shared/LoadingSkeleton'
import { IconFilter, IconX } from '@shared/Icon'
import type { ProductoFilter } from '../types'

const SORT_OPTIONS = [
  { label: 'Recomendados',        value: '' },
  { label: 'Más nuevos',          value: 'id,desc' },
  { label: 'Precio: menor a mayor', value: 'precio,asc' },
  { label: 'Precio: mayor a menor', value: 'precio,desc' },
]

export default function Catalogo() {
  const [searchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [filter, setFilter] = useState<ProductoFilter>({
    categoriaId: searchParams.get('categoriaId') ? Number(searchParams.get('categoriaId')) : undefined,
    nombre:      searchParams.get('nombre')      ?? undefined,
    genero:      searchParams.get('genero')      ?? undefined,
    sort:        searchParams.get('sort')        ?? undefined,
    page: 0, size: 24,
  })

  // Sync URL params when they change (e.g. clicking género from home)
  useEffect(() => {
    setFilter({
      categoriaId: searchParams.get('categoriaId') ? Number(searchParams.get('categoriaId')) : undefined,
      nombre:      searchParams.get('nombre')      ?? undefined,
      genero:      searchParams.get('genero')      ?? undefined,
      sort:        searchParams.get('sort')        ?? undefined,
      page: 0, size: 24,
    })
  }, [searchParams.toString()])

  const { data, isLoading } = useQuery({
    queryKey: ['productos', filter],
    queryFn: () => getProductos(filter),
    placeholderData: prev => prev,
  })

  const { data: cats = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })

  const catActual = cats.find(c => c.id === filter.categoriaId)
  const titulo = catActual?.nombre
    ?? (filter.genero ? filter.genero.charAt(0) + filter.genero.slice(1).toLowerCase()
    : filter.nombre ? `Búsqueda: "${filter.nombre}"` : 'Catálogo')

  const activeFilters: { label: string; clear: () => void }[] = []
  if (filter.categoriaId) activeFilters.push({ label: catActual?.nombre ?? 'Categoría', clear: () => setFilter(f => ({ ...f, categoriaId: undefined, page: 0 })) })
  if (filter.genero)      activeFilters.push({ label: filter.genero, clear: () => setFilter(f => ({ ...f, genero: undefined, page: 0 })) })
  if (filter.talla)       activeFilters.push({ label: `Talla ${filter.talla}`, clear: () => setFilter(f => ({ ...f, talla: undefined, page: 0 })) })
  if (filter.color)       activeFilters.push({ label: 'Color', clear: () => setFilter(f => ({ ...f, color: undefined, page: 0 })) })
  if (filter.precioMin)   activeFilters.push({ label: `Desde $${filter.precioMin}`, clear: () => setFilter(f => ({ ...f, precioMin: undefined, page: 0 })) })
  if (filter.precioMax)   activeFilters.push({ label: `Hasta $${filter.precioMax}`, clear: () => setFilter(f => ({ ...f, precioMax: undefined, page: 0 })) })

  const clearAll = () => setFilter({ page: 0, size: 24 })

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ── Header de sección ─────────────────────────────────── */}
      <div className="bg-white border-b border-[#ede8df]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#2c1a10] tracking-tight">{titulo}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLoading ? 'Cargando...' : `${data?.totalElements ?? 0} productos`}
            </p>
          </div>

          {/* Chips de filtros activos */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {activeFilters.map(f => (
                <button
                  key={f.label}
                  onClick={f.clear}
                  className="flex items-center gap-1 text-xs bg-[#f0ebe4] text-[#4a3728] rounded-full px-3 py-1 hover:bg-[#e8dfd5] transition-colors"
                >
                  {f.label} <IconX size={11} />
                </button>
              ))}
              <button onClick={clearAll} className="text-xs text-[#7d5c48] hover:underline ml-1">
                Limpiar todo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
        {/* ── Toolbar ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 gap-3">
          {/* Filtros mobile */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden flex items-center gap-2 text-sm font-medium text-[#4a3728] bg-white border border-[#e2d9ce] rounded-lg px-3 py-2 hover:bg-[#faf7f2] transition-colors"
          >
            <IconFilter size={15} />
            Filtros
            {activeFilters.length > 0 && (
              <span className="bg-[#4a3728] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
          <div className="hidden md:block text-sm text-gray-400">
            {activeFilters.length > 0 ? `${activeFilters.length} filtros activos` : 'Todos los productos'}
          </div>

          {/* Ordenar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Ordenar por</span>
            <select
              value={filter.sort ?? ''}
              onChange={e => setFilter(f => ({ ...f, sort: e.target.value || undefined, page: 0 }))}
              className="border border-[#e2d9ce] rounded-lg text-xs px-3 py-2 bg-white focus:outline-none focus:border-[#7d5c48] text-[#2c1a10]"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-5">
          {/* ── Sidebar desktop (siempre visible) ─────────────── */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <FilterSidebar filter={filter} onChange={f => setFilter({ ...f, page: 0 })} cats={cats} />
          </aside>

          {/* ── Grid de productos ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <ProductGridSkeleton count={24} />
            ) : data?.content.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-semibold text-[#2c1a10] mb-1">Sin resultados</p>
                <p className="text-sm text-gray-400 mb-4">No encontramos productos con esos filtros.</p>
                <button
                  onClick={clearAll}
                  className="text-sm font-medium text-white bg-[#4a3728] hover:bg-[#3a2a1e] px-5 py-2 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {data?.content.map(p => <ProductCard key={p.id} producto={p} compact />)}
                </div>

                {/* Paginación */}
                {data && data.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-8 flex-wrap">
                    <button
                      disabled={filter.page === 0}
                      onClick={() => setFilter(f => ({ ...f, page: (f.page ?? 0) - 1 }))}
                      className="px-3 py-1.5 border border-[#e2d9ce] rounded-lg text-sm disabled:opacity-30 hover:border-[#7d5c48] hover:text-[#4a3728] transition-colors"
                    >‹ Anterior</button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(data.totalPages, 7) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setFilter(f => ({ ...f, page: i }))}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            (filter.page ?? 0) === i
                              ? 'bg-[#4a3728] text-white'
                              : 'border border-[#e2d9ce] text-gray-600 hover:border-[#7d5c48] hover:text-[#4a3728]'
                          }`}
                        >{i + 1}</button>
                      ))}
                    </div>

                    <button
                      disabled={(filter.page ?? 0) >= data.totalPages - 1}
                      onClick={() => setFilter(f => ({ ...f, page: (f.page ?? 0) + 1 }))}
                      className="px-3 py-1.5 border border-[#e2d9ce] rounded-lg text-sm disabled:opacity-30 hover:border-[#7d5c48] hover:text-[#4a3728] transition-colors"
                    >Siguiente ›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Drawer mobile ─────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#ede8df]">
              <span className="font-semibold text-[#2c1a10]">Filtros</span>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <IconX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar
                filter={filter}
                onChange={f => { setFilter({ ...f, page: 0 }); setDrawerOpen(false) }}
                cats={cats}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
