import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProductoPorSlug, getProductos, getProductosTrending } from '../api/productos'
import ImageGallery from '../components/products/ImageGallery'
import SizeSelector from '../components/products/SizeSelector'
import ColorSelector from '../components/products/ColorSelector'
import ProductCard from '../components/products/ProductCard'
import { useCartStore } from '../store/useCartStore'
import womanSvg from '../assets/woman.svg'

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
  const { agregarItem, loading } = useCartStore()
  const [talla, setTalla] = useState<string>()
  const [color, setColor] = useState<string>()
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)
  const [guiaOpen, setGuiaOpen] = useState(false)

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

  // Stock del color seleccionado (si hay stockPorColor), si no usa stock total
  const stockColor = color && producto?.stockPorColor?.[color] !== undefined
    ? producto.stockPorColor[color]
    : producto?.stock ?? 0
  const stockDisponible = necesitaColor && color ? stockColor : (producto?.stock ?? 0)

  const puedeAgregar = (!necesitaTalla || !!talla) && (!necesitaColor || !!color) && stockDisponible > 0

  const handleAgregar = async () => {
    if (!puedeAgregar) return
    await agregarItem(producto!.id, cantidad, talla, color, {
      nombre: producto!.nombre,
      precio: producto!.precio,
      imagen: producto!.imagenes?.[0],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 aspect-[3/4] rounded" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )

  if (!producto) return <div className="text-center py-16 text-gray-500">Producto no encontrado</div>

  const descuento = producto.precioOriginal && producto.precioOriginal > producto.precio
    ? Math.round((1 - producto.precio / producto.precioOriginal) * 100) : null

  const stockBajo = stockDisponible > 0 && stockDisponible <= 10

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-red-500 transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-red-500 transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[160px]">{producto.nombre}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <ImageGallery imagenes={producto.imagenes} nombre={producto.nombre} />

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
          <div className="flex items-end gap-3 mb-5">
            <span className="text-3xl font-black text-red-600">${producto.precio.toFixed(2)}</span>
            {producto.precioOriginal && producto.precioOriginal > producto.precio && (
              <>
                <span className="text-base text-gray-400 line-through mb-0.5">${producto.precioOriginal.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  -{descuento}% OFF
                </span>
              </>
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
                <SizeSelector tallas={producto.tallas} selected={talla} onSelect={setTalla} />
              </div>
            )}
            <ColorSelector colores={producto.colores} selected={color} onSelect={c => { setColor(c); setCantidad(1) }} />
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

          {/* Botón agregar */}
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
            {stockDisponible === 0
              ? 'Agotado'
              : added
              ? 'Agregado al carrito'
              : loading
              ? 'Agregando...'
              : 'Agregar al carrito'}
          </button>
        </div>
      </div>

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
