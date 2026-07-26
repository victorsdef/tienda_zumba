import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCupones, crearCupon, actualizarCupon, eliminarCupon, toggleCupon, type Cupon } from '../../api/admin'
import { getCategorias } from '../../api/categorias'
import { getProductosAdmin } from '../../api/admin'

const EMPTY: Cupon = { codigo: '', tipo: 'PORCENTAJE', valor: 10, activo: true }

type Restriccion = 'TODAS' | 'CATEGORIA' | 'PRODUCTO'

function getRestriccion(c: Cupon): Restriccion {
  if (c.productoId) return 'PRODUCTO'
  if (c.categoriaId) return 'CATEGORIA'
  return 'TODAS'
}

export default function AdminCupones() {
  const qc = useQueryClient()
  const { data: cupones = [], isLoading } = useQuery({ queryKey: ['cupones-admin'], queryFn: getCupones })
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const { data: productosPage } = useQuery({ queryKey: ['productos-admin', 0], queryFn: () => getProductosAdmin(0, 100) })
  const productos = productosPage?.content ?? []

  const [form, setForm] = useState<Cupon>(EMPTY)
  const [restriccion, setRestriccion] = useState<Restriccion>('TODAS')
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [busquedaProducto, setBusquedaProducto] = useState('')

  const invalidar = () => qc.invalidateQueries({ queryKey: ['cupones-admin'] })

  const crearMut = useMutation({ mutationFn: crearCupon, onSuccess: () => { invalidar(); cerrar() } })
  const actualizarMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Cupon }) => actualizarCupon(id, data), onSuccess: () => { invalidar(); cerrar() } })
  const eliminarMut = useMutation({ mutationFn: eliminarCupon, onSuccess: invalidar })
  const toggleMut = useMutation({ mutationFn: toggleCupon, onSuccess: invalidar })

  const cerrar = () => { setShowForm(false); setEditId(null); setForm(EMPTY); setRestriccion('TODAS'); setBusquedaProducto('') }

  const buildForm = (): Cupon => ({
    ...form,
    productoId: restriccion === 'PRODUCTO' ? form.productoId : undefined,
    categoriaId: restriccion === 'CATEGORIA' ? form.categoriaId : undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = buildForm()
    if (editId) actualizarMut.mutate({ id: editId, data })
    else crearMut.mutate(data)
  }

  const editar = (c: Cupon) => {
    setForm({ ...c, fechaExpiracion: c.fechaExpiracion?.slice(0, 16) })
    setEditId(c.id!)
    setRestriccion(getRestriccion(c))
    setBusquedaProducto('')
    setShowForm(true)
  }

  const productosFiltrados = productos.filter(p =>
    !busquedaProducto || p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  ).slice(0, 30)

  const productoSeleccionado = productos.find(p => p.id === form.productoId)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Cupones de descuento</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cupones.length} cupones creados</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); setRestriccion('TODAS') }}
          className="bg-[#4a3728] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#3a2a1e] transition-colors"
        >
          + Nuevo cupón
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">{editId ? 'Editar cupón' : 'Nuevo cupón'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Código *</label>
              <input
                required value={form.codigo}
                onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase font-mono"
                placeholder="PROMO10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Tipo *</label>
              <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as Cupon['tipo'] }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Valor * {form.tipo === 'PORCENTAJE' ? '(%)' : '($)'}
              </label>
              <input
                required type="number" min="0.01" step="0.01" value={form.valor}
                onChange={e => setForm(p => ({ ...p, valor: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Monto mínimo ($)</label>
              <input
                type="number" min="0" step="0.01" value={form.montoMinimo ?? ''}
                onChange={e => setForm(p => ({ ...p, montoMinimo: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Sin mínimo"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Máximo de usos</label>
              <input
                type="number" min="1" value={form.maxUsos ?? ''}
                onChange={e => setForm(p => ({ ...p, maxUsos: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Sin límite"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Fecha de expiración</label>
              <input
                type="datetime-local" value={form.fechaExpiracion ?? ''}
                onChange={e => setForm(p => ({ ...p, fechaExpiracion: e.target.value || undefined }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Restricción */}
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Aplicar cupón a</p>
            <div className="flex gap-3 mb-4 flex-wrap">
              {(['TODAS', 'CATEGORIA', 'PRODUCTO'] as Restriccion[]).map(r => (
                <label key={r} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${restriccion === r ? 'border-[#7d5c48] bg-[#f5f0e8] text-[#4a3728] font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" name="restriccion" checked={restriccion === r} onChange={() => { setRestriccion(r); setForm(p => ({ ...p, productoId: undefined, categoriaId: undefined })) }} className="hidden" />
                  {r === 'TODAS' ? 'Toda la tienda' : r === 'CATEGORIA' ? 'Una categoría' : 'Un producto'}
                </label>
              ))}
            </div>

            {restriccion === 'CATEGORIA' && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Categoría *</label>
                <select
                  required
                  value={form.categoriaId ?? ''}
                  onChange={e => setForm(p => ({ ...p, categoriaId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {restriccion === 'PRODUCTO' && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Producto *</label>
                {productoSeleccionado ? (
                  <div className="flex items-center gap-3 bg-[#f5f0e8] border border-[#ddd8d0] rounded-lg px-3 py-2">
                    <span className="text-sm text-[#4a3728] font-medium flex-1">{productoSeleccionado.nombre}</span>
                    <button type="button" onClick={() => { setForm(p => ({ ...p, productoId: undefined })); setBusquedaProducto('') }} className="text-xs text-red-500 hover:text-red-700">Quitar</button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={busquedaProducto}
                      onChange={e => setBusquedaProducto(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
                    />
                    {busquedaProducto && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                        {productosFiltrados.length === 0 ? (
                          <p className="text-xs text-gray-400 p-3">Sin resultados</p>
                        ) : productosFiltrados.map(p => (
                          <button
                            key={p.id} type="button"
                            onClick={() => { setForm(f => ({ ...f, productoId: p.id })); setBusquedaProducto('') }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#f5f0e8] border-b border-gray-50 last:border-0"
                          >
                            <span className="font-medium text-gray-800">{p.nombre}</span>
                            <span className="text-gray-400 text-xs ml-2">${Number(p.precio).toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={crearMut.isPending || actualizarMut.isPending}
              className="bg-[#4a3728] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#3a2a1e] disabled:opacity-50">
              {editId ? 'Guardar cambios' : 'Crear cupón'}
            </button>
            <button type="button" onClick={cerrar}
              className="border border-gray-200 px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : cupones.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎟️</p>
          <p className="font-medium">No hay cupones creados</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f0e8] text-[#4a3728]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Código</th>
                <th className="text-left px-4 py-3 font-semibold">Descuento</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Aplica a</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Usos</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Expira</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cupones.map(c => {
                const prod = c.productoId ? productos.find(p => p.id === c.productoId) : null
                const cat = c.categoriaId ? categorias.find(ct => ct.id === c.categoriaId) : null
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-[#4a3728]">{c.codigo}</td>
                    <td className="px-4 py-3">
                      {c.tipo === 'PORCENTAJE' ? `${c.valor}%` : `$${Number(c.valor).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">
                      {prod ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">📦 {prod.nombre}</span>
                      ) : cat ? (
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">🏷️ {cat.nombre}</span>
                      ) : (
                        <span className="text-gray-400">Toda la tienda</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                      {c.usos ?? 0}{c.maxUsos ? `/${c.maxUsos}` : ''}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                      {c.fechaExpiracion ? new Date(c.fechaExpiracion).toLocaleDateString('es-EC') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleMut.mutate(c.id!)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => editar(c)} className="text-xs text-[#7d5c48] hover:underline">Editar</button>
                        <button onClick={() => { if (confirm('¿Eliminar cupón?')) eliminarMut.mutate(c.id!) }}
                          className="text-xs text-red-500 hover:underline">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
