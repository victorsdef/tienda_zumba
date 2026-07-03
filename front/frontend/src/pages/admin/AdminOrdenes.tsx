import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrdenesAdmin } from '../../api/admin'
import { actualizarGuiaOrden, cambiarEstadoOrden } from '../../api/ordenes'
import api from '../../api/axios'
import { IconChevronDown, IconChevronRight, IconSearch } from '../../components/ui/Icon'
import type { EstadoOrden, Orden } from '../../types'

const ESTADOS: EstadoOrden[] = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:       'bg-yellow-100 text-yellow-800',
  PAGADO:          'bg-blue-100 text-blue-800',
  EN_PREPARACION:  'bg-orange-100 text-orange-800',
  ENVIADO:         'bg-indigo-100 text-indigo-800',
  ENTREGADO:       'bg-green-100 text-green-800',
  CANCELADO:       'bg-red-100 text-red-800',
}

export default function AdminOrdenes() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [expandida, setExpandida] = useState<number | null>(null)
  const [guiaModal, setGuiaModal] = useState<{ id: number } | null>(null)
  const [numeroGuia, setNumeroGuia] = useState('')
  const [guiaArchivoModal, setGuiaArchivoModal] = useState<Orden | null>(null)
  const [guiaNumeroEditar, setGuiaNumeroEditar] = useState('')
  const [guiaImagenUrl, setGuiaImagenUrl] = useState('')
  const [subiendoGuia, setSubiendoGuia] = useState(false)
  const [errorGuia, setErrorGuia] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ordenes', page, filtroEstado],
    queryFn: () => getOrdenesAdmin(page, filtroEstado || undefined),
  })

  const cambiarMut = useMutation({
    mutationFn: ({ id, estado, guia }: { id: number; estado: string; guia?: string }) =>
      cambiarEstadoOrden(id, estado, guia),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ordenes'] })
      setGuiaModal(null)
      setNumeroGuia('')
    },
  })
  const actualizarGuiaMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { numeroGuia?: string; guiaImagenUrl?: string } }) =>
      actualizarGuiaOrden(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ordenes'] })
      setGuiaArchivoModal(null)
      setGuiaNumeroEditar('')
      setGuiaImagenUrl('')
      setErrorGuia('')
    },
  })

  const codigoVisible = (orden: { codigoOrden?: string; id: number }) => orden.codigoOrden || `#${orden.id}`
  const abrirModalGuia = (orden: Orden) => {
    setGuiaArchivoModal(orden)
    setGuiaNumeroEditar(orden.numeroGuia || '')
    setGuiaImagenUrl(orden.guiaImagenUrl || '')
    setErrorGuia('')
  }
  const subirArchivoGuia = async (file?: File | null) => {
    if (!file) return
    setSubiendoGuia(true)
    setErrorGuia('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post<{ url: string }>('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setGuiaImagenUrl(res.data.url)
    } catch {
      setErrorGuia('No se pudo subir la imagen de la guía.')
    } finally {
      setSubiendoGuia(false)
    }
  }
  const termino = busqueda.trim().toLowerCase()
  const ordenesFiltradas = (data?.content ?? []).filter(o => {
    if (!termino) return true

    const cliente = (o.usuarioNombre || '').toLowerCase()
    const codigo = (o.codigoOrden || '').toLowerCase()
    const ciudad = (o.ciudadEnvio || '').toLowerCase()
    const calle = (o.calleEnvio || '').toLowerCase()
    const estado = o.estado.toLowerCase()
    const idTexto = String(o.id)
    const productos = o.items.map(item => item.nombreProducto.toLowerCase()).join(' ')

    return (
      cliente.includes(termino) ||
      codigo.includes(termino) ||
      ciudad.includes(termino) ||
      calle.includes(termino) ||
      estado.includes(termino) ||
      idTexto.includes(termino) ||
      productos.includes(termino)
    )
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

      <div className="bg-white border rounded-lg px-3 md:px-4 py-3 flex items-center gap-3">
        <IconSearch size={16} className="text-gray-400 flex-shrink-0" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por código, cliente, ciudad o producto..."
          className="flex-1 outline-none text-sm"
        />
        <span className="text-xs text-gray-400">{ordenesFiltradas.length} visibles</span>
      </div>

      {isLoading ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-400">Cargando órdenes...</div>
      ) : ordenesFiltradas.length === 0 ? (
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
                {ordenesFiltradas.map(o => (
                  <React.Fragment key={o.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandida(expandida === o.id ? null : o.id)} className="text-gray-400 hover:text-gray-600">
                          {expandida === o.id
                            ? <IconChevronDown size={16} />
                            : <IconChevronRight size={16} />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">{codigoVisible(o)}</td>
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
                          onChange={e => {
                            if (e.target.value === 'ENVIADO') {
                              setGuiaModal({ id: o.id })
                            } else {
                              cambiarMut.mutate({ id: o.id, estado: e.target.value })
                            }
                          }}
                          onClick={e => e.stopPropagation()}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400">
                          {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                    </tr>
                    {expandida === o.id && (
                      <tr>
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
                          {(o.estado === 'ENVIADO' || o.estado === 'ENTREGADO') && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                              <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-800">Guía de envío</p>
                                <p>{o.numeroGuia ? `Número: ${o.numeroGuia}` : 'Todavía no se cargó número de guía'}</p>
                                <p>{o.guiaImagenUrl ? 'Imagen cargada para el cliente' : 'Falta cargar imagen de la guía'}</p>
                              </div>
                              <button
                                onClick={() => abrirModalGuia(o)}
                                className="btn-outline text-sm"
                              >
                                {o.guiaImagenUrl ? 'Editar guía' : 'Cargar guía'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {ordenesFiltradas.map(o => (
              <div key={o.id} className="bg-white border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandida(expandida === o.id ? null : o.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-700">{codigoVisible(o)}</span>
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
                        onChange={e => {
                          if (e.target.value === 'ENVIADO') {
                            setGuiaModal({ id: o.id })
                          } else {
                            cambiarMut.mutate({ id: o.id, estado: e.target.value })
                          }
                        }}
                        className="border border-gray-200 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:border-red-400">
                        {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    {(o.estado === 'ENVIADO' || o.estado === 'ENTREGADO') && (
                      <button onClick={() => abrirModalGuia(o)} className="btn-outline w-full text-sm">
                        {o.guiaImagenUrl ? 'Editar guía enviada' : 'Cargar guía para cliente'}
                      </button>
                    )}
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
      {/* Modal número de guía Servientrega */}
      {guiaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Número de guía Servientrega</h3>
            <p className="text-sm text-gray-500 mb-4">Ingresá el número de guía para notificar al cliente. Es opcional.</p>
            <input
              value={numeroGuia}
              onChange={e => setNumeroGuia(e.target.value)}
              className="input-field w-full mb-4"
              placeholder="Ej: 9876543210"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => cambiarMut.mutate({ id: guiaModal.id, estado: 'ENVIADO', guia: numeroGuia || undefined })}
                disabled={cambiarMut.isPending}
                className="btn-primary flex-1"
              >
                {cambiarMut.isPending ? 'Guardando...' : 'Marcar como Enviado'}
              </button>
              <button
                onClick={() => { setGuiaModal(null); setNumeroGuia('') }}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {guiaArchivoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Guía de envío</h3>
            <p className="text-sm text-gray-500 mb-4">{codigoVisible(guiaArchivoModal)} · visible para el cliente en su pedido</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Número de guía</label>
                <input
                  value={guiaNumeroEditar}
                  onChange={e => setGuiaNumeroEditar(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej: 9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Foto de la guía</label>
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#7d5c48] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => subirArchivoGuia(e.target.files?.[0])}
                  />
                  {subiendoGuia ? (
                    <p className="text-sm text-gray-500">Subiendo imagen...</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700">Haz clic para subir la foto de la guía</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP</p>
                    </>
                  )}
                </label>
              </div>

              {guiaImagenUrl && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <img src={guiaImagenUrl} alt="Guía de envío" className="w-full max-h-64 object-contain rounded bg-white" />
                  <div className="flex items-center justify-between gap-3 mt-3">
                    <a href={guiaImagenUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7d5c48] hover:underline">
                      Ver imagen completa
                    </a>
                    <button type="button" onClick={() => setGuiaImagenUrl('')} className="text-sm text-red-500 hover:underline">
                      Quitar imagen
                    </button>
                  </div>
                </div>
              )}

              {errorGuia && <p className="text-sm text-red-500">{errorGuia}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => actualizarGuiaMut.mutate({
                  id: guiaArchivoModal.id,
                  data: {
                    numeroGuia: guiaNumeroEditar || undefined,
                    guiaImagenUrl: guiaImagenUrl || undefined,
                  },
                })}
                disabled={actualizarGuiaMut.isPending}
                className="btn-primary flex-1"
              >
                {actualizarGuiaMut.isPending ? 'Guardando...' : 'Guardar guía'}
              </button>
              <button
                onClick={() => {
                  setGuiaArchivoModal(null)
                  setGuiaNumeroEditar('')
                  setGuiaImagenUrl('')
                  setErrorGuia('')
                }}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
