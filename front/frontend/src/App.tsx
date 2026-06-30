import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import DetalleProducto from './pages/DetalleProducto'
import CarritoPage from './pages/CarritoPage'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Registro from './pages/Registro'
import MiCuenta from './pages/MiCuenta'
import MisOrdenes from './pages/MisOrdenes'
import DetalleOrden from './pages/DetalleOrden'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductos from './pages/admin/AdminProductos'
import AdminCategorias from './pages/admin/AdminCategorias'
import AdminOrdenes from './pages/admin/AdminOrdenes'
import AdminUsuarios from './pages/admin/AdminUsuarios'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="ordenes" element={<AdminOrdenes />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Main */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/catalogo" element={<MainLayout><Catalogo /></MainLayout>} />
          <Route path="/producto/:id" element={<MainLayout><DetalleProducto /></MainLayout>} />
          <Route path="/carrito" element={<MainLayout><CarritoPage /></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
          <Route path="/cuenta" element={<MainLayout><MiCuenta /></MainLayout>} />
          <Route path="/ordenes" element={<MainLayout><MisOrdenes /></MainLayout>} />
          <Route path="/ordenes/:id" element={<MainLayout><DetalleOrden /></MainLayout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
