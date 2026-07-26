import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductos, actualizarProducto } from '../../api/productos'
import { hexToNombre } from '../../components/ui/colores'
import type { Producto } from '../../types'

const getNombreColor = (hex: string) => hexToNombre(hex)

// clave única por celda: "prodId-color-talla"
type CeldaKey = string
type EstadoCelda = { descuento: string; precioOriginal?: number }

function getImagen(p: Producto, color?: string): string | null {
  if (color && p.imagenesPorColor?.[color]?.[0]) return p.imagenesPorColor[color][0]
  if (p.imagenes?.[0]) return p.imagenes[0]
  return Object.values(p.imagenesPorColor ?? {}).find(imgs => imgs?.length)?.[0] ?? null
}

export default function AdminDescuentos() {
  const qc = useQueryClient()
  const [pagina, setPagina] = useState(0)
  const [inputBusqueda, setInputBusqueda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [abiertos, setAbiertos] = useState<Record<number, boolean>>({})
  const [celdas, setCeldas] = useState<Record<CeldaKey, EstadoCelda>>({})
  // para productos simples
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

  // Aplica descuento a UNA celda (color+talla)
  const aplicarCelda = (p: Producto, color: string, talla: string, precioActual: number) => {
    const k = celdaKey(p.id, color, talla)
    const est = getCelda(k)
    const pct = Number(est.descuento)
    if (!pct || pct <= 0 || pct >= 100) return

    const precioLista = est.precioOriginal ?? precioActual
    const nuevo = parseFloat((precioLista * (1 - pct / 100)).toFixed(2))

    const nuevoPCT = {
      ...(p.precioPorColorTalla ?? {}),
      [color]: { ...(p.precioPorColorTalla?.[color] ?? {}), [talla]: nuevo },
    }
    const todos = Object.values(nuevoPCT).flatMap(t => Object.values(t))

    patchCelda(k, { precioOriginal: precioLista })
    actualizarMut.mutate({
      id: p.id,
      upd: {
        precioPorColorTalla: nuevoPCT,
        precio: Math.min(...todos),
        precioOriginal: p.precioOriginal && p.precioOriginal > 0 ? p.precioOriginal : precioLista,
      },
    })
  }

  // Quita el descuento de UNA celda
  const quitarCelda = (p: Producto, color: string, talla: string, precioActual: number) => {
    const k = celdaKey(p.id, color, talla)
    const est = getCelda(k)
    const original = est.precioOriginal ?? precioActual

    const nuevoPCT = {
      ...(p.precioPorColorTalla ?? {}),
      [color]: { ...(p.precioPorColorTalla?.[color] ?? {}), [talla]: original },
    }
    const todos = Object.values(nuevoPCT).flatMap(t => Object.values(t))

    actualizarMut.mutate({
      id: p.id,
      upd: { precioPorColorTalla: nuevoPCT, precio: Math.min(...todos) },
    })
    setCeldas(prev => { const n = { ...prev }; delete n[k]; return n })
  }

  // Producto simple
  const aplicarSimple = (p: Producto) => {
    const pct = Number(simples[p.id] ?? '')
    if (!pct || pct <= 0 || pct >= 100) return
    const lista = p.precioOriginal && p.precioOriginal > (p.precio ?? 0) ? p.precioOriginal : (p.precio ?? 0)
    actualizarMut.mutate({ id: p.id, upd: { precio: parseFloat((lista * (1 - pct / 100)).toFixed(2)), precioOriginal: lista } })
    setAbiertos(prev => ({ ...prev, [p.id]: false }))
  }
  const quitarSimple = (p: Producto) => {
    actualizarMut.mutate({ id: p.id, upd: { precio: p.precioOriginal ?? p.precio, precioOriginal: 0 } })
    setSimples(prev => { const n = { ...prev }; delete n[p.id]; return n })
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Descuentos en productos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Aplica descuentos por producto, color o talla individual</p>
      </div>

      <div className="mb-5">
        <input
          value={inputBusqueda}
          onChange={e => handleBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30 shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {productos.map(p => {
            const pct = p.precioPorColorTalla
            const coloresPCT = pct ? Object.keys(pct).filter(k => k !== '_') : []
            // "_" = precios por talla sin colores
            const esPorTallaSinColor = !!pct?.['_'] && coloresPCT.length === 0
            const esPorColor = coloresPCT.length > 0
            const abierto = abiertos[p.id] ?? false
            const imagen = getImagen(p)

            // ── Producto simple (sin tallas ni colores con precio) ─────
            if (!esPorColor && !esPorTallaSinColor) {
              const actual = p.precio ?? 0
              const lista = p.precioOriginal && p.precioOriginal > actual ? p.precioOriginal : actual
              const conDesc = lista > actual
              const descPct = conDesc ? Math.round((1 - actual / lista) * 100) : 0
              const descInput = simples[p.id] ?? (descPct > 0 ? String(descPct) : '')

              return (
                <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setAbiertos(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                    {imagen ? <img src={imagen} alt={p.nombre} className="w-12 h-14 object-cover rounded-xl flex-shrink-0" /> : <div className="w-12 h-14 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.nombre}</p>
                      <div className="flex items-center gap-2 mt-1">
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
                    <div className="border-t border-gray-100 px-4 py-4 bg-[#fafaf9]">
                      <div className="flex items-center gap-3">
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

            // ── Producto con tallas sin color ─────────────────────────
            if (esPorTallaSinColor) {
              const preciosPorTalla = pct!['_']
              const tallas = Object.keys(preciosPorTalla).sort((a, b) => {
                const n = (v: string) => isNaN(Number(v)) ? v.charCodeAt(0) : Number(v)
                return n(a) - n(b)
              })
              return (
                <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setAbiertos(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                    {imagen ? <img src={imagen} alt={p.nombre} className="w-12 h-14 object-cover rounded-xl flex-shrink-0" /> : <div className="w-12 h-14 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
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
                    <div className="border-t border-gray-100 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#f5f0e8]">
                            {tallas.map(t => (
                              <th key={t} className="px-3 py-2.5 text-xs font-semibold text-[#4a3728] text-center min-w-[130px]">Talla {t}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {tallas.map(talla => {
                              const precioActual = preciosPorTalla[talla]
                              const k = celdaKey(p.id, '_', talla)
                              const est = getCelda(k)
                              const conDesc = !!est.precioOriginal && est.precioOriginal > precioActual
                              const pctActual = conDesc ? Math.round((1 - precioActual / est.precioOriginal!) * 100) : 0
                              const nuevo = est.descuento && Number(est.descuento) > 0 && Number(est.descuento) < 100
                                ? parseFloat(((est.precioOriginal ?? precioActual) * (1 - Number(est.descuento) / 100)).toFixed(2))
                                : null
                              return (
                                <td key={talla} className="px-3 py-3 border-r border-gray-100 last:border-0">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      {conDesc ? (
                                        <>
                                          <span className="text-red-500 font-bold text-xs">${precioActual.toFixed(2)}</span>
                                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1 py-0.5 rounded">-{pctActual}%</span>
                                        </>
                                      ) : (
                                        <span className="text-gray-700 font-semibold text-xs">${precioActual.toFixed(2)}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="relative">
                                        <input type="number" min="1" max="99" value={est.descuento}
                                          onChange={e => patchCelda(k, { descuento: e.target.value })}
                                          onKeyDown={e => e.key === 'Enter' && aplicarCelda(p, '_', talla, precioActual)}
                                          placeholder={conDesc ? String(pctActual) : '%'}
                                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs pr-5 focus:outline-none focus:ring-1 focus:ring-[#7d5c48]/40 text-center" />
                                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">%</span>
                                      </div>
                                      <button onClick={() => aplicarCelda(p, '_', talla, precioActual)}
                                        disabled={guardando(p.id) || !est.descuento}
                                        className="text-[10px] bg-[#4a3728] text-white px-1.5 py-1 rounded-lg hover:bg-[#3a2a1e] disabled:opacity-40">OK</button>
                                    </div>
                                    {nuevo !== null && <span className="text-[10px] text-green-600 font-semibold">${nuevo.toFixed(2)}</span>}
                                    {conDesc && (
                                      <button onClick={() => quitarCelda(p, '_', talla, precioActual)}
                                        className="text-[10px] text-red-400 hover:text-red-600">Quitar</button>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            }

            // ── Producto con colores: tabla color × talla ──────────────
            const colores = coloresPCT
            // Unión de todas las tallas que aparecen en algún color
            const tallasSet = new Set<string>()
            for (const [k, ts] of Object.entries(pct!)) { if (k !== '_') Object.keys(ts).forEach(t => tallasSet.add(t)) }
            const tallas = Array.from(tallasSet).sort((a, b) => {
              const n = (v: string) => isNaN(Number(v)) ? v.charCodeAt(0) : Number(v)
              return n(a) - n(b)
            })

            return (
              <div key={p.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                {/* Cabecera */}
                <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setAbiertos(prev => ({ ...prev, [p.id]: !prev[p.id] }))}>
                  {imagen ? <img src={imagen} alt={p.nombre} className="w-12 h-14 object-cover rounded-xl flex-shrink-0" /> : <div className="w-12 h-14 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-[#7d5c48] bg-[#f5f0e8] px-2 py-0.5 rounded font-medium">
                        {colores.length} color{colores.length !== 1 ? 'es' : ''} · {tallas.length} talla{tallas.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Tabla color × talla */}
                {abierto && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#f5f0e8]">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#4a3728] min-w-[100px]">Color</th>
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
                              {/* Columna de color */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {imgColor
                                    ? <img src={imgColor} alt={color} className="w-7 h-8 object-cover rounded-lg flex-shrink-0" />
                                    : <div className="w-7 h-8 bg-[#f0ebe3] rounded-lg flex-shrink-0" />}
                                  <span className="text-xs font-semibold text-gray-700 leading-tight">{getNombreColor(color)}</span>
                                </div>
                              </td>

                              {/* Celdas por talla */}
                              {tallas.map(talla => {
                                const precioActual = pct[color]?.[talla]
                                if (precioActual === undefined) {
                                  return (
                                    <td key={talla} className="px-3 py-3 text-center">
                                      <span className="text-gray-300 text-xs">—</span>
                                    </td>
                                  )
                                }
                                const k = celdaKey(p.id, color, talla)
                                const est = getCelda(k)
                                const conDesc = !!est.precioOriginal && est.precioOriginal > precioActual
                                const pctActual = conDesc ? Math.round((1 - precioActual / est.precioOriginal!) * 100) : 0
                                const nuevo = est.descuento && Number(est.descuento) > 0 && Number(est.descuento) < 100
                                  ? parseFloat(((est.precioOriginal ?? precioActual) * (1 - Number(est.descuento) / 100)).toFixed(2))
                                  : null

                                return (
                                  <td key={talla} className="px-3 py-3">
                                    <div className="flex flex-col items-center gap-1.5">
                                      {/* Precio actual */}
                                      <div className="flex items-center gap-1.5">
                                        {conDesc ? (
                                          <>
                                            <span className="text-red-500 font-bold text-xs">${precioActual.toFixed(2)}</span>
                                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1 py-0.5 rounded">-{pctActual}%</span>
                                          </>
                                        ) : (
                                          <span className="text-gray-700 font-semibold text-xs">${precioActual.toFixed(2)}</span>
                                        )}
                                      </div>

                                      {/* Input de descuento */}
                                      <div className="flex items-center gap-1">
                                        <div className="relative">
                                          <input
                                            type="number" min="1" max="99"
                                            value={est.descuento}
                                            onChange={e => patchCelda(k, { descuento: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && aplicarCelda(p, color, talla, precioActual)}
                                            placeholder={conDesc ? String(pctActual) : '%'}
                                            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs pr-5 focus:outline-none focus:ring-1 focus:ring-[#7d5c48]/40 text-center"
                                          />
                                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">%</span>
                                        </div>
                                        <button
                                          onClick={() => aplicarCelda(p, color, talla, precioActual)}
                                          disabled={guardando(p.id) || !est.descuento}
                                          className="text-[10px] bg-[#4a3728] text-white px-1.5 py-1 rounded-lg hover:bg-[#3a2a1e] disabled:opacity-40"
                                        >OK</button>
                                      </div>

                                      {/* Previsualización */}
                                      {nuevo !== null && (
                                        <span className="text-[10px] text-green-600 font-semibold">${nuevo.toFixed(2)}</span>
                                      )}

                                      {/* Quitar */}
                                      {conDesc && (
                                        <button onClick={() => quitarCelda(p, color, talla, precioActual)}
                                          className="text-[10px] text-red-400 hover:text-red-600">
                                          Quitar
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}
            className="text-sm text-[#7d5c48] disabled:opacity-40 hover:underline font-medium">← Anterior</button>
          <span className="text-sm text-gray-500">Página {pagina + 1} de {totalPaginas}</span>
          <button disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(p => p + 1)}
            className="text-sm text-[#7d5c48] disabled:opacity-40 hover:underline font-medium">Siguiente →</button>
        </div>
      )}
    </div>
  )
}
