import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Producto } from '../../types'
import { useUiStore } from '../../store/useUiStore'

interface Props {
  producto: Producto
  compact?: boolean
}

export default function ProductCard({ producto, compact = false }: Props) {
  const colores = producto.colores ?? []
  const tieneColores = colores.length > 0

  const { secuenciasActivas } = useUiStore()
  const [colorIndex, setColorIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const colorActual = tieneColores ? colores[colorIndex] : null

  const getImagen = (color: string | null) => {
    if (color && producto.imagenesPorColor?.[color]?.length) {
      return producto.imagenesPorColor[color][0]
    }
    return producto.imagenes?.[0]
      || Object.values(producto.imagenesPorColor ?? {}).find(imgs => imgs?.length)?.[0]
      || 'https://placehold.co/300x400/f0f0f0/aaaaaa?text=Sin+imagen'
  }

  const getPrecio = (color: string | null) => {
    if (color && producto.precioPorColorTalla?.[color]) {
      const valores = Object.values(producto.precioPorColorTalla[color])
      if (valores.length) return valores[0]
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
      <div className={`relative overflow-hidden bg-gray-50 ${compact ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}>
        <img
          src={imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover transition-all duration-500"
          loading="lazy"
        />

        {descuento && descuento > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10">
            -{descuento}%
          </span>
        )}

        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">Agotado</span>
          </div>
        )}

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
          <span className={`font-bold text-red-500 ${compact ? 'text-sm' : 'text-sm'} transition-all duration-300`}>
            ${Number(precioMostrado).toFixed(2)}
          </span>
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
