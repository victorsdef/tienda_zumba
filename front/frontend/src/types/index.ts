export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email: string
  nombre: string
  rol: 'CLIENTE' | 'ADMIN'
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
}

export interface Producto {
  id: number
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

export type EstadoOrden = 'PENDIENTE' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'

export interface Orden {
  id: number
  usuarioId: number
  usuarioNombre: string
  items: ItemOrden[]
  total: number
  estado: EstadoOrden
  calleEnvio: string
  ciudadEnvio: string
  provinciaEnvio?: string
  codigoPostalEnvio?: string
  fechaCreacion: string
}

export interface Direccion {
  id: number
  calle: string
  ciudad: string
  provincia?: string
  codigoPostal?: string
  referencias?: string
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
  page?: number
  size?: number
  sort?: string
}
