import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCupones, crearCupon, actualizarCupon, eliminarCupon, toggleCupon, type Cupon } from '../../api/admin'
import { getCategorias } from '../../api/categorias'
import { getProductosAdmin } from '../../api/admin'

type FiltroCupon = 'TODOS' | 'ACTIVOS' | 'INACTIVOS' | 'EXPIRADOS'

const EMPTY: Cupon = { codigo: '', tipo: 'PORCENTAJE', valor: 10, activo: true }
type Restriccion = 'TODAS' | 'CATEGORIA' | 'PRODUCTO'

function getRestriccion(c: Cupon): Restriccion {
  if (c.productoId) return 'PRODUCTO'
  if (c.categoriaId) return 'CATEGORIA'
  return 'TODAS'
}

const IconStore = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 10V6l2-3h10l2 3v4M5 10v10h14V10M9 20v-6h6v6" />
  </svg>
)
const IconTag = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 011.41.59l7.59 7.59a2 2 0 010 2.83l-6.58 6.58a2 2 0 01-2.83 0L4 12.99A2 2 0 013.41 11.58V7a4 4 0 014-4z" />
  </svg>
)
const IconBox = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const RESTRICCION_OPTS: { value: Restriccion; label: string; Icon: () => JSX.Element }[] = [
  { value: 'TODAS',    label: 'Toda la tienda', Icon: IconStore },
  { value: 'CATEGORIA', label: 'Una categoría',  Icon: IconTag },
  { value: 'PRODUCTO',  label: 'Un producto',    Icon: IconBox },
]

export default function AdminCupones() {
  const qc = useQueryClient()
  const { data: cupones = [], isLoading } = useQuery({ queryKey: ['cupones-admin'], queryFn: getCupones })
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const { data: productosPage } = useQuery({ queryKey: ['productos-admin-cup'], queryFn: () => getProductosAdmin(0, 200) })
  const productos = productosPage?.content ?? []

  const [form, setForm] = useState<Cupon>(EMPTY)
  const [restriccion, setRestriccion] = useState<Restriccion>('TODAS')
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroCupon>('TODOS')

  const cuponesFiltrados = useMemo(() => {
    const ahora = Date.now()
    return cupones.filter(c => {
      if (filtro === 'ACTIVOS' && !c.activo) return false
      if (filtro === 'INACTIVOS' && c.activo) return false
      if (filtro === 'EXPIRADOS') {
        if (!c.fechaExpiracion) return false
        if (new Date(c.fechaExpiracion).getTime() >= ahora) return false
      }
      if (busqueda) {
        const b = busqueda.toLowerCase()
        if (!c.codigo.toLowerCase().includes(b)) return false
      }
      return true
    })
  }, [cupones, filtro, busqueda])

  const cuentaActivos = cupones.filter(c => c.activo).length
  const cuentaInactivos = cupones.filter(c => !c.activo).length
  const cuentaExpirados = cupones.filter(c => c.fechaExpiracion && new Date(c.fechaExpiracion).getTime() < Date.now()).length

  const invalidar = () => qc.invalidateQueries({ queryKey: ['cupones-admin'] })
  const crearMut = useMutation({ mutationFn: crearCupon, onSuccess: () => { invalidar(); cerrar() } })
  const actualizarMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Cupon }) => actualizarCupon(id, data), onSuccess: () => { invalidar(); cerrar() } })
  const eliminarMut = useMutation({ mutationFn: eliminarCupon, onSuccess: invalidar })
  const toggleMut = useMutation({ mutationFn: toggleCupon, onSuccess: invalidar })

  const cerrar = () => { setShowForm(false); setEditId(null); setForm(EMPTY); setRestriccion('TODAS'); setBusquedaProducto('') }

  const abrirNuevo = () => { setEditId(null); setForm(EMPTY); setRestriccion('TODAS'); setShowForm(true) }

  const editar = (c: Cupon) => {
    setForm({ ...c, fechaExpiracion: c.fechaExpiracion?.slice(0, 16) })
    setEditId(c.id!)
    setRestriccion(getRestriccion(c))
    setBusquedaProducto('')
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: Cupon = {
      ...form,
      productoId: restriccion === 'PRODUCTO' ? form.productoId : undefined,
      categoriaId: restriccion === 'CATEGORIA' ? form.categoriaId : undefined,
    }
    if (editId) actualizarMut.mutate({ id: editId, data })
    else crearMut.mutate(data)
  }

  const productosFiltrados = productos.filter(p =>
    !busquedaProducto || p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  ).slice(0, 20)
  const productoSeleccionado = productos.find(p => p.id === form.productoId)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">

      {/* Encabezado unificado (sticky) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5 sticky top-14 lg:top-2 z-20">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">Cupones</h1>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
              {cupones.length} en total · {cuponesFiltrados.length} visibles
            </p>
          </div>
          <button onClick={abrirNuevo}
            className="flex items-center gap-1.5 bg-[#4a3728] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#3a2a1e] transition-colors flex-shrink-0">
            <span className="text-base leading-none">+</span> <span className="hidden sm:inline">Nuevo cupón</span><span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por código..."
              className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm">✕</button>
            )}
          </div>
        </div>

        {/* Pills */}
        <div className="px-4 sm:px-5 py-3 flex items-center gap-2 overflow-x-auto">
          {[
            { v: 'TODOS' as FiltroCupon, l: 'Todos', c: cupones.length },
            { v: 'ACTIVOS' as FiltroCupon, l: 'Activos', c: cuentaActivos },
            { v: 'INACTIVOS' as FiltroCupon, l: 'Inactivos', c: cuentaInactivos },
            { v: 'EXPIRADOS' as FiltroCupon, l: 'Expirados', c: cuentaExpirados },
          ].map(p => (
            <button key={p.v} onClick={() => setFiltro(p.v)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                filtro === p.v ? 'bg-[#4a3728] text-white border-[#4a3728] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
              }`}>
              {p.l}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filtro === p.v ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{p.c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Formulario — panel deslizable */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={cerrar} />
          {/* Panel */}
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            {/* Cabecera panel */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#4a3728]">
              <div>
                <p className="text-xs text-[#c9b8a8] font-medium uppercase tracking-wider">
                  {editId ? 'Editando cupón' : 'Nuevo cupón'}
                </p>
                <h2 className="text-white font-bold text-lg leading-tight">
                  {editId ? form.codigo || '—' : 'Crear cupón'}
                </h2>
              </div>
              <button onClick={cerrar} className="text-[#c9b8a8] hover:text-white text-xl leading-none p-1">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-5">

              {/* Código */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Código del cupón</label>
                <input
                  required value={form.codigo}
                  onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                  placeholder="PROMO20"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base uppercase font-mono font-bold text-[#4a3728] tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30 focus:border-[#7d5c48]"
                />
                <p className="text-[11px] text-gray-400 mt-1">Este es el código que tu cliente escribirá al pagar.</p>
              </div>

              {/* Tipo de descuento — cards visuales */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de descuento</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, tipo: 'PORCENTAJE', valor: 10 }))}
                    className={`text-left border rounded-xl p-3 transition-all ${
                      form.tipo === 'PORCENTAJE'
                        ? 'border-[#7d5c48] bg-[#f5f0e8] ring-2 ring-[#7d5c48]/20 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                        form.tipo === 'PORCENTAJE' ? 'bg-[#4a3728] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>%</span>
                      <span className="font-bold text-sm text-gray-800">Porcentaje</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">Ej: 20% de descuento</p>
                  </button>
                  <button type="button"
                    onClick={() => setForm(p => ({ ...p, tipo: 'MONTO_FIJO', valor: 5 }))}
                    className={`text-left border rounded-xl p-3 transition-all ${
                      form.tipo === 'MONTO_FIJO'
                        ? 'border-[#7d5c48] bg-[#f5f0e8] ring-2 ring-[#7d5c48]/20 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                        form.tipo === 'MONTO_FIJO' ? 'bg-[#4a3728] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>$</span>
                      <span className="font-bold text-sm text-gray-800">Monto fijo</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight">Ej: $5 de descuento</p>
                  </button>
                </div>
              </div>

              {/* Valor con contexto */}
              <div className="bg-[#faf7f2] border border-[#ede8df] rounded-xl p-3.5">
                <label className="block text-xs font-bold text-[#7d5c48] uppercase tracking-wider mb-2">
                  {form.tipo === 'PORCENTAJE' ? '¿Qué % de descuento?' : '¿Cuántos dólares de descuento?'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7d5c48] text-lg font-bold">
                    {form.tipo === 'PORCENTAJE' ? '%' : '$'}
                  </span>
                  <input required type="number" min="0.01" step="0.01" max={form.tipo === 'PORCENTAJE' ? 100 : undefined}
                    value={form.valor}
                    onChange={e => setForm(p => ({ ...p, valor: Number(e.target.value) }))}
                    placeholder={form.tipo === 'PORCENTAJE' ? '20' : '5.00'}
                    className="w-full border-2 border-white bg-white rounded-xl pl-10 pr-4 py-3 text-2xl font-black text-[#4a3728] focus:outline-none focus:border-[#7d5c48]"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-2 leading-tight">
                  {form.tipo === 'PORCENTAJE'
                    ? <>El cliente pagará <strong className="text-[#4a3728]">{Math.max(0, 100 - (form.valor || 0)).toFixed(0)}%</strong> del total (ej: si compra $50, pagará ${(50 * (1 - (form.valor || 0) / 100)).toFixed(2)}).</>
                    : <>Se restarán <strong className="text-[#4a3728]">${(form.valor || 0).toFixed(2)}</strong> del total del pedido.</>}
                </p>
              </div>

              {/* Mínimo + Usos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monto mínimo ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={form.montoMinimo ?? ''}
                      onChange={e => setForm(p => ({ ...p, montoMinimo: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Máx. usos</label>
                  <input type="number" min="1" value={form.maxUsos ?? ''}
                    onChange={e => setForm(p => ({ ...p, maxUsos: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="Sin límite"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
                  />
                </div>
              </div>

              {/* Fecha expiración */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Fecha de expiración</label>
                <input type="datetime-local" value={form.fechaExpiracion ?? ''}
                  onChange={e => setForm(p => ({ ...p, fechaExpiracion: e.target.value || undefined }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
                />
              </div>

              {/* Restricción */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Aplica a</label>
                <div className="grid grid-cols-3 gap-2">
                  {RESTRICCION_OPTS.map(r => (
                    <button key={r.value} type="button"
                      onClick={() => { setRestriccion(r.value); setForm(p => ({ ...p, productoId: undefined, categoriaId: undefined })) }}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
                        restriccion === r.value
                          ? 'border-[#7d5c48] bg-[#f5f0e8] text-[#4a3728]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <r.Icon />
                      <span className="leading-tight text-center">{r.label}</span>
                    </button>
                  ))}
                </div>

                {restriccion === 'CATEGORIA' && (
                  <div className="mt-3">
                    <select required value={form.categoriaId ?? ''}
                      onChange={e => setForm(p => ({ ...p, categoriaId: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30">
                      <option value="">Selecciona una categoría</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                )}

                {restriccion === 'PRODUCTO' && (
                  <div className="mt-3">
                    {productoSeleccionado ? (
                      <div className="flex items-center gap-3 bg-[#f5f0e8] border border-[#ddd8d0] rounded-xl px-4 py-2.5">
                        <span className="text-sm text-[#4a3728] font-medium flex-1">{productoSeleccionado.nombre}</span>
                        <button type="button" onClick={() => { setForm(p => ({ ...p, productoId: undefined })); setBusquedaProducto('') }}
                          className="text-xs text-red-500 hover:text-red-700 font-medium">✕ Quitar</button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input type="text" placeholder="Buscar producto..." value={busquedaProducto}
                          onChange={e => setBusquedaProducto(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
                        />
                        {busquedaProducto && (
                          <div className="absolute z-10 left-0 right-0 mt-1 border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                            {productosFiltrados.length === 0
                              ? <p className="text-xs text-gray-400 p-3">Sin resultados</p>
                              : productosFiltrados.map(p => (
                                <button key={p.id} type="button"
                                  onClick={() => { setForm(f => ({ ...f, productoId: p.id })); setBusquedaProducto('') }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f5f0e8] border-b border-gray-50 last:border-0 flex items-center justify-between">
                                  <span className="font-medium text-gray-800">{p.nombre}</span>
                                  <span className="text-gray-400 text-xs">${Number(p.precio).toFixed(2)}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="pt-2 flex gap-3">
                <button type="submit" disabled={crearMut.isPending || actualizarMut.isPending}
                  className="flex-1 bg-[#4a3728] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#3a2a1e] disabled:opacity-50 transition-colors">
                  {crearMut.isPending || actualizarMut.isPending ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear cupón'}
                </button>
                <button type="button" onClick={cerrar}
                  className="px-5 py-3 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de cupones */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : cuponesFiltrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 010 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 010-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="font-semibold text-gray-500">{cupones.length === 0 ? 'No hay cupones creados' : 'Sin resultados con esos filtros'}</p>
          {cupones.length === 0 && <p className="text-sm mt-1">Crea tu primer cupón con el botón de arriba</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cuponesFiltrados.map(c => {
            const prod = c.productoId ? productos.find(p => p.id === c.productoId) : null
            const cat = c.categoriaId ? categorias.find(ct => ct.id === c.categoriaId) : null
            const agotado = c.maxUsos != null && (c.usos ?? 0) >= c.maxUsos
            const venceProximamente = c.fechaExpiracion
              ? new Date(c.fechaExpiracion).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
              : false

            return (
              <div key={c.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${
                agotado ? 'border-red-300 ring-1 ring-red-100' : !c.activo ? 'opacity-60' : ''
              }`}>
                {/* Franja superior con código */}
                <div className="bg-[#4a3728] px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#a89888] uppercase tracking-widest font-medium">Código</p>
                    <p className="text-white font-black text-lg font-mono tracking-widest leading-tight">{c.codigo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#a89888] uppercase tracking-widest">Descuento</p>
                    <p className="text-[#f5d4a0] font-black text-2xl leading-tight">
                      {c.tipo === 'PORCENTAJE' ? `${c.valor}%` : `$${Number(c.valor).toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="px-5 py-3 space-y-2">
                  {/* Aplica a */}
                  <div className="flex items-center gap-2">
                    {prod ? (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        {prod.nombre}
                      </span>
                    ) : cat ? (
                      <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 011.41.59l7.59 7.59a2 2 0 010 2.83l-6.58 6.58a2 2 0 01-2.83 0L4 12.99A2 2 0 013.41 11.58V7a4 4 0 014-4z" /></svg>
                        {cat.nombre}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 10V6l2-3h10l2 3v4M5 10v10h14V10" /></svg>
                        Toda la tienda
                      </span>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className={agotado ? 'font-semibold text-red-600' : ''}>
                      Usos: <strong className={agotado ? 'text-red-700' : 'text-gray-700'}>{c.usos ?? 0}{c.maxUsos ? `/${c.maxUsos}` : ''}</strong>
                      {agotado && ' · Límite alcanzado'}
                    </span>
                    {c.montoMinimo && <span>Mín: <strong className="text-gray-700">${c.montoMinimo}</strong></span>}
                    {c.fechaExpiracion && (
                      <span className={venceProximamente ? 'text-orange-500 font-semibold' : ''}>
                        Vence: <strong>{new Date(c.fechaExpiracion).toLocaleDateString('es-EC')}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer con acciones */}
                <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
                  <button onClick={() => !agotado && toggleMut.mutate(c.id!)}
                    disabled={agotado}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      agotado
                        ? 'cursor-not-allowed bg-red-100 text-red-700'
                        : c.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}>
                    {agotado ? '● Agotado' : c.activo ? '● Activo' : '○ Inactivo'}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => editar(c)}
                      className="text-xs text-[#7d5c48] font-medium hover:bg-[#f5f0e8] px-3 py-1.5 rounded-lg transition-colors">
                      Editar
                    </button>
                    <button onClick={() => { if (confirm('¿Eliminar cupón?')) eliminarMut.mutate(c.id!) }}
                      className="text-xs text-red-500 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
