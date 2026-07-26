import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductos, actualizarProducto } from '../../api/productos'
import type { Producto } from '../../types'

type FilaEstado = {
  descuento: string
  abierto: boolean
  originalPCT?: Record<string, Record<string, number>>
}

function getPrecioEfectivo(p: Producto): number {
  if (p.precioPorColorTalla) {
    const precios = Object.values(p.precioPorColorTalla).flatMap(t => Object.values(t))
    if (precios.length > 0) return Math.min(...precios)
  }
  return p.precio ?? 0
}

function getPrecioOriginal(p: Producto): number {
  return p.precioOriginal && p.precioOriginal > 0 ? p.precioOriginal : getPrecioEfectivo(p)
}

function usaPreciosPorColor(p: Producto): boolean {
  return !!p.precioPorColorTalla && Object.keys(p.precioPorColorTalla).length > 0
}

function getImagen(p: Producto): string | null {
  if (p.imagenes?.[0]) return p.imagenes[0]
  return Object.values(p.imagenesPorColor ?? {}).find(imgs => imgs?.length)?.[0] ?? null
}

function tieneDescuento(p: Producto): boolean {
  return !!(p.precioOriginal && p.precioOriginal > 0 && p.precioOriginal > getPrecioEfectivo(p))
}

export default function AdminDescuentos() {
  const qc = useQueryClient()
  const [pagina, setPagina] = useState(0)
  const [inputBusqueda, setInputBusqueda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filas, setFilas] = useState<Record<number, FilaEstado>>({})
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

  const getFilaEstado = (p: Producto): FilaEstado => {
    if (filas[p.id]) return filas[p.id]
    const conDesc = tieneDescuento(p)
    const pct = conDesc ? Math.round((1 - getPrecioEfectivo(p) / p.precioOriginal!) * 100) : 0
    return { descuento: pct > 0 ? String(pct) : '', abierto: false }
  }

  const patchFila = (id: number, patch: Partial<FilaEstado>) =>
    setFilas(prev => ({ ...prev, [id]: { ...getFilaEstado({ id } as Producto), ...prev[id], ...patch } }))

  const toggleAbierto = (p: Producto) => {
    patchFila(p.id, { abierto: !getFilaEstado(p).abierto })
  }

  const aplicarDescuento = (p: Producto) => {
    const fila = getFilaEstado(p)
    const pct = Number(fila.descuento)
    if (!pct || pct <= 0 || pct >= 100) return
    const precioBase = getPrecioOriginal(p)

    if (usaPreciosPorColor(p)) {
      const factor = 1 - pct / 100
      const nuevoPCT: Record<string, Record<string, number>> = {}
      for (const [color, tallas] of Object.entries(p.precioPorColorTalla ?? {})) {
        nuevoPCT[color] = {}
        for (const [talla, precio] of Object.entries(tallas)) {
          nuevoPCT[color][talla] = parseFloat((precio * factor).toFixed(2))
        }
      }
      setFilas(prev => ({
        ...prev,
        [p.id]: { ...(prev[p.id] ?? getFilaEstado(p)), abierto: false, originalPCT: p.precioPorColorTalla ?? {} },
      }))
      actualizarMut.mutate({ id: p.id, upd: { precioPorColorTalla: nuevoPCT, precioOriginal: precioBase } })
    } else {
      const nuevoPrecio = parseFloat((precioBase * (1 - pct / 100)).toFixed(2))
      patchFila(p.id, { abierto: false })
      actualizarMut.mutate({ id: p.id, upd: { precio: nuevoPrecio, precioOriginal: precioBase } })
    }
  }

  const quitarDescuento = (p: Producto) => {
    const fila = getFilaEstado(p)
    if (usaPreciosPorColor(p)) {
      const conDesc = tieneDescuento(p)
      const pct = conDesc ? Math.round((1 - getPrecioEfectivo(p) / p.precioOriginal!) * 100) : 0
      const factor = pct > 0 ? 1 / (1 - pct / 100) : 1
      const originalPCT = fila.originalPCT
        ?? Object.fromEntries(
          Object.entries(p.precioPorColorTalla ?? {}).map(([c, ts]) => [
            c,
            Object.fromEntries(Object.entries(ts).map(([t, pr]) => [t, parseFloat((pr * factor).toFixed(2))])),
          ])
        )
      actualizarMut.mutate({ id: p.id, upd: { precioPorColorTalla: originalPCT, precioOriginal: 0 } })
    } else {
      actualizarMut.mutate({ id: p.id, upd: { precio: p.precioOriginal ?? p.precio, precioOriginal: 0 } })
    }
    setFilas(prev => { const n = { ...prev }; delete n[p.id]; return n })
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Descuentos en productos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Haz clic en un producto para abrir sus opciones de descuento</p>
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
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {productos.map(p => {
            const fila = getFilaEstado(p)
            const conDesc = tieneDescuento(p)
            const precioActual = getPrecioEfectivo(p)
            const precioLista = getPrecioOriginal(p)
            const pct = conDesc ? Math.round((1 - precioActual / precioLista) * 100) : 0
            const imagen = getImagen(p)
            const porColor = usaPreciosPorColor(p)
            const guardando = actualizarMut.isPending && (actualizarMut.variables as {id:number})?.id === p.id

            return (
              <div
                key={p.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${fila.abierto ? 'border-[#7d5c48] ring-2 ring-[#7d5c48]/20' : 'border-gray-200 hover:border-gray-300'}`}
              >
                {/* Cabecera — siempre visible, clic para abrir/cerrar */}
                <button
                  className="w-full flex items-center gap-3 p-3 text-left"
                  onClick={() => toggleAbierto(p)}
                >
                  {imagen ? (
                    <img src={imagen} alt={p.nombre} className="w-12 h-14 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-14 bg-[#f5ede6] rounded-xl flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {conDesc ? (
                        <>
                          <span className="text-red-500 font-bold text-sm">${precioActual.toFixed(2)}</span>
                          <span className="text-gray-400 line-through text-xs">${precioLista.toFixed(2)}</span>
                          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{pct}%</span>
                        </>
                      ) : (
                        <span className="text-gray-700 font-semibold text-sm">${precioActual.toFixed(2)}</span>
                      )}
                      {porColor && (
                        <span className="text-[10px] text-[#7d5c48] bg-[#f5f0e8] px-1.5 py-0.5 rounded">por color</span>
                      )}
                    </div>
                  </div>

                  {/* Ícono de apertura */}
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${fila.abierto ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Panel expandible */}
                {fila.abierto && (
                  <div className="border-t border-gray-100 px-4 py-4 bg-[#fafaf9]">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {conDesc ? `Descuento actual: ${pct}%` : 'Aplicar descuento'}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-[140px]">
                        <input
                          type="number" min="1" max="99"
                          value={fila.descuento}
                          onChange={e => patchFila(p.id, { descuento: e.target.value })}
                          onKeyDown={e => e.key === 'Enter' && aplicarDescuento(p)}
                          placeholder={conDesc ? String(pct) : '0'}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
                          autoFocus
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                      </div>

                      <button
                        onClick={() => aplicarDescuento(p)}
                        disabled={guardando || !fila.descuento}
                        className="bg-[#4a3728] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3a2a1e] disabled:opacity-40 transition-colors"
                      >
                        {guardando ? '...' : conDesc ? 'Cambiar' : 'Aplicar'}
                      </button>

                      {conDesc && (
                        <button
                          onClick={() => quitarDescuento(p)}
                          disabled={guardando}
                          className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    {fila.descuento && Number(fila.descuento) > 0 && Number(fila.descuento) < 100 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Precio con descuento:{' '}
                        <strong className="text-gray-700">
                          ${(getPrecioOriginal(p) * (1 - Number(fila.descuento) / 100)).toFixed(2)}
                        </strong>
                        {porColor && ' (precio mínimo)'}
                      </p>
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
