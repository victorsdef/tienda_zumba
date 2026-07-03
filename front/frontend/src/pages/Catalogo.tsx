import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProductos } from '../api/productos'
import FilterSidebar from '../components/products/FilterSidebar'
import ProductCard from '../components/products/ProductCard'
import { ProductGridSkeleton } from '../components/ui/LoadingSkeleton'
import { IconFilter, IconX } from '../components/ui/Icon'
import type { ProductoFilter } from '../types'

const SORT_OPTIONS = [
  { label: 'Recomendados', value: '' },
  { label: 'Precio: menor a mayor', value: 'precio,asc' },
  { label: 'Precio: mayor a menor', value: 'precio,desc' },
  { label: 'Más nuevos', value: 'id,desc' },
]

export default function Catalogo() {
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<ProductoFilter>({
    categoriaId: searchParams.get('categoriaId') ? Number(searchParams.get('categoriaId')) : undefined,
    nombre: searchParams.get('nombre') ?? undefined,
    genero: searchParams.get('genero') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    page: 0, size: 20,
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['productos', filter],
    queryFn: () => getProductos(filter),
    placeholderData: prev => prev,
  })

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-3 md:py-4">
      {/* Toolbar */}
      <div className="bg-white rounded mb-3 px-3 md:px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-500"
          >
            <IconFilter size={15} className="text-gray-500" />
            Filtros
          </button>
          {/* Desktop filter toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="hidden md:flex items-center gap-1.5 text-sm text-gray-700 hover:text-red-500"
          >
            <IconFilter size={15} className="text-gray-500" />
            {sidebarOpen ? 'Ocultar filtros' : 'Filtros'}
          </button>
          <span className="text-xs text-gray-400">{data ? `${data.totalElements} resultados` : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">Ordenar:</span>
          <select
            value={filter.sort ?? ''}
            onChange={e => setFilter({ ...filter, sort: e.target.value || undefined, page: 0 })}
            className="border border-gray-200 rounded text-xs px-2 py-1.5 focus:outline-none focus:border-red-400"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-gray-800">Filtros</span>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <IconX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar filter={filter} onChange={f => { setFilter({ ...f, page: 0 }); setDrawerOpen(false) }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Desktop Sidebar */}
        {sidebarOpen && (
          <div className="hidden md:block w-52 flex-shrink-0">
            <FilterSidebar filter={filter} onChange={f => setFilter({ ...f, page: 0 })} />
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <ProductGridSkeleton count={20} />
          ) : data?.content.length === 0 ? (
            <div className="bg-white rounded p-8 md:p-12 text-center">
              <p className="text-gray-400 text-lg mb-2">No encontramos productos</p>
              <button onClick={() => setFilter({ page: 0, size: 20 })} className="text-red-500 text-sm hover:underline">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-2 ${sidebarOpen
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              }`}>
                {data?.content.map(p => <ProductCard key={p.id} producto={p} compact />)}
              </div>

              {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-1 mt-6 flex-wrap">
                  <button
                    disabled={filter.page === 0}
                    onClick={() => setFilter(f => ({ ...f, page: (f.page ?? 0) - 1 }))}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-40 hover:border-red-400 hover:text-red-500"
                  >‹</button>
                  {Array.from({ length: Math.min(data.totalPages, 7) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilter(f => ({ ...f, page: i }))}
                      className={`px-3 py-1.5 border rounded text-sm ${(filter.page ?? 0) === i ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 hover:border-red-400 hover:text-red-500'}`}
                    >{i + 1}</button>
                  ))}
                  <button
                    disabled={(filter.page ?? 0) >= data.totalPages - 1}
                    onClick={() => setFilter(f => ({ ...f, page: (f.page ?? 0) + 1 }))}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-40 hover:border-red-400 hover:text-red-500"
                  >›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
