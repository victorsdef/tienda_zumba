import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@store/useAuthStore'
import { useCartStore } from '@store/useCartStore'
import { getCategorias } from '@api/categorias'
import { IconSearch, IconUser, IconCart, IconMenu, IconX } from '@shared/Icon'
import styles from './Navbar.module.scss'

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
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topInner}>

          <button
            onClick={() => setMobileOpen(true)}
            className={`${styles.iconButton} ${styles.mobileOnly}`}
            aria-label="Menú"
          >
            <IconMenu size={22} />
          </button>

          <Link to="/" className={styles.desktopLogo}>sofia couture ec</Link>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBox}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en Sofia Couture EC"
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchSubmit}>
                <IconSearch size={16} />
              </button>
            </div>
          </form>

          <Link to="/" className={styles.mobileLogo}>sofia couture ec</Link>

          <button
            onClick={() => setMobileOpen(true)}
            className={`${styles.iconButton} ${styles.mobileOnly}`}
            aria-label="Buscar"
          >
            <IconSearch size={20} />
          </button>

          <div className={styles.desktopActions}>
            <div className={styles.userMenuWrap} ref={menuRef}>
              <button
                onClick={() => isAuthenticated ? setMenuOpen(v => !v) : navigate('/login')}
                className={styles.stackButton}
              >
                <IconUser size={20} />
                <span>{isAuthenticated ? user?.nombre.split(' ')[0] : 'Ingresar'}</span>
              </button>
              {menuOpen && (
                <div className={styles.userMenu}>
                  <div className={styles.userMenuHeader}>
                    <p className={styles.userMenuName}>{user?.nombre}</p>
                    <p className={styles.userMenuEmail}>{user?.email}</p>
                  </div>
                  <Link to="/cuenta" className={styles.userMenuLink} onClick={() => setMenuOpen(false)}>Mi cuenta</Link>
                  <Link to="/ordenes" className={styles.userMenuLink} onClick={() => setMenuOpen(false)}>Mis órdenes</Link>
                  {canAccessAdmin && <Link to="/admin" className={`${styles.userMenuLink} ${styles.userMenuLinkAccent}`} onClick={() => setMenuOpen(false)}>Panel de gestión</Link>}
                  <div className={styles.menuDivider} />
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }} className={styles.userMenuLogout}>Cerrar sesión</button>
                </div>
              )}
            </div>

            <button onClick={toggleCart} className={styles.stackButton}>
              <span className={styles.userMenuWrap}>
                <IconCart size={20} />
                {(carrito?.cantidadItems ?? 0) > 0 && (
                  <span className={styles.cartCount}>
                    {carrito!.cantidadItems > 9 ? '9+' : carrito!.cantidadItems}
                  </span>
                )}
              </span>
              <span>Carrito</span>
            </button>
          </div>

          <button onClick={toggleCart} className={`${styles.iconButton} ${styles.mobileOnly}`}>
            <IconCart size={20} />
            {(carrito?.cantidadItems ?? 0) > 0 && (
              <span className={styles.cartCount}>
                {carrito!.cantidadItems > 9 ? '9+' : carrito!.cantidadItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.categoryBar}>
        <div className={styles.categoryInner}>
          <div className={styles.categoryScroller}>
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={styles.categoryLink}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
          <div className={styles.mobileDrawer}>
            <div className={styles.mobileHeader}>
              <span className={styles.mobileBrand}>sofia couture ec</span>
              <button onClick={() => setMobileOpen(false)} className={styles.iconButtonGhost}>
                <IconX size={20} />
              </button>
            </div>

            <div className={styles.mobileSearchSection}>
              <form onSubmit={handleSearch}>
                <div className={styles.mobileSearchWrap}>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    className={styles.mobileSearchInput}
                  />
                  <button type="submit" className={styles.searchSubmit}>
                    <IconSearch size={16} />
                  </button>
                </div>
              </form>
            </div>

            <div className={`${styles.mobileAuthSection} ${styles.mobileAuthPanel}`}>
              {isAuthenticated ? (
                <div>
                  <p className={styles.mobileAuthName}>{user?.nombre}</p>
                  <p className={styles.mobileAuthEmail}>{user?.email}</p>
                  <div className={styles.mobileAuthActions}>
                    <Link to="/cuenta" onClick={() => setMobileOpen(false)} className={styles.mobileActionSecondary}>Mi cuenta</Link>
                    <Link to="/ordenes" onClick={() => setMobileOpen(false)} className={styles.mobileActionSecondary}>Órdenes</Link>
                  </div>
                  {canAccessAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className={styles.mobileActionAdmin}>Panel de gestión</Link>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false); navigate('/') }} className={styles.mobileLogout}>Cerrar sesión</button>
                </div>
              ) : (
                <div className={styles.mobileAuthActions}>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className={styles.mobileActionPrimary}>Ingresar</Link>
                  <Link to="/registro" onClick={() => setMobileOpen(false)} className={styles.mobileActionSecondary}>Registro</Link>
                </div>
              )}
            </div>

            <nav className={styles.mobileNav}>
              <p className={styles.mobileNavTitle}>Categorías</p>
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={styles.mobileNavLink}
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
