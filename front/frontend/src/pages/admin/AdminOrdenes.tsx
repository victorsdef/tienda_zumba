import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrdenesAdmin } from '../../api/admin'
import { cambiarEstadoOrden } from '../../api/ordenes'
import { IconChevronDown, IconChevronRight } from '../../components/ui/Icon'
import type { EstadoOrden } from '../../types'

const ESTADOS: EstadoOrden[] = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800',
  PAGADO:     'bg-blue-100 text-blue-800',
  ENVIADO:    'bg-indigo-100 text-indigo-800',
  ENTREGADO:  'bg-green-100 text-green-800',
  CANCELADO:  'bg-red-100 text-red-800',
}

export default function AdminOrdenes() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [expandida, setExpandida] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ordenes', page, filtroEstado],
    queryFn: () => getOrdenesAdmin(page, filtroEstado || undefined),
  })

  const cambiarMut = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => cambiarEstadoOrden(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-ordenes'] }),
  })

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Órdenes</h1>

      {/* Filtros */}
      <div className="bg-white border rounded-lg px-3 md:px-4 py-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => { setFiltroEstado(''); setPage(0) }}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${!filtroEstado ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
          Todas
        </button>
        {ESTADOS.map(e => (
          <button key={e} onClick={() => { setFiltroEstado(e); setPage(0) }}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${filtroEstado === e ? ESTADO_STYLE[e] + ' border-transparent' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
            {e}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{data?.totalElements ?? 0} órdenes</span>
      </div>

      {isLoading ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-400">Cargando órdenes...</div>
      ) : data?.content.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-400">No hay órdenes con ese estado</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-4 py-3" />
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Orden</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Cambiar estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.content.map(o => (
                  <>
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandida(expandida === o.id ? null : o.id)} className="text-gray-400 hover:text-gray-600">
                          {expandida === o.id
                            ? <IconChevronDown size={16} />
                            : <IconChevronRight size={16} />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">#{o.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{o.usuarioNombre}</p>
                        <p className="text-xs text-gray-400">{o.ciudadEnvio}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">${o.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLE[o.estado]}`}>{o.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(o.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <select value={o.estado}
                          onChange={e => cambiarMut.mutate({ id: o.id, estado: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400">
                          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </td>
                    </tr>
                    {expandida === o.id && (
                      <tr key={`detail-${o.id}`}>
                        <td colSpan={7} className="px-8 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Dirección de envío</p>
                              <p className="text-sm">{o.calleEnvio}</p>
                              <p className="text-sm text-gray-500">{o.ciudadEnvio}{o.provinciaEnvio && `, ${o.provinciaEnvio}`} {o.codigoPostalEnvio}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Artículos ({o.items.length})</p>
                              <div className="space-y-1">
                                {o.items.map(item => (
                                  <div key={item.id} className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400 font-mono">x{item.cantidad}</span>
                                    <span className="text-gray-700">{item.nombreProducto}</span>
                                    {item.talla && <span className="text-xs bg-gray-100 px-1 rounded">{item.talla}</span>}
                                    <span className="ml-auto font-medium">${(item.precio * item.cantidad).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data?.content.map(o => (
              <div key={o.id} className="bg-white border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandida(expandida === o.id ? null : o.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-700">#{o.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_STYLE[o.estado]}`}>{o.estado}</span>
                  </div>
                  <span className="font-bold text-gray-900">${o.total.toFixed(2)}</span>
                </div>
                <div className="px-4 pb-3 -mt-2 text-sm text-gray-500 flex items-center justify-between">
                  <span>{o.usuarioNombre}</span>
                  <span className="text-xs">{new Date(o.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                </div>
                {expandida === o.id && (
                  <div className="border-t px-4 py-3 space-y-3 bg-gray-50">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Dirección</p>
                      <p className="text-sm">{o.calleEnvio}, {o.ciudadEnvio}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Artículos</p>
                      {o.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm py-0.5">
                          <span className="text-gray-700">x{item.cantidad} {item.nombreProducto}</span>
                          <span className="font-medium">${(item.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cambiar estado</p>
                      <select value={o.estado}
                        onChange={e => cambiarMut.mutate({ id: o.id, estado: e.target.value })}
                        className="border border-gray-200 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:border-red-400">
                        {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">‹</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Página {page + 1} de {data.totalPages}</span>
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">›</button>
        </div>
      )}
    </div>
  )
}
