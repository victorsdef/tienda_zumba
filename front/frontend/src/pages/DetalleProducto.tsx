import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProductoPorSlug, getProductos, getProductosTrending } from '../api/productos'
import ImageGallery from '@entities/product/ImageGallery'
import SizeSelector from '@entities/product/SizeSelector'
import ColorSelector from '@entities/product/ColorSelector'
import ProductCard from '@entities/product/ProductCard'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import womanSvg from '../assets/woman.svg'
import ResenaSection from '@entities/product/ResenaSection'
import { DetailSkeleton } from '@shared/LoadingSkeleton'

const COLORES_NOMBRES: Record<string, string> = {
  '#000000': 'Negro', '#FFFFFF': 'Blanco', '#9CA3AF': 'Gris', '#EF4444': 'Rojo',
  '#F9A8D4': 'Rosa', '#EC4899': 'Fucsia', '#F97316': 'Naranja', '#FACC15': 'Amarillo',
  '#22C55E': 'Verde', '#3B82F6': 'Azul', '#1E3A5F': 'Marino', '#A855F7': 'Morado',
  '#92400E': 'Café', '#D4B896': 'Beige', '#FEF3C7': 'Crema',
}
function getColorLabel(hex: string) {
  return COLORES_NOMBRES[hex] ?? COLORES_NOMBRES[hex.toUpperCase()] ?? hex.toUpperCase()
}

const GUIA_TALLAS: { zona: string; XS: string; S: string; M: string; L: string; XL: string }[] = [
  { zona: 'Pecho (A)',   XS: '90-93',  S: '94-97',   M: '98-101',  L: '102-105', XL: '106-109' },
  { zona: 'Cintura (B)', XS: '69-72',  S: '73-76',   M: '77-80',   L: '81-84',   XL: '85-88'   },
  { zona: 'Cadera (C)',  XS: '97-100', S: '101-104', M: '105-108', L: '109-112', XL: '113-116' },
]

type TallaGuia = 'XS' | 'S' | 'M' | 'L' | 'XL'

const TALLA_COLOR: Record<TallaGuia, string> = {
  XS: '#9b8ea0', S: '#7d8ea0', M: '#7d9a8e', L: '#a08e7d', XL: '#a07d7d',
}

// Coordenadas en el viewBox 250x500 (solo mitad izquierda = figura de frente)
// cx = centro del cuerpo para el punto central de medición
const LINEAS_MEDIDA = [
  { label: 'A', zona: 'Pecho (A)',   y: 148, x1: 112, x2: 196, cx: 154, color: '#c0392b' },
  { label: 'B', zona: 'Cintura (B)', y: 200, x1: 122, x2: 184, cx: 153, color: '#d35400' },
  { label: 'C', zona: 'Cadera (C)',  y: 252, x1: 108, x2: 200, cx: 154, color: '#6c3483' },
]

function SiluetaModelo({ talla }: { talla: TallaGuia }) {
  const medidas = GUIA_TALLAS.reduce((acc, row) => {
    acc[row.zona] = row[talla]
    return acc
  }, {} as Record<string, string>)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Badge talla */}
      <div
        className="px-4 py-1 rounded-full text-white text-sm font-bold shadow"
        style={{ backgroundColor: TALLA_COLOR[talla], transition: 'background-color 0.2s' }}
      >
        Talla {talla}
      </div>

      {/* Solo figura de frente: recortamos la mitad izquierda del SVG (250/500) */}
      <div className="relative overflow-hidden" style={{ height: '288px', width: '144px' }}>
        <img
          src={womanSvg}
          alt="Figura femenina frente"
          style={{ height: '288px', width: '288px', maxWidth: 'none' }}
          className="block"
        />

        {/* SVG overlay: viewBox solo cubre la mitad izquierda */}
        <svg
          viewBox="0 0 250 500"
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {LINEAS_MEDIDA.map(({ label, zona, y, x1, x2, cx, color }) => (
            <g key={label}>
              {/* Línea punteada que cruza la zona del cuerpo */}
              <line
                x1={x1 - 30} y1={y} x2={x2} y2={y}
                stroke={color} strokeWidth="1.8"
                strokeDasharray="5,3" opacity="0.9"
              />
              {/* Punto izquierdo */}
              <circle cx={x1} cy={y} r="3.5" fill={color} />
              {/* Punto central (centro del cuerpo) */}
              <circle cx={cx} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
              {/* Punto derecho */}
              <circle cx={x2} cy={y} r="3.5" fill={color} />
              {/* Etiqueta a la izquierda del cuerpo */}
              <rect
                x={x1 - 78} y={y - 10}
                width="62" height="20"
                rx="5" fill={color} opacity="0.93"
              />
              <text
                x={x1 - 47} y={y + 5}
                textAnchor="middle"
                fontSize="10" fontWeight="bold" fill="white"
                fontFamily="Arial, sans-serif"
              >
                {label} {medidas[zona]}cm
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

const TALLAS_GUIA: TallaGuia[] = ['XS', 'S', 'M', 'L', 'XL']

function GuiaTallasModal({ onClose }: { onClose: () => void }) {
  const [tallaActiva, setTallaActiva] = useState<TallaGuia>('M')

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg text-gray-800">Guía de tallas</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          {/* Silueta real — frente y espalda */}
          <div className="flex justify-center mb-5">
            <SiluetaModelo talla={tallaActiva} />
          </div>

          {/* Selector de talla */}
          <div className="flex justify-center gap-2 mb-5">
            {TALLAS_GUIA.map(t => (
              <button
                key={t}
                onMouseEnter={() => setTallaActiva(t)}
                onClick={() => setTallaActiva(t)}
                className="w-10 h-10 rounded-full text-xs font-bold border-2 transition-all"
                style={
                  tallaActiva === t
                    ? { backgroundColor: TALLA_COLOR[t], borderColor: TALLA_COLOR[t], color: '#fff' }
                    : { backgroundColor: '#f5f0e8', borderColor: '#d4c8be', color: '#4a3728' }
                }
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tabla de medidas */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Medidas en centímetros</p>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#f5f0e8]">
                  <th className="text-left py-2.5 px-3 font-semibold text-[#4a3728]">Zona</th>
                  {TALLAS_GUIA.map(t => (
                    <th
                      key={t}
                      onMouseEnter={() => setTallaActiva(t)}
                      onClick={() => setTallaActiva(t)}
                      className="py-2.5 px-3 font-bold text-center cursor-pointer select-none transition-colors"
                      style={tallaActiva === t ? { backgroundColor: TALLA_COLOR[t], color: '#fff' } : { color: '#4a3728' }}
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GUIA_TALLAS.map((row, i) => (
                  <tr key={row.zona} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2.5 px-3 text-gray-700 font-semibold">{row.zona}</td>
                    {TALLAS_GUIA.map(t => (
                      <td
                        key={t}
                        onMouseEnter={() => setTallaActiva(t)}
                        onClick={() => setTallaActiva(t)}
                        className="py-2.5 px-3 text-center cursor-pointer"
                        style={tallaActiva === t ? { color: TALLA_COLOR[t], fontWeight: 700 } : { color: '#6b7280' }}
                      >
                        {row[t]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-[#f5f0e8] rounded-lg p-3 text-[11px] text-gray-500 space-y-1">
            <p>• Selecciona la talla más cercana a tus medidas corporales.</p>
            <p>• Si la tela es stretch o semi-stretch, puedes tomar la talla inferior.</p>
            <p>• Usa una cinta métrica flexible para medir pecho, cintura y cadera.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DetalleProducto() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const colorParam = searchParams.get('color') ?? undefined
  const { agregarItem, loading, getCarritoActivo } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [talla, setTalla] = useState<string>()
  const [color, setColor] = useState<string>(colorParam)
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)
  const [guiaOpen, setGuiaOpen] = useState(false)
  const [compartirOpen, setCompartirOpen] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)

  const { data: producto, isLoading } = useQuery({
    queryKey: ['producto', slug],
    queryFn: () => getProductoPorSlug(slug!),
    enabled: !!slug,
  })

  const { data: relacionados } = useQuery({
    queryKey: ['relacionados', producto?.categoriaId],
    queryFn: () => getProductos({ categoriaId: producto?.categoriaId, size: 8 }),
    enabled: !!producto?.categoriaId,
  })

  const relacionadosFiltrados = (relacionados?.content ?? []).filter(p => p.id !== producto?.id)

  const { data: trending } = useQuery({
    queryKey: ['trending-detalle'],
    queryFn: () => getProductosTrending(8),
    enabled: relacionadosFiltrados.length < 4,
  })

  // Combina relacionados + trending sin repetir ni incluir el producto actual
  const sugerencias = (() => {
    const ids = new Set<number>()
    const lista = [...relacionadosFiltrados]
    if (producto?.id) ids.add(producto.id)
    lista.forEach(p => ids.add(p.id))
    if (lista.length < 4) {
      for (const p of (trending ?? [])) {
        if (!ids.has(p.id)) { lista.push(p); ids.add(p.id) }
        if (lista.length >= 8) break
      }
    }
    return lista.slice(0, 8)
  })()

  const necesitaTalla = (producto?.tallas?.length ?? 0) > 0
  const necesitaColor = (producto?.colores?.length ?? 0) > 0
  const stockPorColorTalla = producto?.stockPorColorTalla ?? {}

  // Colores que tienen stock en la talla seleccionada
  const coloresDisponiblesParaTalla = talla && Object.keys(stockPorColorTalla).length > 0
    ? producto!.colores.filter(c => (stockPorColorTalla[c]?.[talla] ?? 0) > 0)
    : undefined
  const stockColorTalla = (() => {
    if (color && talla) return stockPorColorTalla[color]?.[talla]
    if (talla && stockPorColorTalla['_']) return stockPorColorTalla['_'][talla]  // sin-color
    return undefined
  })()

  // Stock del color seleccionado (si hay stockPorColor), si no usa stock total
  const stockColor = color && producto?.stockPorColor?.[color] !== undefined
    ? producto.stockPorColor[color]
    : producto?.stock ?? 0
  const primeraImagenPorColor = Object.values(producto?.imagenesPorColor ?? {}).find(
    imgs => Array.isArray(imgs) && imgs.length > 0
  ) ?? []
  const imagenesActivas =
    color && producto?.imagenesPorColor?.[color]?.length > 0
      ? producto.imagenesPorColor[color]
      : (producto?.imagenes?.length ?? 0) > 0
        ? producto.imagenes
        : primeraImagenPorColor
  const stockDisponible =
    stockColorTalla !== undefined
      ? stockColorTalla
      : necesitaColor && color
        ? stockColor
        : (producto?.stock ?? 0)

  const carritoActivo = getCarritoActivo(isAuthenticated)
  const yaEnCarrito = !!producto && !!(carritoActivo?.items ?? []).find(
    i => i.productoId === producto.id &&
      (!talla || i.talla === talla) &&
      (!color || i.color === color)
  )

  const puedeAgregar = (!necesitaTalla || !!talla) && (!necesitaColor || !!color) && stockDisponible > 0 && !yaEnCarrito

  // Precio de la variante seleccionada (si existe), si no el precio base
  const precioVariante: number | undefined = (() => {
    const pct = producto?.precioPorColorTalla
    if (!pct) return undefined
    if (color && talla) return pct[color]?.[talla]
    if (talla && pct['_']) return pct['_'][talla]  // sin-color per-talla
    return undefined
  })()
  const precioMostrado = precioVariante ?? producto?.precio ?? 0
  const hayPrecioVariante = precioVariante !== undefined && precioVariante !== producto?.precio

  // Precio original de la variante seleccionada (si tiene descuento)
  const precioOriginalVariante: number | undefined = (() => {
    const poct = producto?.precioOriginalPorColorTalla
    if (!poct) return undefined
    if (color && talla) return poct[color]?.[talla]
    if (talla && poct['_']) return poct['_'][talla]
    return undefined
  })()
  const tieneDescuentoVariante = precioOriginalVariante !== undefined && precioOriginalVariante > precioMostrado
  const descuentoVariantePct = tieneDescuentoVariante
    ? Math.round((1 - precioMostrado / precioOriginalVariante!) * 100)
    : 0

  const handleAgregar = async () => {
    if (!puedeAgregar) return
    await agregarItem(producto!.id, cantidad, talla, color, {
      nombre: producto!.nombre,
      precio: precioMostrado,
      imagen: imagenesActivas[0],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleCompartir = async () => {
    if (!producto) return
    const url = window.location.href
    const title = producto.nombre
    const text = `Mira este producto en Sofia Couture EC: ${producto.nombre} · $${precioMostrado.toFixed(2)}`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (e: any) {
        if (e?.name === 'AbortError') return
      }
    }
    // Fallback: mostrar dropdown con opciones
    setCompartirOpen(true)
  }

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    } catch {}
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = producto ? `Mira este producto en Sofia Couture EC: ${producto.nombre} · $${precioMostrado.toFixed(2)}` : ''

  if (isLoading) return <DetailSkeleton />

  if (!producto) return <div className="text-center py-16 text-gray-500">Producto no encontrado</div>

  const descuento = producto.precioOriginal && producto.precioOriginal > producto.precio
    ? Math.round((1 - producto.precio / producto.precioOriginal) * 100) : null

  const stockBajo = stockDisponible > 0 && stockDisponible <= 10

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Breadcrumb — solo desktop */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-[#7d5c48] transition-colors">Inicio</Link>
        <span className="text-gray-300">/</span>
        <Link to="/catalogo" className="hover:text-[#7d5c48] transition-colors">Catálogo</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{producto.nombre}</span>
      </div>

      {/* Botón volver — solo móvil */}
      <div className="flex md:hidden mb-4">
        <Link to="/catalogo" className="flex items-center gap-1.5 text-xs text-[#7d5c48] font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <ImageGallery key={color ?? ''} imagenes={imagenesActivas} nombre={producto.nombre} />

        <div className="flex flex-col">
          {/* Categoría + nombre */}
          {producto.categoriaNombre && (
            <span className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">
              {producto.categoriaNombre}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {producto.nombre}
          </h1>

          {/* Precio */}
          <div className="flex items-end gap-3 mb-5 flex-wrap">
            <span className="text-3xl font-black text-red-600 transition-all duration-200">
              ${precioMostrado.toFixed(2)}
            </span>
            {/* Descuento por variante (color/talla específica) */}
            {tieneDescuentoVariante && (
              <>
                <span className="text-base text-gray-400 line-through mb-0.5">${precioOriginalVariante!.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  -{descuentoVariantePct}% OFF
                </span>
              </>
            )}
            {/* Descuento global (aplica a todo el producto) — solo si no hay descuento por variante */}
            {!tieneDescuentoVariante && !hayPrecioVariante && producto.precioOriginal && producto.precioOriginal > producto.precio && (
              <>
                <span className="text-base text-gray-400 line-through mb-0.5">${producto.precioOriginal.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  -{descuento}% OFF
                </span>
              </>
            )}
            {/* Badge cuando el precio viene de la variante */}
            {hayPrecioVariante && (
              <span className="text-xs text-[#7d5c48] bg-[#f0e9df] border border-[#d9ccbb] px-2 py-1 rounded-full font-medium mb-0.5">
                Precio para {color ? `${getColorLabel(color)}${talla ? ` · ${talla}` : ''}` : `Talla ${talla}`}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-5" />

          {/* Descripción */}
          {producto.descripcion && (
            <p className="text-gray-500 text-sm leading-relaxed mb-5">{producto.descripcion}</p>
          )}

          {/* Características */}
          {producto.caracteristicaTitulo && (
            <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{producto.caracteristicaTitulo}</p>
              </div>
              {producto.caracteristicaDescripcion && (
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{producto.caracteristicaDescripcion}</p>
                </div>
              )}
            </div>
          )}

          {/* Talla y color */}
          <div className="space-y-5 mb-6">
            {(producto.tallas?.length ?? 0) > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Talla</span>
                  <button
                    onClick={() => setGuiaOpen(true)}
                    className="text-xs text-[#7d5c48] underline underline-offset-2 hover:text-[#4a3728] transition-colors"
                  >
                    Guía de tallas
                  </button>
                </div>
                <SizeSelector
              tallas={producto.tallas}
              selected={talla}
              onSelect={t => {
                setTalla(t)
                setCantidad(1)
                // Si el color actual no tiene stock en la nueva talla, lo deselecciona
                if (color && Object.keys(stockPorColorTalla).length > 0) {
                  const disponible = (stockPorColorTalla[color]?.[t] ?? 0) > 0
                  if (!disponible) setColor(undefined)
                }
              }}
            />
                {color && producto.stockPorColorTalla?.[color] && !talla && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selecciona una talla para ver el stock exacto de ese color.
                  </p>
                )}
              </div>
            )}
            {/* Miniaturas por color — solo móvil: se ve la foto arriba de cada círculo */}
            {(producto.colores?.length ?? 0) > 0 && Object.keys(producto.imagenesPorColor ?? {}).length > 0 && (
              <div className="md:hidden">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Color: {color && <span className="font-normal">{
                    ({'#000000':'Negro','#FFFFFF':'Blanco','#9CA3AF':'Gris','#EF4444':'Rojo','#F9A8D4':'Rosa','#EC4899':'Fucsia','#F97316':'Naranja','#FACC15':'Amarillo','#22C55E':'Verde','#3B82F6':'Azul','#1E3A5F':'Marino','#A855F7':'Morado','#92400E':'Café','#D4B896':'Beige','#FEF3C7':'Crema'} as Record<string,string>)[color] ?? color
                  }</span>}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {producto.colores.map(c => {
                    const img = producto.imagenesPorColor?.[c]?.[0] ?? producto.imagenes?.[0]
                    const disponible = !coloresDisponiblesParaTalla || coloresDisponiblesParaTalla.includes(c)
                    const activo = color === c
                    return (
                      <button
                        key={c}
                        onClick={() => { setColor(c); setCantidad(1) }}
                        disabled={!disponible}
                        className={`flex-shrink-0 flex flex-col items-center gap-1 transition-all ${!disponible ? 'opacity-40' : ''}`}
                      >
                        <div className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${activo ? 'border-[#4a3728] shadow-md scale-105' : 'border-gray-200'}`}>
                          {img
                            ? <img src={img} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full" style={{ backgroundColor: c }} />}
                        </div>
                        <span className={`w-4 h-4 rounded-full border ${activo ? 'border-[#4a3728] scale-110' : 'border-gray-300'}`} style={{ backgroundColor: c }} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {/* Selector clásico — desktop */}
            <div className="hidden md:block">
              <ColorSelector
                colores={producto.colores}
                selected={color}
                onSelect={c => { setColor(c); setCantidad(1) }}
                coloresDisponibles={coloresDisponiblesParaTalla}
              />
            </div>
          </div>

          {/* Cantidad + alerta stock bajo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setCantidad(c => Math.max(1, c - 1))}
                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                −
              </button>
              <span className="w-10 h-10 flex items-center justify-center font-semibold border-x border-gray-200">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad(c => Math.min(stockDisponible, c + 1))}
                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                +
              </button>
            </div>
            {stockBajo && (
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
                Solo quedan {stockDisponible}
              </span>
            )}
          </div>

          {/* Validación selección */}
          {!puedeAgregar && (
            <p className="text-xs text-red-500 mb-2">
              {!talla && necesitaTalla && !color && necesitaColor
                ? 'Seleccioná una talla y un color'
                : !talla && necesitaTalla
                ? 'Seleccioná una talla'
                : 'Seleccioná un color'}
            </p>
          )}

          {/* Ya en carrito — desktop (inline) */}
          <div className="hidden md:flex gap-2">
            <div className="flex-1">
            {yaEnCarrito ? (
              <Link
                to="/carrito"
                className="w-full py-4 font-bold rounded-xl text-base tracking-wide border-2 border-[#7d5c48] text-[#7d5c48] hover:bg-[#f5ede6] transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
                </svg>
                Ya está en tu carrito · Ver carrito
              </Link>
            ) : (
              <button
                onClick={handleAgregar}
                disabled={loading || stockDisponible === 0 || !puedeAgregar}
                className={`w-full py-4 font-bold text-white rounded-xl text-base tracking-wide transition-all ${
                  added
                    ? 'bg-green-500 scale-[0.99]'
                    : stockDisponible === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : !puedeAgregar
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 active:scale-[0.99] shadow-sm hover:shadow-md'
                }`}
              >
                {stockDisponible === 0 ? 'Agotado' : added ? 'Agregado ✓' : loading ? 'Agregando...' : 'Agregar al carrito'}
              </button>
            )}
            </div>
            {/* Botón compartir desktop */}
            <button
              onClick={handleCompartir}
              aria-label="Compartir producto"
              title="Compartir"
              className="flex-shrink-0 py-4 px-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-[#7d5c48] hover:text-[#7d5c48] hover:bg-[#f5ede6] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          {/* Spacer en móvil para que el botón sticky no tape contenido */}
          <div className="block md:hidden h-20" />
        </div>
      </div>

      {/* Botón sticky — solo móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex gap-2 items-center">
        <button
          onClick={handleCompartir}
          aria-label="Compartir"
          className="flex-shrink-0 p-3 rounded-xl border-2 border-gray-200 text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <div className="flex-1">
        {yaEnCarrito ? (
          <Link
            to="/carrito"
            className="w-full py-3.5 font-bold rounded-xl text-base tracking-wide border-2 border-[#7d5c48] text-[#7d5c48] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" />
            </svg>
            Ya está en tu carrito · Ver carrito
          </Link>
        ) : (
          <button
            onClick={handleAgregar}
            disabled={loading || stockDisponible === 0 || !puedeAgregar}
            className={`w-full py-3.5 font-bold text-white rounded-xl text-base tracking-wide transition-all ${
              added
                ? 'bg-green-500'
                : stockDisponible === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : !puedeAgregar
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 active:scale-[0.99]'
            }`}
          >
            {stockDisponible === 0 ? 'Agotado' : added ? '✓ Agregado al carrito' : loading ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        )}
        </div>
      </div>

      {/* Modal de compartir — fallback si no hay Web Share API */}
      {compartirOpen && producto && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setCompartirOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-base">Compartir producto</h3>
              <button onClick={() => setCompartirOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-4 truncate">{producto.nombre} · ${precioMostrado.toFixed(2)}</p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer"
                onClick={() => setCompartirOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors">
                <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487 2.981 1.287 2.981.858 3.518.804.537-.054 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.075-.124-.272-.198-.57-.347M12 2a10 10 0 00-8.7 15L2 22l5.2-1.4A10 10 0 1012 2z"/>
                </svg>
                <span className="text-[11px] font-semibold text-gray-700">WhatsApp</span>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                onClick={() => setCompartirOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-[11px] font-semibold text-gray-700">Facebook</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                onClick={() => setCompartirOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <svg className="w-7 h-7 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[11px] font-semibold text-gray-700">Twitter/X</span>
              </a>
            </div>

            {/* Copiar link */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 p-2">
              <input value={shareUrl} readOnly
                className="flex-1 bg-transparent text-xs text-gray-600 outline-none px-2 truncate" />
              <button onClick={copiarLink}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  linkCopiado ? 'bg-green-500 text-white' : 'bg-[#4a3728] text-white hover:bg-[#3a2a1e]'
                }`}>
                {linkCopiado ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ResenaSection productoId={producto!.id} />

      {/* Sugerencias */}
      {sugerencias.length > 0 && (
        <section className="mt-10 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">También te puede gustar</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {relacionadosFiltrados.length > 0 ? 'De la misma categoría' : 'Lo más popular de la tienda'}
              </p>
            </div>
            <Link to="/catalogo" className="text-xs text-[#7d5c48] hover:text-[#4a3728] underline underline-offset-2">
              Ver más
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {sugerencias.map(p => (
              <ProductCard key={p.id} producto={p} compact />
            ))}
          </div>
        </section>
      )}

      {guiaOpen && <GuiaTallasModal onClose={() => setGuiaOpen(false)} />}
    </div>
  )
}
