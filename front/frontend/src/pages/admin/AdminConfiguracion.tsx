import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfiguracion, updateConfiguracion } from '../../api/configuracion'

type ConfigMeta = { label: string; hint: string; tipo: 'numero'; prefix?: string; suffix?: string }
                | { label: string; hint: string; tipo: 'texto'; placeholder?: string }

const LABELS: Record<string, ConfigMeta> = {
  comision_payphone: {
    tipo: 'numero', label: 'Comisión Payphone', suffix: '%',
    hint: 'Se descuenta de cada venta pagada con tarjeta. Payphone cobra esto directamente.',
  },
  costo_envio: {
    tipo: 'numero', label: 'Costo de envío a domicilio', prefix: '$',
    hint: 'Se suma al total del pedido cuando el cliente elige envío a domicilio.',
  },
  iva_porcentaje: {
    tipo: 'numero', label: 'IVA Ecuador', suffix: '%',
    hint: 'Solo referencia para calcular tus precios. Payphone no cobra IVA aparte.',
  },
  retiro_direccion: {
    tipo: 'texto', label: 'Dirección de retiro (Cuenca)',
    hint: 'Dirección exacta del punto de retiro. Se muestra al cliente en el checkout.',
    placeholder: 'Ej: Av. Solano y Remigio Crespo, local 12, Cuenca',
  },
  retiro_horario: {
    tipo: 'texto', label: 'Horario de retiro',
    hint: 'Días y horas de atención para retiro en tienda.',
    placeholder: 'Ej: Lunes a sábado · 9:00 – 18:00',
  },
  retiro_whatsapp: {
    tipo: 'texto', label: 'WhatsApp de contacto',
    hint: 'Número en formato internacional sin + ni espacios (593 + número sin 0). Ej: 593987654321',
    placeholder: '593987654321',
  },
}

export default function AdminConfiguracion() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<string | null>(null)
  const [valor, setValor] = useState('')
  const [ok, setOk] = useState<string | null>(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: getConfiguracion,
  })

  const updateMut = useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: string }) =>
      updateConfiguracion(clave, valor),
    onSuccess: (_, { clave }) => {
      qc.invalidateQueries({ queryKey: ['configuracion'] })
      setEditando(null)
      setOk(clave)
      setTimeout(() => setOk(null), 3000)
    },
  })

  const iniciarEdicion = (clave: string, valorActual: string) => {
    setEditando(clave)
    setValor(valorActual)
  }

  const guardar = (clave: string) => {
    const meta = LABELS[clave]
    if (!valor.trim()) return
    if (meta?.tipo === 'numero' && (isNaN(Number(valor)) || Number(valor) < 0)) return
    updateMut.mutate({ clave, valor: valor.trim() })
  }

  // Calcular ejemplo con comisión Payphone
  const comision = Number(items.find(i => i.clave === 'comision_payphone')?.valor ?? 5.75)
  const costoEnvio = Number(items.find(i => i.clave === 'costo_envio')?.valor ?? 6)
  const iva = Number(items.find(i => i.clave === 'iva_porcentaje')?.valor ?? 15)

  if (isLoading) return <div className="p-6 text-gray-400">Cargando configuración...</div>

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Valores actualizables sin tocar código. Afectan precios, comisiones y envíos en tiempo real.</p>
      </div>

      {/* Tarjetas numéricas */}
      <div className="space-y-3">
        {items.filter(i => LABELS[i.clave]?.tipo === 'numero').map(item => {
          const meta = LABELS[item.clave] as Extract<ConfigMeta, { tipo: 'numero' }>
          const estandoEditando = editando === item.clave
          return (
            <div key={item.clave} className={`bg-white border rounded-lg p-4 transition-all ${estandoEditando ? 'border-[#7d5c48] shadow-sm' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{meta.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{meta.hint}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!estandoEditando ? (
                    <>
                      <span className="text-lg font-bold text-[#7d5c48]">
                        {meta.prefix}{Number(item.valor).toFixed(2)}{meta.suffix}
                      </span>
                      <button onClick={() => iniciarEdicion(item.clave, item.valor)} className="text-xs text-blue-600 hover:underline px-2 py-1">Editar</button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        {meta.prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{meta.prefix}</span>}
                        <input
                          type="number" step="0.01" min="0" value={valor}
                          onChange={e => setValor(e.target.value)}
                          className={`input-field w-24 text-right ${meta.prefix ? 'pl-5' : ''}`}
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') guardar(item.clave); if (e.key === 'Escape') setEditando(null) }}
                        />
                        {meta.suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{meta.suffix}</span>}
                      </div>
                      <button onClick={() => guardar(item.clave)} disabled={updateMut.isPending} className="btn-primary text-xs py-1.5 px-3">Guardar</button>
                      <button onClick={() => setEditando(null)} className="text-xs text-gray-400 hover:text-gray-600">X</button>
                    </div>
                  )}
                  {ok === item.clave && <span className="text-xs text-green-600 font-medium">Guardado</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Retiro en tienda */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Retiro en tienda — Cuenca</h2>
        <p className="text-xs text-gray-400 mb-3">Esta información se muestra al cliente cuando elige retirar en tienda y en el mensaje de WhatsApp.</p>
        <div className="space-y-3">
          {items.filter(i => LABELS[i.clave]?.tipo === 'texto').map(item => {
            const meta = LABELS[item.clave] as Extract<ConfigMeta, { tipo: 'texto' }>
            const estandoEditando = editando === item.clave
            return (
              <div key={item.clave} className={`bg-white border rounded-lg p-4 transition-all ${estandoEditando ? 'border-[#7d5c48] shadow-sm' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{meta.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{meta.hint}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!estandoEditando ? (
                      <>
                        <span className="text-sm text-[#7d5c48] font-medium max-w-xs truncate">{item.valor}</span>
                        <button onClick={() => iniciarEdicion(item.clave, item.valor)} className="text-xs text-blue-600 hover:underline px-2 py-1">Editar</button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text" value={valor}
                          onChange={e => setValor(e.target.value)}
                          placeholder={meta.placeholder}
                          className="input-field w-64 text-sm"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') guardar(item.clave); if (e.key === 'Escape') setEditando(null) }}
                        />
                        <button onClick={() => guardar(item.clave)} disabled={updateMut.isPending} className="btn-primary text-xs py-1.5 px-3">Guardar</button>
                        <button onClick={() => setEditando(null)} className="text-xs text-gray-400 hover:text-gray-600">X</button>
                      </div>
                    )}
                    {ok === item.clave && <span className="text-xs text-green-600 font-medium">Guardado</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Simulador */}
      <div className="bg-[#f5f0e8] border border-[#ddd8d0] rounded-lg p-4">
        <h2 className="font-bold text-[#4a3728] mb-3 text-sm">Simulador de precios</h2>
        <p className="text-xs text-gray-500 mb-4">
          Calculá cuánto recibirás realmente por un producto según los valores actuales.
        </p>
        <SimuladorPrecios comision={comision} costoEnvio={costoEnvio} iva={iva} />
      </div>

      <div className="text-xs text-gray-400 bg-gray-50 rounded p-3 border border-gray-100">
        <strong>Nota sobre envío:</strong> El costo de envío actual es fijo por pedido. Si manejás pedidos grandes
        (por cantidad de prendas o peso), podés actualizar este valor manualmente según el costo real del courier.
        En el futuro se puede agregar lógica automática por volumen.
      </div>
    </div>
  )
}

function SimuladorPrecios({ comision, costoEnvio, iva }: { comision: number; costoEnvio: number; iva: number }) {
  const [precio, setPrecio] = useState('100')
  const [incluyeEnvio, setIncluyeEnvio] = useState(false)

  const precioNum = Number(precio) || 0
  const comisionMonto = precioNum * (comision / 100)
  const envioMonto = incluyeEnvio ? costoEnvio : 0
  const recibes = precioNum - comisionMonto + envioMonto
  const precioConIva = precioNum * (1 + iva / 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Precio del producto:</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number" step="0.01" min="0"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              className="input-field w-24 pl-5 text-right text-sm py-1.5"
            />
          </div>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={incluyeEnvio} onChange={e => setIncluyeEnvio(e.target.checked)} className="accent-[#7d5c48]" />
          Con envío (+${costoEnvio.toFixed(2)})
        </label>
      </div>

      {precioNum > 0 && (
        <div className="bg-white rounded border border-[#ddd8d0] divide-y divide-[#ddd8d0] text-sm">
          <div className="flex justify-between px-3 py-2 text-gray-600">
            <span>Precio venta</span>
            <span className="font-medium">${precioNum.toFixed(2)}</span>
          </div>
          <div className="flex justify-between px-3 py-2 text-red-500">
            <span>Comisión Payphone ({comision}%)</span>
            <span>− ${comisionMonto.toFixed(2)}</span>
          </div>
          {incluyeEnvio && (
            <div className="flex justify-between px-3 py-2 text-green-600">
              <span>Cobro de envío al cliente</span>
              <span>+ ${envioMonto.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between px-3 py-2 font-bold text-[#4a3728] bg-[#f5f0e8]">
            <span>Recibirás</span>
            <span>${recibes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between px-3 py-2 text-xs text-gray-400">
            <span>Precio con IVA ({iva}%) — referencia</span>
            <span>${precioConIva.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
