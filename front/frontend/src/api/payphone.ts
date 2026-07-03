import api from './axios'
import type { Orden } from '../types'

export const prepararPago = (req: {
  ordenId: number
  email?: string
  celular?: string
}) =>
  api.post<{ redirectUrl: string; payWithPayphone: string; clientTransactionId: string }>(
    '/pagos/preparar', req
  ).then(r => r.data)

export const confirmarPago = (id: string, clientTransactionId: string) =>
  api.post<Orden>(`/pagos/confirmar?id=${id}&clientTransactionId=${clientTransactionId}`)
    .then(r => r.data)
