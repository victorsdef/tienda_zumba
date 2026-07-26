import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCupones, crearCupon, actualizarCupon, eliminarCupon, toggleCupon, type Cupon } from '../../api/admin'

const EMPTY: Cupon = { codigo: '', tipo: 'PORCENTAJE', valor: 10, activo: true }

export default function AdminCupones() {
  const qc = useQueryClient()
  const { data: cupones = [], isLoading } = useQuery({ queryKey: ['cupones-admin'], queryFn: getCupones })
  const [form, setForm] = useState<Cupon>(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const invalidar = () => qc.invalidateQueries({ queryKey: ['cupones-admin'] })

  const crearMut = useMutation({ mutationFn: crearCupon, onSuccess: () => { invalidar(); setShowForm(false); setForm(EMPTY) } })
  const actualizarMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Cupon }) => actualizarCupon(id, data), onSuccess: () => { invalidar(); setShowForm(false); setEditId(null); setForm(EMPTY) } })
  const eliminarMut = useMutation({ mutationFn: eliminarCupon, onSuccess: invalidar })
  const toggleMut = useMutation({ mutationFn: toggleCupon, onSuccess: invalidar })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) actualizarMut.mutate({ id: editId, data: form })
    else crearMut.mutate(form)
  }

  const editar = (c: Cupon) => {
    setForm({ ...c, fechaExpiracion: c.fechaExpiracion?.slice(0, 16) })
    setEditId(c.id!)
    setShowForm(true)
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Cupones de descuento</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cupones.length} cupones creados</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }}
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
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={crearMut.isPending || actualizarMut.isPending}
              className="bg-[#4a3728] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#3a2a1e] disabled:opacity-50">
              {editId ? 'Guardar cambios' : 'Crear cupón'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }}
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
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Mínimo</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Usos</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Expira</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cupones.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-[#4a3728]">{c.codigo}</td>
                  <td className="px-4 py-3">
                    {c.tipo === 'PORCENTAJE' ? `${c.valor}%` : `$${Number(c.valor).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                    {c.montoMinimo ? `$${Number(c.montoMinimo).toFixed(2)}` : '—'}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
