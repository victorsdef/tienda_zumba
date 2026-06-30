import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getProductosAdmin, toggleActivo, actualizarStock } from '../../api/admin'
import { crearProducto, actualizarProducto, eliminarProducto } from '../../api/productos'
import { getCategorias } from '../../api/categorias'
import { IconSearch, IconEdit, IconTrash, IconHanger } from '../../components/ui/Icon'
import type { Producto } from '../../types'

type FormData = {
  nombre: string; descripcion: string; precio: number; precioOriginal: number
  stock: number; categoriaId: number; imagenes: string; tallas: string; colores: string
}

export default function AdminProductos() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editStock, setEditStock] = useState<{ id: number; stock: number } | null>(null)
  const [filtroNombre, setFiltroNombre] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-productos', page],
    queryFn: () => getProductosAdmin(page, 20),
  })
  const { data: cats } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>()

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-productos'] })

  const createMut = useMutation({ mutationFn: crearProducto, onSuccess: () => { invalidate(); cerrar() } })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<Producto> }) => actualizarProducto(id, data), onSuccess: () => { invalidate(); cerrar() } })
  const deleteMut = useMutation({ mutationFn: eliminarProducto, onSuccess: invalidate })
  const toggleMut = useMutation({ mutationFn: toggleActivo, onSuccess: invalidate })
  const stockMut = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) => actualizarStock(id, stock),
    onSuccess: () => { invalidate(); setEditStock(null) },
  })

  const abrir = (p?: Producto) => {
    setEditando(p ?? null)
    reset(p ? {
      nombre: p.nombre, descripcion: p.descripcion ?? '', precio: p.precio, precioOriginal: p.precioOriginal ?? 0,
      stock: p.stock, categoriaId: p.categoriaId ?? 0,
      imagenes: p.imagenes.join(', '), tallas: p.tallas.join(', '), colores: p.colores.join(', '),
    } : { stock: 0, precio: 0 })
    setMostrarForm(true)
  }

  const cerrar = () => { setMostrarForm(false); setEditando(null); reset({}) }

  const onSubmit = (d: FormData) => {
    const payload: Partial<Producto> = {
      nombre: d.nombre, descripcion: d.descripcion,
      precio: Number(d.precio), precioOriginal: d.precioOriginal ? Number(d.precioOriginal) : undefined,
      stock: Number(d.stock), categoriaId: d.categoriaId ? Number(d.categoriaId) : undefined,
      imagenes: d.imagenes ? d.imagenes.split(',').map(s => s.trim()).filter(Boolean) : [],
      tallas: d.tallas ? d.tallas.split(',').map(s => s.trim()).filter(Boolean) : [],
      colores: d.colores ? d.colores.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    editando ? updateMut.mutate({ id: editando.id, data: payload }) : createMut.mutate(payload)
  }

  const productos = data?.content.filter(p =>
    !filtroNombre || p.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  ) ?? []

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Productos</h1>
        <button onClick={() => abrir()} className="btn-primary flex items-center gap-1.5">
          <span className="text-lg leading-none">+</span> Nuevo producto
        </button>
      </div>

      {/* Form */}
      {mostrarForm && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">{editando ? `Editar: ${editando.nombre}` : 'Nuevo producto'}</h2>
            <button onClick={cerrar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Nombre *</label>
              <input {...register('nombre', { required: true })} className="input-field" placeholder="Ej: Vestido floral verano" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Categoría</label>
              <select {...register('categoriaId')} className="input-field">
                <option value="">Sin categoría</option>
                {cats?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Descripción</label>
              <textarea {...register('descripcion')} className="input-field h-20 resize-none" placeholder="Descripción del producto..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Precio *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" min="0" {...register('precio', { required: true })} className="input-field pl-7" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Precio original (antes de descuento)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" min="0" {...register('precioOriginal')} className="input-field pl-7" placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Stock *</label>
              <input type="number" min="0" {...register('stock', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Tallas (separadas por coma)</label>
              <input {...register('tallas')} className="input-field" placeholder="XS, S, M, L, XL" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Colores (separados por coma)</label>
              <input {...register('colores')} className="input-field" placeholder="#000000, #FF0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">URLs de imágenes (separadas por coma)</label>
              <input {...register('imagenes')} className="input-field" placeholder="https://..., https://..." />
            </div>
            <div className="col-span-2 flex gap-3 pt-2 border-t border-gray-100">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button type="button" onClick={cerrar} className="btn-outline">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtro */}
      <div className="bg-white border rounded-lg px-3 md:px-4 py-3 flex items-center gap-3">
        <IconSearch size={16} className="text-gray-400 flex-shrink-0" />
        <input
          value={filtroNombre}
          onChange={e => setFiltroNombre(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 outline-none text-sm"
        />
        <span className="text-xs text-gray-400">{data?.totalElements ?? 0} total</span>
      </div>

      {/* Tabla */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Cargando productos...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Producto</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Precio</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Stock</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Categoría</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Estado</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productos.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 ${!p.activo ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagenes[0]
                        ? <img src={p.imagenes[0]} alt="" className="w-10 h-12 object-cover rounded" />
                        : <div className="w-10 h-12 bg-gray-100 rounded flex items-center justify-center"><IconHanger size={20} className="text-gray-300" /></div>
                      }
                      <div>
                        <p className="font-medium text-gray-800">{p.nombre}</p>
                        <p className="text-xs text-gray-400">{p.tallas.slice(0, 3).join(', ')}{p.tallas.length > 3 ? '...' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-red-500">${p.precio.toFixed(2)}</span>
                    {p.precioOriginal && <p className="text-xs text-gray-400 line-through">${p.precioOriginal.toFixed(2)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {editStock?.id === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0" value={editStock.stock}
                          onChange={e => setEditStock({ id: p.id, stock: Number(e.target.value) })}
                          className="w-16 border rounded px-1 py-0.5 text-xs"
                          autoFocus
                        />
                        <button onClick={() => stockMut.mutate({ id: p.id, stock: editStock.stock })} className="text-green-600 text-xs font-bold hover:underline">✓</button>
                        <button onClick={() => setEditStock(null)} className="text-gray-400 text-xs hover:underline">✗</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditStock({ id: p.id, stock: p.stock })}
                        className={`font-mono text-sm font-bold hover:underline ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}
                        title="Click para editar stock"
                      >
                        {p.stock} {p.stock <= 5 && p.stock > 0 && <span className="text-orange-400 text-xs">!</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.categoriaNombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleMut.mutate(p.id)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => abrir(p)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Editar"><IconEdit size={15} /></button>
                      <button onClick={() => { if (confirm(`¿Eliminar "${p.nombre}"?`)) deleteMut.mutate(p.id) }}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Eliminar"><IconTrash size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:border-red-400">‹</button>
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`px-3 py-1.5 border rounded text-sm ${page === i ? 'bg-red-500 text-white border-red-500' : 'hover:border-red-400'}`}>{i + 1}</button>
          ))}
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:border-red-400">›</button>
        </div>
      )}
    </div>
  )
}
