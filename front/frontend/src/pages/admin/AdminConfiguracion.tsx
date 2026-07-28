import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfiguracion, updateConfiguracion } from '../../api/configuracion'

type ConfigMeta = { label: string; hint: string; tipo: 'numero'; prefix?: string; suffix?: string; seccion: SeccionId }
                | { label: string; hint: string; tipo: 'texto'; placeholder?: string; seccion: SeccionId }

type SeccionId = 'finanzas' | 'contacto' | 'retiro' | 'redes' | 'home'

const LABELS: Record<string, ConfigMeta> = {
  // ── Finanzas y envío ──
  comision_payphone: {
    tipo: 'numero', label: 'Comisión Payphone', suffix: '%',
    hint: 'Se descuenta de cada venta pagada con tarjeta. Payphone cobra esto directamente.',
    seccion: 'finanzas',
  },
  costo_envio: {
    tipo: 'numero', label: 'Envío a domicilio', prefix: '$',
    hint: 'Costo que se suma al pedido cuando el cliente elige envío nacional.',
    seccion: 'finanzas',
  },
  costo_envio_cuenca: {
    tipo: 'numero', label: 'Envío dentro de Cuenca', prefix: '$',
    hint: 'Costo del envío local en Cuenca.',
    seccion: 'finanzas',
  },
  // ── Contacto ──
  retiro_whatsapp: {
    tipo: 'texto', label: 'WhatsApp de contacto',
    hint: 'Este número aparecerá en TODA la página: botón flotante, checkout, órdenes, mensajes de retiro y devoluciones. Formato internacional sin + ni espacios (593 + número sin 0). Ej: 593987654321',
    placeholder: '593987654321',
    seccion: 'contacto',
  },
  // ── Retiro en tienda ──
  retiro_direccion: {
    tipo: 'texto', label: 'Dirección de retiro (Cuenca)',
    hint: 'Se muestra al cliente en el checkout cuando elige retirar.',
    placeholder: 'Ej: Av. Solano y Remigio Crespo, local 12, Cuenca',
    seccion: 'retiro',
  },
  retiro_horario: {
    tipo: 'texto', label: 'Horario de retiro',
    hint: 'Días y horas de atención para retiro en tienda.',
    placeholder: 'Ej: Lunes a sábado · 9:00 – 18:00',
    seccion: 'retiro',
  },
  // ── Redes sociales ──
  social_instagram: {
    tipo: 'texto', label: 'Instagram',
    hint: 'URL completa del perfil. Ej: https://instagram.com/sofia_couture_ec',
    placeholder: 'https://instagram.com/tu_usuario',
    seccion: 'redes',
  },
  social_tiktok: {
    tipo: 'texto', label: 'TikTok',
    hint: 'URL completa del perfil. Ej: https://tiktok.com/@sofia.couture',
    placeholder: 'https://tiktok.com/@tu_usuario',
    seccion: 'redes',
  },
  social_facebook: {
    tipo: 'texto', label: 'Facebook',
    hint: 'URL completa de la página. Ej: https://facebook.com/sofia.couture.ec',
    placeholder: 'https://facebook.com/tu_pagina',
    seccion: 'redes',
  },
  social_pinterest: {
    tipo: 'texto', label: 'Pinterest',
    hint: 'URL completa del perfil. Ej: https://pinterest.com/sofia_couture',
    placeholder: 'https://pinterest.com/tu_usuario',
    seccion: 'redes',
  },
  // ── Contenido del home ──
  home_editorial_titulo: {
    tipo: 'texto', label: 'Título del bloque editorial',
    hint: 'Título grande de la sección central del home.',
    placeholder: 'Moda que te hace sentir única en cada ocasión.',
    seccion: 'home',
  },
  home_editorial_subtitulo: {
    tipo: 'texto', label: 'Subtítulo del bloque editorial',
    hint: 'Texto descriptivo debajo del título.',
    placeholder: 'Descubrí piezas pensadas para resaltar tu estilo...',
    seccion: 'home',
  },
  home_editorial_boton: {
    tipo: 'texto', label: 'Texto del botón "Ver catálogo"',
    hint: 'Texto del enlace que lleva al catálogo desde el home.',
    placeholder: 'Ver catálogo completo',
    seccion: 'home',
  },
  home_editorial_link: {
    tipo: 'texto', label: 'Destino del botón editorial',
    hint: 'Ruta a la que lleva el botón. Ej: /catalogo, /catalogo?genero=MUJER',
    placeholder: '/catalogo',
    seccion: 'home',
  },
}

const IconMoney = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const IconChat = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 01-9 9c-1.68 0-3.26-.46-4.6-1.26L3 21l1.26-4.4A8.96 8.96 0 013 12a9 9 0 019-9 9 9 0 019 9z" /></svg>
const IconPin = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
const IconHome = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
const IconShare = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>

const SECCIONES: { id: SeccionId; titulo: string; descripcion: string; Icon: () => JSX.Element; color: string; iconColor: string }[] = [
  { id: 'finanzas', titulo: 'Comisiones y envíos', descripcion: 'Valores financieros que afectan cada venta.',    Icon: IconMoney, color: 'from-amber-100 to-yellow-50 border-amber-200', iconColor: 'text-amber-600' },
  { id: 'contacto', titulo: 'Contacto WhatsApp',   descripcion: 'El número que ve tu cliente en toda la tienda.', Icon: IconChat,  color: 'from-green-100 to-emerald-50 border-green-200', iconColor: 'text-green-600' },
  { id: 'retiro',   titulo: 'Retiro en tienda',    descripcion: 'Información del punto de retiro en Cuenca.',     Icon: IconPin,   color: 'from-blue-100 to-sky-50 border-blue-200', iconColor: 'text-blue-600' },
  { id: 'redes',    titulo: 'Redes sociales',      descripcion: 'Enlaces del footer y del botón "Síguenos".',     Icon: IconShare, color: 'from-pink-100 to-rose-50 border-pink-200', iconColor: 'text-pink-600' },
  { id: 'home',     titulo: 'Contenido del home',  descripcion: 'Textos que aparecen en la página principal.',    Icon: IconHome,  color: 'from-purple-100 to-fuchsia-50 border-purple-200', iconColor: 'text-purple-600' },
]

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
    mutationFn: ({ clave, valor }: { clave: string; valor: string }) => updateConfiguracion(clave, valor),
    onSuccess: (_, { clave }) => {
      qc.invalidateQueries({ queryKey: ['configuracion'] })
      qc.invalidateQueries({ queryKey: ['retiro-info'] })
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

  const comision = Number(items.find(i => i.clave === 'comision_payphone')?.valor ?? 5.75)
  const costoEnvio = Number(items.find(i => i.clave === 'costo_envio')?.valor ?? 6)

  if (isLoading) return <div className="p-6 text-gray-400">Cargando configuración...</div>

  const clavesPorSeccion = (s: SeccionId) =>
    Object.entries(LABELS).filter(([, m]) => m.seccion === s)

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Encabezado (sticky) */}
      <div className="sticky top-14 lg:top-2 z-20 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 sm:px-5 py-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">Configuración de la tienda</h1>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Los cambios se reflejan al instante en la tienda pública.</p>
      </div>

      {/* Secciones */}
      {SECCIONES.map(sec => {
        const claves = clavesPorSeccion(sec.id)
        return (
          <section key={sec.id} className={`bg-gradient-to-br ${sec.color} border rounded-2xl overflow-hidden`}>
            {/* Cabecera de sección */}
            <div className="px-4 sm:px-5 py-4 bg-white/50 border-b border-white">
              <div className="flex items-start gap-3">
                <span className={`${sec.iconColor}`}><sec.Icon /></span>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-800 text-base sm:text-lg leading-tight">{sec.titulo}</h2>
                  <p className="text-xs text-gray-600 mt-0.5">{sec.descripcion}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-3 sm:p-4 space-y-2.5 bg-white/70">
              {claves.map(([clave, metaBase]) => {
                const item = items.find(i => i.clave === clave)
                const estandoEditando = editando === clave
                const guardado = ok === clave

                return (
                  <div key={clave} className={`bg-white rounded-xl border transition-all ${
                    estandoEditando ? 'border-[#7d5c48] shadow-md' : guardado ? 'border-green-300' : 'border-gray-100'
                  }`}>
                    {metaBase.tipo === 'numero' ? (
                      <NumeroItem meta={metaBase} clave={clave} item={item} estandoEditando={estandoEditando} valor={valor}
                        onCambiarValor={setValor} onIniciar={() => iniciarEdicion(clave, item?.valor ?? '')}
                        onGuardar={() => guardar(clave)} onCancelar={() => setEditando(null)}
                        guardando={updateMut.isPending} guardado={guardado} />
                    ) : (
                      <TextoItem meta={metaBase} clave={clave} item={item} estandoEditando={estandoEditando} valor={valor}
                        onCambiarValor={setValor} onIniciar={() => iniciarEdicion(clave, item?.valor ?? '')}
                        onGuardar={() => guardar(clave)} onCancelar={() => setEditando(null)}
                        guardando={updateMut.isPending} guardado={guardado} />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Simulador */}
      <section className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
        <h2 className="font-bold text-gray-800 mb-1 text-sm sm:text-base flex items-center gap-2">
          <svg className="w-5 h-5 text-[#7d5c48]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          Simulador de precios
        </h2>
        <p className="text-xs text-gray-500 mb-4">Calcula cuánto recibirás realmente por un producto según los valores actuales.</p>
        <SimuladorPrecios comision={comision} costoEnvio={costoEnvio} />
      </section>

      {/* Notas */}
      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-4 leading-relaxed">
        <strong className="text-blue-800 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Sobre IVA y comisiones:
        </strong> El precio de cada producto ya debe incluir el IVA. Payphone no lo suma aparte; lo único que descuenta del cobro es la comisión por transacción.
      </div>
    </div>
  )
}

// ── Item numérico ──
function NumeroItem({ meta, item, estandoEditando, valor, onCambiarValor, onIniciar, onGuardar, onCancelar, guardando, guardado }: {
  meta: Extract<ConfigMeta, { tipo: 'numero' }>; clave: string; item?: { valor: string }; estandoEditando: boolean;
  valor: string; onCambiarValor: (v: string) => void; onIniciar: () => void; onGuardar: () => void; onCancelar: () => void;
  guardando: boolean; guardado: boolean;
}) {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{meta.label}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{meta.hint}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!estandoEditando ? (
            <>
              {item
                ? <span className="text-lg font-bold text-[#7d5c48]">{meta.prefix}{Number(item.valor).toFixed(2)}{meta.suffix}</span>
                : <span className="text-[11px] text-gray-400 italic bg-gray-50 px-2 py-1 rounded">Sin configurar</span>}
              <button onClick={onIniciar} className="text-xs bg-[#f5f0e8] text-[#7d5c48] px-3 py-1.5 rounded-lg font-semibold hover:bg-[#e7dccb] transition-colors">
                {item ? 'Editar' : 'Agregar'}
              </button>
              {guardado && <span className="text-xs text-green-600 font-medium">✓ Guardado</span>}
            </>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative">
                {meta.prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{meta.prefix}</span>}
                <input type="number" step="0.01" min="0" value={valor}
                  onChange={e => onCambiarValor(e.target.value)}
                  className={`w-24 border border-gray-300 rounded-lg py-2 text-right focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30 text-sm ${meta.prefix ? 'pl-6 pr-3' : 'px-3'}`}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') onGuardar(); if (e.key === 'Escape') onCancelar() }} />
                {meta.suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{meta.suffix}</span>}
              </div>
              <button onClick={onGuardar} disabled={guardando}
                className="bg-[#4a3728] text-white text-xs py-2 px-3.5 rounded-lg font-semibold hover:bg-[#3a2a1e] disabled:opacity-40">
                {guardando ? '...' : 'Guardar'}
              </button>
              <button onClick={onCancelar} className="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Item texto ──
function TextoItem({ meta, item, estandoEditando, valor, onCambiarValor, onIniciar, onGuardar, onCancelar, guardando, guardado }: {
  meta: Extract<ConfigMeta, { tipo: 'texto' }>; clave: string; item?: { valor: string }; estandoEditando: boolean;
  valor: string; onCambiarValor: (v: string) => void; onIniciar: () => void; onGuardar: () => void; onCancelar: () => void;
  guardando: boolean; guardado: boolean;
}) {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{meta.label}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{meta.hint}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!estandoEditando && (
            <>
              <button onClick={onIniciar} className="text-xs bg-[#f5f0e8] text-[#7d5c48] px-3 py-1.5 rounded-lg font-semibold hover:bg-[#e7dccb] transition-colors">
                {item ? 'Editar' : 'Agregar'}
              </button>
              {guardado && <span className="text-xs text-green-600 font-medium">✓ Guardado</span>}
            </>
          )}
        </div>
      </div>

      {!estandoEditando ? (
        item
          ? <div className="bg-[#faf7f2] border border-[#ede8df] rounded-lg px-3 py-2 text-sm text-gray-700 break-words whitespace-pre-line">{item.valor}</div>
          : <div className="text-[11px] text-gray-400 italic bg-gray-50 px-3 py-2 rounded-lg border border-dashed border-gray-200">Sin configurar</div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <input type="text" value={valor}
            onChange={e => onCambiarValor(e.target.value)}
            placeholder={meta.placeholder}
            className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') onGuardar(); if (e.key === 'Escape') onCancelar() }} />
          <button onClick={onGuardar} disabled={guardando}
            className="bg-[#4a3728] text-white text-xs py-2 px-3.5 rounded-lg font-semibold hover:bg-[#3a2a1e] disabled:opacity-40">
            {guardando ? '...' : 'Guardar'}
          </button>
          <button onClick={onCancelar} className="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
        </div>
      )}
    </div>
  )
}

function SimuladorPrecios({ comision, costoEnvio }: { comision: number; costoEnvio: number }) {
  const [precio, setPrecio] = useState('100')
  const [incluyeEnvio, setIncluyeEnvio] = useState(false)

  const precioNum = Number(precio) || 0
  const comisionMonto = precioNum * (comision / 100)
  const envioMonto = incluyeEnvio ? costoEnvio : 0
  const recibes = precioNum - comisionMonto + envioMonto

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Precio del producto:</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input type="number" step="0.01" min="0"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              className="w-24 pl-5 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30" />
          </div>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input type="checkbox" checked={incluyeEnvio} onChange={e => setIncluyeEnvio(e.target.checked)} className="accent-[#7d5c48]" />
          Con envío (+${costoEnvio.toFixed(2)})
        </label>
      </div>

      {precioNum > 0 && (
        <div className="bg-[#faf7f2] rounded-xl border border-[#ede8df] divide-y divide-[#ede8df] text-sm overflow-hidden">
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
            <span className="text-base">${recibes.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
