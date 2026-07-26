import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductos, actualizarProducto } from '../../api/productos'
import type { Producto } from '../../types'

// Una "fila" puede ser el producto simple o una variante de color
type FilaSimple = { tipo: 'simple'; producto: Producto }
type FilaColor  = { tipo: 'color';  producto: Producto; color: string; precios: Record<string, number> }
type Fila = FilaSimple | FilaColor

type FilaEstado = {
  descuento: string
  abierto: boolean
  originalPrecios?: Record<string, number> // para restaurar colores individuales
}

function getImagen(p: Producto, color?: string): string | null {
  if (color && p.imagenesPorColor?.[color]?.[0]) return p.imagenesPorColor[color][0]
  if (p.imagenes?.[0]) return p.imagenes[0]
  return Object.values(p.imagenesPorColor ?? {}).find(imgs => imgs?.length)?.[0] ?? null
}

function precioMinimoDeColor(precios: Record<string, number>): number {
  const vals = Object.values(precios)
  return vals.length ? Math.min(...vals) : 0
}

// Calcula precio actual y precio lista para la fila
function getPreciosFilaSimple(p: Producto): { actual: number; lista: number; conDesc: boolean } {
  const actual = p.precio ?? 0
  const lista = p.precioOriginal && p.precioOriginal > actual ? p.precioOriginal : actual
  return { actual, lista, conDesc: lista > actual }
}

// clave única para el estado de cada fila
function keyFila(f: Fila): string {
  return f.tipo === 'simple' ? `s-${f.producto.id}` : `c-${f.producto.id}-${f.color}`
}

export default function AdminDescuentos() {
  const qc = useQueryClient()
  const [pagina, setPagina] = useState(0)
  const [inputBusqueda, setInputBusqueda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estados, setEstados] = useState<Record<string, FilaEstado>>({})
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

  // Expandir productos con colores en filas separadas
  const filas: Fila[] = productos.flatMap(p => {
    const pct = p.precioPorColorTalla
    if (pct && Object.keys(pct).length > 0) {
      return Object.entries(pct).map(([color, precios]) => ({
        tipo: 'color' as const,
        producto: p,
        color,
        precios,
      }))
    }
    return [{ tipo: 'simple' as const, producto: p }]
  })

  const actualizarMut = useMutation({
    mutationFn: ({ id, upd }: { id: number; upd: Partial<Producto> }) => actualizarProducto(id, upd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos-desc'] }),
  })

  const getEstado = (key: string, descInicial: string): FilaEstado =>
    estados[key] ?? { descuento: descInicial, abierto: false }

  const patchEstado = (key: string, patch: Partial<FilaEstado>) =>
    setEstados(prev => ({ ...prev, [key]: { ...(prev[key] ?? { descuento: '', abierto: false }), ...patch } }))

  // ── Aplicar descuento ──────────────────────────────────────────────

  const aplicarSimple = (p: Producto, pct: number) => {
    const lista = p.precioOriginal && p.precioOriginal > (p.precio ?? 0) ? p.precioOriginal : (p.precio ?? 0)
    const nuevo = parseFloat((lista * (1 - pct / 100)).toFixed(2))
    actualizarMut.mutate({ id: p.id, upd: { precio: nuevo, precioOriginal: lista } })
  }

  const aplicarColor = (p: Producto, color: string, preciosActuales: Record<string, number>, pct: number) => {
    // precios lista de este color = los actuales (si hay precioOriginal ya aplicado, usar eso; sino actuales)
    // guardamos los originales en estado antes de sobreescribir
    const factor = 1 - pct / 100
    const nuevosPrecios: Record<string, number> = {}
    for (const [talla, precio] of Object.entries(preciosActuales)) {
      nuevosPrecios[talla] = parseFloat((precio * factor).toFixed(2))
    }
    const nuevoPCT = {
      ...(p.precioPorColorTalla ?? {}),
      [color]: nuevosPrecios,
    }
    // precio general = mínimo de todos los colores con el nuevo
    const todosPrecios = Object.values(nuevoPCT).flatMap(t => Object.values(t))
    const minPrecio = Math.min(...todosPrecios)
    const minOriginal = precioMinimoDeColor(preciosActuales)
    const precioOrigGlobal = p.precioOriginal && p.precioOriginal > 0 ? p.precioOriginal : minOriginal

    actualizarMut.mutate({
      id: p.id,
      upd: {
        precioPorColorTalla: nuevoPCT,
        precioOriginal: Math.max(precioOrigGlobal, minOriginal),
        precio: minPrecio,
      },
    })
  }

  const handleAplicar = (fila: Fila, key: string) => {
    const estado = getEstado(key, '')
    const pct = Number(estado.descuento)
    if (!pct || pct <= 0 || pct >= 100) return
    patchEstado(key, { abierto: false, originalPrecios: fila.tipo === 'color' ? fila.precios : undefined })
    if (fila.tipo === 'simple') aplicarSimple(fila.producto, pct)
    else aplicarColor(fila.producto, fila.color, fila.precios, pct)
  }

  // ── Quitar descuento ───────────────────────────────────────────────

  const quitarSimple = (p: Producto) => {
    actualizarMut.mutate({ id: p.id, upd: { precio: p.precioOriginal ?? p.precio, precioOriginal: 0 } })
  }

  const quitarColor = (p: Producto, color: string, preciosActuales: Record<string, number>, key: string) => {
    const estado = getEstado(key, '')
    const pct = Number(estado.descuento) || 0
    const factor = pct > 0 ? 1 / (1 - pct / 100) : 1
    const originales = estado.originalPrecios
      ?? Object.fromEntries(Object.entries(preciosActuales).map(([t, pr]) => [t, parseFloat((pr * factor).toFixed(2))]))
    const nuevoPCT = { ...(p.precioPorColorTalla ?? {}), [color]: originales }
    const todosPrecios = Object.values(nuevoPCT).flatMap(t => Object.values(t))
    actualizarMut.mutate({
      id: p.id,
      upd: { precioPorColorTalla: nuevoPCT, precio: Math.min(...todosPrecios), precioOriginal: 0 },
    })
    setEstados(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const handleQuitar = (fila: Fila, key: string) => {
    if (fila.tipo === 'simple') quitarSimple(fila.producto)
    else quitarColor(fila.producto, fila.color, fila.precios, key)
    setEstados(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Descuentos en productos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Los productos con colores se muestran por variante. Haz clic para abrir las opciones.
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filas.map(fila => {
            const key = keyFila(fila)
            const p = fila.producto

            // ── Fila simple ──────────────────────────────────────────
            if (fila.tipo === 'simple') {
              const { actual, lista, conDesc } = getPreciosFilaSimple(p)
              const pct = conDesc ? Math.round((1 - actual / lista) * 100) : 0
              const estado = getEstado(key, pct > 0 ? String(pct) : '')
              const imagen = getImagen(p)
              const guardando = actualizarMut.isPending && (actualizarMut.variables as {id:number})?.id === p.id

              return (
                <div key={key} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${estado.abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => patchEstado(key, { abierto: !estado.abierto })}>
                    {imagen
                      ? <img src={imagen} alt={p.nombre} className="w-12 h-14 object-cover rounded-xl flex-shrink-0" />
                      : <div className="w-12 h-14 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-2">{p.nombre}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {conDesc ? (
                          <>
                            <span className="text-red-500 font-bold text-sm">${actual.toFixed(2)}</span>
                            <span className="text-gray-400 line-through text-xs">${lista.toFixed(2)}</span>
                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{pct}%</span>
                          </>
                        ) : (
                          <span className="text-gray-700 font-semibold text-sm">${actual.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${estado.abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {estado.abierto && (
                    <div className="border-t border-gray-100 px-4 py-4 bg-[#fafaf9]">
                      <PanelDescuento
                        descuento={estado.descuento}
                        conDesc={conDesc}
                        pctActual={pct}
                        precioLista={lista}
                        guardando={guardando}
                        onChange={v => patchEstado(key, { descuento: v })}
                        onAplicar={() => handleAplicar(fila, key)}
                        onQuitar={() => handleQuitar(fila, key)}
                      />
                    </div>
                  )}
                </div>
              )
            }

            // ── Fila color ───────────────────────────────────────────
            const { color, precios } = fila
            const imagen = getImagen(p, color)
            const minPrecio = precioMinimoDeColor(precios)
            // detectar si este color tiene descuento: comparar vs originalPrecios en estado
            const estadoColor = getEstado(key, '')
            const guardando = actualizarMut.isPending && (actualizarMut.variables as {id:number})?.id === p.id

            // Para mostrar si ya tiene descuento: si hay originalPrecios guardados los comparamos
            const originalPrecios = estadoColor.originalPrecios
            const minOriginal = originalPrecios ? precioMinimoDeColor(originalPrecios) : minPrecio
            const conDesc = minOriginal > minPrecio
            const pct = conDesc && minOriginal > 0 ? Math.round((1 - minPrecio / minOriginal) * 100) : 0

            const tallas = Object.keys(precios)

            // Buscar un color hex de imagenesPorColor (el color puede ser el nombre)
            const colorSwatchStyle = p.imagenesPorColor?.[color] ? {} : {}

            return (
              <div key={key} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${estadoColor.abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => patchEstado(key, { abierto: !estadoColor.abierto })}>
                  {imagen
                    ? <img src={imagen} alt={`${p.nombre} ${color}`} className="w-12 h-14 object-cover rounded-xl flex-shrink-0" />
                    : <div className="w-12 h-14 bg-[#f5ede6] rounded-xl flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.nombre}</p>
                    <p className="text-xs text-[#7d5c48] font-medium mt-0.5">{color}</p>
                    {/* Precios por talla */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {tallas.map(t => (
                        <span key={t} className={`text-[11px] px-1.5 py-0.5 rounded border ${conDesc ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                          T{t}: <strong>${precios[t].toFixed(2)}</strong>
                        </span>
                      ))}
                    </div>
                    {conDesc && (
                      <span className="inline-block mt-1 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{pct}%</span>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${estadoColor.abierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {estadoColor.abierto && (
                  <div className="border-t border-gray-100 px-4 py-4 bg-[#fafaf9]">
                    <p className="text-xs text-gray-400 mb-3">El descuento se aplica a todas las tallas de este color</p>
                    <PanelDescuento
                      descuento={estadoColor.descuento}
                      conDesc={conDesc}
                      pctActual={pct}
                      precioLista={minOriginal}
                      guardando={guardando}
                      onChange={v => patchEstado(key, { descuento: v })}
                      onAplicar={() => handleAplicar(fila, key)}
                      onQuitar={() => handleQuitar(fila, key)}
                      mostrarPrevisualizacion={false}
                    />
                    {/* Previsualización de precios por talla */}
                    {estadoColor.descuento && Number(estadoColor.descuento) > 0 && Number(estadoColor.descuento) < 100 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tallas.map(t => {
                          const nuevo = parseFloat((precios[t] * (1 - Number(estadoColor.descuento) / 100)).toFixed(2))
                          return (
                            <span key={t} className="text-[11px] px-2 py-1 rounded border border-green-100 bg-green-50 text-green-700">
                              T{t}: <strong>${nuevo.toFixed(2)}</strong>
                            </span>
                          )
                        })}
                      </div>
                    )}
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
            className="text-sm text-[#7d5c48] disabled:opacity-40 hover:underline font-medium">
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">Página {pagina + 1} de {totalPaginas}</span>
          <button disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(p => p + 1)}
            className="text-sm text-[#7d5c48] disabled:opacity-40 hover:underline font-medium">
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Componente panel de descuento reutilizable ────────────────────────
function PanelDescuento({
  descuento, conDesc, pctActual, precioLista, guardando,
  onChange, onAplicar, onQuitar, mostrarPrevisualizacion = true,
}: {
  descuento: string
  conDesc: boolean
  pctActual: number
  precioLista: number
  guardando: boolean
  onChange: (v: string) => void
  onAplicar: () => void
  onQuitar: () => void
  mostrarPrevisualizacion?: boolean
}) {
  return (
    <>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {conDesc ? `Descuento actual: ${pctActual}%` : 'Aplicar descuento'}
      </p>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[140px]">
          <input
            type="number" min="1" max="99"
            value={descuento}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onAplicar()}
            placeholder={conDesc ? String(pctActual) : '0'}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
        </div>
        <button
          onClick={onAplicar}
          disabled={guardando || !descuento}
          className="bg-[#4a3728] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3a2a1e] disabled:opacity-40 transition-colors"
        >
          {guardando ? '...' : conDesc ? 'Cambiar' : 'Aplicar'}
        </button>
        {conDesc && (
          <button onClick={onQuitar} disabled={guardando}
            className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-40">
            Quitar
          </button>
        )}
      </div>
      {mostrarPrevisualizacion && descuento && Number(descuento) > 0 && Number(descuento) < 100 && (
        <p className="text-xs text-gray-400 mt-2">
          Precio con descuento:{' '}
          <strong className="text-gray-700">
            ${(precioLista * (1 - Number(descuento) / 100)).toFixed(2)}
          </strong>
        </p>
      )}
    </>
  )
}
