import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  getBannersAdmin, crearBanner, actualizarBanner,
  eliminarBanner, toggleBanner,
  type Banner, type BannerRequest,
} from '../../api/banners'
import HeroBannerPreview from '@widgets/banners/HeroBannerPreview'
import { IconEdit, IconSearch, IconTrash, IconX } from '@shared/Icon'
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
  { value: 'CATALOGO',  label: 'Catálogo general',    desc: 'Lleva al catálogo completo' },
  { value: 'GENERO',    label: 'Por género',           desc: 'Filtra por género' },
  { value: 'CATEGORIA', label: 'Por categoría',        desc: 'Filtra por categoría' },
  { value: 'PRODUCTO',  label: 'Producto específico',  desc: 'Abre un producto' },
  { value: 'URL',       label: 'URL personalizada',    desc: 'Ruta libre' },
]

const GENEROS = [
  { value: 'MUJER',      label: 'Mujer',      emoji: '👗' },
  { value: 'HOMBRE',     label: 'Hombre',     emoji: '👔' },
  { value: 'NINO',       label: 'Niño/a',     emoji: '🧒' },
  { value: 'CALZADO',    label: 'Calzado',    emoji: '👟' },
  { value: 'ACCESORIOS', label: 'Accesorios', emoji: '👜' },
  { value: 'BELLEZA',    label: 'Belleza',    emoji: '💄' },
]

const PALETA = [
  { desde: '#2f1f17', hasta: '#7d5c48', label: 'Café editorial' },
  { desde: '#3c2419', hasta: '#9a7357', label: 'Chocolate' },
  { desde: '#231a16', hasta: '#685246', label: 'Café profundo' },
  { desde: '#473127', hasta: '#c3a487', label: 'Beige cálido' },
  { desde: '#1f1a18', hasta: '#554844', label: 'Carbón' },
  { desde: '#4d272a', hasta: '#91615e', label: 'Vino suave' },
  { desde: '#1a1a2e', hasta: '#4a4a8a', label: 'Noche azul' },
  { desde: '#0d2b1a', hasta: '#2d6a4f', label: 'Bosque' },
]

const HERO_TIPS = [
  'Usa una foto editorial vertical o 4:5, con la modelo hacia la derecha.',
  'Deja el lado izquierdo más limpio para que el texto respire.',
  'Mantén el título corto y elegante; evita frases largas en mayúsculas.',
  'Prefiere tonos café, beige, negro o vino para que combine con la portada.',
]

const PASOS = ['Imagen', 'Textos', 'Colores', 'Destino', 'Publicar']

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
  const [paso, setPaso] = useState(1)
  const [activo, setActivo] = useState(true)
  const [imagen, setImagen] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [verPreview, setVerPreview] = useState(false)
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())

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

  const { register, handleSubmit, reset, watch, setValue, trigger, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: {
      tag: '', titulo: '', subtitulo: '', ctaTexto: 'VER AHORA',
      tipoDestino: 'CATALOGO', destinoValor: '',
      colorDesde: '#7d5c48', colorHasta: '#6b5040', orden: 0,
    }
  })

  const tipoActual   = watch('tipoDestino')
  const tagPreview   = watch('tag')    || 'Sofia Couture EC'
  const tituloPreview   = watch('titulo')    || 'Pantalones que realzan tu esencia'
  const subtituloPreview = watch('subtitulo') || 'Diseños elegantes con una presencia más cuidada.'
  const ctaPreview   = watch('ctaTexto') || 'VER AHORA'
  const colorDesde   = watch('colorDesde') || '#7d5c48'
  const colorHasta   = watch('colorHasta') || '#6b5040'

  const bannersFiltrados = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    if (!t) return banners
    return banners.filter(b =>
      (b.tag ?? '').toLowerCase().includes(t) ||
      (b.titulo ?? '').toLowerCase().includes(t) ||
      buildLink(b.tipoDestino, b.destinoValor).toLowerCase().includes(t) ||
      (b.activo ? 'activo' : 'inactivo').includes(t)
    )
  }, [banners, busqueda])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-banners'] })

  const createMut = useMutation({ mutationFn: crearBanner,    onSuccess: () => { invalidate(); cerrar() } })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BannerRequest }) => actualizarBanner(id, data),
    onSuccess: () => { invalidate(); cerrar() },
  })
  const deleteMut = useMutation({ mutationFn: eliminarBanner, onSuccess: invalidate })
  const toggleMut = useMutation({ mutationFn: toggleBanner,   onSuccess: invalidate })

  const abrir = (b?: Banner) => {
    setEditando(b ?? null)
    setActivo(b?.activo ?? true)
    setImagen(b?.imagen ?? '')
    setPaso(1)
    reset(b ? {
      tag: b.tag, titulo: b.titulo, subtitulo: b.subtitulo, ctaTexto: b.ctaTexto,
      tipoDestino: b.tipoDestino, destinoValor: b.destinoValor,
      colorDesde: b.colorDesde, colorHasta: b.colorHasta, orden: b.orden,
    } : {
      tag: '', titulo: '', subtitulo: '', ctaTexto: 'VER AHORA',
      tipoDestino: 'CATALOGO', destinoValor: '',
      colorDesde: '#7d5c48', colorHasta: '#6b5040', orden: banners.length,
    })
    setMostrarForm(true)
  }

  const cerrar = () => {
    setMostrarForm(false)
    setEditando(null)
    setImagen('')
    setPaso(1)
    reset({
      tag: '', titulo: '', subtitulo: '', ctaTexto: 'VER AHORA',
      tipoDestino: 'CATALOGO', destinoValor: '',
      colorDesde: '#7d5c48', colorHasta: '#6b5040', orden: 0,
    })
  }

  const siguientePaso = async () => {
    if (paso === 2) {
      const ok = await trigger(['titulo'])
      if (!ok) return
    }
    setPaso(p => Math.min(p + 1, 5))
  }

  const onSubmit = (d: FormData) => {
    const payload: BannerRequest = { ...d, orden: Number(d.orden), activo, imagen: imagen || undefined }
    editando
      ? updateMut.mutate({ id: editando.id, data: payload })
      : createMut.mutate(payload)
  }

  const moverOrden = (b: Banner, dir: -1 | 1) => {
    const req: BannerRequest = {
      tag: b.tag, titulo: b.titulo, subtitulo: b.subtitulo, ctaTexto: b.ctaTexto,
      tipoDestino: b.tipoDestino, destinoValor: b.destinoValor,
      colorDesde: b.colorDesde, colorHasta: b.colorHasta,
      activo: b.activo, imagen: b.imagen, orden: b.orden + dir,
    }
    updateMut.mutate({ id: b.id, data: req })
  }

  // ── Minipreview siempre visible en el modal ───────────────────────────────
  const MiniPreview = ({ height = 320 }: { height?: number }) => {
    const REF = 700
    const scale = height / REF
    return (
      <div className="w-full overflow-hidden rounded-xl border border-[#ede8df] shadow-sm bg-gray-50" style={{ height }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${100 / scale}%`, height: REF, pointerEvents: 'none' }}>
          <HeroBannerPreview
            tag={tagPreview} titulo={tituloPreview} subtitulo={subtituloPreview}
            ctaTexto={ctaPreview} imagen={imagen}
            colorDesde={colorDesde} colorHasta={colorHasta}
            compact previewMode
          />
        </div>
      </div>
    )
  }

  // ── Contenido por paso ────────────────────────────────────────────────────
  const renderPaso = () => {
    switch (paso) {

      // PASO 1 — Imagen ────────────────────────────────────────────────────
      case 1: return (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-0.5">Imagen del banner</p>
              <p className="text-xs text-gray-400">Subí una foto o pegá una URL. Se muestra en la portada de la tienda.</p>
            </div>
            <button
              type="button"
              onClick={() => setVerPreview(true)}
              className="lg:hidden flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-[#7d5c48] border border-[#d9ccbb] rounded-lg px-3 py-1.5 hover:bg-[#faf7f2] transition-colors"
            >
              <span>👁</span> Ver banner
            </button>
          </div>

          <ImageManager
            value={imagen ? [imagen] : []}
            onChange={urls => setImagen(urls[urls.length - 1] ?? '')}
            label="Imagen del banner"
            maxImages={1}
            renderCropPreview={url => (
              <HeroBannerPreview
                tag={tagPreview} titulo={tituloPreview} subtitulo={subtituloPreview}
                ctaTexto={ctaPreview} imagen={url}
                colorDesde={colorDesde} colorHasta={colorHasta}
                compact previewMode
              />
            )}
          />
          {imagen && (
            <button type="button" onClick={() => setImagen('')} className="text-xs text-red-400 hover:underline">
              Quitar imagen
            </button>
          )}

          {/* Tips */}
          <div className="rounded-xl border border-[#ede8df] bg-[#faf7f2] p-4 space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Consejos para la foto</p>
            {HERO_TIPS.map(tip => (
              <div key={tip} className="flex gap-2 text-xs text-gray-600">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#7d5c48]" />
                <p>{tip}</p>
              </div>
            ))}
            <div className="grid gap-2 sm:grid-cols-2 pt-1">
              <div className="rounded-lg border border-[#e4d8cb] bg-white p-2.5">
                <p className="text-[10px] font-bold uppercase text-gray-500">Imagen ideal</p>
                <p className="mt-0.5 text-xs text-gray-600">2000 × 2400 px, tonos cálidos, modelo hacia la derecha.</p>
              </div>
              <div className="rounded-lg border border-[#e4d8cb] bg-white p-2.5">
                <p className="text-[10px] font-bold uppercase text-gray-500">Sin imagen</p>
                <p className="mt-0.5 text-xs text-gray-600">El gradiente de color se usa como fondo. Asegurate de elegir uno en el paso 3.</p>
              </div>
            </div>
          </div>
        </div>
      )

      // PASO 2 — Textos ────────────────────────────────────────────────────
      case 2: return (
        <div className="flex gap-6">
          {/* Columna izquierda — campos */}
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-0.5">Textos del banner</p>
              <p className="text-xs text-gray-400">Lo que ven los clientes sobre la imagen.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Etiqueta pequeña
                <span className="ml-1 font-normal normal-case text-gray-400">— arriba del título</span>
              </label>
              <input
                {...register('tag')}
                className="input-field"
                placeholder="Ej: Sofia Couture EC"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                {...register('titulo', { required: 'El título es obligatorio' })}
                className={`input-field ${errors.titulo ? 'border-red-400 bg-red-50' : ''}`}
                placeholder="Ej: Pantalones que realzan tu esencia"
                autoFocus
              />
              {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo.message}</p>}
              <p className="text-[11px] text-gray-400 mt-1">Corto y elegante — máximo 2 líneas.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subtítulo</label>
              <textarea
                {...register('subtitulo')}
                className="input-field h-20 resize-none"
                placeholder="Ej: Diseños elegantes con una presencia más cuidada."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Texto del botón</label>
              <input
                {...register('ctaTexto')}
                className="input-field"
                placeholder="Ej: VER AHORA"
              />
              <p className="text-[11px] text-gray-400 mt-1">Una sola llamada a la acción, corta y directa.</p>
            </div>
          </div>

          {/* Columna derecha — preview en tiempo real */}
          <div className="hidden sm:flex flex-col gap-2 w-64 flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Vista previa</p>
            <div className="sticky top-0">
              <MiniPreview height={400} />
            </div>
            <p className="text-[10px] text-gray-400 text-center">Se actualiza mientras escribís</p>
          </div>
        </div>
      )

      // PASO 3 — Colores ───────────────────────────────────────────────────
      case 3: return (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-0.5">Gradiente de fondo</p>
            <p className="text-xs text-gray-400">Se mezcla con la imagen o se usa como fondo si no hay foto.</p>
          </div>

          {/* Preview live */}
          <MiniPreview height={220} />

          {/* Paleta rápida */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Paleta rápida</p>
            <div className="grid grid-cols-4 gap-2">
              {PALETA.map(p => (
                <button
                  key={p.label}
                  type="button"
                  title={p.label}
                  onClick={() => { setValue('colorDesde', p.desde); setValue('colorHasta', p.hasta) }}
                  className={`h-12 rounded-xl border-2 transition-all hover:scale-105 shadow-sm ${
                    colorDesde === p.desde && colorHasta === p.hasta
                      ? 'border-[#4a3728] scale-105 shadow-md'
                      : 'border-transparent hover:border-[#d9ccbb]'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${p.desde}, ${p.hasta})` }}
                >
                  <span className="sr-only">{p.label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {PALETA.map(p => (
                <span
                  key={p.label}
                  className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    colorDesde === p.desde && colorHasta === p.hasta
                      ? 'bg-[#4a3728] text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Pickers manuales */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Personalizado</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Color desde (izquierda)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorDesde}
                    onChange={e => setValue('colorDesde', e.target.value)}
                    className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-0.5 flex-shrink-0"
                  />
                  <span className="text-xs font-mono text-gray-500">{colorDesde}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Color hasta (derecha)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHasta}
                    onChange={e => setValue('colorHasta', e.target.value)}
                    className="h-9 w-9 rounded border border-gray-200 cursor-pointer p-0.5 flex-shrink-0"
                  />
                  <span className="text-xs font-mono text-gray-500">{colorHasta}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

      // PASO 4 — Destino ───────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-0.5">¿A dónde lleva el botón?</p>
            <p className="text-xs text-gray-400">Cuando el cliente hace click en el banner, ¿a dónde va?</p>
          </div>

          {/* Tipo de destino — botones */}
          <div className="grid grid-cols-1 gap-2">
            {TIPOS_DESTINO.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setValue('tipoDestino', t.value); setValue('destinoValor', '') }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  tipoActual === t.value
                    ? 'border-[#7d5c48] bg-[#faf7f2]'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  tipoActual === t.value ? 'border-[#7d5c48]' : 'border-gray-300'
                }`}>
                  {tipoActual === t.value && <span className="w-2 h-2 rounded-full bg-[#7d5c48]" />}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${tipoActual === t.value ? 'text-[#4a3728]' : 'text-gray-700'}`}>{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Selector secundario */}
          {tipoActual === 'GENERO' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Género</label>
              <div className="grid grid-cols-3 gap-2">
                {GENEROS.map(g => {
                  const sel = watch('destinoValor') === g.value
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setValue('destinoValor', g.value)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-sm ${
                        sel ? 'border-[#7d5c48] bg-[#faf7f2] text-[#4a3728] font-semibold' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <span className="text-xs">{g.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {tipoActual === 'CATEGORIA' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Categoría</label>
              <select {...register('destinoValor')} className="input-field">
                <option value="">— Seleccionar categoría —</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}

          {tipoActual === 'PRODUCTO' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Producto</label>
              <select {...register('destinoValor')} className="input-field">
                <option value="">— Seleccionar producto —</option>
                {productos.map(p => <option key={p.id} value={p.slug ?? String(p.id)}>{p.nombre}</option>)}
              </select>
            </div>
          )}

          {tipoActual === 'URL' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">URL</label>
              <input
                {...register('destinoValor')}
                className="input-field font-mono"
                placeholder="/catalogo?sort=precio,asc"
              />
            </div>
          )}

          {tipoActual && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">URL resultante</p>
              <p className="text-xs font-mono text-gray-600 break-all">
                {buildLink(tipoActual, watch('destinoValor') || '')}
              </p>
            </div>
          )}
        </div>
      )

      // PASO 5 — Publicar ──────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-0.5">Resumen y publicación</p>
            <p className="text-xs text-gray-400">Revisá todo antes de publicar. Podés volver a cualquier paso.</p>
          </div>

          {/* Preview completo */}
          <div className="rounded-xl overflow-hidden border border-[#ede8df]">
            <HeroBannerPreview
              tag={tagPreview} titulo={tituloPreview} subtitulo={subtituloPreview}
              ctaTexto={ctaPreview} imagen={imagen}
              colorDesde={colorDesde} colorHasta={colorHasta}
              compact previewMode
            />
          </div>

          {/* Datos resumidos */}
          <div className="rounded-xl border border-[#ede8df] divide-y divide-gray-50 overflow-hidden">
            {[
              { label: 'Imagen',   value: imagen ? '✓ Cargada' : '— Sin imagen (se usará el gradiente)', ok: !!imagen },
              { label: 'Título',   value: watch('titulo') || '—', ok: !!watch('titulo') },
              { label: 'Subtítulo', value: watch('subtitulo') || '—', ok: true },
              { label: 'Botón',    value: watch('ctaTexto') || '—', ok: !!watch('ctaTexto') },
              { label: 'Destino',  value: buildLink(tipoActual, watch('destinoValor') || ''), ok: true },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{item.label}</span>
                <span className={`text-xs flex-1 min-w-0 truncate font-mono ${item.ok ? 'text-gray-700' : 'text-amber-500'}`}>
                  {item.value}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const pasoMap: Record<string, number> = { Imagen: 1, Título: 2, Subtítulo: 2, Botón: 2, Destino: 4 }
                    setPaso(pasoMap[item.label] ?? 1)
                  }}
                  className="text-[10px] text-[#7d5c48] hover:underline flex-shrink-0"
                >
                  editar
                </button>
              </div>
            ))}
          </div>

          {/* Orden + activo */}
          <div className="rounded-xl border border-[#ede8df] bg-gray-50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Visibilidad</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activo ? 'El banner aparece en la portada' : 'El banner está oculto'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivo(v => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${activo ? 'bg-[#7d5c48]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${activo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Posición en el carrusel
                <span className="ml-1 font-normal normal-case text-gray-400">(0 = primero)</span>
              </label>
              <input type="number" min={0} {...register('orden')} className="input-field w-24" />
            </div>
          </div>

          {(createMut.isError || updateMut.isError) && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              Hubo un error al guardar. Intentá de nuevo.
            </p>
          )}
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-xs text-gray-500 mt-0.5">Administrá el carrusel de la página principal</p>
        </div>
        <button onClick={() => abrir()} className="btn-primary flex items-center gap-1.5">
          <span className="text-lg leading-none">+</span> Nuevo banner
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white border border-[#ede8df] rounded-lg p-3 flex items-center gap-3">
        <IconSearch size={16} className="text-gray-400 flex-shrink-0" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 outline-none text-sm"
          placeholder="Buscar por título, etiqueta, destino o estado"
        />
        <span className="text-xs text-gray-400">{bannersFiltrados.length} de {banners.length}</span>
      </div>

      {/* ── MODAL DE 5 PASOS ────────────────────────────────────────────── */}
      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/60" onClick={cerrar} />
          <div className={`relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden ${paso === 2 ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}>

            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b px-4 pt-4 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Paso {paso} de {PASOS.length} · {PASOS[paso - 1]}
                  </p>
                  {editando && (
                    <p className="text-xs text-[#7d5c48] mt-0.5">
                      Editando: <strong>{editando.titulo}</strong>
                    </p>
                  )}
                </div>
                <button onClick={cerrar} className="text-gray-400 hover:text-gray-600 -mt-0.5">
                  <IconX size={20} />
                </button>
              </div>
              {/* Barra de progreso */}
              <div className="flex items-center gap-1">
                {PASOS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => i + 1 < paso ? setPaso(i + 1) : undefined}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i + 1 < paso  ? 'bg-[#a37c64] cursor-pointer hover:bg-[#7d5c48]' :
                      i + 1 === paso ? 'bg-[#4a3728]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              {renderPaso()}
            </div>

            {/* Overlay preview banner — solo mobile/tablet */}
            {verPreview && (
              <div className="lg:hidden absolute inset-0 z-10 flex flex-col bg-black/80">
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800">Vista previa del banner</p>
                  <button
                    type="button"
                    onClick={() => setVerPreview(false)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <IconX size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 gap-4">
                  <div className="w-full rounded-xl overflow-hidden shadow-lg">
                    <HeroBannerPreview
                      tag={tagPreview} titulo={tituloPreview} subtitulo={subtituloPreview}
                      ctaTexto={ctaPreview} imagen={imagen}
                      colorDesde={colorDesde} colorHasta={colorHasta}
                      compact previewMode
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Así se verá el banner en la portada de la tienda
                  </p>
                </div>
                <div className="flex-shrink-0 px-4 py-3 bg-white border-t">
                  <button
                    type="button"
                    onClick={() => setVerPreview(false)}
                    className="w-full btn-primary"
                  >
                    Continuar editando
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t px-4 py-3 flex items-center gap-3">
              {paso > 1 && (
                <button type="button" onClick={() => setPaso(p => p - 1)} className="btn-outline">
                  ← Atrás
                </button>
              )}
              <div className="flex-1" />
              {paso < 5 ? (
                <button type="button" onClick={siguientePaso} className="btn-primary">
                  Siguiente →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn-primary min-w-[160px]"
                >
                  {isSubmitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Publicar banner'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de banners */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Cargando banners...</div>
      ) : banners.length === 0 ? (
        <div className="bg-white border border-[#ede8df] rounded-lg py-16 text-center">
          <p className="text-gray-400 text-sm">No hay banners creados todavía.</p>
          <button onClick={() => abrir()} className="mt-3 btn-primary">Crear el primero</button>
        </div>
      ) : bannersFiltrados.length === 0 ? (
        <div className="bg-white border border-[#ede8df] rounded-lg py-16 text-center">
          <p className="text-gray-700 text-sm font-semibold">No encontré banners con esa búsqueda.</p>
          <p className="text-gray-400 text-sm mt-1">Probá con otro título, destino o estado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bannersFiltrados.map((b, i) => {
            const expanded = expandidos.has(b.id)
            const toggle = () => setExpandidos(prev => {
              const next = new Set(prev)
              next.has(b.id) ? next.delete(b.id) : next.add(b.id)
              return next
            })
            return (
              <div key={b.id} className="bg-white border border-[#ede8df] rounded-xl overflow-hidden">

                {/* ── Fila colapsada (siempre visible) ── */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-[#ede8df]">
                    {b.imagen
                      ? <img src={b.imagen} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${b.colorDesde ?? '#7d5c48'}, ${b.colorHasta ?? '#6b5040'})` }} />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {b.tag && <span className="text-[10px] font-semibold text-[#7d5c48] uppercase tracking-wide">{b.tag}</span>}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {b.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{b.titulo || '(sin título)'}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{buildLink(b.tipoDestino, b.destinoValor)}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moverOrden(b, -1)} disabled={i === 0}
                        className="w-5 h-5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center text-[10px]">↑</button>
                      <button onClick={() => moverOrden(b, 1)} disabled={i === bannersFiltrados.length - 1}
                        className="w-5 h-5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center text-[10px]">↓</button>
                    </div>
                    <button onClick={() => toggleMut.mutate(b.id)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-xs"
                      title={b.activo ? 'Desactivar' : 'Activar'}>{b.activo ? '⏸' : '▶'}</button>
                    <button onClick={() => abrir(b)} className="p-1.5 rounded hover:bg-[#ede8df] text-[#7d5c48]" title="Editar">
                      <IconEdit size={15} />
                    </button>
                    <button onClick={() => { if (confirm('¿Eliminar este banner?')) deleteMut.mutate(b.id) }}
                      className="p-1.5 rounded hover:bg-red-50 text-red-400" title="Eliminar">
                      <IconTrash size={15} />
                    </button>
                    {/* Flecha expandir */}
                    <button onClick={toggle}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-transform"
                      title={expanded ? 'Colapsar' : 'Ver preview'}>
                      <span className={`inline-block transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  </div>
                </div>

                {/* ── Preview expandido ── */}
                {expanded && (
                  <div className="border-t border-[#ede8df]">
                    <HeroBannerPreview
                      tag={b.tag} titulo={b.titulo} subtitulo={b.subtitulo}
                      ctaTexto={b.ctaTexto} imagen={b.imagen}
                      colorDesde={b.colorDesde} colorHasta={b.colorHasta}
                      compact previewMode
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
