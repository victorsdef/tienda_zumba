import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMisOrdenes } from '../api/ordenes'
import { useAuthStore } from '../store/useAuthStore'
import OrderStatus from '../components/orders/OrderStatus'
import {
  IconChevronRight,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconTruck,
} from '../components/ui/Icon'
import type { EstadoOrden, Orden } from '../types'

const ESTADOS: Array<{ value: 'TODOS' | EstadoOrden; label: string }> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'PAGADO', label: 'Pagados' },
  { value: 'EN_PREPARACION', label: 'Preparando' },
  { value: 'ENVIADO', label: 'Enviados' },
  { value: 'ENTREGADO', label: 'Entregados' },
  { value: 'CANCELADO', label: 'Cancelados' },
]

const ESTADO_BADGE: Record<EstadoOrden, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700 border-amber-200',
  PAGADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  EN_PREPARACION: 'bg-blue-100 text-blue-700 border-blue-200',
  ENVIADO: 'bg-violet-100 text-violet-700 border-violet-200',
  ENTREGADO: 'bg-stone-200 text-stone-700 border-stone-300',
  CANCELADO: 'bg-red-100 text-red-700 border-red-200',
}

const ESTADO_LABEL: Record<EstadoOrden, string> = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  EN_PREPARACION: 'En preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function codigoVisible(orden: Orden) {
  return orden.codigoOrden || `#${orden.id}`
}

function matchOrden(orden: Orden, search: string) {
  const normalized = search.trim().toLowerCase()
  if (!normalized) return true

  if (String(orden.id).includes(normalized)) return true
  if ((orden.codigoOrden || '').toLowerCase().includes(normalized)) return true
  if (ESTADO_LABEL[orden.estado].toLowerCase().includes(normalized)) return true

  return orden.items.some(item => {
    const nombre = item.nombreProducto.toLowerCase()
    const talla = item.talla?.toLowerCase() ?? ''
    const color = item.color?.toLowerCase() ?? ''
    return nombre.includes(normalized) || talla.includes(normalized) || color.includes(normalized)
  })
}

function resumenOrden(orden: Orden) {
  const cantidad = orden.items.reduce((sum, item) => sum + item.cantidad, 0)
  const preview = orden.items.slice(0, 2).map(item => item.nombreProducto).join(' · ')
  return cantidad === 1 ? preview : `${preview}${orden.items.length > 2 ? ` y ${orden.items.length - 2} más` : ''}`
}

export default function MisOrdenes() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | EstadoOrden>('TODOS')

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['mis-ordenes'],
    queryFn: () => getMisOrdenes(),
    enabled: isAuthenticated,
  })

  const ordenes = data?.content ?? []
  const filtradas = ordenes.filter(orden =>
    (estadoFiltro === 'TODOS' || orden.estado === estadoFiltro) &&
    matchOrden(orden, search)
  )

  const totalGastado = ordenes
    .filter(orden => orden.estado !== 'CANCELADO')
    .reduce((sum, orden) => sum + Number(orden.total), 0)

  const pendientes = ordenes.filter(orden => orden.estado === 'PENDIENTE' || orden.estado === 'EN_PREPARACION').length
  const enCamino = ordenes.filter(orden => orden.estado === 'ENVIADO').length

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">Cargando tus órdenes...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#4a3728]">Mis órdenes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisá el estado de tus compras, encontrá pedidos rápido y retomá los pendientes.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 border border-[#d8cfc6] bg-white hover:bg-[#f5f0e8] text-[#4a3728] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <IconRefresh size={16} className={isFetching ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {!ordenes.length ? (
        <div className="bg-white border border-[#ddd8d0] rounded-xl p-10 md:p-14 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#f5f0e8] text-[#7d5c48] flex items-center justify-center mb-4">
            <IconPackage size={26} />
          </div>
          <h2 className="text-xl font-bold text-[#4a3728] mb-2">Todavía no tenés órdenes</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Cuando completes una compra, acá vas a poder seguir su estado y ver el detalle de cada pedido.
          </p>
          <Link to="/catalogo" className="btn-primary inline-flex items-center gap-2">
            Explorar catálogo
            <IconChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#ddd8d0] rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Órdenes totales</p>
              <p className="text-2xl font-bold text-[#4a3728]">{ordenes.length}</p>
              <p className="text-sm text-gray-500 mt-1">Historial completo de compras</p>
            </div>
            <div className="bg-white border border-[#ddd8d0] rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">En proceso</p>
              <p className="text-2xl font-bold text-[#4a3728]">{pendientes}</p>
              <p className="text-sm text-gray-500 mt-1">Pendientes o en preparación</p>
            </div>
            <div className="bg-white border border-[#ddd8d0] rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Total invertido</p>
              <p className="text-2xl font-bold text-[#4a3728]">{formatMoney(totalGastado)}</p>
              <p className="text-sm text-gray-500 mt-1">{enCamino} pedido{enCamino === 1 ? '' : 's'} en camino</p>
            </div>
          </div>

          <div className="bg-white border border-[#ddd8d0] rounded-xl p-4 md:p-5 mb-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por número de orden, producto, talla o color"
                  className="w-full rounded-lg border border-[#ddd8d0] bg-[#faf8f5] pl-10 pr-4 py-3 text-sm text-[#4a3728] outline-none focus:border-[#7d5c48]"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {ESTADOS.map(item => (
                  <button
                    key={item.value}
                    onClick={() => setEstadoFiltro(item.value)}
                    className={`whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      estadoFiltro === item.value
                        ? 'bg-[#7d5c48] border-[#7d5c48] text-white'
                        : 'bg-white border-[#ddd8d0] text-[#6b5040] hover:bg-[#f5f0e8]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!filtradas.length ? (
            <div className="bg-white border border-[#ddd8d0] rounded-xl p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#f5f0e8] text-[#7d5c48] flex items-center justify-center mb-4">
                <IconSearch size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#4a3728] mb-2">No encontramos órdenes con ese filtro</h2>
              <p className="text-sm text-gray-500 mb-5">
                Probá otro estado o buscá por un nombre de producto diferente.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setEstadoFiltro('TODOS')
                }}
                className="btn-outline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtradas.map(orden => {
                const cantidadItems = orden.items.reduce((sum, item) => sum + item.cantidad, 0)
                const imagenPrincipal = orden.items[0]?.productoImagen || 'https://placehold.co/88x112/f3f4f6/9ca3af'

                return (
                  <Link
                    key={orden.id}
                    to={`/ordenes/${orden.codigoOrden || orden.id}`}
                    className="block bg-white border border-[#ddd8d0] rounded-xl p-4 md:p-5 hover:shadow-md hover:border-[#c9bbaf] transition-all"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4 min-w-0">
                        <img
                          src={imagenPrincipal}
                          alt={orden.items[0]?.nombreProducto || `Orden ${codigoVisible(orden)}`}
                          className="w-20 h-24 object-cover rounded-lg border border-[#ece7e1] flex-shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-bold text-[#4a3728]">{codigoVisible(orden)}</p>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE[orden.estado]}`}>
                              {ESTADO_LABEL[orden.estado]}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mb-1">
                            {formatFecha(orden.fechaCreacion)}
                          </p>
                          <p className="text-sm text-[#6b5040] line-clamp-2">
                            {resumenOrden(orden)}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>{cantidadItems} artículo{cantidadItems === 1 ? '' : 's'}</span>
                            {orden.numeroGuia && (
                              <span className="inline-flex items-center gap-1 text-[#6b5040]">
                                <IconTruck size={14} />
                                Guía: {orden.numeroGuia}
                              </span>
                            )}
                            {orden.guiaImagenUrl && (
                              <span className="text-[#6b5040]">Guía disponible</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="md:text-right md:min-w-[180px]">
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Total</p>
                        <p className="text-2xl font-bold text-[#4a3728] mb-3">{formatMoney(Number(orden.total))}</p>
                        <div className="hidden md:flex md:justify-end">
                          <span className="inline-flex items-center gap-1 text-sm text-[#7d5c48] font-medium">
                            Ver detalle
                            <IconChevronRight size={16} />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#efe9e3] overflow-x-auto">
                      <OrderStatus estado={orden.estado} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
