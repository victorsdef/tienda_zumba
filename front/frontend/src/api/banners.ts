import api from './axios'

export interface Banner {
  id: number
  tag: string
  titulo: string
  subtitulo: string
  ctaTexto: string
  tipoDestino: string
  destinoValor: string
  colorDesde: string
  colorHasta: string
  imagen?: string
  orden: number
  activo: boolean
}

export interface BannerRequest {
  tag: string
  titulo: string
  subtitulo: string
  ctaTexto: string
  tipoDestino: string
  destinoValor: string
  colorDesde: string
  colorHasta: string
  imagen?: string
  orden: number
  activo: boolean
}

export const getBannersPublic = () =>
  api.get<Banner[]>('/banners').then(r => r.data)

export const getBannersAdmin = () =>
  api.get<Banner[]>('/banners/admin').then(r => r.data)

export const crearBanner = (data: BannerRequest) =>
  api.post<Banner>('/banners/admin', data).then(r => r.data)

export const actualizarBanner = (id: number, data: BannerRequest) =>
  api.put<Banner>(`/banners/admin/${id}`, data).then(r => r.data)

export const eliminarBanner = (id: number) =>
  api.delete(`/banners/admin/${id}`)

export const toggleBanner = (id: number) =>
  api.patch<Banner>(`/banners/admin/${id}/toggle`).then(r => r.data)
