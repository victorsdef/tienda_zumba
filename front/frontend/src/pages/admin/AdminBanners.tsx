import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  getBannersAdmin, crearBanner, actualizarBanner,
  eliminarBanner, toggleBanner,
  type Banner, type BannerRequest,
} from '../../api/banners'
import { IconEdit, IconSearch, IconTrash } from '../../components/ui/Icon'
import { getCategorias } from '../../api/categorias'
import { getProductosAdmin } from '../../api/admin'
import ImageManager from '../../components/ui/ImageManager'

type FormData = {
  tag: string
  titulo: string
  subtitulo: string
  ctaTexto: string
  tipoDestino: string
  destinoValor: string
  colorDesde: string
  colorHasta: string
  orden: number
}

const TIPOS_DESTINO = [
  { value: 'CATALOGO',   label: 'Catálogo general' },
  { value: 'GENERO',     label: 'Por género' },
  { value: 'CATEGORIA',  label: 'Por categoría' },
  { value: 'PRODUCTO',   label: 'Producto específico' },
  { value: 'URL',        label: 'URL personalizada' },
]

const GENEROS = [
  { value: 'MUJER',      label: 'Mujer' },
  { value: 'HOMBRE',     label: 'Hombre' },
  { value: 'NINO',       label: 'Niño/a' },
  { value: 'CALZADO',    label: 'Calzado' },
  { value: 'ACCESORIOS', label: 'Accesorios' },
  { value: 'BELLEZA',    label: 'Belleza' },
]

function buildLink(tipo: string, valor: string): string {
  switch (tipo) {
    case 'CATALOGO':  return '/catalogo'
    case 'GENERO':    return `/catalogo?genero=${valor}`
    case 'CATEGORIA': return `/catalogo?categoriaId=${valor}`
    case 'PRODUCTO':  return `/producto/${valor}`
    case 'URL':       return valor || '/catalogo'
    default:          return '/catalogo'
  }
}

export default function AdminBanners() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<Banner | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [activo, setActivo] = useState(true)
  const [imagen, setImagen] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: getBannersAdmin,
  })
  const { data: cats = [] } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const { data: productosData } = useQuery({
    queryKey: ['admin-productos-banner'],
    queryFn: () => getProductosAdmin(0, 100),
  })
  const productos = productosData?.content ?? []

  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: { tag: '', titulo: '', subtitulo: '', ctaTexto: 'VER AHORA', tipoDestino: 'CATALOGO', destinoValor: '', colorDesde: '#7d5c48', colorHasta: '#6b5040', orden: 0 }
  })
  const tipoActual = watch('tipoDestino')

  const bannersFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return banners

    return banners.filter(b => {
      const tag = b.tag?.toLowerCase() ?? ''
      const titulo = b.titulo?.toLowerCase() ?? ''
      const subtitulo = b.subtitulo?.toLowerCase() ?? ''
      const destino = buildLink(b.tipoDestino, b.destinoValor).toLowerCase()
      const tipoDestino = b.tipoDestino?.toLowerCase() ?? ''
      const estado = b.activo ? 'activo' : 'inactivo'

      return (
        tag.includes(termino) ||
        titulo.includes(termino) ||
        subtitulo.includes(termino) ||
        destino.includes(termino) ||
        tipoDestino.includes(termino) ||
        estado.includes(termino)
      )
    })
  }, [banners, busqueda])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-banners'] })

  const createMut = useMutation({ mutationFn: crearBanner, onSuccess: () => { invalidate(); cerrar() } })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BannerRequest }) => actualizarBanner(id, data),
    onSuccess: () => { invalidate(); cerrar() },
  })
  const deleteMut = useMutation({ mutationFn: eliminarBanner, onSuccess: invalidate })
  const toggleMut = useMutation({ mutationFn: toggleBanner, onSuccess: invalidate })

  const abrir = (b?: Banner) => {
    setEditando(b ?? null)
    setActivo(b?.activo ?? true)
    setImagen(b?.imagen ?? '')
    reset(b ? {
      tag: b.tag,
      titulo: b.titulo,
      subtitulo: b.subtitulo,
      ctaTexto: b.ctaTexto,
      tipoDestino: b.tipoDestino,
      destinoValor: b.destinoValor,
      colorDesde: b.colorDesde,
      colorHasta: b.colorHasta,
      orden: b.orden,
    } : {
      tag: '',
      titulo: '',
      subtitulo: '',
      ctaTexto: 'VER AHORA',
      tipoDestino: 'CATALOGO',
      destinoValor: '',
      colorDesde: '#7d5c48',
      colorHasta: '#6b5040',
      orden: banners.length,
    })
    setMostrarForm(true)
  }

  const cerrar = () => {
    setMostrarForm(false)
    setEditando(null)
    setImagen('')
    reset({ tag: '', titulo: '', subtitulo: '', ctaTexto: 'VER AHORA', tipoDestino: 'CATALOGO', destinoValor: '', colorDesde: '#7d5c48', colorHasta: '#6b5040', orden: 0 })
  }

  const onSubmit = (d: FormData) => {
    const payload: BannerRequest = { ...d, orden: Number(d.orden), activo, imagen: imagen || undefined }
    editando
      ? updateMut.mutate({ id: editando.id, data: payload })
      : createMut.mutate(payload)
  }

  const moverOrden = (banner: Banner, dir: -1 | 1) => {
    const req: BannerRequest = {
      tag: banner.tag, titulo: banner.titulo, subtitulo: banner.subtitulo,
      ctaTexto: banner.ctaTexto, tipoDestino: banner.tipoDestino,
      destinoValor: banner.destinoValor, colorDesde: banner.colorDesde,
      colorHasta: banner.colorHasta, activo: banner.activo,
      imagen: banner.imagen,
      orden: banner.orden + dir,
    }
    updateMut.mutate({ id: banner.id, data: req })
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-xs text-gray-500 mt-0.5">Administrá el carrusel de la página principal</p>
        </div>
        <button onClick={() => abrir()} className="btn-primary flex items-center gap-1.5">
          <span className="text-lg leading-none">+</span> Nuevo banner
        </button>
      </div>

      <div className="bg-white border border-[#ede8df] rounded-lg p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="input-field w-full pl-9"
              placeholder="Buscar por título, etiqueta, destino o estado"
            />
          </div>
          <div className="text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-800">{bannersFiltrados.length}</span> de{' '}
            <span className="font-semibold text-gray-800">{banners.length}</span> banners
          </div>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-white border border-[#ede8df] rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">{editando ? 'Editar banner' : 'Nuevo banner'}</h2>
            <button onClick={cerrar} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Preview del gradiente */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Preview</label>
              <div
                className="rounded-lg h-24 flex items-center px-6 transition-all relative overflow-hidden"
                style={{ background: `linear-gradient(to right, ${watch('colorDesde') || '#7d5c48'}, ${watch('colorHasta') || '#6b5040'})` }}
              >
                {imagen && (
                  <div className="absolute inset-y-0 right-0 w-1/2">
                    <img src={imagen} alt="" className="w-full h-full object-cover"
                      style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }} />
                  </div>
                )}
                <div className="text-white relative z-10">
                  <p className="text-xs opacity-75">{watch('tag') || 'Etiqueta'}</p>
                  <p className="font-bold text-sm">{watch('titulo') || 'Título del banner'}</p>
                  <p className="text-xs opacity-75 mt-0.5">{watch('subtitulo') || 'Subtítulo'}</p>
                </div>
              </div>
            </div>

            {/* Colores */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Color desde</label>
                  <input
                    type="color"
                    value={watch('colorDesde') || '#7d5c48'}
                    onChange={e => setValue('colorDesde', e.target.value)}
                    className="w-full h-10 rounded cursor-pointer border border-gray-200 p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Color hasta</label>
                  <input
                    type="color"
                    value={watch('colorHasta') || '#6b5040'}
                    onChange={e => setValue('colorHasta', e.target.value)}
                    className="w-full h-10 rounded cursor-pointer border border-gray-200 p-0.5"
                  />
                </div>
              </div>

              {/* Paleta rápida */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Combinaciones rápidas</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { desde: '#7d5c48', hasta: '#8b6f5e', label: 'Café' },
                    { desde: '#1a1a2e', hasta: '#16213e', label: 'Marino' },
                    { desde: '#2d3436', hasta: '#636e72', label: 'Carbón' },
                    { desde: '#6c1b1b', hasta: '#c0392b', label: 'Rojo' },
                    { desde: '#1b4332', hasta: '#52b788', label: 'Verde' },
                    { desde: '#0d3b6e', hasta: '#1a6eb5', label: 'Azul' },
                    { desde: '#4a0e8f', hasta: '#9b59b6', label: 'Violeta' },
                    { desde: '#7d3c98', hasta: '#e91e8c', label: 'Rosa' },
                    { desde: '#b7410e', hasta: '#f39c12', label: 'Naranja' },
                    { desde: '#1a1a1a', hasta: '#4a4a4a', label: 'Negro' },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      title={p.label}
                      onClick={() => { setValue('colorDesde', p.desde); setValue('colorHasta', p.hasta) }}
                      className="w-8 h-8 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${p.desde}, ${p.hasta})` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Imagen derecha (opcional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Imagen <span className="font-normal text-gray-400 normal-case">(opcional — aparece a la derecha del texto)</span>
              </label>
              <ImageManager
                value={imagen ? [imagen] : []}
                onChange={urls => setImagen(urls[urls.length - 1] ?? '')}
                renderCropPreview={(url) => (
                  <div
                    className="rounded-lg h-20 flex items-center px-5 relative overflow-hidden"
                    style={{ background: `linear-gradient(to right, ${watch('colorDesde') || '#7d5c48'}, ${watch('colorHasta') || '#6b5040'})` }}
                  >
                    <div className="absolute inset-y-0 right-0 w-1/2">
                      <img src={url} alt="" className="w-full h-full object-cover"
                        style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }} />
                    </div>
                    <div className="text-white relative z-10">
                      <p className="text-[10px] opacity-75">{watch('tag') || 'Etiqueta'}</p>
                      <p className="font-bold text-sm">{watch('titulo') || 'Título del banner'}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{watch('subtitulo') || 'Subtítulo'}</p>
                    </div>
                  </div>
                )}
              />
              {imagen && (
                <button type="button" onClick={() => setImagen('')} className="text-xs text-red-400 hover:underline mt-1">
                  Quitar imagen
                </button>
              )}
            </div>

            {/* Textos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Etiqueta pequeña</label>
                <input {...register('tag')} className="input-field" placeholder="Ej: Nueva Colección" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('titulo', { required: 'El título es obligatorio' })}
                  className={`input-field ${errors.titulo ? 'border-red-400' : ''}`}
                  placeholder="Ej: ESTILO QUE TE DEFINE"
                />
                {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subtítulo</label>
                <input {...register('subtitulo')} className="input-field" placeholder="Ej: Descubre las tendencias" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Texto del botón</label>
                <input {...register('ctaTexto')} className="input-field" placeholder="Ej: VER COLECCIÓN" />
              </div>
            </div>

            {/* Destino */}
            <div className="border border-[#ede8df] rounded-lg p-4 space-y-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase">¿A dónde lleva el botón?</label>

              <select {...register('tipoDestino', { required: true })} className="input-field">
                {TIPOS_DESTINO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              {/* Selector dinámico según tipo */}
              {tipoActual === 'GENERO' && (
                <select {...register('destinoValor')} className="input-field">
                  <option value="">— Elegí un género —</option>
                  {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              )}

              {tipoActual === 'CATEGORIA' && (
                <select {...register('destinoValor')} className="input-field">
                  <option value="">— Elegí una categoría —</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              )}

              {tipoActual === 'PRODUCTO' && (
                <select {...register('destinoValor')} className="input-field">
                  <option value="">— Elegí un producto —</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              )}

              {tipoActual === 'URL' && (
                <input
                  {...register('destinoValor')}
                  className="input-field"
                  placeholder="Ej: /catalogo?sort=precio,asc"
                />
              )}

              {tipoActual && (
                <p className="text-xs text-gray-400">
                  Destino: <span className="font-mono text-gray-600">{buildLink(tipoActual, watch('destinoValor') || '')}</span>
                </p>
              )}
            </div>

            {/* Orden + activo */}
            <div className="flex items-center gap-4">
              <div className="w-28">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Orden</label>
                <input type="number" min={0} {...register('orden')} className="input-field" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <button
                  type="button"
                  onClick={() => setActivo(v => !v)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${activo ? 'bg-[#7d5c48]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${activo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-gray-600">{activo ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear banner'}
              </button>
              <button type="button" onClick={cerrar} className="btn-outline">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de banners */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando banners...</div>
      ) : banners.length === 0 ? (
        <div className="bg-white border border-[#ede8df] rounded-lg py-16 text-center">
          <p className="text-gray-400 text-sm">No hay banners creados todavía.</p>
          <button onClick={() => abrir()} className="mt-3 btn-primary">Crear el primero</button>
        </div>
      ) : bannersFiltrados.length === 0 ? (
        <div className="bg-white border border-[#ede8df] rounded-lg py-16 text-center">
          <p className="text-gray-700 text-sm font-semibold">No encontré banners con esa búsqueda.</p>
          <p className="text-gray-400 text-sm mt-1">Prueba con otro título, destino o estado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bannersFiltrados.map((b, i) => (
            <div key={b.id} className="bg-white border border-[#ede8df] rounded-lg overflow-hidden">
              {/* Preview banner completo */}
              <div
                className="relative h-28 flex items-center px-6"
                style={{ background: `linear-gradient(to right, ${b.colorDesde}, ${b.colorHasta})` }}
              >
                {b.imagen && (
                  <div className="absolute inset-y-0 right-0 w-1/2">
                    <img src={b.imagen} alt="" className="w-full h-full object-cover"
                      style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }} />
                  </div>
                )}
                <div className="text-white relative z-10">
                  {b.tag && <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">{b.tag}</p>}
                  <p className="font-black text-base leading-tight">{b.titulo}</p>
                  {b.subtitulo && <p className="text-xs opacity-75 mt-0.5">{b.subtitulo}</p>}
                </div>
                {/* Badge activo */}
                <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10 ${b.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Info + acciones */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[#ede8df] bg-gray-50">
                <p className="text-xs text-gray-400 font-mono">{buildLink(b.tipoDestino, b.destinoValor)}</p>

              {/* Acciones */}
              <div className="flex items-center gap-1">
                {/* Ordenar */}
                <div className="flex flex-col gap-0.5 mr-1">
                  <button
                    onClick={() => moverOrden(b, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center text-xs"
                  >↑</button>
                  <button
                    onClick={() => moverOrden(b, 1)}
                    disabled={i === bannersFiltrados.length - 1}
                    className="w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center text-xs"
                  >↓</button>
                </div>
                <button
                  onClick={() => toggleMut.mutate(b.id)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-xs"
                  title={b.activo ? 'Desactivar' : 'Activar'}
                >
                  {b.activo ? '⏸' : '▶'}
                </button>
                <button onClick={() => abrir(b)} className="p-1.5 rounded hover:bg-[#ede8df] text-[#7d5c48]" title="Editar">
                  <IconEdit size={16} />
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar este banner?')) deleteMut.mutate(b.id) }}
                  className="p-1.5 rounded hover:bg-red-50 text-red-400"
                  title="Eliminar"
                >
                  <IconTrash size={16} />
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
