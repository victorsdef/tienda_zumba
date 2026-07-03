import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '../../store/useCartStore'
import { getCategorias } from '../../api/categorias'
import { IconSearch, IconUser, IconCart, IconMenu, IconX } from '../ui/Icon'

const GENERO_LABELS: Record<string, string> = {
  MUJER: 'Mujer', HOMBRE: 'Hombre', NINO: 'Niño/a',
  CALZADO: 'Calzado', ACCESORIOS: 'Accesorios', BELLEZA: 'Belleza',
}
const GENERO_ORDER = ['MUJER', 'HOMBRE', 'NINO', 'CALZADO', 'ACCESORIOS', 'BELLEZA']

const NAV_STATIC = [
  { label: 'Categorías', to: '/catalogo' },
  { label: 'Novedades',  to: '/catalogo?sort=id,desc' },
  { label: 'Ofertas',    to: '/catalogo?sort=precio,asc' },
]

export default function Navbar() {
  const { user, isAuthenticated, canAccessAdmin, logout } = useAuthStore()
  const { carrito, toggleCart } = useCartStore()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const generosActivos = new Set(categorias.map(c => c.genero).filter(Boolean))
  const navGeneros = GENERO_ORDER
    .filter(g => generosActivos.has(g))
    .map(g => ({ label: GENERO_LABELS[g], to: `/catalogo?genero=${g}` }))
  const navLinks = [...NAV_STATIC, ...navGeneros]

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
      {/* Top bar */}
      <div className="bg-[#7d5c48] text-[#f5f0e8]">
        <div className="px-4 md:px-8 h-14 flex items-center gap-3">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded flex-shrink-0"
            aria-label="Menú"
          >
            <IconMenu size={22} />
          </button>

          {/* Logo — izquierda, ancho fijo para que la búsqueda quede centrada */}
          <Link to="/" className="flex-shrink-0 w-40 hidden sm:block">
            <span className="text-base font-bold tracking-tight text-white leading-none">sofia couture ec</span>
          </Link>

          {/* Buscador — centro, ocupa todo el espacio disponible */}
          <form onSubmit={handleSearch} className="flex-1 hidden sm:flex justify-center">
            <div className="flex h-9 w-full max-w-2xl bg-white rounded-sm overflow-hidden">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en Sofia Couture EC"
                className="flex-1 px-4 text-sm text-gray-800 outline-none bg-transparent"
              />
              <button type="submit" className="bg-[#7d5c48] hover:bg-[#4a3728] px-4 flex items-center justify-center flex-shrink-0 transition-colors">
                <IconSearch size={16} className="text-white" />
              </button>
            </div>
          </form>

          {/* Mobile: logo centro */}
          <Link to="/" className="sm:hidden flex-1 text-center">
            <span className="text-sm font-bold tracking-tight text-white">sofia couture ec</span>
          </Link>

          {/* Mobile search icon */}
          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded"
            aria-label="Buscar"
          >
            <IconSearch size={20} />
          </button>

          {/* Íconos derecha — ancho fijo igual al logo para que la búsqueda quede centrada */}
          <div className="hidden sm:flex items-center justify-end gap-1 w-40 flex-shrink-0">
            {/* Usuario */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => isAuthenticated ? setMenuOpen(v => !v) : navigate('/login')}
                className="flex flex-col items-center px-3 py-1 hover:bg-white/10 rounded text-xs gap-0.5 transition-colors"
              >
                <IconUser size={20} />
                <span>{isAuthenticated ? user?.nombre.split(' ')[0] : 'Ingresar'}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white text-gray-800 rounded shadow-xl border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm">{user?.nombre}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link to="/cuenta" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Mi cuenta</Link>
                  <Link to="/ordenes" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Mis órdenes</Link>
                  {canAccessAdmin && <Link to="/admin" className="block px-4 py-2 text-sm text-[#7d5c48] font-semibold hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Panel de gestión</Link>}
                  <hr className="my-1" />
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Cerrar sesión</button>
                </div>
              )}
            </div>

            {/* Carrito */}
            <button onClick={toggleCart} className="flex flex-col items-center px-3 py-1 hover:bg-white/10 rounded text-xs gap-0.5 relative transition-colors">
              <span className="relative">
                <IconCart size={20} />
                {(carrito?.cantidadItems ?? 0) > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#c9a87c] text-[#4a3728] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {carrito!.cantidadItems > 9 ? '9+' : carrito!.cantidadItems}
                  </span>
                )}
              </span>
              <span>Carrito</span>
            </button>
          </div>

          {/* Carrito — mobile */}
          <button onClick={toggleCart} className="sm:hidden relative flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded">
            <IconCart size={20} />
            {(carrito?.cantidadItems ?? 0) > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#c9a87c] text-[#4a3728] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {carrito!.cantidadItems > 9 ? '9+' : carrito!.cantidadItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category nav — desktop */}
      <div className="bg-[#ede8df] border-b border-[#c9bfb4] hidden sm:block">
        <div className="px-4 md:px-8">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="flex-shrink-0 px-3 py-3 text-xs font-medium text-[#7d5c48] hover:text-[#4a3728] whitespace-nowrap border-b-2 border-transparent hover:border-[#7d5c48] transition-colors"
              >
                {label}
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
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-[#f5f0e8] flex flex-col shadow-xl">
            <div className="bg-[#7d5c48] text-[#f5f0e8] p-4 flex items-center justify-between flex-shrink-0">
              <span className="text-base font-bold tracking-tight text-white">sofia couture ec</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded">
                <IconX size={20} />
              </button>
            </div>

            {/* Mobile search */}
            <div className="p-3 border-b border-[#c9bfb4]">
              <form onSubmit={handleSearch}>
                <div className="flex h-10 bg-[#ede8df] rounded overflow-hidden">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    className="flex-1 px-3 text-sm outline-none bg-transparent text-[#4a3728]"
                  />
                  <button type="submit" className="bg-[#7d5c48] px-4 flex items-center justify-center">
                    <IconSearch size={16} className="text-white" />
                  </button>
                </div>
              </form>
            </div>

            {/* Auth */}
            <div className="p-4 border-b border-[#c9bfb4] bg-[#ede8df] flex-shrink-0">
              {isAuthenticated ? (
                <div>
                  <p className="font-semibold text-gray-800">{user?.nombre}</p>
                  <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
                  <div className="flex gap-2">
                    <Link to="/cuenta" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-xs bg-[#c9bfb4] text-[#4a3728] rounded py-2 font-medium">Mi cuenta</Link>
                    <Link to="/ordenes" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-xs bg-[#c9bfb4] text-[#4a3728] rounded py-2 font-medium">Órdenes</Link>
                  </div>
                  {canAccessAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="mt-2 block text-center text-xs bg-[#7d5c48] text-[#f5f0e8] rounded py-2 font-medium">Panel de gestión</Link>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false); navigate('/') }} className="mt-2 w-full text-xs text-gray-500 py-1">Cerrar sesión</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-[#7d5c48] text-[#f5f0e8] rounded py-2 text-sm font-medium">Ingresar</Link>
                  <Link to="/registro" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-[#7d5c48] text-[#7d5c48] rounded py-2 text-sm font-medium">Registro</Link>
                </div>
              )}
            </div>

            {/* Categories */}
            <nav className="flex-1 overflow-y-auto">
              <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Categorías</p>
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 text-sm text-[#7d5c48] hover:bg-[#ede8df] border-b border-[#ddd8d0]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
