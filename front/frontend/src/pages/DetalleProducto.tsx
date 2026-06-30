import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducto } from '../api/productos'
import { getProductos } from '../api/productos'
import ImageGallery from '../components/products/ImageGallery'
import SizeSelector from '../components/products/SizeSelector'
import ColorSelector from '../components/products/ColorSelector'
import ProductCard from '../components/products/ProductCard'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function DetalleProducto() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { agregarItem, loading } = useCartStore()
  const [talla, setTalla] = useState<string>()
  const [color, setColor] = useState<string>()
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)

  const { data: producto, isLoading } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => getProducto(Number(id)),
    enabled: !!id,
  })

  const { data: relacionados } = useQuery({
    queryKey: ['relacionados', producto?.categoriaId],
    queryFn: () => getProductos({ categoriaId: producto?.categoriaId, size: 4 }),
    enabled: !!producto?.categoriaId,
  })

  const handleAgregar = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    await agregarItem(Number(id), cantidad, talla, color)
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-red-600">Inicio</Link> /
        <Link to="/catalogo" className="hover:text-red-600 mx-1">Catálogo</Link> /
        <span className="mx-1">{producto.nombre}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <ImageGallery imagenes={producto.imagenes} nombre={producto.nombre} />

        <div>
          {producto.categoriaNombre && (
            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide">{producto.categoriaNombre}</p>
          )}
          <h1 className="text-2xl font-bold mb-3">{producto.nombre}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-red-600">${producto.precio.toFixed(2)}</span>
            {producto.precioOriginal && producto.precioOriginal > producto.precio && (
              <>
                <span className="text-lg text-gray-400 line-through">${producto.precioOriginal.toFixed(2)}</span>
                <span className="bg-red-600 text-white text-sm font-bold px-2 py-0.5 rounded">-{descuento}%</span>
              </>
            )}
          </div>

          {producto.descripcion && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{producto.descripcion}</p>
          )}

          <div className="space-y-4 mb-6">
            <SizeSelector tallas={producto.tallas} selected={talla} onSelect={setTalla} />
            <ColorSelector colores={producto.colores} selected={color} onSelect={setColor} />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex border border-gray-300 rounded">
              <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="px-4 py-2 hover:bg-gray-100">-</button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">{cantidad}</span>
              <button onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))} className="px-4 py-2 hover:bg-gray-100">+</button>
            </div>
            <span className="text-xs text-gray-500">{producto.stock} disponibles</span>
          </div>

          <button
            onClick={handleAgregar}
            disabled={loading || producto.stock === 0}
            className={`w-full py-4 font-bold text-white rounded text-lg transition-colors ${
              added ? 'bg-green-600' : producto.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {producto.stock === 0 ? 'Agotado' : added ? '✓ Agregado al carrito' : loading ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      {relacionados && relacionados.content.filter(p => p.id !== producto.id).length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relacionados.content.filter(p => p.id !== producto.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
