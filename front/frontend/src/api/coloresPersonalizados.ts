import api from './axios'

export interface ColorPersonalizado {
  id: number
  nombre: string
  hex: string
  fechaCreacion?: string
}

export const getColoresPersonalizados = () =>
  api.get<ColorPersonalizado[]>('/admin/colores-personalizados').then(r => r.data)

export const crearColorPersonalizado = (nombre: string, hex: string) =>
  api.post<ColorPersonalizado>('/admin/colores-personalizados', { nombre, hex }).then(r => r.data)

export const actualizarColorPersonalizado = (id: number, nombre: string) =>
  api.put<ColorPersonalizado>(`/admin/colores-personalizados/${id}`, { nombre }).then(r => r.data)

export const eliminarColorPersonalizado = (id: number) =>
  api.delete(`/admin/colores-personalizados/${id}`)
