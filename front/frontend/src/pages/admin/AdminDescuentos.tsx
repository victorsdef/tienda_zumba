import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductos, actualizarProducto } from '../../api/productos'
import { hexToNombre } from '../../components/ui/colores'
import type { Producto } from '../../types'

const getNombreColor = (hex: string) => hexToNombre(hex)

type CeldaKey = string
type EstadoCelda = { descuento: string }

function getImagen(p: Producto, color?: string): string | null {
  if (color && p.imagenesPorColor?.[color]?.[0]) return p.imagenesPorColor[color][0]
  if (p.imagenes?.[0]) return p.imagenes[0]
  return Object.values(p.imagenesPorColor ?? {}).find(imgs => imgs?.length)?.[0] ?? null
}

// Precio original de una celda: primero mira precioOriginalPorColorTalla, luego el precio actual
function getPrecioOriginalCelda(p: Producto, color: string, talla: string): number | undefined {
  return p.precioOriginalPorColorTalla?.[color]?.[talla]
}

// ── Celda de descuento (fuera del padre para preservar focus) ──
interface CeldaDescuentoProps {
  p: Producto
  color: string
  talla: string
  descuentoInput: string
  onDescuentoChange: (v: string) => void
  onAplicar: () => void
  onQuitar: () => void
  guardando: boolean
}

function CeldaDescuento({ p, color, talla, descuentoInput, onDescuentoChange, onAplicar, onQuitar, guardando }: CeldaDescuentoProps) {
  const precioActual = p.precioPorColorTalla?.[color]?.[talla]
  if (precioActual === undefined) return <span className="text-gray-300 text-xs">—</span>

  const precioLista = getPrecioOriginalCelda(p, color, talla)
  const conDesc = precioLista !== undefined && precioLista > precioActual
  const pctActual = conDesc ? Math.round((1 - precioActual / precioLista!) * 100) : 0

  const pctNum = Number(descuentoInput)
  const inputValido = descuentoInput !== '' && !isNaN(pctNum) && pctNum >= 1 && pctNum <= 99
  const inputInvalido = descuentoInput !== '' && !inputValido
  const nuevo = inputValido ? parseFloat(((precioLista ?? precioActual) * (1 - pctNum / 100)).toFixed(2)) : null

  // Limita el input a 1-99: si el user escribe > 99 lo cortamos, si es 0 o negativo tampoco
  const handleChange = (raw: string) => {
    if (raw === '') { onDescuentoChange(''); return }
    // solo permite dígitos (evita "." "e" "-")
    if (!/^\d+$/.test(raw)) return
    const n = Number(raw)
    if (n > 99) { onDescuentoChange('99'); return }
    onDescuentoChange(raw)
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {conDesc ? (
          <>
            <span className="text-red-500 font-bold text-xs sm:text-sm">${precioActual.toFixed(2)}</span>
            <span className="text-gray-400 line-through text-[10px]">${precioLista!.toFixed(2)}</span>
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1 py-0.5 rounded">-{pctActual}%</span>
          </>
        ) : (
          <span className="text-gray-700 font-semibold text-xs sm:text-sm">${precioActual.toFixed(2)}</span>
        )}
      </div>

      {conDesc ? (
        <button onClick={onQuitar} disabled={guardando}
          className="text-[11px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg disabled:opacity-40 font-medium">
          Quitar descuento
        </button>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <div className="relative">
              <input
                type="text" inputMode="numeric" maxLength={2}
                value={descuentoInput}
                onChange={e => handleChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && inputValido) onAplicar() }}
                placeholder="%"
                className={`w-14 border rounded-lg px-2 py-1 text-xs pr-5 focus:outline-none focus:ring-1 text-center transition-colors ${
                  inputInvalido ? 'border-red-300 focus:ring-red-300 bg-red-50' : 'border-gray-200 focus:ring-[#7d5c48]/40'
                }`}
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">%</span>
            </div>
            <button
              onClick={onAplicar}
              disabled={guardando || !inputValido}
              className="text-[10px] bg-[#4a3728] text-white px-1.5 py-1 rounded-lg hover:bg-[#3a2a1e] disabled:opacity-40 font-semibold"
            >OK</button>
          </div>
          {inputInvalido && <span className="text-[10px] text-red-500">Debe ser 1–99</span>}
          {nuevo !== null && <span className="text-[10px] text-green-600 font-semibold">→ ${nuevo.toFixed(2)}</span>}
        </>
      )}
    </div>
  )
}

export default function AdminDescuentos() {
  const qc = useQueryClient()
  const [pagina, setPagina] = useState(0)
  const [inputBusqueda, setInputBusqueda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [abiertos, setAbiertos] = useState<Record<number, boolean>>({})
  const [celdas, setCeldas] = useState<Record<CeldaKey, EstadoCelda>>({})
  const [simples, setSimples] = useState<Record<number, string>>({})

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleBusqueda = (val: string) => {
    setInputBusqueda(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setBusqueda(val); setPagina(0) }, 500)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['productos-desc', pagina, busqueda],
    queryFn: () => getProductos({ page: pagina, size: 20, nombre: busqueda || undefined }),
  })
  const productos = data?.content ?? []
  const totalPaginas = data?.totalPages ?? 1

  const actualizarMut = useMutation({
    mutationFn: ({ id, upd }: { id: number; upd: Partial<Producto> }) => actualizarProducto(id, upd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos-desc'] }),
  })

  const guardando = (id: number) =>
    actualizarMut.isPending && (actualizarMut.variables as { id: number })?.id === id

  const celdaKey = (prodId: number, color: string, talla: string): CeldaKey => `${prodId}|${color}|${talla}`
  const getCelda = (k: CeldaKey): EstadoCelda => celdas[k] ?? { descuento: '' }
  const patchCelda = (k: CeldaKey, patch: Partial<EstadoCelda>) =>
    setCeldas(prev => ({ ...prev, [k]: { ...getCelda(k), ...patch } }))

  // Aplica descuento a UNA celda — persiste original en precioOriginalPorColorTalla
  const aplicarCelda = (p: Producto, color: string, talla: string) => {
    const k = celdaKey(p.id, color, talla)
    const pct = Number(getCelda(k).descuento)
    if (!pct || pct <= 0 || pct >= 100) return

    const precioActual = p.precioPorColorTalla?.[color]?.[talla] ?? 0
    // El "precio lista" es el original ya guardado, si no existe usamos el actual como base
    const precioLista = getPrecioOriginalCelda(p, color, talla) ?? precioActual
    const nuevo = parseFloat((precioLista * (1 - pct / 100)).toFixed(2))

    const nuevoPCT = {
      ...(p.precioPorColorTalla ?? {}),
      [color]: { ...(p.precioPorColorTalla?.[color] ?? {}), [talla]: nuevo },
    }
    const nuevoPOCT = {
      ...(p.precioOriginalPorColorTalla ?? {}),
      [color]: { ...(p.precioOriginalPorColorTalla?.[color] ?? {}), [talla]: precioLista },
    }
    const todos = Object.values(nuevoPCT).flatMap(t => Object.values(t))

    actualizarMut.mutate({
      id: p.id,
      upd: {
        precioPorColorTalla: nuevoPCT,
        precioOriginalPorColorTalla: nuevoPOCT,
        precio: Math.min(...todos),
      },
    })
    patchCelda(k, { descuento: '' })
  }

  const quitarCelda = (p: Producto, color: string, talla: string) => {
    const original = getPrecioOriginalCelda(p, color, talla)
    if (original === undefined) return

    const nuevoPCT = {
      ...(p.precioPorColorTalla ?? {}),
      [color]: { ...(p.precioPorColorTalla?.[color] ?? {}), [talla]: original },
    }
    const nuevoPOCT = { ...(p.precioOriginalPorColorTalla ?? {}) }
    if (nuevoPOCT[color]) {
      const copia = { ...nuevoPOCT[color] }
      delete copia[talla]
      if (Object.keys(copia).length === 0) delete nuevoPOCT[color]
      else nuevoPOCT[color] = copia
    }
    const todos = Object.values(nuevoPCT).flatMap(t => Object.values(t))

    actualizarMut.mutate({
      id: p.id,
      upd: {
        precioPorColorTalla: nuevoPCT,
        precioOriginalPorColorTalla: nuevoPOCT,
        precio: Math.min(...todos),
      },
    })
  }

  const aplicarSimple = (p: Producto) => {
    const pct = Number(simples[p.id] ?? '')
    if (!pct || pct <= 0 || pct >= 100) return
    const lista = p.precioOriginal && p.precioOriginal > (p.precio ?? 0) ? p.precioOriginal : (p.precio ?? 0)
    actualizarMut.mutate({ id: p.id, upd: { precio: parseFloat((lista * (1 - pct / 100)).toFixed(2)), precioOriginal: lista } })
    setSimples(prev => ({ ...prev, [p.id]: '' }))
  }
  const quitarSimple = (p: Producto) => {
    actualizarMut.mutate({ id: p.id, upd: { precio: p.precioOriginal ?? p.precio, precioOriginal: 0 } })
  }


  return (
    <div className="px-3 py-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      {/* Encabezado unificado (sticky) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5 sticky top-2 z-30">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">Descuentos en productos</h1>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Aplica descuentos por producto, color o talla individual · {productos.length} productos</p>
        </div>
        <div className="px-4 sm:px-5 py-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              value={inputBusqueda}
              onChange={e => handleBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
            />
            {inputBusqueda && (
              <button onClick={() => handleBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm">✕</button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-16 sm:py-20 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {productos.map(p => {
            const pct = p.precioPorColorTalla
            const coloresPCT = pct ? Object.keys(pct).filter(k => k !== '_') : []
            const esPorTallaSinColor = !!pct?.['_'] && coloresPCT.length === 0
            const esPorColor = coloresPCT.length > 0
            const abierto = abiertos[p.id] ?? false
            const imagen = getImagen(p)

            // ── Producto simple ────────────────────────────────────────
            if (!esPorColor && !esPorTallaSinColor) {
              const actual = p.precio ?? 0
              const lista = p.precioOriginal && p.precioOriginal > actual ? p.precioOriginal : actual
              const conDesc = lista > actual
              const descPct = conDesc ? Math.round((1 - actual / lista) * 100) : 0
              const descInput = simples[p.id] ?? ''

              return (
                <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <button className="w-full flex items-center gap-3 p-3 sm:p-4 text-left" onClick={() => setAbiertos(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                    {imagen ? <img src={imagen} alt={p.nombre} className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded-xl flex-shrink-0" /> : <div className="w-12 h-14 sm:w-14 sm:h-16 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.nombre}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                        {conDesc ? (
                          <>
                            <span className="text-red-500 font-bold text-sm">${actual.toFixed(2)}</span>
                            <span className="text-gray-400 line-through text-xs">${lista.toFixed(2)}</span>
                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{descPct}%</span>
                          </>
                        ) : (
                          <span className="text-gray-700 font-semibold text-sm">${actual.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {abierto && (
                    <div className="border-t border-gray-100 px-3 sm:px-4 py-3 sm:py-4 bg-[#fafaf9]">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="relative">
                          <input type="number" min="1" max="99" value={descInput}
                            onChange={e => setSimples(prev => ({ ...prev, [p.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && aplicarSimple(p)}
                            placeholder="0" autoFocus
                            className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm pr-7 focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                        </div>
                        <button onClick={() => aplicarSimple(p)} disabled={guardando(p.id) || !descInput}
                          className="bg-[#4a3728] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3a2a1e] disabled:opacity-40">
                          {guardando(p.id) ? '...' : conDesc ? 'Cambiar' : 'Aplicar'}
                        </button>
                        {conDesc && <button onClick={() => quitarSimple(p)} className="text-sm text-red-500 hover:text-red-700">Quitar</button>}
                      </div>
                      {descInput && Number(descInput) > 0 && Number(descInput) < 100 && (
                        <p className="text-xs text-gray-400 mt-2">
                          Precio resultante: <strong className="text-gray-700">${(lista * (1 - Number(descInput) / 100)).toFixed(2)}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            // ── Producto con tallas SIN color ───────────────────────────
            if (esPorTallaSinColor) {
              const preciosPorTalla = pct!['_']
              const tallas = Object.keys(preciosPorTalla).sort((a, b) => {
                const n = (v: string) => isNaN(Number(v)) ? v.charCodeAt(0) : Number(v)
                return n(a) - n(b)
              })
              return (
                <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <button className="w-full flex items-center gap-3 p-3 sm:p-4 text-left" onClick={() => setAbiertos(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                    {imagen ? <img src={imagen} alt={p.nombre} className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded-xl flex-shrink-0" /> : <div className="w-12 h-14 sm:w-14 sm:h-16 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.nombre}</p>
                      <span className="text-xs text-[#7d5c48] bg-[#f5f0e8] px-2 py-0.5 rounded font-medium mt-1 inline-block">
                        {tallas.length} talla{tallas.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {abierto && (
                    <div className="border-t border-gray-100 p-3 sm:p-4 bg-[#fafaf9]">
                      {/* Mobile: cards por talla · Desktop: grid horizontal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {tallas.map(talla => (
                          <div key={talla} className="bg-white border border-gray-100 rounded-xl px-3 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center mb-2">Talla {talla}</p>
                            <CeldaDescuento
                              p={p} color="_" talla={talla}
                              descuentoInput={getCelda(celdaKey(p.id, '_', talla)).descuento}
                              onDescuentoChange={v => patchCelda(celdaKey(p.id, '_', talla), { descuento: v })}
                              onAplicar={() => aplicarCelda(p, '_', talla)}
                              onQuitar={() => quitarCelda(p, '_', talla)}
                              guardando={guardando(p.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // ── Producto con colores + tallas ──────────────────────────
            const colores = coloresPCT
            const tallasSet = new Set<string>()
            for (const [k, ts] of Object.entries(pct!)) { if (k !== '_') Object.keys(ts).forEach(t => tallasSet.add(t)) }
            const tallas = Array.from(tallasSet).sort((a, b) => {
              const n = (v: string) => isNaN(Number(v)) ? v.charCodeAt(0) : Number(v)
              return n(a) - n(b)
            })

            return (
              <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                <button className="w-full flex items-center gap-3 p-3 sm:p-4 text-left" onClick={() => setAbiertos(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                  {imagen ? <img src={imagen} alt={p.nombre} className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded-xl flex-shrink-0" /> : <div className="w-12 h-14 sm:w-14 sm:h-16 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.nombre}</p>
                    <span className="text-xs text-[#7d5c48] bg-[#f5f0e8] px-2 py-0.5 rounded font-medium mt-1 inline-block">
                      {colores.length} color{colores.length !== 1 ? 'es' : ''} · {tallas.length} talla{tallas.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {abierto && (
                  <div className="border-t border-gray-100 bg-[#fafaf9]">
                    {/* MOBILE: acordeón por color */}
                    <div className="lg:hidden divide-y divide-gray-100">
                      {colores.map(color => {
                        const imgColor = getImagen(p, color)
                        return (
                          <div key={color} className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-3">
                              {imgColor
                                ? <img src={imgColor} alt={color} className="w-8 h-10 object-cover rounded-lg flex-shrink-0" />
                                : <div className="w-8 h-10 bg-[#f0ebe3] rounded-lg flex-shrink-0" />}
                              <span
                                className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm font-semibold text-gray-800">{getNombreColor(color)}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {tallas.map(talla => (
                                pct[color]?.[talla] !== undefined ? (
                                  <div key={talla} className="bg-white border border-gray-100 rounded-xl px-2 py-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center mb-1.5">Talla {talla}</p>
                                    <CeldaDescuento
                                      p={p} color={color} talla={talla}
                                      descuentoInput={getCelda(celdaKey(p.id, color, talla)).descuento}
                                      onDescuentoChange={v => patchCelda(celdaKey(p.id, color, talla), { descuento: v })}
                                      onAplicar={() => aplicarCelda(p, color, talla)}
                                      onQuitar={() => quitarCelda(p, color, talla)}
                                      guardando={guardando(p.id)}
                                    />
                                  </div>
                                ) : null
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* DESKTOP: tabla color × talla */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#f5f0e8]">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#4a3728] min-w-[140px]">Color</th>
                            {tallas.map(t => (
                              <th key={t} className="px-3 py-2.5 text-xs font-semibold text-[#4a3728] text-center min-w-[130px]">
                                Talla {t}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {colores.map(color => {
                            const imgColor = getImagen(p, color)
                            return (
                              <tr key={color} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {imgColor
                                      ? <img src={imgColor} alt={color} className="w-7 h-8 object-cover rounded-lg flex-shrink-0" />
                                      : <div className="w-7 h-8 bg-[#f0ebe3] rounded-lg flex-shrink-0" />}
                                    <span
                                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="text-xs font-semibold text-gray-700">{getNombreColor(color)}</span>
                                  </div>
                                </td>
                                {tallas.map(talla => (
                                  <td key={talla} className="px-3 py-3">
                                    <CeldaDescuento
                                      p={p} color={color} talla={talla}
                                      descuentoInput={getCelda(celdaKey(p.id, color, talla)).descuento}
                                      onDescuentoChange={v => patchCelda(celdaKey(p.id, color, talla), { descuento: v })}
                                      onAplicar={() => aplicarCelda(p, color, talla)}
                                      onQuitar={() => quitarCelda(p, color, talla)}
                                      guardando={guardando(p.id)}
                                    />
                                  </td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}
            className="text-sm text-[#7d5c48] disabled:opacity-40 hover:underline font-medium">← Anterior</button>
          <span className="text-sm text-gray-500">Pág. {pagina + 1} / {totalPaginas}</span>
          <button disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(p => p + 1)}
            className="text-sm text-[#7d5c48] disabled:opacity-40 hover:underline font-medium">Siguiente →</button>
        </div>
      )}
    </div>
  )
}
