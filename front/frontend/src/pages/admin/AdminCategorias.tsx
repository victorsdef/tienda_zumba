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
  const [busqueda, setBusqueda] = useState('')

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
    if (!termino) return categorias ?? []

    return (categorias ?? []).filter(c => {
      const nombre = c.nombre?.toLowerCase() ?? ''
      const descripcion = c.descripcion?.toLowerCase() ?? ''
      const generoCategoria = c.genero?.toLowerCase() ?? ''
      const estado = c.activo === false ? 'inactiva' : 'activa'

      return (
        nombre.includes(termino) ||
        descripcion.includes(termino) ||
        generoCategoria.includes(termino) ||
        estado.includes(termino)
      )
    })
  }, [busqueda, categorias])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['categorias-admin'] })
  const createMut = useMutation({ mutationFn: crearCategoria, onSuccess: () => { invalidate(); cerrar() } })
  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: Partial<Categoria> }) => actualizarCategoria(id, d),
    onSuccess: () => { invalidate(); cerrar() },
  })
  const deleteMut = useMutation({ mutationFn: eliminarCategoria, onSuccess: invalidate })
  const toggleMut = useMutation({ mutationFn: toggleCategoria, onSuccess: invalidate })

  const abrir = (c?: Categoria) => {
    setEditando(c ?? null)
    setImagen(c?.imagen ?? '')
    setTallas(c?.tallasDisponibles ?? [])
    setNombreWatch(c?.nombre ?? '')
    setGenero(c?.genero ?? '')
    reset(c ? { nombre: c.nombre, descripcion: c.descripcion ?? '' } : {})
    setMostrarForm(true)
  }

  const cerrar = () => {
    setMostrarForm(false)
    setEditando(null)
    setImagen('')
    setTallas([])
    setNombreWatch('')
    setGenero('')
    reset({})
  }

  const onSubmit = (d: FormData) => {
    const payload = { ...d, imagen, genero, tallasDisponibles: tallas }
    editando ? updateMut.mutate({ id: editando.id, d: payload }) : createMut.mutate(payload)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Categorías</h1>
          <p className="text-xs text-gray-500 mt-0.5">La imagen aparece en el círculo de categorías del inicio</p>
        </div>
        <button onClick={() => abrir()} className="btn-primary text-sm">+ Nueva categoría</button>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="input-field w-full pl-9"
              placeholder="Buscar por nombre, descripción, grupo o estado"
            />
          </div>
          <div className="text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-800">{categoriasFiltradas.length}</span> de{' '}
            <span className="font-semibold text-gray-800">{categorias?.length ?? 0}</span> categorías
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="bg-white border rounded-lg p-5 max-w-2xl">
          <h2 className="font-bold mb-4 text-gray-800">{editando ? 'Editar' : 'Nueva'} categoría</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Grupo *</label>
              <div className="flex flex-wrap gap-2">
                {GENEROS.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGenero(g.value)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      genero === g.value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Nombre *</label>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Descripción</label>
              <input {...register('descripcion')} className="input-field" placeholder="Descripción opcional..." />
            </div>

            {/* Tallas disponibles para esta categoría */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Tallas disponibles</label>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Imagen</label>
              <p className="text-xs text-gray-500 mb-2">Aparece en el círculo de categorías del Home · máx 1 imagen</p>
              <ImageManager
                value={imagen ? [imagen] : []}
                onChange={urls => setImagen(urls[urls.length - 1] ?? '')}
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={cerrar} className="btn-outline text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categoriasFiltradas.map(c => (
          <div key={c.id} className={`bg-white border rounded-lg overflow-hidden group hover:shadow-md transition-shadow ${c.activo === false ? 'opacity-50' : ''}`}>
            <div className="h-28 bg-gray-100 flex items-center justify-center overflow-hidden relative">
              {c.imagen
                ? <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover" />
                : <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
              }
              {c.activo === false && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border">INACTIVO</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-gray-800">{c.nombre}</h3>
              {c.descripcion && <p className="text-xs text-gray-500 mt-0.5 truncate">{c.descripcion}</p>}
              {c.tallasDisponibles && c.tallasDisponibles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.tallasDisponibles.slice(0, 4).map(t => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                  {c.tallasDisponibles.length > 4 && (
                    <span className="text-[10px] text-gray-400">+{c.tallasDisponibles.length - 4}</span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => abrir(c)} className="flex items-center gap-1 text-blue-600 text-xs hover:underline">
                  <IconEdit size={12} /> Editar
                </button>
                <button
                  onClick={() => toggleMut.mutate(c.id)}
                  className={`flex items-center gap-1 text-xs hover:underline ${c.activo === false ? 'text-green-600' : 'text-orange-500'}`}
                >
                  {c.activo === false ? '● Activar' : '● Desactivar'}
                </button>
                <button onClick={() => { if (confirm('¿Eliminar?')) deleteMut.mutate(c.id) }}
                  className="flex items-center gap-1 text-red-500 text-xs hover:underline">
                  <IconTrash size={12} /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categoriasFiltradas.length === 0 && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <h3 className="text-base font-semibold text-gray-800">No encontré categorías con esa búsqueda</h3>
          <p className="text-sm text-gray-500 mt-1">Prueba con otro nombre, grupo o estado.</p>
        </div>
      )}
    </div>
  )
}
