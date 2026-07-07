import { Link } from 'react-router-dom'
import type { Producto } from '../../types'

interface Props {
  producto: Producto
  compact?: boolean
}

export default function ProductCard({ producto, compact = false }: Props) {
  const imagen = producto.imagenes?.[0] || 'https://placehold.co/300x400/f0f0f0/aaaaaa?text=Sin+imagen'
  const descuento = producto.precioOriginal && producto.precioOriginal > producto.precio
    ? Math.round((1 - producto.precio / producto.precioOriginal) * 100)
    : producto.descuentoPorcentaje ?? null

  return (
    <Link to={`/producto/${producto.slug ?? producto.id}`} className="group block bg-white hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className={`relative overflow-hidden bg-gray-50 ${compact ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}>
        <img
          src={imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {descuento && descuento > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            -{descuento}%
          </span>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">Agotado</span>
          </div>
        )}
        {/* Quick add hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs text-center py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 font-medium">
          + Agregar al carrito
        </div>
      </div>

      {/* Info */}
      <div className={`${compact ? 'p-1.5' : 'p-2'}`}>
        {/* Colors */}
        {producto.colores.length > 0 && (
          <div className="flex gap-0.5 mb-1">
            {producto.colores.slice(0, 4).map(color => (
              <span
                key={color}
                className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: color.startsWith('#') ? color : color }}
                title={color}
              />
            ))}
            {producto.colores.length > 4 && (
              <span className="text-[10px] text-gray-400 ml-0.5">+{producto.colores.length - 4}</span>
            )}
          </div>
        )}

        {/* Name */}
        <p className={`text-gray-700 line-clamp-2 leading-tight ${compact ? 'text-[11px]' : 'text-xs'} mb-1`}>
          {producto.nombre}
        </p>

        {/* Price */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-bold text-red-500 ${compact ? 'text-sm' : 'text-sm'}`}>
            ${producto.precio.toFixed(2)}
          </span>
          {producto.precioOriginal && producto.precioOriginal > producto.precio && (
            <span className="text-[11px] text-gray-400 line-through">
              ${producto.precioOriginal.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
