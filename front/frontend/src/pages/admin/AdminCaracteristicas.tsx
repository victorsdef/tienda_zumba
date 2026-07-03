import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductosAdmin } from '../../api/admin'
import { actualizarProducto } from '../../api/productos'
import { IconSearch, IconTrash } from '../../components/ui/Icon'
import type { Producto } from '../../types'

export default function AdminCaracteristicas() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [caracteristicas, setCaracteristicas] = useState<string[]>([])
  const [titulo, setTitulo] = useState('')
  const [valor, setValor] = useState('')
  const [guardado, setGuardado] = useState(false)

  const { data } = useQuery({
    queryKey: ['admin-productos', 0],
    queryFn: () => getProductosAdmin(0, 100),
  })

  const productos = data?.content.filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) ?? []

  const saveMut = useMutation({
    mutationFn: () => actualizarProducto(productoSeleccionado!.id, {
      nombre: productoSeleccionado!.nombre,
      descripcion: productoSeleccionado!.descripcion,
      precio: productoSeleccionado!.precio,
      precioOriginal: productoSeleccionado!.precioOriginal,
      stock: productoSeleccionado!.stock,
      activo: productoSeleccionado!.activo,
      categoriaId: productoSeleccionado!.categoriaId,
      imagenes: productoSeleccionado!.imagenes,
      tallas: productoSeleccionado!.tallas,
      colores: productoSeleccionado!.colores,
      caracteristicas,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-productos'] })
      // Actualizar el producto seleccionado con las nuevas características
      setProductoSeleccionado(prev => prev ? { ...prev, caracteristicas } : null)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2000)
    },
  })

  const seleccionar = (p: Producto) => {
    setProductoSeleccionado(p)
    setCaracteristicas(p.caracteristicas ?? [])
    setTitulo('')
    setValor('')
    setGuardado(false)
  }

  const agregar = () => {
    if (!titulo.trim() || !valor.trim()) return
    setCaracteristicas(prev => [...prev, `${titulo.trim()}::${valor.trim()}`])
    setTitulo('')
    setValor('')
  }

  const quitar = (i: number) => setCaracteristicas(prev => prev.filter((_, j) => j !== i))

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Características</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Seleccioná un producto y agregá sus especificaciones técnicas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel izquierdo — lista de productos */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-3 border-b flex items-center gap-2">
            <IconSearch size={15} className="text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              className="flex-1 outline-none text-sm"
            />
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {productos.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">No hay productos</p>
            )}
            {productos.map(p => (
              <button
                key={p.id}
                onClick={() => seleccionar(p)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  productoSeleccionado?.id === p.id ? 'bg-red-50 border-l-4 border-red-500' : ''
                }`}
              >
                {p.imagenes?.[0]
                  ? <img src={p.imagenes[0]} alt="" className="w-10 h-12 object-cover rounded flex-shrink-0" />
                  : <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0" />
                }
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{p.categoriaNombre ?? '—'}</p>
                  {(() => {
                    const count = productoSeleccionado?.id === p.id
                      ? caracteristicas.length
                      : (p.caracteristicas?.length ?? 0)
                    return (
                      <p className="text-xs text-gray-400">
                        {count > 0 ? `${count} característica${count > 1 ? 's' : ''}` : 'Sin características'}
                      </p>
                    )
                  })()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel derecho — editor de características */}
        <div>
          {!productoSeleccionado ? (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-400">
              <p className="text-sm">← Seleccioná un producto para editar sus características</p>
            </div>
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{productoSeleccionado.nombre}</p>
                  <p className="text-xs text-gray-400">{productoSeleccionado.categoriaNombre}</p>
                </div>
                <button
                  onClick={() => saveMut.mutate()}
                  disabled={saveMut.isPending}
                  className={`px-4 py-1.5 rounded text-xs font-bold text-white transition-colors ${
                    guardado ? 'bg-green-500' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {guardado ? 'Guardado' : saveMut.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>

              {/* Lista de características actuales */}
              <div className="divide-y max-h-64 overflow-y-auto">
                {caracteristicas.length === 0 && (
                  <p className="text-center text-gray-400 text-xs py-6">Sin características aún</p>
                )}
                {caracteristicas.map((c, i) => {
                  const [t, ...rest] = c.split('::')
                  const v = rest.join('::')
                  return (
                    <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <span className="text-xs font-semibold text-gray-700 w-28 flex-shrink-0">{t}</span>
                      <span className="text-gray-400 text-xs">→</span>
                      <span className="text-xs text-gray-600 flex-1">{v}</span>
                      <button onClick={() => quitar(i)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                        <IconTrash size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Agregar nueva */}
              <div className="p-4 border-t bg-gray-50 space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">Agregar característica</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Título (ej: Material)"
                    className="input-field flex-1 text-sm"
                  />
                  <input
                    type="text"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    placeholder="Valor (ej: 100% algodón)"
                    className="input-field flex-1 text-sm"
                    onKeyDown={e => { if (e.key === 'Enter') agregar() }}
                  />
                  <button
                    type="button"
                    onClick={agregar}
                    disabled={!titulo.trim() || !valor.trim()}
                    className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-40"
                  >
                    + Agregar
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">También podés presionar Enter para agregar</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
