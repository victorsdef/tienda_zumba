import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getCategoriasAdmin, crearCategoria, actualizarCategoria, eliminarCategoria, toggleCategoria } from '../../api/categorias'
import ImageManager from '@shared/ImageManager'
import TallasSelector from '@shared/TallasSelector'
import { IconEdit, IconSearch, IconTrash } from '@shared/Icon'
import type { Categoria } from '../../types'

type FormData = { nombre: string; descripcion: string }

export default function AdminCategorias() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [imagen, setImagen] = useState('')
  const [tallas, setTallas] = useState<string[]>([])
  const [nombreWatch, setNombreWatch] = useState('')
  const [genero, setGenero] = useState('')
  const [categoriaPadreId, setCategoriaPadreId] = useState<number | ''>('')
  const [busqueda, setBusqueda] = useState('')
  const [saveError, setSaveError] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'ACTIVAS' | 'INACTIVAS'>('TODAS')
  const [filtroGenero, setFiltroGenero] = useState('')

  const GENEROS = [
    { value: 'MUJER',      label: 'Mujer' },
    { value: 'HOMBRE',     label: 'Hombre' },
    { value: 'NINO',       label: 'Niño/a' },
    { value: 'CALZADO',    label: 'Calzado' },
    { value: 'ACCESORIOS', label: 'Accesorios' },
    { value: 'BELLEZA',    label: 'Belleza' },
  ]

  const { data: categorias } = useQuery({ queryKey: ['categorias-admin'], queryFn: getCategoriasAdmin })
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormData>()

  const categoriasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    return (categorias ?? []).filter(c => {
      const nombre = c.nombre?.toLowerCase() ?? ''
      const descripcion = c.descripcion?.toLowerCase() ?? ''
      const generoCategoria = c.genero?.toLowerCase() ?? ''
      const estado = c.activo === false ? 'inactiva' : 'activa'

      const coincideBusqueda = !termino || (
        nombre.includes(termino) ||
        descripcion.includes(termino) ||
        generoCategoria.includes(termino) ||
        estado.includes(termino)
      )
      const coincideEstado =
        filtroEstado === 'TODAS' ||
        (filtroEstado === 'ACTIVAS' && c.activo !== false) ||
        (filtroEstado === 'INACTIVAS' && c.activo === false)
      const coincideGenero = !filtroGenero || c.genero === filtroGenero
      return coincideBusqueda && coincideEstado && coincideGenero
    })
  }, [busqueda, categorias, filtroEstado, filtroGenero])

  const totalCategorias = categorias?.length ?? 0
  const totalActivas = categorias?.filter(c => c.activo !== false).length ?? 0
  const totalInactivas = totalCategorias - totalActivas
  const totalConImagen = categorias?.filter(c => Boolean(c.imagen)).length ?? 0

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categorias-admin'] })
  const mutationError = (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status
    setSaveError(status === 401
      ? 'Tu sesión venció. Inicia sesión nuevamente y vuelve a guardar.'
      : status === 403
        ? 'Tu usuario no tiene permiso para modificar categorías.'
        : 'No se pudo guardar la categoría. Intenta nuevamente.')
  }
  const createMut = useMutation({ mutationFn: crearCategoria, onSuccess: () => { invalidate(); cerrar() }, onError: mutationError })
  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: Partial<Categoria> }) => actualizarCategoria(id, d),
    onSuccess: () => { invalidate(); cerrar() },
    onError: mutationError,
  })
  const deleteMut = useMutation({ mutationFn: eliminarCategoria, onSuccess: invalidate })
  const toggleMut = useMutation({
    mutationFn: toggleCategoria,
    onMutate: async (id: number) => {
      // Optimistic update: cambia el estado inmediatamente en el cache
      await qc.cancelQueries({ queryKey: ['categorias-admin'] })
      const previo = qc.getQueryData<Categoria[]>(['categorias-admin'])
      qc.setQueryData<Categoria[]>(['categorias-admin'], (viejo = []) =>
        viejo.map(c => c.id === id ? { ...c, activo: c.activo === false ? true : false } : c)
      )
      return { previo }
    },
    onError: (_err, _id, ctx) => {
      // Rollback si falla
      if (ctx?.previo) qc.setQueryData(['categorias-admin'], ctx.previo)
    },
    onSettled: () => {
      // Refetch para sincronizar con el servidor
      qc.invalidateQueries({ queryKey: ['categorias-admin'] })
      qc.invalidateQueries({ queryKey: ['categorias'] })
    },
  })

  const abrir = (c?: Categoria) => {
    setSaveError('')
    setEditando(c ?? null)
    setImagen(c?.imagen ?? '')
    setTallas(c?.tallasDisponibles ?? [])
    setNombreWatch(c?.nombre ?? '')
    setGenero(c?.genero ?? '')
    setCategoriaPadreId(c?.categoriaPadreId ?? '')
    reset(c ? { nombre: c.nombre, descripcion: c.descripcion ?? '' } : {})
    setMostrarForm(true)
  }

  const cerrar = () => {
    setSaveError('')
    setMostrarForm(false)
    setEditando(null)
    setImagen('')
    setTallas([])
    setNombreWatch('')
    setGenero('')
    setCategoriaPadreId('')
    reset({})
  }

  const onSubmit = (d: FormData) => {
    const payload = { ...d, imagen, genero, categoriaPadreId: categoriaPadreId === '' ? null : Number(categoriaPadreId), tallasDisponibles: tallas }
    editando ? updateMut.mutate({ id: editando.id, d: payload }) : createMut.mutate(payload)
  }

  return (
    <div className="p-3 sm:p-4 md:p-8 max-w-[1600px] mx-auto space-y-4">
      {/* Encabezado unificado (sticky) */}
      <div className="sticky top-14 lg:top-2 z-20 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">Categorías</h1>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
              {totalCategorias} en total · {totalActivas} activas · {totalInactivas} inactivas
            </p>
          </div>
          <button onClick={() => abrir()} className="bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
            <span className="text-base leading-none">+</span> <span className="hidden sm:inline">Nueva categoría</span><span className="sm:hidden">Nueva</span>
          </button>
        </div>

        <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
              placeholder="Buscar por nombre o descripción..."
            />
            {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm">✕</button>}
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3 flex items-center gap-2 overflow-x-auto">
          {([
            ['TODAS', 'Todas', totalCategorias],
            ['ACTIVAS', 'Activas', totalActivas],
            ['INACTIVAS', 'Inactivas', totalInactivas],
          ] as const).map(([value, label, count]) => (
            <button key={value} type="button" onClick={() => setFiltroEstado(value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${filtroEstado === value ? 'bg-[#4a3728] text-white border-[#4a3728] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'}`}>
              {label} <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filtroEstado === value ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
            </button>
          ))}
          <select value={filtroGenero} onChange={e => setFiltroGenero(e.target.value)}
            className="flex-shrink-0 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 focus:outline-none hover:border-gray-400 bg-white font-semibold">
            <option value="">Todos los grupos</option>
            {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total', value: totalCategorias, detail: 'categorías creadas', color: 'bg-gray-900 text-white' },
          { label: 'Activas', value: totalActivas, detail: 'visibles en la tienda', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Inactivas', value: totalInactivas, detail: 'ocultas temporalmente', color: 'bg-amber-50 text-amber-700' },
          { label: 'Con imagen', value: totalConImagen, detail: 'con portada configurada', color: 'bg-blue-50 text-blue-700' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${item.color}`}>{item.value}</span>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 px-1">Mostrando <strong className="text-gray-800">{categoriasFiltradas.length}</strong> resultados</p>

      {mostrarForm && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-5">
          <button type="button" aria-label="Cerrar" onClick={cerrar} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#9a7a63]">{editando ? 'Actualizar información' : 'Agregar al catálogo'}</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">{editando ? `Editar ${editando.nombre}` : 'Nueva categoría'}</h2>
                <p className="mt-1 text-xs text-gray-500">Completa los datos principales. Puedes modificarlos después.</p>
              </div>
              <button type="button" onClick={cerrar} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 hover:bg-gray-200">×</button>
            </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 sm:p-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">¿A quién está dirigida? *</label>
              <p className="mb-3 text-xs text-gray-400">Esto ayuda a organizar los filtros del catálogo.</p>
              <div className="flex flex-wrap gap-2">
                {GENEROS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGenero(g.value)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      genero === g.value
                        ? 'bg-[#4a3728] text-white border-[#4a3728] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#9a7a63]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoría padre (opcional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Categoría padre (opcional)</label>
              <p className="mb-2 text-xs text-gray-400">Selecciona una categoría existente si esta es una subcategoría. Ej: "Camisas" bajo "Ropa Hombre".</p>
              <select value={categoriaPadreId}
                onChange={e => setCategoriaPadreId(e.target.value === '' ? '' : Number(e.target.value))}
                className="input-field w-full">
                <option value="">— Sin padre (categoría principal) —</option>
                {(categorias ?? [])
                  .filter(c => c.id !== editando?.id && (!genero || c.genero === genero))
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Nombre de la categoría *</label>
              <input
                {...register('nombre', { required: 'El nombre es requerido' })}
                className={`input-field ${errors.nombre ? 'border-red-400 bg-red-50' : ''}`}
                placeholder="Ej: Vestidos"
                onChange={e => {
                  setNombreWatch(e.target.value)
                }}
              />
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Descripción</label>
              <input {...register('descripcion')} className="input-field" placeholder="Descripción opcional..." />
            </div>
            </div>

            {/* Tallas disponibles para esta categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Tallas disponibles</label>
              <p className="text-xs text-gray-400 mb-2">
                Se detectan automáticamente según el nombre · podés agregar o quitar las que quieras
              </p>
              <TallasSelector
                value={tallas}
                onChange={setTallas}
                categoriaNombre={nombreWatch}
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Imagen de portada</label>
              <p className="text-xs text-gray-500 mb-2">Se mostrará en el Home y ayudará a reconocer la categoría. Máximo 1 imagen.</p>
              <ImageManager
                value={imagen ? [imagen] : []}
                onChange={urls => setImagen(urls[urls.length - 1] ?? '')}
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              {saveError && <p className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>}
            </div>
            <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white p-5 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:p-6">
              <button type="button" onClick={cerrar} className="btn-outline px-5 py-2.5 text-sm">Cancelar</button>
              <button type="submit" disabled={isSubmitting || createMut.isPending || updateMut.isPending} className="btn-primary px-6 py-2.5 text-sm">
                {createMut.isPending || updateMut.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {categoriasFiltradas.map(c => (
          <article key={c.id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${c.activo === false ? 'border-dashed border-amber-300' : 'border-gray-200'}`}>
            <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
              {c.imagen
                ? <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover" />
                : <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 text-3xl font-bold">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
              }
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600 shadow-sm backdrop-blur">
                  {GENEROS.find(g => g.value === c.genero)?.label ?? 'Sin grupo'}
                </span>
              </div>
              <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${c.activo === false ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {c.activo === false ? 'Inactiva' : 'Activa'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-base text-gray-900">{c.nombre}</h3>
              <p className="mt-1 min-h-8 text-xs leading-relaxed text-gray-500 line-clamp-2">
                {c.descripcion || 'Sin descripción. Puedes agregar una para orientar mejor a tus clientes.'}
              </p>
              {c.tallasDisponibles && c.tallasDisponibles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.tallasDisponibles.slice(0, 5).map(t => (
                    <span key={t} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{t}</span>
                  ))}
                  {c.tallasDisponibles.length > 5 && (
                    <span className="text-[10px] px-1 py-1 text-gray-400">+{c.tallasDisponibles.length - 5} más</span>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50/70">
                <button onClick={() => abrir(c)} className="flex items-center justify-center gap-1.5 border-r border-gray-100 px-2 py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                  <IconEdit size={13} /> Editar
                </button>
                <button
                  onClick={() => toggleMut.mutate(c.id)}
                  className={`flex items-center justify-center gap-1 border-r border-gray-100 px-2 py-3 text-xs font-semibold hover:bg-white ${c.activo === false ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  {c.activo === false ? 'Activar' : 'Ocultar'}
                </button>
                <button onClick={() => { if (confirm('¿Eliminar?')) deleteMut.mutate(c.id) }}
                  className="flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-semibold text-red-500 hover:bg-red-50">
                  <IconTrash size={13} /> Eliminar
                </button>
            </div>
          </article>
        ))}
      </div>

      {categoriasFiltradas.length === 0 && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">⌕</div>
          <h3 className="mt-3 text-base font-semibold text-gray-800">No encontramos categorías</h3>
          <p className="text-sm text-gray-500 mt-1">Prueba cambiando la búsqueda o los filtros seleccionados.</p>
          <button type="button" onClick={() => { setBusqueda(''); setFiltroGenero(''); setFiltroEstado('TODAS') }} className="mt-4 text-sm font-semibold text-[#7d5c48] hover:underline">
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
