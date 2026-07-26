import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWishlist, toggleWishlist, type WishlistItem } from '../api/wishlist'
import { useAuthStore } from '../store/useAuthStore'

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: () => getWishlist(user!.id),
    enabled: !!user?.id,
  })

  const quitarMut = useMutation({
    mutationFn: (productoId: number) => toggleWishlist(user!.id, productoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', user?.id] }),
  })

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">♡</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Tu lista de deseos</h1>
        <p className="text-gray-500 mb-6">Inicia sesión para guardar tus productos favoritos.</p>
        <Link to="/login" className="bg-[#4a3728] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#3a2a1e] transition-colors">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">♡</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Tu lista de deseos está vacía</h1>
        <p className="text-gray-500 mb-6">Guarda tus productos favoritos para comprarlos después.</p>
        <Link to="/catalogo" className="bg-[#4a3728] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#3a2a1e] transition-colors">
          Explorar productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4a3728]">Mi lista de deseos</h1>
        <p className="text-sm text-gray-500 mt-1">{items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item: WishlistItem) => {
          const p = item.producto
          if (!p) return null
          const imagen = p.imagenes?.[0] || null
          const slug = p.slug ?? p.id

          return (
            <div key={item.id} className="group relative bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
              <Link to={`/producto/${slug}`}>
                <div className="aspect-[3/4] bg-[#f5ede6] overflow-hidden">
                  {imagen ? (
                    <img src={imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c4a882]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-700 line-clamp-2 mb-1">{p.nombre}</p>
                  <span className="font-bold text-red-500 text-sm">${Number(p.precio).toFixed(2)}</span>
                </div>
              </Link>
              <button
                onClick={() => quitarMut.mutate(item.productoId)}
                className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                title="Quitar de favoritos"
              >
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
