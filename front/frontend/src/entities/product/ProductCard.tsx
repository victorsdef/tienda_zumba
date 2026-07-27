import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Producto } from '../../types'
import { useUiStore } from '../../store/useUiStore'
import { useAuthStore } from '../../store/useAuthStore'
import { toggleWishlist } from '../../api/wishlist'

interface Props {
  producto: Producto
  compact?: boolean
}

export default function ProductCard({ producto, compact = false }: Props) {
  const colores = producto.colores ?? []
  const tieneColores = colores.length > 0

  const { secuenciasActivas } = useUiStore()
  const { user, isAuthenticated } = useAuthStore()
  const [wishlist, setWishlist] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const colorActual = tieneColores ? colores[colorIndex] : null

  const getImagen = (color: string | null): string | null => {
    if (color && producto.imagenesPorColor?.[color]?.length) {
      return producto.imagenesPorColor[color][0]
    }
    return producto.imagenes?.[0]
      || Object.values(producto.imagenesPorColor ?? {}).find(imgs => imgs?.length)?.[0]
      || null
  }

  const getPrecio = (color: string | null) => {
    const pct = producto.precioPorColorTalla
    if (color && pct?.[color]) {
      const valores = Object.values(pct[color])
      if (valores.length) return Math.min(...valores)
    }
    // sin color: leer desde llave '_'
    if (!color && pct?.['_']) {
      const valores = Object.values(pct['_'])
      if (valores.length) return Math.min(...valores)
    }
    return producto.precio
  }

  const imagen = getImagen(colorActual)
  const precioMostrado = getPrecio(colorActual)

  const descuento = producto.precioOriginal && producto.precioOriginal > producto.precio
    ? Math.round((1 - producto.precio / producto.precioOriginal) * 100)
    : producto.descuentoPorcentaje ?? null

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    setPaused(true)
    setColorIndex(i => (i - 1 + colores.length) % colores.length)
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    setPaused(true)
    setColorIndex(i => (i + 1) % colores.length)
  }

  useEffect(() => {
    if (!tieneColores || colores.length < 2 || paused || !secuenciasActivas) return
    intervalRef.current = setInterval(() => {
      setColorIndex(i => (i + 1) % colores.length)
    }, 2500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [tieneColores, colores.length, paused])

  // resume auto-cycle after 4s of inactivity
  useEffect(() => {
    if (!paused) return
    const t = setTimeout(() => setPaused(false), 4000)
    return () => clearTimeout(t)
  }, [paused, colorIndex])

  const href = `/producto/${producto.slug ?? producto.id}${colorActual ? `?color=${encodeURIComponent(colorActual)}` : ''}`

  return (
    <Link to={href} className="group block bg-white hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className={`relative overflow-hidden bg-[#f5ede6] ${compact ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}>
        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-all duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#c4a882] gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-[10px] opacity-50 font-medium">Sin imagen</span>
          </div>
        )}

        {descuento && descuento > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10">
            -{descuento}%
          </span>
        )}

        {(() => {
          const stockEfectivo = producto.stock > 0 ? producto.stock
            : Object.values(producto.stockPorColorTalla?.['_'] ?? {}).reduce((a: number, b: number) => a + b, 0)
          return stockEfectivo === 0 ? (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">Agotado</span>
            </div>
          ) : null
        })()}

        {/* Flechas — solo si hay 2+ colores */}
        {tieneColores && colores.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full w-6 h-6 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full w-6 h-6 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {isAuthenticated && (
          <button
            onClick={async e => {
              e.preventDefault()
              e.stopPropagation()
              if (!user?.id) return
              setWishlist(w => !w)
              await toggleWishlist(user.id, producto.id)
            }}
            className="absolute top-2 right-2 z-20 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className={`w-4 h-4 ${wishlist ? 'text-red-500' : 'text-gray-400'}`} fill={wishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs text-center py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 font-medium z-10">
          + Agregar al carrito
        </div>
      </div>

      {/* Info */}
      <div className={`${compact ? 'p-1.5' : 'p-2'}`}>
        {/* Color dots */}
        {tieneColores && (
          <div className="flex gap-1 mb-1">
            {colores.slice(0, 4).map((c, idx) => (
              <span
                key={c}
                onMouseEnter={() => { setPaused(true); setColorIndex(idx) }}
                onMouseLeave={() => setPaused(false)}
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 cursor-pointer transition-transform ${colorIndex === idx ? 'scale-125 border-gray-600' : 'border-gray-200'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            {colores.length > 4 && (
              <span className="text-[10px] text-gray-400 ml-0.5">+{colores.length - 4}</span>
            )}
          </div>
        )}

        {/* Name */}
        <p className={`text-gray-700 line-clamp-2 leading-tight ${compact ? 'text-[11px]' : 'text-xs'} mb-1`}>
          {producto.nombre}
        </p>

        {/* Price */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(() => {
            const pct = producto.precioPorColorTalla
            const tallaVals = pct?.['_'] ? Object.values(pct['_']) : []
            const colorVals = colorActual && pct?.[colorActual] ? Object.values(pct[colorActual]) : []
            const vals = tallaVals.length ? tallaVals : colorVals
            if (vals.length > 1) {
              const min = Math.min(...vals), max = Math.max(...vals)
              return <>
                <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">desde</span>
                <span className={`font-bold text-red-500 ${compact ? 'text-sm' : 'text-sm'}`}>${min.toFixed(2)}</span>
                {min !== max && <span className="text-[11px] text-gray-400">– ${max.toFixed(2)}</span>}
              </>
            }
            return <span className={`font-bold text-red-500 ${compact ? 'text-sm' : 'text-sm'} transition-all duration-300`}>
              ${Number(precioMostrado).toFixed(2)}
            </span>
          })()}
          {producto.precioOriginal && producto.precioOriginal > producto.precio && (
            <span className="text-[11px] text-gray-400 line-through">
              ${Number(producto.precioOriginal).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
