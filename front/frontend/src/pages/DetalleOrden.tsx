import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarOrden, descargarPedidoPdf, getOrden, getOrdenPorCodigo } from '../api/ordenes'
import { getRetiroInfo } from '../api/configuracion'
import OrderStatus from '@entities/order/OrderStatus'
import PayphoneWidget from '@shared/PayphoneWidget'
import {
  IconChevronLeft,
  IconCreditCard,
  IconMapPin,
  IconPackage,
  IconPhone,
  IconTruck,
  IconUser,
} from '@shared/Icon'
import type { EstadoOrden, Orden } from '../types'

function codigoVisible(orden: { codigoOrden?: string; id: number }) {
  return orden.codigoOrden || `#${orden.id}`
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function estadoTexto(estado: EstadoOrden) {
  const labels: Record<EstadoOrden, string> = {
    PENDIENTE: 'Pendiente de pago',
    PAGADO: 'Pago confirmado',
    EN_PREPARACION: 'Preparando tu pedido',
    ENVIADO: 'Pedido enviado',
    ENTREGADO: 'Pedido entregado',
    CANCELADO: 'Pedido cancelado',
  }

  return labels[estado]
}

function estadoDescripcion(estado: EstadoOrden) {
  const descriptions: Record<EstadoOrden, string> = {
    PENDIENTE: 'Tu orden fue creada, pero aún falta completar el pago.',
    PAGADO: 'Recibimos tu pago y tu pedido ya está listo para pasar a preparación.',
    EN_PREPARACION: 'Estamos alistando tus productos para despacho.',
    ENVIADO: 'Tu pedido ya salió y va camino a la dirección registrada.',
    ENTREGADO: 'La orden fue marcada como entregada.',
    CANCELADO: 'La orden fue cancelada y ya no seguirá avanzando.',
  }

  return descriptions[estado]
}

function direccionCompleta(orden: Orden) {
  return [
    orden.calleEnvio,
    orden.ciudadEnvio,
    orden.cantonEnvio,
    orden.provinciaEnvio,
    orden.codigoPostalEnvio,
  ]
    .filter(Boolean)
    .join(', ')
}

function tipoEntregaTexto(tipoEntrega?: Orden['tipoEntrega']) {
  switch (tipoEntrega) {
    case 'CUENCA':
      return 'Envio dentro de Cuenca'
    case 'RETIRO':
      return 'Retiro en tienda'
    default:
      return 'Envio a domicilio'
  }
}

function descargarBlob(nombre: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function DetalleOrden() {
  const { codigo } = useParams<{ codigo: string }>()
  const [confirmCancelar, setConfirmCancelar] = useState(false)
  const [descargandoPdf, setDescargandoPdf] = useState(false)
  const qc = useQueryClient()

  const { data: orden, isLoading } = useQuery({
    queryKey: ['orden', codigo],
    queryFn: () => {
      const valor = codigo ?? ''
      return /^ord-/i.test(valor) ? getOrdenPorCodigo(valor) : getOrden(Number(valor))
    },
  })

  const { data: retiro } = useQuery({
    queryKey: ['retiro-info'],
    queryFn: getRetiroInfo,
    staleTime: 1000 * 60 * 10,
  })

  const cancelarMut = useMutation({
    mutationFn: () => cancelarOrden(Number(orden.id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orden', codigo] })
      qc.invalidateQueries({ queryKey: ['mis-ordenes'] })
      setConfirmCancelar(false)
    },
  })

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">Cargando detalle de la orden...</div>
  }

  if (!orden) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-center text-gray-500">Orden no encontrada</div>
  }

  const cantidadItems = orden.items.reduce((sum, item) => sum + item.cantidad, 0)
  const subtotal = Number(orden.total) - Number(orden.costoEnvio ?? 0)
  const shippingCost = Number(orden.costoEnvio ?? 0)

  const handleDescargarPdf = async () => {
    if (!orden.codigoOrden) {
      window.alert('Esta orden todavía no tiene un código público disponible.')
      return
    }

    setDescargandoPdf(true)
    try {
      const blob = await descargarPedidoPdf(orden.codigoOrden)
      descargarBlob(`${orden.codigoOrden}.pdf`, blob)
    } catch {
      window.alert('No se pudo descargar el PDF del pedido.')
    } finally {
      setDescargandoPdf(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <Link
            to="/ordenes"
            className="inline-flex items-center gap-2 text-sm text-[#7d5c48] hover:text-[#5f4636] mb-3"
          >
            <IconChevronLeft size={16} />
            Volver a mis órdenes
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-[#4a3728]">{codigoVisible(orden)}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Creada el {formatFecha(orden.fechaCreacion)}
          </p>
        </div>

        <div className="bg-[#f8f5f1] border border-[#e7ddd2] rounded-xl px-4 py-3 max-w-md">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Estado actual</p>
          <p className="font-semibold text-[#4a3728]">{estadoTexto(orden.estado)}</p>
          <p className="text-sm text-gray-500 mt-1">{estadoDescripcion(orden.estado)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_360px] gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-[#ddd8d0] rounded-xl p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-[#4a3728]">Seguimiento del pedido</h2>
                <p className="text-sm text-gray-500 mt-1">Aquí puedes revisar en qué etapa va tu compra.</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Estado</p>
                <p className="text-sm font-semibold text-[#6b5040]">{estadoTexto(orden.estado)}</p>
              </div>
            </div>

            <OrderStatus estado={orden.estado} />

            {orden.estado === 'PENDIENTE' && (
              <div className="mt-5 border-t border-[#efe9e3] pt-5 space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Tu pago todavía no se ha completado. Puedes retomarlo desde aquí para no perder la orden.
                </div>
                <PayphoneWidget ordenId={orden.id} total={Number(orden.total)} />

                {!confirmCancelar ? (
                  <button
                    onClick={() => setConfirmCancelar(true)}
                    className="w-full border border-red-300 text-red-600 hover:bg-red-50 rounded-lg py-2.5 text-sm font-medium transition-colors"
                  >
                    Cancelar pedido
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-red-700 font-medium">¿Seguro que quieres cancelar esta orden?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => cancelarMut.mutate()}
                        disabled={cancelarMut.isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-bold transition-colors"
                      >
                        {cancelarMut.isPending ? 'Cancelando...' : 'Sí, cancelar'}
                      </button>
                      <button
                        onClick={() => setConfirmCancelar(false)}
                        className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg py-2.5 text-sm transition-colors"
                      >
                        No, volver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(orden.estado === 'PAGADO' || orden.estado === 'EN_PREPARACION' || orden.estado === 'ENVIADO' || orden.estado === 'ENTREGADO') && (
              <div className="mt-5 border-t border-[#efe9e3] pt-5">
                <p className="text-xs text-gray-500 mb-2">¿Necesitas hacer una devolución?</p>
                <a
                  href={`https://wa.me/${retiro?.retiro_whatsapp ?? '593000000000'}?text=${encodeURIComponent(`Hola, quiero solicitar una devolución del pedido ${codigoVisible(orden)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-700 border border-green-300 hover:bg-green-50 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-green-600"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Solicitar devolución por WhatsApp
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[#ddd8d0] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <IconUser size={18} className="text-[#7d5c48]" />
                <h2 className="font-bold text-[#4a3728]">Datos de entrega</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Recibe</p>
                  <p className="font-medium text-[#4a3728]">{orden.nombreEnvio || orden.usuarioNombre || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Celular</p>
                  <p className="font-medium text-[#4a3728]">{orden.celularEnvio || 'No especificado'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ddd8d0] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <IconTruck size={18} className="text-[#7d5c48]" />
                <h2 className="font-bold text-[#4a3728]">Despacho</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Método</p>
                  <p className="font-medium text-[#4a3728]">{tipoEntregaTexto(orden.tipoEntrega)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Guía</p>
                  <p className="font-medium text-[#4a3728]">
                    {orden.tipoEntrega === 'RETIRO' ? 'No aplica' : orden.numeroGuia || 'Aun no asignada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#ddd8d0] rounded-xl p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <IconMapPin size={18} className="text-[#7d5c48]" />
              <div>
                <h2 className="font-bold text-[#4a3728]">{orden.tipoEntrega === 'RETIRO' ? 'Punto de retiro' : 'Direccion de envio'}</h2>
                <p className="text-sm text-gray-500">
                  {orden.tipoEntrega === 'RETIRO'
                    ? 'Aqui ves el punto de retiro coordinado para esta orden.'
                    : 'Te mostramos la direccion exacta registrada para esta orden.'}
                </p>
              </div>
            </div>

            {orden.tipoEntrega === 'RETIRO' ? (
              <div className="rounded-xl border border-[#ece5dd] bg-[#faf8f5] p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-400">Retiro en tienda</p>
                <p className="text-base font-semibold text-[#4a3728]">{retiro?.retiro_direccion || 'Direccion no configurada'}</p>
                <p className="text-sm text-gray-500">{retiro?.retiro_horario || 'Horario no configurado'}</p>
                <p className="text-sm text-gray-500">Te contactaremos por WhatsApp para coordinar la entrega.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#ece5dd] bg-[#faf8f5] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Direccion principal</p>
                  <p className="text-base font-semibold text-[#4a3728] leading-relaxed">
                    {orden.calleEnvio || 'No especificada'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {direccionCompleta(orden) || 'No hay una direccion completa registrada.'}
                  </p>
                </div>

                <div className="rounded-xl border border-[#ece5dd] p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Ciudad</p>
                      <p className="font-medium text-[#4a3728]">{orden.ciudadEnvio || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Canton</p>
                      <p className="font-medium text-[#4a3728]">{orden.cantonEnvio || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Provincia</p>
                      <p className="font-medium text-[#4a3728]">{orden.provinciaEnvio || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Codigo postal</p>
                      <p className="font-medium text-[#4a3728]">{orden.codigoPostalEnvio || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(orden.estado === 'ENVIADO' || orden.estado === 'ENTREGADO') && (orden.numeroGuia || orden.guiaImagenUrl) && (
            <div className="bg-white border border-[#ddd8d0] rounded-xl p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-bold text-[#4a3728] mb-1">Guía de envío</h2>
                  <p className="text-sm text-gray-500">
                    {orden.numeroGuia ? `Número de guía: ${orden.numeroGuia}` : 'Tu pedido ya fue enviado.'}
                  </p>
                </div>
                {orden.guiaImagenUrl && (
                  <div className="flex gap-2">
                    <a
                      href={orden.guiaImagenUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm"
                    >
                      Ver guía
                    </a>
                    <a
                      href={orden.guiaImagenUrl}
                      download
                      className="btn-primary text-sm"
                    >
                      Descargar
                    </a>
                  </div>
                )}
              </div>

              {orden.guiaImagenUrl && (
                <div className="mt-4 border border-[#ece5dd] rounded-xl bg-[#faf8f5] p-3">
                  <img
                    src={orden.guiaImagenUrl}
                    alt="Guía de envío"
                    className="w-full max-h-[420px] object-contain rounded-lg bg-white"
                  />
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-[#ddd8d0] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#ece5dd] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconPackage size={18} className="text-[#7d5c48]" />
                <h2 className="font-bold text-[#4a3728]">Productos del pedido</h2>
              </div>
              <p className="text-sm text-gray-500">{cantidadItems} artículo{cantidadItems === 1 ? '' : 's'}</p>
            </div>

            <div className="divide-y divide-[#f0ebe5]">
              {orden.items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 md:p-5">
                  <img
                    src={item.productoImagen || 'https://placehold.co/88x112/f3f4f6/9ca3af'}
                    alt={item.nombreProducto}
                    className="w-20 h-24 md:w-24 md:h-28 object-cover rounded-lg border border-[#ece7e1]"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#4a3728]">{item.nombreProducto}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.talla && (
                        <span className="text-xs rounded-full bg-[#f5f0e8] text-[#6b5040] px-2.5 py-1">
                          Talla: {item.talla}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-xs rounded-full bg-[#f5f0e8] text-[#6b5040] px-2.5 py-1">
                          Color: {item.color}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Cantidad</p>
                        <p className="font-medium text-[#4a3728]">{item.cantidad}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Precio unitario</p>
                        <p className="font-medium text-[#4a3728]">{formatMoney(item.precio)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Subtotal</p>
                        <p className="font-semibold text-[#4a3728]">{formatMoney(item.precio * item.cantidad)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-[#ddd8d0] rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <IconCreditCard size={18} className="text-[#7d5c48]" />
              <h2 className="font-bold text-[#4a3728]">Resumen de pago</h2>
            </div>

            <button
              onClick={handleDescargarPdf}
              disabled={descargandoPdf}
              className="w-full btn-outline text-sm mb-4"
            >
              {descargandoPdf ? 'Generando PDF...' : 'Descargar pedido PDF'}
            </button>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Código de orden</span>
                <span className="font-medium text-[#4a3728]">{codigoVisible(orden)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Artículos</span>
                <span className="font-medium text-[#4a3728]">{cantidadItems}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-[#4a3728]">{formatMoney(subtotal > 0 ? subtotal : Number(orden.total))}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Envío</span>
                <span className={`font-medium ${shippingCost > 0 ? 'text-[#4a3728]' : 'text-green-600'}`}>
                  {shippingCost > 0 ? formatMoney(shippingCost) : 'Gratis'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Estado</span>
                <span className="font-medium text-[#4a3728]">{estadoTexto(orden.estado)}</span>
              </div>

              <div className="pt-3 border-t border-[#ece5dd] flex justify-between gap-3 text-base">
                <span className="font-bold text-[#4a3728]">Total pagado</span>
                <span className="font-bold text-[#7d5c48]">{formatMoney(Number(orden.total))}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#f8f5f1] border border-[#e7ddd2] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <IconPhone size={18} className="text-[#7d5c48] mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#4a3728]">¿Necesitas ayuda con esta orden?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ten a mano el código {codigoVisible(orden)} para que el soporte te ayude más rápido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
