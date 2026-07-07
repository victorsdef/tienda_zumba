import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  getBannersAdmin, crearBanner, actualizarBanner,
  eliminarBanner, toggleBanner,
  type Banner, type BannerRequest,
} from '../../api/banners'
import HeroBannerPreview from '@widgets/banners/HeroBannerPreview'
import { IconEdit, IconSearch, IconTrash } from '@shared/Icon'
import { getCategorias } from '../../api/categorias'
import { getProductosAdmin } from '../../api/admin'
import ImageManager from '@shared/ImageManager'

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

const HERO_TIPS = [
  'Usa una foto editorial vertical o 4:5, con la modelo hacia la derecha.',
  'Deja el lado izquierdo más limpio para que el texto respire.',
  'Mantén el título corto y elegante; evita frases largas en mayúsculas.',
  'Prefiere tonos café, beige, negro o vino para que combine con la portada.',
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
  const tagPreview = watch('tag') || 'Sofia Couture EC'
  const tituloPreview = watch('titulo') || 'Pantalones que realzan tu esencia'
  const subtituloPreview = watch('subtitulo') || 'Disenos elegantes con una presencia mas cuidada.'
  const ctaPreview = watch('ctaTexto') || 'Comprar ahora'

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
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Preview portada</label>
                  <HeroBannerPreview
                    tag={tagPreview}
                    titulo={tituloPreview}
                    subtitulo={subtituloPreview}
                    ctaTexto={ctaPreview}
                    imagen={imagen}
                    colorDesde={watch('colorDesde') || '#2f1f17'}
                    colorHasta={watch('colorHasta') || '#7d5c48'}
                    compact
                    previewMode
                  />
                </div>

                <div className="rounded-lg border border-[#ede8df] bg-[#faf7f2] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">Guia para este hero</p>
                  <div className="space-y-3">
                    {HERO_TIPS.map(tip => (
                      <div key={tip} className="flex gap-2 text-sm text-gray-600">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#7d5c48]" />
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-[#e4d8cb] bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Imagen ideal</p>
                      <p className="mt-1 text-sm text-gray-700">2000 x 2400 px o similar, enfoque limpio y tonos cálidos.</p>
                    </div>
                    <div className="rounded-lg border border-[#e4d8cb] bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Texto ideal</p>
                      <p className="mt-1 text-sm text-gray-700">Título de 1 a 2 líneas, subtítulo corto y un solo CTA.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">

                {/* Textos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Etiqueta pequeña</label>
                    <input {...register('tag')} className="input-field" placeholder="Ej: Sofia Couture EC" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('titulo', { required: 'El título es obligatorio' })}
                      className={`input-field ${errors.titulo ? 'border-red-400' : ''}`}
                      placeholder="Ej: Pantalones que realzan tu esencia"
                    />
                    {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subtítulo</label>
                    <textarea
                      {...register('subtitulo')}
                      className="input-field min-h-[96px] resize-y"
                      placeholder="Ej: Diseños elegantes con una presencia más cuidada."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Texto del botón</label>
                    <input {...register('ctaTexto')} className="input-field" placeholder="Ej: COMPRAR AHORA" />
                    <p className="mt-2 text-xs text-gray-400">Usa una sola llamada a la acción clara.</p>
                  </div>
                </div>

                {/* Imagen hero */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Imagen hero <span className="font-normal text-gray-400 normal-case">(recomendada para la nueva portada)</span>
                  </label>
                  <ImageManager
                    value={imagen ? [imagen] : []}
                    onChange={urls => setImagen(urls[urls.length - 1] ?? '')}
                    renderCropPreview={(url) => (
                      <HeroBannerPreview
                        tag={tagPreview}
                        titulo={tituloPreview}
                        subtitulo={subtituloPreview}
                        ctaTexto={ctaPreview}
                        imagen={url}
                        colorDesde={watch('colorDesde') || '#2f1f17'}
                        colorHasta={watch('colorHasta') || '#7d5c48'}
                        compact
                        previewMode
                      />
                    )}
                  />
                  {imagen && (
                    <button type="button" onClick={() => setImagen('')} className="text-xs text-red-400 hover:underline mt-1">
                      Quitar imagen
                    </button>
                  )}
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

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Paleta rápida</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { desde: '#2f1f17', hasta: '#7d5c48', label: 'Cafe editorial' },
                        { desde: '#3c2419', hasta: '#9a7357', label: 'Chocolate' },
                        { desde: '#231a16', hasta: '#685246', label: 'Cafe profundo' },
                        { desde: '#473127', hasta: '#c3a487', label: 'Beige calido' },
                        { desde: '#1f1a18', hasta: '#554844', label: 'Carbon' },
                        { desde: '#4d272a', hasta: '#91615e', label: 'Vino suave' },
                      ].map(p => (
                        <button
                          key={p.label}
                          type="button"
                          title={p.label}
                          onClick={() => { setValue('colorDesde', p.desde); setValue('colorHasta', p.hasta) }}
                          className="h-9 w-9 rounded-lg border-2 border-white shadow transition-transform hover:scale-110"
                          style={{ background: `linear-gradient(135deg, ${p.desde}, ${p.hasta})` }}
                        />
                      ))}
                    </div>
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
              </div>
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
              <div className="relative">
                <HeroBannerPreview
                  tag={b.tag}
                  titulo={b.titulo}
                  subtitulo={b.subtitulo}
                  ctaTexto={b.ctaTexto}
                  imagen={b.imagen}
                  colorDesde={b.colorDesde}
                  colorHasta={b.colorHasta}
                  compact
                  previewMode
                />
                <span className={`absolute right-3 top-8 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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
