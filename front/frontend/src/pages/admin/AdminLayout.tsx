import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { IconBarChart, IconHanger, IconGrid, IconPackage, IconUsers, IconX, IconMenu, IconArrowRight } from '../../components/ui/Icon'

const NAV = [
  { to: '/admin',            label: 'Dashboard',  Icon: IconBarChart, exact: true  },
  { to: '/admin/productos',  label: 'Productos',  Icon: IconHanger,   exact: false },
  { to: '/admin/categorias', label: 'Categorías', Icon: IconGrid,     exact: false },
  { to: '/admin/ordenes',    label: 'Órdenes',    Icon: IconPackage,  exact: false },
  { to: '/admin/usuarios',   label: 'Usuarios',   Icon: IconUsers,    exact: false },
]

export default function AdminLayout() {
  const { isAdmin } = useAuthStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  if (!isAdmin) { navigate('/'); return null }

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-gray-700 flex items-center justify-between">
        <Link to="/" className="block" onClick={() => setSidebarOpen(false)}>
          <span className="text-white font-black text-xl tracking-tighter">MODASTORE</span>
          <p className="text-xs text-gray-500 mt-0.5">Panel de administración</p>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <IconX size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-white rounded">
          <IconArrowRight size={14} className="rotate-180" />
          Ver tienda
        </Link>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-gray-300 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-gray-900 text-gray-300 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-12 flex items-center gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900">
            <IconMenu size={22} />
          </button>
          <span className="font-bold text-gray-800 text-sm">Panel de administración</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
