import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getResenasAdmin, aprobarResena, eliminarResena, getProductosAdmin, type ResenaAdmin } from '../../api/admin'
import type { Producto } from '../../types'

type Filtro = 'TODOS' | 'APROBADOS' | 'PENDIENTES'

function Estrellas({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= n ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  )
}

function getImagen(p: Producto): string | null {
  return p.imagenes?.[0]
    ?? Object.values(p.imagenesPorColor ?? {}).find(imgs => imgs?.length)?.[0]
    ?? null
}

export default function AdminResenas() {
  const qc = useQueryClient()
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [busqueda, setBusqueda] = useState('')

  const { data: resenas = [], isLoading } = useQuery({ queryKey: ['resenas-admin'], queryFn: getResenasAdmin })
  const { data: productosPage } = useQuery({ queryKey: ['productos-resenas'], queryFn: () => getProductosAdmin(0, 200) })
  const productos = productosPage?.content ?? []

  const invalidar = () => qc.invalidateQueries({ queryKey: ['resenas-admin'] })
  const aprobarMut = useMutation({ mutationFn: aprobarResena, onSuccess: invalidar })
  const eliminarMut = useMutation({ mutationFn: eliminarResena, onSuccess: invalidar })

  const productoMap = useMemo(() => {
    const m = new Map<number, Producto>()
    productos.forEach(p => m.set(p.id, p))
    return m
  }, [productos])

  const totalPendientes = resenas.filter(r => !r.aprobada).length
  const totalAprobadas = resenas.filter(r => r.aprobada).length

  // Aplicar filtros: estado + búsqueda (por producto o comentario o usuario)
  const resenasFiltradas = useMemo(() => {
    return resenas.filter(r => {
      if (filtro === 'APROBADOS' && !r.aprobada) return false
      if (filtro === 'PENDIENTES' && r.aprobada) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        const p = productoMap.get(r.productoId)
        const match =
          (p?.nombre.toLowerCase().includes(b) ?? false) ||
          (r.usuarioNombre?.toLowerCase().includes(b) ?? false) ||
          (r.comentario?.toLowerCase().includes(b) ?? false)
        if (!match) return false
      }
      return true
    })
  }, [resenas, filtro, busqueda, productoMap])

  // Agrupar por producto
  const grupos = useMemo(() => {
    const g = new Map<number, ResenaAdmin[]>()
    resenasFiltradas.forEach(r => {
      const arr = g.get(r.productoId) ?? []
      arr.push(r)
      g.set(r.productoId, arr)
    })
    return Array.from(g.entries()).sort((a, b) => b[1].length - a[1].length)
  }, [resenasFiltradas])

  const PILLS: { value: Filtro; label: string; count: number }[] = [
    { value: 'TODOS', label: 'Todas', count: resenas.length },
    { value: 'APROBADOS', label: 'Aprobadas', count: totalAprobadas },
    { value: 'PENDIENTES', label: 'Pendientes', count: totalPendientes },
  ]

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto">
      {/* Encabezado unificado (sticky) */}
      <div className="sticky top-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">Reseñas</h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
            {resenas.length} en total · {totalPendientes} pendiente{totalPendientes !== 1 ? 's' : ''} · {totalAprobadas} aprobada{totalAprobadas !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por producto, usuario o comentario..."
              className="w-full border border-gray-200 rounded-lg pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm">✕</button>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3 flex gap-2 overflow-x-auto">
          {PILLS.map(p => (
            <button key={p.value} onClick={() => setFiltro(p.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                filtro === p.value
                  ? 'bg-[#4a3728] text-white border-[#4a3728] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              <span>{p.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filtro === p.value ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
              }`}>{p.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grupos por producto */}
      {grupos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">
            {busqueda ? 'Sin resultados para tu búsqueda' : filtro === 'PENDIENTES' ? 'No hay reseñas pendientes' : filtro === 'APROBADOS' ? 'No hay reseñas aprobadas' : 'No hay reseñas aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map(([prodId, resenasProd]) => {
            const p = productoMap.get(prodId)
            const imagen = p ? getImagen(p) : null
            const promedio = resenasProd.reduce((s, r) => s + r.calificacion, 0) / resenasProd.length
            const pendientesProd = resenasProd.filter(r => !r.aprobada).length

            return (
              <div key={prodId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Cabecera del producto */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-[#faf7f2] border-b border-gray-100">
                  {imagen
                    ? <img src={imagen} alt={p?.nombre} className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded-xl flex-shrink-0" />
                    : <div className="w-12 h-14 sm:w-14 sm:h-16 bg-[#f0ebe3] rounded-xl flex-shrink-0 flex items-center justify-center text-[#c4a882]">
                        <svg className="w-6 h-6 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1">
                      {p?.nombre ?? `Producto ID: ${prodId}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Estrellas n={Math.round(promedio)} />
                        <span className="text-xs text-gray-500 font-medium">{promedio.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {resenasProd.length} reseña{resenasProd.length !== 1 ? 's' : ''}
                      </span>
                      {pendientesProd > 0 && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded-full">
                          {pendientesProd} pendiente{pendientesProd !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista de reseñas */}
                <div className="divide-y divide-gray-100">
                  {resenasProd.map(r => (
                    <ResenaCard key={r.id} r={r}
                      onAprobar={!r.aprobada ? () => aprobarMut.mutate(r.id) : undefined}
                      onEliminar={() => { if (confirm('¿Eliminar reseña?')) eliminarMut.mutate(r.id) }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ResenaCard({ r, onAprobar, onEliminar }: { r: ResenaAdmin; onAprobar?: () => void; onEliminar: () => void }) {
  return (
    <div className={`p-3 sm:p-4 ${!r.aprobada ? 'bg-orange-50/40' : ''}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-sm text-gray-800">{r.usuarioNombre || 'Anónimo'}</span>
            <Estrellas n={r.calificacion} />
            <span className="text-[11px] text-gray-400">{new Date(r.fechaCreacion).toLocaleDateString('es-EC')}</span>
            {!r.aprobada && (
              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Pendiente
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line break-words">{r.comentario}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          {onAprobar && (
            <button onClick={onAprobar}
              className="flex-1 sm:flex-none text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-200 transition-colors">
              Aprobar
            </button>
          )}
          <button onClick={onEliminar}
            className="flex-1 sm:flex-none text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-100 transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
