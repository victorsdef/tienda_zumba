import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crearOrden, crearOrdenInvitado } from '../api/ordenes'
import { getDirecciones, crearDireccion } from '../api/direcciones'
import type { DireccionRequest } from '../api/direcciones'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import DireccionForm from '../components/ui/DireccionForm'
import { getRetiroInfo } from '../api/configuracion'
import type { Direccion, Orden } from '../types'

const COSTO_ENVIO = 6

function codigoVisible(orden: Orden) {
  return orden.codigoOrden || `#${orden.id}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const { fetchCarrito, getCarritoActivo, guestItems, clearGuest } = useCartStore()
  const [error, setError] = useState('')
  const [conEnvio, setConEnvio] = useState(true)
  const [direccionId, setDireccionId] = useState<number | null>(null)
  const [mostrarFormDir, setMostrarFormDir] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [ordenCreada, setOrdenCreada] = useState<Orden | null>(null)

  // Datos invitado
  const [guestData, setGuestData] = useState({ nombre: '', email: '' })
  const [guestDirForm, setGuestDirForm] = useState<DireccionRequest | null>(null)

  useEffect(() => {
    if (isAuthenticated) fetchCarrito()
  }, [isAuthenticated])

  const carritoActivo = getCarritoActivo(isAuthenticated)

  useEffect(() => {
    if (!carritoActivo || carritoActivo.items.length === 0) navigate('/carrito')
  }, [])

  const { data: retiro } = useQuery({
    queryKey: ['retiro-info'],
    queryFn: getRetiroInfo,
    staleTime: 1000 * 60 * 10,
  })

  const { data: direcciones = [] } = useQuery({
    queryKey: ['mis-direcciones'],
    queryFn: getDirecciones,
    enabled: isAuthenticated,
  })

  // Seleccionar predeterminada automáticamente
  useEffect(() => {
    if (direcciones.length > 0 && direccionId === null) {
      const pred = direcciones.find(d => d.predeterminada) ?? direcciones[0]
      setDireccionId(pred.id)
    }
  }, [direcciones])

  const crearDirMut = useMutation({
    mutationFn: crearDireccion,
    onSuccess: (nueva) => {
      queryClient.invalidateQueries({ queryKey: ['mis-direcciones'] })
      setDireccionId(nueva.id)
      setMostrarFormDir(false)
    },
  })

  if (!carritoActivo || carritoActivo.items.length === 0) return null

  const subtotal = carritoActivo.total
  const costoEnvio = conEnvio ? COSTO_ENVIO : 0
  const total = subtotal + costoEnvio

  const direccionSeleccionada: Direccion | undefined = direcciones.find(d => d.id === direccionId)

  const handleConfirmar = async () => {
    setError('')

    if (isAuthenticated) {
      if (conEnvio && !direccionId && !mostrarFormDir) {
        setError('Seleccioná o agregá una dirección de entrega')
        return
      }
      setProcesando(true)

      // Abrir pestaña en blanco ANTES del await para que el navegador no la bloquee
      const pagoWindow = conEnvio ? window.open('', '_blank') : null

      try {
        const orden = await crearOrden({ direccionId: direccionId ?? undefined, conEnvio })
        if (!conEnvio) setOrdenCreada(orden)
        if (pagoWindow) {
          const params = new URLSearchParams({ ordenId: String(orden.id), total: String(orden.total) })
          if (orden.codigoOrden) params.set('codigoOrden', orden.codigoOrden)
          const cel = direccionSeleccionada?.celular
          if (cel) params.set('celular', cel)
          pagoWindow.location.href = `/pagar?${params}`
        }
      } catch {
        setError('Error al procesar el pedido. Intentá de nuevo.')
        pagoWindow?.close()
        setProcesando(false)
      }
    } else {
      if (!guestData.nombre || !guestData.email) {
        setError('Completá tu nombre y email')
        return
      }
      if (!guestDirForm) {
        setError('Completá la dirección de entrega')
        return
      }
      setProcesando(true)

      const pagoWindow = conEnvio ? window.open('', '_blank') : null

      try {
        const orden = await crearOrdenInvitado({
          nombre: guestData.nombre,
          email: guestData.email,
          ...guestDirForm,
          conEnvio,
          items: guestItems.map(gi => ({
            productoId: gi.productoId,
            cantidad: gi.cantidad,
            talla: gi.talla,
            color: gi.color,
          })),
        })
        clearGuest()
        if (!conEnvio) setOrdenCreada(orden)
        if (pagoWindow) {
          const params = new URLSearchParams({ ordenId: String(orden.id), total: String(orden.total), email: guestData.email })
          if (orden.codigoOrden) params.set('codigoOrden', orden.codigoOrden)
          if (guestDirForm.celular) params.set('celular', guestDirForm.celular)
          pagoWindow.location.href = `/pagar?${params}`
        }
      } catch {
        setError('Error al procesar el pedido. Intentá de nuevo.')
        pagoWindow?.close()
        setProcesando(false)
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-[#4a3728]">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        {/* ── Columna izquierda ── */}
        <div className="space-y-5">

          {/* Banner login (invitado) */}
          {!isAuthenticated && (
            <div className="bg-[#f5f0e8] border border-[#ddd8d0] rounded-lg p-4 text-sm text-[#7d5c48]">
              ¿Tenés cuenta?{' '}
              <Link to="/login" className="font-semibold underline hover:text-[#4a3728]">Iniciá sesión</Link>
              {' '}para guardar tu historial y direcciones.
            </div>
          )}

          {/* Datos del invitado */}
          {!isAuthenticated && (
            <div className="bg-white border border-[#ddd8d0] rounded-lg p-4 space-y-3">
              <h2 className="font-bold text-[#4a3728]">Tus datos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nombre completo *</label>
                  <input
                    value={guestData.nombre}
                    onChange={e => setGuestData(p => ({ ...p, nombre: e.target.value }))}
                    className="input-field" placeholder="Ana García"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={e => setGuestData(p => ({ ...p, email: e.target.value }))}
                    className="input-field" placeholder="tu@email.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Dirección de entrega ── */}
          <div className="bg-white border border-[#ddd8d0] rounded-lg p-4">
            <h2 className="font-bold text-[#4a3728] mb-4">Dirección de entrega</h2>

            {isAuthenticated ? (
              <div className="space-y-3">
                {/* Direcciones guardadas */}
                {direcciones.map(d => (
                  <label key={d.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    direccionId === d.id ? 'border-[#7d5c48] bg-[#f5f0e8]' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="direccion"
                      checked={direccionId === d.id}
                      onChange={() => { setDireccionId(d.id); setMostrarFormDir(false) }}
                      className="mt-0.5 accent-[#7d5c48]"
                    />
                    <div className="text-sm min-w-0">
                      <p className="font-semibold text-[#4a3728]">{d.nombreCompleto}
                        {d.predeterminada && <span className="ml-2 text-[10px] bg-[#7d5c48] text-white px-1.5 py-0.5 rounded-full">predeterminada</span>}
                      </p>
                      <p className="text-gray-500 text-xs">{d.celular}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{d.direccion}, {d.ciudad}, {d.canton}, {d.provincia}</p>
                    </div>
                  </label>
                ))}

                {/* Agregar nueva */}
                {!mostrarFormDir ? (
                  <button
                    onClick={() => { setMostrarFormDir(true); setDireccionId(null) }}
                    className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-gray-400 hover:border-[#7d5c48] hover:text-[#7d5c48] transition-colors"
                  >
                    + Agregar nueva dirección
                  </button>
                ) : (
                  <div className="border border-[#ddd8d0] rounded-lg p-4 bg-[#f5f0e8]">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Nueva dirección</p>
                    <DireccionForm
                      onSubmit={async data => { await crearDirMut.mutateAsync(data) }}
                      onCancel={() => { setMostrarFormDir(false); if (direcciones.length > 0) setDireccionId(direcciones[0].id) }}
                      loading={crearDirMut.isPending}
                      submitLabel="Guardar y usar"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Invitado — formulario directo */
              <DireccionForm
                      onSubmit={data => { setGuestDirForm(data) }}
                submitLabel={guestDirForm ? 'Direccion guardada' : 'Confirmar direccion'}
              />
            )}
          </div>

          {/* ── Tipo de entrega ── */}
          <div className="bg-white border border-[#ddd8d0] rounded-lg p-4">
            <h2 className="font-bold text-[#4a3728] mb-3">Tipo de entrega</h2>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${conEnvio ? 'border-[#7d5c48] bg-[#f5f0e8]' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="envio" checked={conEnvio} onChange={() => setConEnvio(true)} className="accent-[#7d5c48]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#4a3728]">Envío a domicilio</p>
                  <p className="text-xs text-gray-500">Recibís en tu dirección</p>
                </div>
                <span className="text-sm font-bold text-[#7d5c48]">$6.00</span>
              </label>
              <label className={`flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${!conEnvio ? 'border-[#7d5c48] bg-[#f5f0e8]' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="envio" checked={!conEnvio} onChange={() => setConEnvio(false)} className="accent-[#7d5c48]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#4a3728]">Retiro en tienda</p>
                    <p className="text-xs text-gray-500">Cuenca, Ecuador — coordinamos por WhatsApp</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">Gratis</span>
                </div>
                {!conEnvio && (
                  <div className="ml-6 bg-white border border-[#ddd8d0] rounded-lg p-3 text-xs text-[#4a3728] space-y-1">
                    <p className="font-semibold">Punto de retiro — Cuenca</p>
                    <p className="text-gray-600">{retiro?.retiro_direccion ?? '...'}</p>
                    <p className="text-gray-500">{retiro?.retiro_horario ?? ''}</p>
                    <p className="text-gray-500 mt-1">Una vez confirmado tu pedido te contactaremos por <span className="font-semibold text-green-700">WhatsApp</span> para coordinar el retiro.</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>
          )}

          {ordenCreada ? (
            /* Retiro en tienda: confirmación + WhatsApp */
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center space-y-3">
              <p className="font-bold text-green-800 text-base">¡Pedido {codigoVisible(ordenCreada)} confirmado!</p>
              <p className="text-sm text-green-700">Te contactaremos por WhatsApp para coordinar el retiro en Cuenca.</p>
              <a
                href={`https://wa.me/${retiro?.retiro_whatsapp ?? '593000000000'}?text=${encodeURIComponent(`Hola, quiero coordinar el retiro de mi pedido ${codigoVisible(ordenCreada)}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                Coordinar por WhatsApp
              </a>
            </div>
          ) : (
            <>
              <button
                onClick={handleConfirmar}
                disabled={procesando}
                className="btn-primary w-full text-base py-3"
              >
                {procesando ? 'Procesando...' : `Confirmar y pagar — $${total.toFixed(2)}`}
              </button>
              <p className="text-xs text-center text-gray-400">
                Pagá con tarjeta de forma segura a través de Payphone
              </p>
            </>
          )}
        </div>

        {/* ── Columna derecha — Resumen ── */}
        <div>
          <h2 className="font-bold text-lg mb-4 text-[#4a3728]">Resumen del pedido</h2>
          <div className="bg-white border border-[#ddd8d0] rounded-lg overflow-hidden sticky top-4">
            <div className="divide-y divide-[#ddd8d0]">
              {carritoActivo.items.map(item => (
                <div key={item.id} className="flex gap-3 p-3">
                  <img
                    src={item.productoImagen || 'https://placehold.co/60x80/f3f4f6/9ca3af'}
                    alt={item.productoNombre}
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 text-sm min-w-0">
                    <p className="font-medium text-[#4a3728] truncate">{item.productoNombre}</p>
                    <p className="text-gray-400 text-xs">
                      x{item.cantidad}
                      {item.talla && ` · ${item.talla}`}
                      {item.color && ` · ${item.color}`}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#7d5c48] flex-shrink-0">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#f5f0e8] space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span className={costoEnvio === 0 ? 'text-green-600 font-medium' : ''}>
                  {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-[#ddd8d0] pt-2 flex justify-between font-bold text-lg text-[#4a3728]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Dirección seleccionada (resumen) */}
            {direccionSeleccionada && (
              <div className="px-4 pb-4 text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-0.5">Entrega para:</p>
                <p>{direccionSeleccionada.nombreCompleto} · {direccionSeleccionada.celular}</p>
                <p>{direccionSeleccionada.direccion}, {direccionSeleccionada.ciudad}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
