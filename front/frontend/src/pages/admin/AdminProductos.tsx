import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getProductosAdmin, toggleActivo, actualizarStock } from '../../api/admin'
import { crearProducto, actualizarProducto, eliminarProducto } from '../../api/productos'
import { getCategoriasAdmin } from '../../api/categorias'
import { IconSearch, IconEdit, IconTrash, IconHanger, IconX, IconChevronDown } from '@shared/Icon'
import ImageManager from '@shared/ImageManager'
import TallasSelector from '@shared/TallasSelector'
import ColoresSelector from '@shared/ColoresSelector'
import PrecioDescuento from '@shared/PrecioDescuento'
import { useAuthStore } from '../../store/useAuthStore'
import { useUiStore } from '../../store/useUiStore'
import type { Producto } from '../../types'

type FormData = {
  nombre: string
  descripcion: string
  caracteristicaTitulo: string
  caracteristicaDescripcion: string
  precio: number
  stock: number
  categoriaId: number
}

type Genero = '' | 'MUJER' | 'HOMBRE' | 'NINO' | 'CALZADO' | 'ACCESORIOS' | 'BELLEZA'

const GENERO_OPTS = [
  { value: 'MUJER',      label: 'Mujer',      emoji: '👗', color: 'bg-pink-500',   ring: 'ring-pink-400'   },
  { value: 'HOMBRE',     label: 'Hombre',     emoji: '👔', color: 'bg-blue-500',   ring: 'ring-blue-400'   },
  { value: 'NINO',       label: 'Niño/a',     emoji: '🧒', color: 'bg-green-500',  ring: 'ring-green-400'  },
  { value: 'CALZADO',    label: 'Calzado',    emoji: '👟', color: 'bg-yellow-500', ring: 'ring-yellow-400' },
  { value: 'ACCESORIOS', label: 'Accesorios', emoji: '👜', color: 'bg-purple-500', ring: 'ring-purple-400' },
  { value: 'BELLEZA',    label: 'Belleza',    emoji: '💄', color: 'bg-rose-400',   ring: 'ring-rose-300'   },
] as const

const COLORES_COMUNES: Record<string, string> = {
  '#000000': 'Negro', '#FFFFFF': 'Blanco', '#9CA3AF': 'Gris', '#EF4444': 'Rojo',
  '#F9A8D4': 'Rosa', '#EC4899': 'Fucsia', '#F97316': 'Naranja', '#FACC15': 'Amarillo',
  '#22C55E': 'Verde', '#3B82F6': 'Azul', '#1E3A5F': 'Marino', '#A855F7': 'Morado',
  '#92400E': 'Café', '#D4B896': 'Beige', '#FEF3C7': 'Crema',
}

function getColorLabel(hex: string) {
  return COLORES_COMUNES[hex.toUpperCase()] ?? COLORES_COMUNES[hex] ?? hex.toUpperCase()
}

const PASOS = ['¿Para quién?', 'Producto', 'Variantes', 'Imágenes y precio', 'Resumen']

export default function AdminProductos() {
  const { isAdmin } = useAuthStore()
  const { secuenciasActivas, toggleSecuencias } = useUiStore()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [paso, setPaso] = useState(1)
  const [editStock, setEditStock] = useState<{ id: number; stock: number } | null>(null)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [genero, setGenero] = useState<Genero>('')
  const [colorExpandido, setColorExpandido] = useState<string | null>(null)
  const [precioPorColorTalla, setPrecioPorColorTalla] = useState<Record<string, Record<string, number>>>({})

  const [imagenes, setImagenes] = useState<string[]>([])
  const [tallas, setTallas] = useState<string[]>([])
  const [colores, setColores] = useState<string[]>([])
  const [stockPorColor, setStockPorColor] = useState<Record<string, number>>({})
  const [stockPorColorTalla, setStockPorColorTalla] = useState<Record<string, Record<string, number>>>({})
  const [imagenesPorColor, setImagenesPorColor] = useState<Record<string, string[]>>({})
  const [precioFinal, setPrecioFinal] = useState<number | undefined>(undefined)
  const [precioOriginal, setPrecioOriginal] = useState<number | undefined>(undefined)
  const [activo, setActivo] = useState(true)
  const [aplicaIva, setAplicaIva] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-productos', page],
    queryFn: () => getProductosAdmin(page, 20),
  })
  const { data: cats = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategoriasAdmin,
    enabled: isAdmin,
  })
  const generosActivos = new Set(cats.filter(c => c.activo).map(c => c.genero).filter(Boolean))
  const generoOpts = GENERO_OPTS.filter(g => generosActivos.has(g.value))

  const { register, handleSubmit, reset, watch, trigger, formState: { isSubmitting, errors } } = useForm<FormData>()
  const precioActual = Number(watch('precio') ?? 0)
  const categoriaIdActual = watch('categoriaId')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-productos'] })

  const createMut = useMutation({ mutationFn: crearProducto, onSuccess: () => { invalidate(); cerrar() } })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Producto> }) => actualizarProducto(id, data),
    onSuccess: () => { invalidate(); cerrar() },
  })
  const deleteMut = useMutation({ mutationFn: eliminarProducto, onSuccess: invalidate })
  const toggleMut = useMutation({ mutationFn: toggleActivo, onSuccess: invalidate })
  const stockMut = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) => actualizarStock(id, stock),
    onSuccess: () => { invalidate(); setEditStock(null) },
  })

  const abrir = (p?: Producto) => {
    if (!isAdmin) return
    setEditando(p ?? null)
    setImagenes(p?.imagenes ?? [])
    setTallas(p?.tallas ?? [])
    setColores(p?.colores ?? [])
    setStockPorColor(p?.stockPorColor ?? {})
    setStockPorColorTalla(p?.stockPorColorTalla ?? {})
    setImagenesPorColor(p?.imagenesPorColor ?? {})
    setPrecioPorColorTalla(p?.precioPorColorTalla ?? {})
    setPrecioFinal(p?.precio)
    setPrecioOriginal(p?.precioOriginal ?? undefined)
    setActivo(p?.activo ?? true)
    setAplicaIva(p?.aplicaIva ?? true)
    setColorExpandido(null)
    if (p?.categoriaId && cats) {
      const cat = cats.find(c => c.id === p.categoriaId)
      if (cat?.genero) setGenero(cat.genero as Genero)
    } else {
      setGenero('')
    }
    reset(p ? {
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      caracteristicaTitulo: p.caracteristicaTitulo ?? '',
      caracteristicaDescripcion: p.caracteristicaDescripcion ?? '',
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoriaId ?? 0,
    } : { stock: 0, precio: 0, caracteristicaTitulo: '', caracteristicaDescripcion: '' })
    setPaso(1)
    setMostrarForm(true)
  }

  const cerrar = () => {
    setMostrarForm(false)
    setEditando(null)
    setImagenes([])
    setTallas([])
    setColores([])
    setStockPorColor({})
    setStockPorColorTalla({})
    setImagenesPorColor({})
    setPrecioPorColorTalla({})
    setPrecioFinal(undefined)
    setPrecioOriginal(undefined)
    setActivo(true)
    setAplicaIva(true)
    setGenero('')
    setColorExpandido(null)
    setPaso(1)
    reset({})
  }

  useEffect(() => {
    if (tallas.length === 0) { setStockPorColorTalla({}); return }
    setStockPorColorTalla(prev => {
      const next: Record<string, Record<string, number>> = {}
      colores.forEach(color => {
        const actual = prev[color] ?? {}
        next[color] = {}
        tallas.forEach(talla => { next[color][talla] = Math.max(0, actual[talla] ?? 0) })
      })
      return next
    })
  }, [tallas, colores])

  useEffect(() => {
    if (tallas.length === 0) return
    setStockPorColor(prev => {
      const next: Record<string, number> = { ...prev }
      colores.forEach(color => {
        next[color] = Object.values(stockPorColorTalla[color] ?? {}).reduce((a, b) => a + b, 0)
      })
      return next
    })
  }, [stockPorColorTalla, tallas, colores])

  useEffect(() => {
    setImagenesPorColor(prev => {
      const next: Record<string, string[]> = {}
      colores.forEach(color => { next[color] = prev[color] ?? [] })
      return next
    })
    setPrecioPorColorTalla(prev => {
      const next: Record<string, Record<string, number>> = {}
      colores.forEach(color => { if (prev[color]) next[color] = prev[color] })
      return next
    })
  }, [colores])

  const siguientePaso = async () => {
    if (paso === 1 && !genero) return
    if (paso === 2) {
      const ok = await trigger(['nombre', 'categoriaId'])
      if (!ok) return
    }
    setPaso(p => Math.min(p + 1, 5))
  }

  const onSubmit = (d: FormData) => {
    const precioBase = d.precio ? Number(d.precio) : 0
    const stockTotal = tallas.length > 0
      ? Object.values(stockPorColorTalla).reduce(
          (acc, porTalla) => acc + Object.values(porTalla).reduce((a, b) => a + b, 0), 0)
      : colores.length > 0
        ? Object.values(stockPorColor).reduce((a, b) => a + b, 0)
        : Number(d.stock)
    const payload: Partial<Producto> = {
      nombre: d.nombre,
      descripcion: d.descripcion,
      caracteristicaTitulo: d.caracteristicaTitulo || undefined,
      caracteristicaDescripcion: d.caracteristicaDescripcion || undefined,
      precio: precioFinal ?? precioBase,
      precioOriginal: precioOriginal ?? undefined,
      activo,
      aplicaIva,
      stock: stockTotal,
      categoriaId: d.categoriaId ? Number(d.categoriaId) : undefined,
      imagenes,
      imagenesPorColor: colores.length > 0
        ? Object.fromEntries(Object.entries(imagenesPorColor).filter(([, urls]) => Array.isArray(urls) && urls.length > 0))
        : undefined,
      tallas,
      colores,
      stockPorColor: colores.length > 0 ? stockPorColor : undefined,
      stockPorColorTalla: tallas.length > 0 ? stockPorColorTalla : undefined,
      precioPorColorTalla: (tallas.length > 0 && colores.length > 0 && Object.keys(precioPorColorTalla).length > 0)
        ? precioPorColorTalla : undefined,
    }
    editando ? updateMut.mutate({ id: editando.id, data: payload }) : createMut.mutate(payload)
  }

  const catsFiltradas = cats?.filter(c => c.activo && (genero === '' ? true : c.genero === genero)) ?? []
  const categoriaNombreActual = cats?.find(c => c.id === Number(categoriaIdActual))?.nombre ?? ''
  const productos = data?.content.filter(p =>
    !filtroNombre || p.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  ) ?? []

  const getPreviewImage = (producto: Producto) =>
    producto.imagenes?.[0]
    || Object.values(producto.imagenesPorColor ?? {}).find(urls => Array.isArray(urls) && urls.length > 0)?.[0]
    || ''

  const stockTotal = tallas.length > 0
    ? Object.values(stockPorColorTalla).reduce((a, m) => a + Object.values(m).reduce((x, y) => x + y, 0), 0)
    : colores.length > 0
      ? Object.values(stockPorColor).reduce((a, b) => a + b, 0)
      : 0

  // ── Contenido por paso ──────────────────────────────────────────
  const renderPaso = () => {
    switch (paso) {
      // ── PASO 1: ¿Para quién? ───────────────────────────────────
      case 1: return (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">¿Para quién es este producto?</h3>
            <p className="text-sm text-gray-400">Esto filtra las categorías disponibles en el siguiente paso.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {generoOpts.map(g => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGenero(g.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  genero === g.value
                    ? `border-transparent text-white ${g.color} shadow-md scale-[1.02]`
                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-3xl">{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
          {!genero && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
              Seleccioná una opción para continuar
            </p>
          )}
        </div>
      )

      // ── PASO 2: Nombre, categoría, descripción ─────────────────
      case 2: return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <input
                {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                className={`input-field ${errors.nombre ? 'border-red-400 bg-red-50' : ''}`}
                placeholder="Ej: Vestido floral verano"
                autoFocus
              />
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                Categoría <span className="text-red-500">*</span>
                <span className="ml-2 normal-case font-normal text-gray-400">({catsFiltradas.length} disponibles)</span>
              </label>
              <select
                {...register('categoriaId', {
                  required: 'Seleccioná una categoría',
                  onChange: e => {
                    const cat = cats?.find(c => c.id === Number(e.target.value))
                    if (cat?.tallasDisponibles?.length) setTallas(cat.tallasDisponibles)
                  },
                })}
                className={`input-field ${errors.categoriaId ? 'border-red-400 bg-red-50' : ''}`}
              >
                <option value="">— Seleccionar categoría —</option>
                {catsFiltradas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {errors.categoriaId && <p className="text-xs text-red-500 mt-1">{errors.categoriaId.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Descripción</label>
            <textarea
              {...register('descripcion')}
              className="input-field h-24 resize-none"
              placeholder="Describe el producto: material, estilo, ocasión de uso..."
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-0.5">Características</p>
              <p className="text-xs text-gray-400">Información adicional como composición, instrucciones de cuidado, etc.</p>
            </div>
            <input
              {...register('caracteristicaTitulo')}
              className="input-field bg-white"
              placeholder="Título — ej: Composición y cuidados"
            />
            <textarea
              {...register('caracteristicaDescripcion')}
              className="input-field h-20 resize-none bg-white"
              placeholder="Descripción — ej: 95% poliéster. Lavar a mano en agua fría."
            />
          </div>
        </div>
      )

      // ── PASO 3: Variantes ──────────────────────────────────────
      case 3: return (
        <div className="space-y-6">
          {/* Stock total badge */}
          {(colores.length > 0 || tallas.length > 0) && (
            <div className="flex items-center justify-between bg-[#f5f0e8] rounded-lg px-4 py-2.5">
              <span className="text-sm text-[#7d5c48] font-medium">Stock total calculado</span>
              <span className="text-lg font-black text-[#4a3728]">{stockTotal} uds</span>
            </div>
          )}

          <TallasSelector
            value={tallas}
            onChange={setTallas}
            categoriaNombre={categoriaNombreActual}
          />

          <hr className="border-gray-100" />

          {tallas.length > 0 && (
            <div className="rounded-lg border border-[#ede8df] bg-[#faf7f2] px-4 py-3 text-sm text-gray-600">
              <p className="font-semibold text-gray-700">Inventario por talla y color</p>
              <p className="mt-1 text-xs text-gray-400">
                Agrega colores abajo y define cuántas unidades hay por cada variante.
              </p>
            </div>
          )}

          <ColoresSelector
            value={colores}
            tallas={tallas}
            stockPorColor={stockPorColor}
            stockPorColorTalla={stockPorColorTalla}
            onChange={setColores}
            onStockChange={setStockPorColor}
            onStockMatrixChange={setStockPorColorTalla}
          />

          {/* Precio por color + talla */}
          {colores.length > 0 && tallas.length > 0 && (() => {
            const variantesConPrecio = colores.flatMap(hex =>
              tallas.flatMap(t => {
                const p = precioPorColorTalla[hex]?.[t]
                return p !== undefined && p > 0 ? [{ hex, talla: t, precio: p }] : []
              })
            )
            const hayPrecios = variantesConPrecio.length > 0
            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-0.5">Precio por variante</p>
                    {!hayPrecios ? (
                      <p className="text-xs text-gray-400">Opcional. Dejá vacío para usar un precio único para todo el producto.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {variantesConPrecio.map(({ hex, talla, precio }) => (
                          <span key={`${hex}-${talla}`} className="inline-flex items-center gap-1 bg-[#f0e9df] border border-[#d9ccbb] rounded-full px-2 py-0.5 text-[11px] font-medium text-[#4a3728]">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                            {getColorLabel(hex)} {talla}: <strong>${precio.toFixed(2)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {hayPrecios && (
                    <button
                      type="button"
                      onClick={() => setPrecioPorColorTalla({})}
                      className="text-[11px] text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5"
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>
                <div className="rounded-xl border border-[#e7ddd0] overflow-hidden">
                  {/* Encabezado de tallas */}
                  <div className="grid bg-[#f5f0e8]" style={{ gridTemplateColumns: `140px repeat(${tallas.length}, 1fr)` }}>
                    <div className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">Color</div>
                    {tallas.map(t => (
                      <div key={t} className="px-2 py-2 text-[10px] font-bold uppercase text-gray-500 text-center">{t}</div>
                    ))}
                  </div>
                  {/* Filas por color */}
                  {colores.map((hex, ci) => (
                    <div
                      key={hex}
                      className={`grid items-center border-t border-[#e7ddd0] ${ci % 2 === 1 ? 'bg-[#faf7f2]' : 'bg-white'}`}
                      style={{ gridTemplateColumns: `140px repeat(${tallas.length}, 1fr)` }}
                    >
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: hex }} />
                        <span className="text-xs font-medium text-gray-700 truncate">{getColorLabel(hex)}</span>
                      </div>
                      {tallas.map(t => {
                        const tienePrecio = (precioPorColorTalla[hex]?.[t] ?? 0) > 0
                        return (
                          <div key={t} className="px-1 py-1.5">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="—"
                                value={precioPorColorTalla[hex]?.[t] ?? ''}
                                onChange={e => {
                                  const val = e.target.value === '' ? undefined : Number(e.target.value)
                                  setPrecioPorColorTalla(prev => {
                                    const next = { ...prev }
                                    if (val === undefined || val === 0) {
                                      if (next[hex]) { const c = { ...next[hex] }; delete c[t]; next[hex] = c }
                                    } else {
                                      next[hex] = { ...(next[hex] ?? {}), [t]: val }
                                    }
                                    return next
                                  })
                                }}
                                className={`w-full border rounded-lg pl-5 pr-1 py-1.5 text-xs text-center focus:outline-none focus:border-[#a37c64] bg-transparent transition-colors ${
                                  tienePrecio ? 'border-[#a37c64] bg-[#faf7f2] font-semibold text-[#4a3728]' : 'border-gray-200'
                                }`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Stock general si no hay colores */}
          {colores.length === 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                Stock disponible <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('stock', {
                  required: 'El stock es obligatorio',
                  min: { value: 0, message: 'No puede ser negativo' },
                  valueAsNumber: true,
                })}
                className={`input-field w-32 ${errors.stock ? 'border-red-400 bg-red-50' : ''}`}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
          )}
        </div>
      )

      // ── PASO 4: Imágenes y precio ──────────────────────────────
      case 4: return (
        <div className="space-y-6">
          {/* Imágenes generales — solo si no hay colores */}
          {colores.length === 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Fotos del producto</p>
              <ImageManager value={imagenes} onChange={setImagenes} />
            </div>
          )}

          {/* Imágenes por color — acordeón */}
          {colores.length > 0 && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase mb-0.5">Fotos por color</p>
                <p className="text-xs text-gray-400">
                  Sube las fotos de cada color — se mostrarán al elegir ese color en la tienda.
                </p>
              </div>
              <div className="space-y-2">
                {colores.map(hex => {
                  const fotos = imagenesPorColor[hex] ?? []
                  const abierto = colorExpandido === hex
                  return (
                    <div key={hex} className="rounded-xl border border-[#e7ddd0] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setColorExpandido(abierto ? null : hex)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#faf7f2] transition-colors text-left"
                      >
                        <span
                          className="h-6 w-6 rounded-full border-2 border-white shadow flex-shrink-0"
                          style={{ backgroundColor: hex, boxShadow: '0 0 0 1px #d1c5b5' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700">{getColorLabel(hex)}</p>
                        </div>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-medium flex-shrink-0 ${
                          fotos.length > 0 ? 'bg-[#7d5c48] text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {fotos.length > 0 ? `${fotos.length} foto${fotos.length !== 1 ? 's' : ''}` : 'Sin fotos'}
                        </span>
                        <IconChevronDown
                          size={16}
                          className={`text-gray-400 transition-transform flex-shrink-0 ${abierto ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Miniaturas rápidas (siempre visibles si hay fotos) */}
                      {!abierto && fotos.length > 0 && (
                        <div className="px-4 pb-3 flex gap-2">
                          {fotos.slice(0, 5).map((url, i) => (
                            <img key={i} src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                          ))}
                          {fotos.length > 5 && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium">
                              +{fotos.length - 5}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ImageManager expandible */}
                      {abierto && (
                        <div className="px-4 pb-4 pt-1 bg-[#faf7f2] border-t border-[#e7ddd0]">
                          <ImageManager
                            value={fotos}
                            onChange={urls => setImagenesPorColor(prev => ({ ...prev, [hex]: urls }))}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* Precio — oculto si hay precios por variante */}
          {(() => {
            const hayPreciosVariante = Object.values(precioPorColorTalla).some(
              porTalla => Object.values(porTalla).some(p => p > 0)
            )
            if (hayPreciosVariante) {
              return (
                <div className="rounded-xl border border-[#d4c4b0] bg-[#faf7f2] px-4 py-3 flex items-start gap-3">
                  <span className="text-lg mt-0.5">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-[#4a3728]">Precio por variante activado</p>
                    <p className="text-xs text-[#7d5c48] mt-0.5">
                      Definiste precios individuales por color y talla en el paso anterior.
                      El precio base y el descuento no aplican — cada variante usa su precio propio.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setPaso(3) }}
                      className="text-xs text-[#7d5c48] underline mt-1"
                    >
                      Ir al paso 3 para editar los precios →
                    </button>
                  </div>
                </div>
              )
            }
            return (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                    Precio base
                    <span className="ml-1 font-normal text-gray-400 normal-case">(precio de venta)</span>
                  </label>
                  <div className="relative w-40">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number" step="0.01" min="0"
                      {...register('precio', { min: { value: 0, message: 'No puede ser negativo' } })}
                      className={`input-field pl-7 ${errors.precio ? 'border-red-400 bg-red-50' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio.message}</p>}
                </div>
                <PrecioDescuento
                  precioBase={precioActual}
                  initialPrecioOriginal={precioOriginal}
                  onChange={(final, original) => { setPrecioFinal(final); setPrecioOriginal(original) }}
                />
              </>
            )
          })()}

          <hr className="border-gray-100" />

          {/* IVA */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Aplica IVA</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Payphone separará automáticamente la base gravada y el IVA al cobrar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAplicaIva(v => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${aplicaIva ? 'bg-[#7d5c48]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${aplicaIva ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <span className={`mt-2 inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${aplicaIva ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-500'}`}>
              {aplicaIva ? 'Precio con IVA incluido' : 'Precio sin IVA'}
            </span>
          </div>

          {/* Visibilidad */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Visibilidad en la tienda</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {activo ? 'El producto aparece en el catálogo' : 'El producto está oculto para los clientes'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivo(a => !a)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${activo ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${activo ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      )

      // ── PASO 5: Resumen ────────────────────────────────────────
      case 5: {
        const nombreVal = watch('nombre')
        const descVal = watch('descripcion')
        const catNombre = cats?.find(c => c.id === Number(categoriaIdActual))?.nombre ?? '—'
        const generoObj = GENERO_OPTS.find(g => g.value === genero)
        const precioMostrar = precioFinal ?? precioActual
        const primeraFoto = imagenes[0]
          || Object.values(imagenesPorColor).find(u => u?.length > 0)?.[0]
          || ''

        return (
          <div className="space-y-5">
            <p className="text-sm text-gray-400">Revisá todo antes de publicar. Podés volver a cualquier paso para editar.</p>

            {/* Tarjeta visual */}
            <div className="rounded-xl border border-[#e7ddd0] overflow-hidden bg-white">

              {/* Encabezado con imagen */}
              <div className="flex gap-4 p-4 border-b border-gray-100">
                {primeraFoto ? (
                  <img src={primeraFoto} alt="" className="w-20 h-24 object-cover rounded-lg flex-shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-20 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <IconHanger size={28} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {generoObj && (
                      <span className={`text-[10px] text-white font-bold px-2 py-0.5 rounded-full ${generoObj.color}`}>
                        {generoObj.emoji} {generoObj.label}
                      </span>
                    )}
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{catNombre}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {activo ? 'Activo' : 'Oculto'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 truncate">{nombreVal || '—'}</h3>
                  {descVal && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{descVal}</p>}
                  <div className="flex items-baseline gap-2 mt-2">
                    {precioOriginal && (
                      <span className="text-xs text-gray-400 line-through">${precioOriginal.toFixed(2)}</span>
                    )}
                    <span className="text-lg font-black text-red-500">
                      ${precioMostrar > 0 ? precioMostrar.toFixed(2) : '—'}
                    </span>
                    {precioOriginal && precioMostrar > 0 && (
                      <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">
                        -{Math.round((1 - precioMostrar / precioOriginal) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="divide-y divide-gray-50">

                {/* Colores */}
                <div className="px-4 py-3 flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">Colores</span>
                  {colores.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {colores.map(hex => (
                        <div key={hex} className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: hex }} />
                          <span className="text-xs text-gray-600">{getColorLabel(hex)}</span>
                          {(imagenesPorColor[hex]?.length ?? 0) > 0 && (
                            <span className="text-[10px] text-[#7d5c48]">({imagenesPorColor[hex].length} fotos)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Sin colores definidos</span>
                  )}
                </div>

                {/* Tallas */}
                <div className="px-4 py-3 flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">Tallas</span>
                  {tallas.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tallas.map(t => (
                        <span key={t} className="text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-700 font-medium">{t}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Sin tallas definidas</span>
                  )}
                </div>

                {/* Stock */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">Stock</span>
                  <span className={`text-sm font-bold ${stockTotal === 0 && colores.length > 0 ? 'text-red-500' : 'text-gray-800'}`}>
                    {colores.length > 0 ? `${stockTotal} unidades en total` : `${watch('stock') || 0} unidades`}
                  </span>
                </div>

                {/* Imágenes */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">Imágenes</span>
                  <div className="flex items-center gap-2">
                    {imagenes.length > 0 ? (
                      <div className="flex gap-1">
                        {imagenes.slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="" className="w-8 h-8 rounded object-cover border border-gray-100" />
                        ))}
                        {imagenes.length > 4 && <span className="text-xs text-gray-400 self-center">+{imagenes.length - 4}</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600">Sin imágenes generales</span>
                    )}
                  </div>
                </div>

                {/* IVA */}
                <div className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">IVA</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aplicaIva ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {aplicaIva ? 'Con IVA incluido' : 'Sin IVA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Atajos edición */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Editar producto', paso: 2 },
                { label: 'Editar variantes', paso: 3 },
                { label: 'Editar imágenes', paso: 4 },
                { label: 'Editar precio', paso: 4 },
              ].map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setPaso(item.paso)}
                  className="text-xs text-[#7d5c48] border border-[#d9ccbb] rounded-lg py-2 px-3 hover:bg-[#faf7f2] transition-colors text-left"
                >
                  ← {item.label}
                </button>
              ))}
            </div>

            {(createMut.isError || updateMut.isError) && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                Hubo un error al guardar. Intentá de nuevo.
              </p>
            )}
          </div>
        )
      }

      default: return null
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Productos</h1>
        <div className="flex items-center gap-3">
          {/* Toggle secuencias de color */}
          <button
            onClick={toggleSecuencias}
            title={secuenciasActivas ? 'Desactivar secuencias de color en tienda' : 'Activar secuencias de color en tienda'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              secuenciasActivas
                ? 'bg-[#4a3728] text-white border-[#4a3728]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={`w-8 h-4 rounded-full relative transition-colors ${secuenciasActivas ? 'bg-white/30' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${secuenciasActivas ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
            Secuencias de color
          </button>
          {isAdmin ? (
            <button onClick={() => abrir()} className="btn-primary flex items-center gap-1.5">
              <span className="text-lg leading-none">+</span> Nuevo producto
            </button>
          ) : (
            <span className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
              Acceso de bodega: solo stock
            </span>
          )}
        </div>
      </div>

      {/* ── MODAL DE 5 PASOS ─────────────────────────────────────── */}
      {isAdmin && mostrarForm && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={cerrar} />

          {/* Panel */}
          <div className="relative bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">

            {/* ── HEADER: paso + progreso ── */}
            <div className="flex-shrink-0 bg-white border-b px-4 pt-4 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Paso {paso} de {PASOS.length} · {PASOS[paso - 1]}
                  </p>
                  {editando && (
                    <p className="text-xs text-[#7d5c48] mt-0.5">Editando: <strong>{editando.nombre}</strong></p>
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
                      i + 1 < paso ? 'bg-[#a37c64] cursor-pointer hover:bg-[#7d5c48]' :
                      i + 1 === paso ? 'bg-[#4a3728]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ── CONTENIDO del paso ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              {renderPaso()}
            </div>

            {/* ── FOOTER: navegación ── */}
            <div className="flex-shrink-0 bg-white border-t px-4 py-3 flex items-center gap-3">
              {paso > 1 && (
                <button
                  type="button"
                  onClick={() => setPaso(p => p - 1)}
                  className="btn-outline"
                >
                  ← Atrás
                </button>
              )}
              <div className="flex-1" />
              {paso < 5 ? (
                <button
                  type="button"
                  onClick={siguientePaso}
                  disabled={paso === 1 && !genero}
                  className="btn-primary disabled:opacity-40"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn-primary min-w-[140px]"
                >
                  {isSubmitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Publicar producto'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BUSCADOR ─────────────────────────────────────────────── */}
      <div className="bg-white border rounded-lg px-3 md:px-4 py-3 flex items-center gap-3">
        <IconSearch size={16} className="text-gray-400 flex-shrink-0" />
        <input
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 outline-none text-sm"
        />
        <span className="text-xs text-gray-400">{data?.totalElements ?? 0} total</span>
      </div>

      {/* ── TABLA / CARDS ────────────────────────────────────────── */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Cargando productos...</div>
        ) : productos.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <IconHanger size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay productos{filtroNombre ? ' con ese nombre' : ''}</p>
          </div>
        ) : (
          <>
            {/* Desktop: tabla */}
            <table className="w-full text-sm hidden sm:table">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Producto</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Precio</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Stock</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold hidden md:table-cell">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productos.map(p => {
                  const isExpanded = expandedId === p.id
                  return (
                    <>
                      <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.activo ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {getPreviewImage(p)
                              ? <img src={getPreviewImage(p)} alt="" className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                              : <div className="w-10 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><IconHanger size={18} className="text-gray-300" /></div>
                            }
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 truncate max-w-[180px]">{p.nombre}</p>
                              {p.sku && <p className="text-[11px] text-gray-400 font-mono mt-0.5">{p.sku}</p>}
                              <div className="flex items-center gap-1.5 mt-1">
                                {p.colores.slice(0, 5).map(c => (
                                  <span key={c} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                                ))}
                                {p.colores.length > 5 && <span className="text-[10px] text-gray-400">+{p.colores.length - 5}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-red-500">${p.precio.toFixed(2)}</span>
                          {p.precioOriginal && <p className="text-xs text-gray-400 line-through">${p.precioOriginal.toFixed(2)}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {p.stockPorColorTalla && Object.keys(p.stockPorColorTalla).length > 0 ? (
                            <div>
                              <p className={`font-mono font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>{p.stock}</p>
                              <p className="text-[11px] text-gray-400">variantes</p>
                            </div>
                          ) : editStock?.id === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number" min="0" value={editStock.stock}
                                onChange={e => setEditStock({ id: p.id, stock: Number(e.target.value) })}
                                className="w-14 border rounded px-1 py-0.5 text-xs"
                                autoFocus
                              />
                              <button onClick={() => stockMut.mutate({ id: p.id, stock: editStock.stock })} className="text-green-600 text-xs font-bold">OK</button>
                              <button onClick={() => setEditStock(null)} className="text-gray-400 text-xs">✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditStock({ id: p.id, stock: p.stock })}
                              className={`font-mono font-bold hover:underline ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}
                              title="Click para editar stock"
                            >
                              {p.stock}{p.stock > 0 && p.stock <= 5 && <span className="text-orange-400 text-xs ml-0.5">!</span>}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{p.categoriaNombre ?? '—'}</td>
                        <td className="px-4 py-3">
                          {isAdmin ? (
                            <button
                              onClick={() => toggleMut.mutate(p.id)}
                              className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-70 transition-opacity ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                              {p.activo ? 'Activo' : 'Inactivo'}
                            </button>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {p.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            {isAdmin && (
                              <>
                                <button onClick={() => abrir(p)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50" title="Editar"><IconEdit size={15} /></button>
                                <button
                                  onClick={() => { if (confirm(`¿Eliminar "${p.nombre}"?`)) deleteMut.mutate(p.id) }}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50" title="Eliminar"
                                ><IconTrash size={15} /></button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : p.id)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              title={isExpanded ? 'Cerrar detalle' : 'Ver detalle'}
                            >
                              <IconChevronDown size={15} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${p.id}-detail`} className="bg-[#faf8f5]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="flex gap-6 flex-wrap">
                              {/* Imagen grande */}
                              <div className="flex gap-2 flex-shrink-0">
                                {(p.imagenes?.length > 0
                                  ? p.imagenes
                                  : Object.values(p.imagenesPorColor ?? {}).flat()
                                ).slice(0, 4).map((url, i) => (
                                  <img key={i} src={url} alt="" className="w-16 h-20 object-cover rounded-lg border border-gray-100 shadow-sm" />
                                ))}
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-[200px] space-y-2">
                                <div>
                                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Descripción</p>
                                  <p className="text-sm text-gray-700">{p.descripcion || <span className="italic text-gray-400">Sin descripción</span>}</p>
                                </div>
                                {p.tallas?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Tallas</p>
                                    <div className="flex flex-wrap gap-1">
                                      {p.tallas.map(t => (
                                        <span key={t} className="text-xs border border-gray-200 rounded px-2 py-0.5 font-medium text-gray-700">{t}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {p.colores?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Colores</p>
                                    <div className="flex flex-wrap gap-2">
                                      {p.colores.map(c => (
                                        <div key={c} className="flex items-center gap-1">
                                          <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                                          <span className="text-xs text-gray-600">{getColorLabel(c)}</span>
                                          {p.imagenesPorColor?.[c]?.length > 0 && (
                                            <span className="text-[10px] text-[#7d5c48]">({p.imagenesPorColor[c].length} fotos)</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-4 text-xs text-gray-500">
                                  <span>SKU: <strong className="font-mono text-gray-700">{p.sku ?? '—'}</strong></span>
                                  <span>IVA: <strong className="text-gray-700">{p.aplicaIva ? 'Sí' : 'No'}</strong></span>
                                  <span>Categoría: <strong className="text-gray-700">{p.categoriaNombre ?? '—'}</strong></span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>

            {/* Mobile: cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {productos.map(p => (
                <div key={p.id} className={`flex gap-3 p-3 ${!p.activo ? 'opacity-50' : ''}`}>
                  {getPreviewImage(p)
                    ? <img src={getPreviewImage(p)} alt="" className="w-14 h-18 object-cover rounded-lg flex-shrink-0 border border-gray-100" style={{ height: 72 }} />
                    : <div className="w-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ height: 72 }}><IconHanger size={20} className="text-gray-300" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.categoriaNombre ?? '—'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {p.colores.slice(0, 6).map(c => (
                        <span key={c} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-bold text-red-500 text-sm">${p.precio.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">· {p.stock} uds</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-1 justify-center">
                      <button onClick={() => abrir(p)} className="text-blue-600 p-1.5 rounded hover:bg-blue-50"><IconEdit size={15} /></button>
                      <button
                        onClick={() => { if (confirm(`¿Eliminar "${p.nombre}"?`)) deleteMut.mutate(p.id) }}
                        className="text-red-500 p-1.5 rounded hover:bg-red-50"
                      ><IconTrash size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-1 flex-wrap">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:border-[#7d5c48]">‹</button>
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`px-3 py-1.5 border rounded text-sm ${page === i ? 'bg-[#4a3728] text-white border-[#4a3728]' : 'hover:border-[#7d5c48]'}`}>
              {i + 1}
            </button>
          ))}
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:border-[#7d5c48]">›</button>
        </div>
      )}
    </div>
  )
}
