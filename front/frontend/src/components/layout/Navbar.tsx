import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '../../store/useCartStore'
import { IconSearch, IconUser, IconCart, IconHeart, IconMenu, IconX } from '../ui/Icon'

const NAV_CATS = [
  'Categorías', 'Solo para ti', 'Novedades', 'Ofertas', 'Ropa de mujer',
  'Vestidos', 'Zapatos', 'Bisutería', 'Tops', 'Conjuntos', 'Ropa interior',
  'Niños', 'Hombre', 'Bolsos', 'Belleza',
]

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const { carrito, toggleCart } = useCartStore()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/catalogo?nombre=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMobileOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar — black */}
      <div className="bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-3 md:px-4 h-12 flex items-center gap-2 md:gap-4">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded flex-shrink-0"
            aria-label="Menú"
          >
            <IconMenu size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 mr-1 md:mr-4">
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white">MODASTORE</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
            <div className="flex h-9 w-full bg-white rounded-sm overflow-hidden border border-transparent focus-within:border-red-400">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en MODASTORE"
                className="flex-1 px-3 text-sm text-gray-800 outline-none bg-transparent"
              />
              <button type="submit" className="bg-red-500 hover:bg-red-600 px-4 flex items-center justify-center flex-shrink-0">
                <IconSearch size={16} className="text-white" />
              </button>
            </div>
          </form>

          {/* Mobile search icon */}
          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden ml-auto flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded"
            aria-label="Buscar"
          >
            <IconSearch size={20} />
          </button>

          {/* Icons — desktop */}
          <div className="hidden sm:flex items-center gap-1 ml-2 md:ml-4">
            {/* User */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => isAuthenticated ? setMenuOpen(v => !v) : navigate('/login')}
                className="flex flex-col items-center px-2 md:px-3 py-1 hover:bg-white/10 rounded text-xs gap-0.5"
              >
                <IconUser size={20} />
                <span className="hidden md:block">{isAuthenticated ? user?.nombre.split(' ')[0] : 'Ingresar'}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white text-gray-800 rounded shadow-xl border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm">{user?.nombre}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link to="/cuenta" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Mi cuenta</Link>
                  <Link to="/ordenes" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Mis órdenes</Link>
                  {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Panel Admin</Link>}
                  <hr className="my-1" />
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Cerrar sesión</button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={toggleCart} className="flex flex-col items-center px-2 md:px-3 py-1 hover:bg-white/10 rounded text-xs gap-0.5 relative">
              <span className="relative">
                <IconCart size={20} />
                {(carrito?.cantidadItems ?? 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {carrito!.cantidadItems > 9 ? '9+' : carrito!.cantidadItems}
                  </span>
                )}
              </span>
              <span className="hidden md:block">Carrito</span>
            </button>

            {/* Wishlist */}
            <button className="flex flex-col items-center px-2 md:px-3 py-1 hover:bg-white/10 rounded text-xs gap-0.5">
              <IconHeart size={20} />
              <span className="hidden md:block">Favoritos</span>
            </button>
          </div>

          {/* Cart — mobile */}
          <button onClick={toggleCart} className="sm:hidden relative flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded">
            <IconCart size={20} />
            {(carrito?.cantidadItems ?? 0) > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {carrito!.cantidadItems > 9 ? '9+' : carrito!.cantidadItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category nav — desktop */}
      <div className="bg-white border-b border-gray-200 shadow-sm hidden sm:block">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {NAV_CATS.map((cat, i) => (
              <Link
                key={cat}
                to={i === 0 ? '/catalogo' : `/catalogo?nombre=${encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-3 py-3 text-xs font-medium text-gray-700 hover:text-red-500 whitespace-nowrap border-b-2 border-transparent hover:border-red-500 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white flex flex-col shadow-xl">
            <div className="bg-black text-white p-4 flex items-center justify-between flex-shrink-0">
              <span className="text-xl font-black tracking-tighter">MODASTORE</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded">
                <IconX size={20} />
              </button>
            </div>

            {/* Mobile search */}
            <div className="p-3 border-b">
              <form onSubmit={handleSearch}>
                <div className="flex h-10 bg-gray-100 rounded overflow-hidden">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    className="flex-1 px-3 text-sm outline-none bg-transparent"
                  />
                  <button type="submit" className="bg-red-500 px-4 flex items-center justify-center">
                    <IconSearch size={16} className="text-white" />
                  </button>
                </div>
              </form>
            </div>

            {/* Auth */}
            <div className="p-4 border-b bg-gray-50 flex-shrink-0">
              {isAuthenticated ? (
                <div>
                  <p className="font-semibold text-gray-800">{user?.nombre}</p>
                  <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
                  <div className="flex gap-2">
                    <Link to="/cuenta" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-xs bg-gray-200 rounded py-2 font-medium">Mi cuenta</Link>
                    <Link to="/ordenes" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-xs bg-gray-200 rounded py-2 font-medium">Órdenes</Link>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="mt-2 block text-center text-xs bg-red-500 text-white rounded py-2 font-medium">Panel Admin</Link>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false); navigate('/') }} className="mt-2 w-full text-xs text-gray-500 py-1">Cerrar sesión</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-black text-white rounded py-2 text-sm font-medium">Ingresar</Link>
                  <Link to="/registro" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-black rounded py-2 text-sm font-medium">Registro</Link>
                </div>
              )}
            </div>

            {/* Categories */}
            <nav className="flex-1 overflow-y-auto">
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Categorías</p>
              {NAV_CATS.map((cat, i) => (
                <Link
                  key={cat}
                  to={i === 0 ? '/catalogo' : `/catalogo?nombre=${encodeURIComponent(cat)}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 border-b border-gray-50"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
