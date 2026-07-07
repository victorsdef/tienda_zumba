import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore, type AdminPermission } from '../../store/useAuthStore'
import { IconBarChart, IconHanger, IconGrid, IconPackage, IconUsers, IconX, IconMenu, IconArrowRight, IconImage, IconSettings } from '@shared/Icon'

const NAV: Array<{
  to: string
  label: string
  Icon: typeof IconBarChart
  exact: boolean
  permission: AdminPermission
}> = [
  { to: '/admin',               label: 'Dashboard',     Icon: IconBarChart, exact: true,  permission: 'dashboard' },
  { to: '/admin/reportes',      label: 'Reportes',      Icon: IconBarChart, exact: false, permission: 'reportes' },
  { to: '/admin/productos',     label: 'Productos',     Icon: IconHanger,   exact: false, permission: 'productos' },
  { to: '/admin/categorias',    label: 'Categorías',    Icon: IconGrid,     exact: false, permission: 'categorias' },
  { to: '/admin/banners',       label: 'Banners',       Icon: IconImage,    exact: false, permission: 'banners' },
  { to: '/admin/ordenes',       label: 'Órdenes',       Icon: IconPackage,  exact: false, permission: 'ordenes' },
  { to: '/admin/usuarios',      label: 'Usuarios',      Icon: IconUsers,    exact: false, permission: 'usuarios' },
  { to: '/admin/configuracion', label: 'Configuración', Icon: IconSettings, exact: false, permission: 'configuracion' },
]

const DEFAULT_ROUTE_BY_ROLE = {
  ADMIN: '/admin',
  VENDEDOR: '/admin/ordenes',
  BODEGUERO: '/admin/productos',
  CLIENTE: '/',
} as const

const ROUTE_PERMISSION_RULES: Array<{ startsWith: string; permission: AdminPermission }> = [
  { startsWith: '/admin/configuracion', permission: 'configuracion' },
  { startsWith: '/admin/usuarios', permission: 'usuarios' },
  { startsWith: '/admin/reportes', permission: 'reportes' },
  { startsWith: '/admin/categorias', permission: 'categorias' },
  { startsWith: '/admin/banners', permission: 'banners' },
  { startsWith: '/admin/productos', permission: 'productos' },
  { startsWith: '/admin/ordenes', permission: 'ordenes' },
  { startsWith: '/admin', permission: 'dashboard' },
]

export default function AdminLayout() {
  const { role, canAccessAdmin, hasPermission } = useAuthStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navItems = NAV.filter(item => hasPermission(item.permission))
  const defaultRoute = role ? DEFAULT_ROUTE_BY_ROLE[role] : '/'

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    if (!canAccessAdmin) {
      navigate('/', { replace: true })
      return
    }

    const rule = ROUTE_PERMISSION_RULES.find(item => pathname.startsWith(item.startsWith))
    if (rule && !hasPermission(rule.permission)) {
      navigate(defaultRoute, { replace: true })
    }
  }, [canAccessAdmin, defaultRoute, hasPermission, navigate, pathname])

  if (!canAccessAdmin) return null

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-[#7d5c48] flex items-center justify-between">
        <Link to="/" className="block" onClick={() => setSidebarOpen(false)}>
          <span className="text-white font-bold text-base tracking-tight">sofia couture ec</span>
          <p className="text-xs text-gray-500 mt-0.5">Panel de gestión</p>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <IconX size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'bg-[#7d5c48] text-[#f5f0e8]' : 'text-[#a89888] hover:bg-[#3d2b1f] hover:text-[#f5f0e8]'
              }`}
            >
              <item.Icon size={18} className={active ? 'text-[#f5f0e8]' : 'text-[#a89888]'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#7d5c48]">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-[#8a7a6a] hover:text-[#f5f0e8] rounded">
          <IconArrowRight size={14} className="rotate-180" />
          Ver tienda
        </Link>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#4a3728] text-[#c9b8a8] flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex w-60 bg-[#4a3728] text-[#c9b8a8] flex-col flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-12 flex items-center gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900">
            <IconMenu size={22} />
          </button>
          <span className="font-bold text-gray-800 text-sm">Panel de gestión</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
