export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email: string
  nombre: string
  rol: 'CLIENTE' | 'VENDEDOR' | 'BODEGUERO' | 'ADMIN'
}

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
}

export interface Categoria {
  id: number
  nombre: string
  descripcion?: string
  imagen?: string
  genero?: string
  tallasDisponibles?: string[]
  activo?: boolean
}

export interface Producto {
  id: number
  sku?: string
  slug?: string
  nombre: string
  descripcion?: string
  precio: number
  precioOriginal?: number
  stock: number
  activo: boolean
  categoriaId?: number
  categoriaNombre?: string
  imagenes: string[]
  tallas: string[]
  colores: string[]
  stockPorColor?: Record<string, number>
  caracteristicaTitulo?: string
  caracteristicaDescripcion?: string
  caracteristicas?: string[]
  descuentoPorcentaje?: number
}

export interface ItemCarrito {
  id: number
  productoId: number
  productoNombre: string
  productoImagen?: string
  precio: number
  cantidad: number
  talla?: string
  color?: string
}

export interface Carrito {
  id: number
  items: ItemCarrito[]
  total: number
  cantidadItems: number
}

export interface ItemOrden {
  id: number
  productoId?: number
  nombreProducto: string
  productoImagen?: string
  cantidad: number
  precio: number
  talla?: string
  color?: string
}

export type EstadoOrden = 'PENDIENTE' | 'PAGADO' | 'EN_PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'

export interface Orden {
  id: number
  codigoOrden?: string
  usuarioId: number
  usuarioNombre: string
  items: ItemOrden[]
  total: number
  estado: EstadoOrden
  nombreEnvio?: string
  celularEnvio?: string
  provinciaEnvio?: string
  cantonEnvio?: string
  ciudadEnvio?: string
  calleEnvio?: string
  codigoPostalEnvio?: string
  costoEnvio?: number
  payphoneTransactionId?: string
  codigoAutorizacion?: string
  marcaTarjeta?: string
  numeroGuia?: string
  guiaImagenUrl?: string
  fechaCreacion: string
}

export interface Direccion {
  id: number
  nombreCompleto: string
  cedula?: string
  celular: string
  provincia: string
  canton: string
  ciudad: string
  direccion: string
  predeterminada: boolean
}

export interface GuestItem {
  productoId: number
  productoNombre: string
  productoImagen?: string
  precio: number
  cantidad: number
  talla?: string
  color?: string
}

export interface Page<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export interface ProductoFilter {
  categoriaId?: number
  precioMin?: number
  precioMax?: number
  nombre?: string
  talla?: string
  color?: string
  genero?: string
  page?: number
  size?: number
  sort?: string
}
