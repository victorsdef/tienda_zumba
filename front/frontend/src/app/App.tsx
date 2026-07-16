import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from '@widgets/layout/Navbar'
import Footer from '@widgets/layout/Footer'
import CartDrawer from '@widgets/cart/CartDrawer'
import Home from '@pages/Home'
import Catalogo from '@pages/Catalogo'
import DetalleProducto from '@pages/DetalleProducto'
import CarritoPage from '@pages/CarritoPage'
import Checkout from '@pages/Checkout'
import Login from '@pages/Login'
import Registro from '@pages/Registro'
import MiCuenta from '@pages/MiCuenta'
import MisOrdenes from '@pages/MisOrdenes'
import DetalleOrden from '@pages/DetalleOrden'
import AdminLayout from '@pages/admin/AdminLayout'
import AdminDashboard from '@pages/admin/AdminDashboard'
import AdminProductos from '@pages/admin/AdminProductos'
import AdminCategorias from '@pages/admin/AdminCategorias'
import AdminOrdenes from '@pages/admin/AdminOrdenes'
import AdminUsuarios from '@pages/admin/AdminUsuarios'
import AdminBanners from '@pages/admin/AdminBanners'
import AdminConfiguracion from '@pages/admin/AdminConfiguracion'
import AdminReportes from '@pages/admin/AdminReportes'
import VerificarEmail from '@pages/VerificarEmail'
import OrdenConfirmada from '@pages/OrdenConfirmada'
import MisDirecciones from '@pages/MisDirecciones'
import PagoConfirmado from '@pages/PagoConfirmado'
import PagarOrden from '@pages/PagarOrden'
import OlvidePassword from '@pages/OlvidePassword'
import ResetPassword from '@pages/ResetPassword'
import shellStyles from './AppShell.module.scss'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/593983934596"
      target="_blank"
      rel="noopener noreferrer"
      className={shellStyles.whatsAppButton}
      aria-label="Contactar por WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  )
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={shellStyles.mainLayout}>
      <Navbar />
      <CartDrawer />
      <main className={shellStyles.mainContent}>{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="categorias" element={<AdminCategorias />} />
<Route path="ordenes" element={<AdminOrdenes />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="configuracion" element={<AdminConfiguracion />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/olvide-password" element={<OlvidePassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Main */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/catalogo" element={<MainLayout><Catalogo /></MainLayout>} />
          <Route path="/producto/:slug" element={<MainLayout><DetalleProducto /></MainLayout>} />
          <Route path="/carrito" element={<MainLayout><CarritoPage /></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
          <Route path="/cuenta" element={<MainLayout><MiCuenta /></MainLayout>} />
          <Route path="/ordenes" element={<MainLayout><MisOrdenes /></MainLayout>} />
          <Route path="/ordenes/:codigo" element={<MainLayout><DetalleOrden /></MainLayout>} />
          <Route path="/orden-confirmada/:id" element={<MainLayout><OrdenConfirmada /></MainLayout>} />
          <Route path="/mis-direcciones" element={<MainLayout><MisDirecciones /></MainLayout>} />
          <Route path="/pago-confirmado" element={<MainLayout><PagoConfirmado /></MainLayout>} />
          <Route path="/pagar" element={<PagarOrden />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
