import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductos, actualizarProducto } from '../../api/productos'
import type { Producto } from '../../types'

type FilaEstado = { descuento: string; precio: string; editando: boolean }

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
    mutationFn: ({ id, data }: { id: number; data: Partial<Producto> }) => actualizarProducto(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos-desc'] }),
  })

  const productosFiltrados = productos

  const getFila = (p: Producto): FilaEstado => filas[p.id] ?? {
    descuento: p.precioOriginal && p.precioOriginal > p.precio
      ? String(Math.round((1 - p.precio / p.precioOriginal) * 100))
      : '',
    precio: '',
    editando: false,
  }

  const setFila = (id: number, patch: Partial<FilaEstado>) =>
    setFilas(prev => ({ ...prev, [id]: { ...getFila({ id } as Producto), ...prev[id], ...patch } }))

  const aplicarDescuento = (p: Producto) => {
    const fila = getFila(p)
    const pct = Number(fila.descuento)
    if (!pct || pct <= 0 || pct >= 100) return
    const original = p.precioOriginal ?? p.precio
    const nuevoPrecio = parseFloat((original * (1 - pct / 100)).toFixed(2))
    actualizarMut.mutate({ id: p.id, data: { precio: nuevoPrecio, precioOriginal: original } })
    setFila(p.id, { editando: false })
  }

  const quitarDescuento = (p: Producto) => {
    const original = p.precioOriginal ?? p.precio
    actualizarMut.mutate({ id: p.id, data: { precio: original, precioOriginal: undefined } })
    setFilas(prev => { const n = { ...prev }; delete n[p.id]; return n })
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Descuentos en productos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Aplica descuentos porcentuales sobre el precio de lista</p>
      </div>

      <div className="mb-4">
        <input
          value={inputBusqueda}
          onChange={e => handleBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#f5f0e8] text-[#4a3728]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Producto</th>
                <th className="text-left px-4 py-3 font-semibold">Precio original</th>
                <th className="text-left px-4 py-3 font-semibold">Precio actual</th>
                <th className="text-left px-4 py-3 font-semibold">Descuento</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productosFiltrados.map(p => {
                const fila = getFila(p)
                const tieneDesc = p.precioOriginal && p.precioOriginal > p.precio
                const pct = tieneDesc ? Math.round((1 - p.precio / p.precioOriginal!) * 100) : 0

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.imagenes?.[0] ? (
                          <img src={p.imagenes[0]} alt={p.nombre} className="w-8 h-10 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-10 bg-[#f5ede6] rounded flex-shrink-0" />
                        )}
                        <span className="font-medium text-gray-800 line-clamp-1">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      ${Number(p.precioOriginal ?? p.precio).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${tieneDesc ? 'text-red-500' : 'text-gray-700'}`}>
                        ${Number(p.precio).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {tieneDesc ? (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">-{pct}%</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin descuento</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {fila.editando ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="number" min="1" max="99" value={fila.descuento}
                              onChange={e => setFila(p.id, { descuento: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && aplicarDescuento(p)}
                              autoFocus
                              placeholder="0"
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm pr-6"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                          </div>
                          <button onClick={() => aplicarDescuento(p)}
                            className="text-xs bg-[#4a3728] text-white px-2.5 py-1 rounded-lg hover:bg-[#3a2a1e]">
                            OK
                          </button>
                          <button onClick={() => setFila(p.id, { editando: false })}
                            className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFila(p.id, { editando: true, descuento: tieneDesc ? String(pct) : '' })}
                            className="text-xs text-[#7d5c48] hover:underline"
                          >
                            {tieneDesc ? 'Cambiar' : 'Aplicar %'}
                          </button>
                          {tieneDesc && (
                            <button onClick={() => quitarDescuento(p)}
                              className="text-xs text-red-500 hover:underline">
                              Quitar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalPaginas > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <button disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}
                className="text-xs text-[#7d5c48] disabled:opacity-40 hover:underline">← Anterior</button>
              <span className="text-xs text-gray-500">Página {pagina + 1} de {totalPaginas}</span>
              <button disabled={pagina >= totalPaginas - 1} onClick={() => setPagina(p => p + 1)}
                className="text-xs text-[#7d5c48] disabled:opacity-40 hover:underline">Siguiente →</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
