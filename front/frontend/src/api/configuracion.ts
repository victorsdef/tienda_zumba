import api from './axios'

export interface ConfigItem {
  clave: string
  valor: string
  descripcion: string
}

export const getConfiguracion = () =>
  api.get<ConfigItem[]>('/admin/configuracion').then(r => r.data)

export const updateConfiguracion = (clave: string, valor: string) =>
  api.put<ConfigItem>(`/admin/configuracion/${clave}`, { valor }).then(r => r.data)

export interface RetiroInfo {
  retiro_direccion: string
  retiro_horario: string
  retiro_whatsapp: string
}

export const getRetiroInfo = () =>
  api.get<RetiroInfo>('/configuracion/retiro').then(r => r.data)
