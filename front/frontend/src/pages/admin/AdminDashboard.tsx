import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../../api/admin'
import { useAuthStore, type AdminPermission } from '../../store/useAuthStore'
import {
  IconDollar, IconBarChart, IconPackage, IconUsers, IconGrid,
  IconHanger, IconAlertTriangle, IconImage,
} from '@shared/Icon'

type QuickLink = {
  label: string
  value: string
  Icon: typeof IconDollar
  link: string
  color: string
  permission: AdminPermission
}

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800',
  PAGADO:     'bg-blue-100 text-blue-800',
  ENVIADO:    'bg-indigo-100 text-indigo-800',
  ENTREGADO:  'bg-green-100 text-green-800',
  CANCELADO:  'bg-red-100 text-red-800',
}

export default function AdminDashboard() {
  const { hasPermission } = useAuthStore()
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: getDashboard })

  if (isLoading) return (
    <div className="p-4 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gray-200 h-24 rounded-lg" />
      ))}
    </div>
  )

  if (!stats) return null

  const quickLinksBase = [
    {
      label: 'Productos activos',
      value: `${stats.totalProductosActivos ?? 0}/${stats.totalProductos ?? 0}`,
      Icon: IconHanger, link: '/admin/productos', color: 'text-pink-500', permission: 'productos',
    },
    {
      label: 'Categorías activas',
      value: `${stats.totalCategoriasActivas ?? 0}/${stats.totalCategorias ?? 0}`,
      Icon: IconGrid, link: '/admin/categorias', color: 'text-cyan-500', permission: 'categorias',
    },
    {
      label: 'Clientes activos',
      value: `${stats.totalClientesVerificados ?? 0}/${stats.totalClientes ?? 0}`,
      Icon: IconUsers, link: '/admin/usuarios', color: 'text-violet-500', permission: 'usuarios',
    },
    {
      label: 'Órdenes pendientes',
      value: `${stats.totalOrdenesPendientes ?? 0}/${stats.totalOrdenes ?? 0}`,
      Icon: IconPackage, link: '/admin/ordenes', color: 'text-amber-500', permission: 'ordenes',
    },
    {
      label: 'Banners activos',
      value: `${stats.totalBannersActivos ?? 0}/${stats.totalBanners ?? 0}`,
      Icon: IconImage, link: '/admin/banners', color: 'text-rose-500', permission: 'banners',
    },
  ] satisfies QuickLink[]

  const quickLinks = quickLinksBase.filter(item => hasPermission(item.permission))

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Ventas totales',    value: `$${stats.ventasTotales.toFixed(2)}`,   sub: 'Historial completo',          Icon: IconDollar,   color: 'bg-green-50 border-green-200',  ico: 'text-green-500' },
          { label: 'Ventas este mes',   value: `$${stats.ventasMes.toFixed(2)}`,       sub: `${stats.ordenesMes} órdenes`, Icon: IconBarChart, color: 'bg-blue-50 border-blue-200',    ico: 'text-blue-500' },
          { label: 'Esta semana',       value: `$${stats.ventasSemana.toFixed(2)}`,    sub: `${stats.ordenesSemana} órd.`, Icon: IconBarChart, color: 'bg-purple-50 border-purple-200', ico: 'text-purple-500' },
          { label: 'Hoy',              value: `$${stats.ventasHoy.toFixed(2)}`,        sub: `${stats.ordenesHoy} órdenes`, Icon: IconDollar,   color: 'bg-orange-50 border-orange-200', ico: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className={`rounded-lg border p-3 md:p-4 ${k.color}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1 truncate">{k.label}</p>
                <p className="text-lg md:text-2xl font-black text-gray-900 truncate">{k.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{k.sub}</p>
              </div>
              <k.Icon size={22} className={`flex-shrink-0 mt-0.5 ${k.ico}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {quickLinks.map(c => (
          <Link key={c.label} to={c.link} className="bg-white border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow flex items-center gap-3 md:flex-col md:items-start">
            <c.Icon size={24} className={c.color} />
            <div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{c.value}</div>
              <div className="text-xs md:text-sm text-gray-500">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Órdenes por estado */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-bold text-sm mb-4 text-gray-700 uppercase tracking-wide">Órdenes por estado</h2>
          <div className="space-y-2">
            {Object.entries(stats.ordenesPorEstado).map(([estado, count]) => (
              <div key={estado} className="flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${ESTADO_COLOR[estado] ?? 'bg-gray-100 text-gray-700'}`}>
                  {estado}
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-0">
                    <div
                      className="h-1.5 bg-red-400 rounded-full"
                      style={{ width: `${stats.totalOrdenes > 0 ? (count / stats.totalOrdenes) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-5 text-right flex-shrink-0">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top productos */}
        <div className="bg-white border rounded-lg p-4 lg:col-span-2">
          <h2 className="font-bold text-sm mb-4 text-gray-700 uppercase tracking-wide">Top productos más vendidos</h2>
          {stats.topProductos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin ventas aún</p>
          ) : (
            <div className="space-y-2">
              {stats.topProductos.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{p.nombre}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{p.unidadesVendidas} uds</span>
                  <span className="text-sm font-bold text-green-700 flex-shrink-0">${p.ingresos.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock bajo */}
      {stats.productosStockBajo.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconAlertTriangle size={18} className="text-orange-500 flex-shrink-0" />
            <h2 className="font-bold text-orange-800 text-sm">Productos con stock bajo (≤5 unidades)</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.productosStockBajo.map(p => (
              <Link key={p.id} to="/admin/productos" className="flex items-center gap-1.5 bg-white border border-orange-200 rounded px-3 py-1.5 text-sm hover:border-orange-400">
                <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>{p.stock}</span>
                <span className="text-gray-700">{p.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
