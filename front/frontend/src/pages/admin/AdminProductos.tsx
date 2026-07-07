import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getProductosAdmin, toggleActivo, actualizarStock } from '../../api/admin'
import { crearProducto, actualizarProducto, eliminarProducto } from '../../api/productos'
import { getCategorias } from '../../api/categorias'
import { IconSearch, IconEdit, IconTrash, IconHanger } from '@shared/Icon'
import ImageManager from '@shared/ImageManager'
import TallasSelector from '@shared/TallasSelector'
import ColoresSelector from '@shared/ColoresSelector'
import PrecioDescuento from '@shared/PrecioDescuento'
import { useAuthStore } from '../../store/useAuthStore'
import type { Producto } from '../../types'

type FormData = {
  nombre: string
  descripcion: string
  caracteristicaTitulo: string
  caracteristicaDescripcion: string
  precio: number
  stock: number
  categoriaId: number
}

type Genero = '' | 'MUJER' | 'HOMBRE' | 'NINO' | 'CALZADO' | 'ACCESORIOS' | 'BELLEZA'

const GENERO_OPTS = [
  { value: 'MUJER',      label: 'Mujer',      color: 'bg-pink-500'    },
  { value: 'HOMBRE',     label: 'Hombre',     color: 'bg-blue-500'    },
  { value: 'NINO',       label: 'Niño/a',     color: 'bg-green-500'   },
  { value: 'CALZADO',    label: 'Calzado',    color: 'bg-yellow-500'  },
  { value: 'ACCESORIOS', label: 'Accesorios', color: 'bg-purple-500'  },
  { value: 'BELLEZA',    label: 'Belleza',    color: 'bg-rose-400'    },
] as const

export default function AdminProductos() {
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editStock, setEditStock] = useState<{ id: number; stock: number } | null>(null)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [genero, setGenero] = useState<Genero>('')

  // Estado independiente para los campos complejos
  const [imagenes, setImagenes] = useState<string[]>([])
  const [tallas, setTallas] = useState<string[]>([])
  const [colores, setColores] = useState<string[]>([])
  const [stockPorColor, setStockPorColor] = useState<Record<string, number>>({})
  const [stockPorColorTalla, setStockPorColorTalla] = useState<Record<string, Record<string, number>>>({})
  const [precioFinal, setPrecioFinal] = useState<number | undefined>(undefined)
  const [precioOriginal, setPrecioOriginal] = useState<number | undefined>(undefined)
  const [activo, setActivo] = useState(true)
  const [aplicaIva, setAplicaIva] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-productos', page],
    queryFn: () => getProductosAdmin(page, 20),
  })
  const { data: cats = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
    enabled: isAdmin,
  })
  const generosActivos = new Set(cats.map(c => c.genero).filter(Boolean))
  const generoOpts = GENERO_OPTS.filter(g => generosActivos.has(g.value))

  const { register, handleSubmit, reset, watch, formState: { isSubmitting, errors } } = useForm<FormData>()
  const precioActual = Number(watch('precio') ?? 0)
  const categoriaIdActual = watch('categoriaId')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-productos'] })

  const createMut = useMutation({ mutationFn: crearProducto, onSuccess: () => { invalidate(); cerrar() } })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Producto> }) => actualizarProducto(id, data),
    onSuccess: () => { invalidate(); cerrar() },
  })
  const deleteMut = useMutation({ mutationFn: eliminarProducto, onSuccess: invalidate })
  const toggleMut = useMutation({ mutationFn: toggleActivo, onSuccess: invalidate })
  const stockMut = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) => actualizarStock(id, stock),
    onSuccess: () => { invalidate(); setEditStock(null) },
  })

  const abrir = (p?: Producto) => {
    if (!isAdmin) return
    setEditando(p ?? null)
    setImagenes(p?.imagenes ?? [])
    setTallas(p?.tallas ?? [])
    setColores(p?.colores ?? [])
    setStockPorColor(p?.stockPorColor ?? {})
    setStockPorColorTalla(p?.stockPorColorTalla ?? {})
    setPrecioFinal(p?.precio)
    setPrecioOriginal(p?.precioOriginal ?? undefined)
    setActivo(p?.activo ?? true)
    setAplicaIva(p?.aplicaIva ?? true)
    // Detectar género de la categoría al editar
    if (p?.categoriaId && cats) {
      const cat = cats.find(c => c.id === p.categoriaId)
      if (cat?.genero) setGenero(cat.genero as Genero)
    } else {
      setGenero('')
    }
    reset(p ? {
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      caracteristicaTitulo: p.caracteristicaTitulo ?? '',
      caracteristicaDescripcion: p.caracteristicaDescripcion ?? '',
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoriaId ?? 0,
    } : { stock: 0, precio: 0, caracteristicaTitulo: '', caracteristicaDescripcion: '' })
    setMostrarForm(true)
  }

  const cerrar = () => {
    setMostrarForm(false)
    setEditando(null)
    setImagenes([])
    setTallas([])
    setColores([])
    setStockPorColor({})
    setStockPorColorTalla({})
    setPrecioFinal(undefined)
    setPrecioOriginal(undefined)
    setActivo(true)
    setAplicaIva(true)
    setGenero('')
    reset({})
  }

  useEffect(() => {
    if (tallas.length === 0) {
      setStockPorColorTalla({})
      return
    }

    setStockPorColorTalla(prev => {
      const next: Record<string, Record<string, number>> = {}
      colores.forEach(color => {
        const actual = prev[color] ?? {}
        next[color] = {}
        tallas.forEach(talla => {
          next[color][talla] = Math.max(0, actual[talla] ?? 0)
        })
      })
      return next
    })
  }, [tallas, colores])

  useEffect(() => {
    if (tallas.length === 0) return
    setStockPorColor(prev => {
      const next: Record<string, number> = { ...prev }
      colores.forEach(color => {
        next[color] = Object.values(stockPorColorTalla[color] ?? {}).reduce((a, b) => a + b, 0)
      })
      return next
    })
  }, [stockPorColorTalla, tallas, colores])

  const onSubmit = (d: FormData) => {
    const precioBase = d.precio ? Number(d.precio) : 0
    const stockTotal = tallas.length > 0
      ? Object.values(stockPorColorTalla).reduce(
          (acc, porTalla) => acc + Object.values(porTalla).reduce((a, b) => a + b, 0),
          0
        )
      : colores.length > 0
        ? Object.values(stockPorColor).reduce((a, b) => a + b, 0)
        : Number(d.stock)
    const payload: Partial<Producto> = {
      nombre: d.nombre,
      descripcion: d.descripcion,
      caracteristicaTitulo: d.caracteristicaTitulo || undefined,
      caracteristicaDescripcion: d.caracteristicaDescripcion || undefined,
      precio: precioFinal ?? precioBase,
      precioOriginal: precioOriginal ?? undefined,
      activo,
      aplicaIva,
      stock: stockTotal,
      categoriaId: d.categoriaId ? Number(d.categoriaId) : undefined,
      imagenes,
      tallas,
      colores,
      stockPorColor: colores.length > 0 ? stockPorColor : undefined,
      stockPorColorTalla: tallas.length > 0 ? stockPorColorTalla : undefined,
    }
    editando ? updateMut.mutate({ id: editando.id, data: payload }) : createMut.mutate(payload)
  }

  // Categorías filtradas por género (campo real del backend)
  const catsFiltradas = cats?.filter(c =>
    genero === '' ? true : c.genero === genero
  ) ?? []

  // Nombre de la categoría seleccionada (para TallasSelector)
  const categoriaNombreActual = cats?.find(c => c.id === Number(categoriaIdActual))?.nombre ?? ''

  const productos = data?.content.filter(p =>
    !filtroNombre || p.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  ) ?? []

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Productos</h1>
        {isAdmin ? (
          <button onClick={() => abrir()} className="btn-primary flex items-center gap-1.5">
            <span className="text-lg leading-none">+</span> Nuevo producto
          </button>
        ) : (
          <span className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            Acceso de bodega: solo stock
          </span>
        )}
      </div>

      {/* Formulario */}
      {isAdmin && mostrarForm && (
        <div className="bg-white border rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">{editando ? `Editar: ${editando.nombre}` : 'Nuevo producto'}</h2>
            <button onClick={cerrar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Paso 1 — Género */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                Para quién es <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {generoOpts.map(g => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => { setGenero(g.value); reset({ ...watch(), categoriaId: 0 }) }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      genero === g.value
                        ? `border-transparent text-white ${g.color}`
                        : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paso 2 — Nombre + Categoría (se activa al elegir género) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${genero ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                  className={`input-field ${errors.nombre ? 'border-red-400 bg-red-50' : ''}`}
                  placeholder="Ej: Vestido floral verano"
                />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                  Categoría <span className="text-red-500">*</span>
                  {genero && <span className="ml-2 normal-case font-normal text-gray-400">({catsFiltradas.length} disponibles)</span>}
                </label>
                <select
                  {...register('categoriaId', {
                    required: 'Seleccioná una categoría',
                    onChange: e => {
                      const cat = cats?.find(c => c.id === Number(e.target.value))
                      if (cat?.tallasDisponibles?.length) setTallas(cat.tallasDisponibles)
                    }
                  })}
                  className={`input-field ${errors.categoriaId ? 'border-red-400 bg-red-50' : ''}`}
                  disabled={!genero}
                >
                  <option value="">{genero ? '— Seleccionar categoría —' : '← Elegí el género primero'}</option>
                  {catsFiltradas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                {errors.categoriaId && <p className="text-xs text-red-500 mt-1">{errors.categoriaId.message}</p>}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Descripción</label>
              <textarea {...register('descripcion')} className="input-field h-20 resize-none" placeholder="Descripción del producto..." />
            </div>

            {/* Características */}
            <div className="border border-gray-100 rounded-lg p-4 space-y-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase">Características</label>
              <div>
                <input
                  {...register('caracteristicaTitulo')}
                  className="input-field"
                  placeholder="Título (ej: Composición y cuidados)"
                />
              </div>
              <div>
                <textarea
                  {...register('caracteristicaDescripcion')}
                  className="input-field h-20 resize-none"
                  placeholder="Descripción (ej: 95% poliéster. Lavar a mano en agua fría.)"
                />
              </div>
            </div>

            {/* Precio + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                  Precio
                  <span className="ml-1 font-normal text-gray-400 normal-case">(puede definirse después)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number" step="0.01" min="0"
                    {...register('precio', { min: { value: 0, message: 'No puede ser negativo' } })}
                    className={`input-field pl-7 ${errors.precio ? 'border-red-400 bg-red-50' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
                  Stock {colores.length === 0 && <span className="text-red-500">*</span>}
                </label>
                {colores.length > 0 ? (
                  <div className="input-field bg-gray-50 text-gray-500 flex items-center justify-between">
                    <span className="text-xs">{tallas.length > 0 ? 'Se define por color y talla' : 'Se define por color'}</span>
                    <span className="font-bold text-gray-700">
                      {tallas.length > 0
                        ? Object.values(stockPorColorTalla).reduce(
                            (acc, porTalla) => acc + Object.values(porTalla).reduce((a, b) => a + b, 0),
                            0
                          )
                        : Object.values(stockPorColor).reduce((a, b) => a + b, 0)} uds
                    </span>
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      {...register('stock', {
                        required: colores.length === 0 ? 'El stock es obligatorio' : false,
                        min: { value: 0, message: 'No puede ser negativo' },
                        valueAsNumber: true,
                      })}
                      className={`input-field ${errors.stock ? 'border-red-400 bg-red-50' : ''}`}
                    />
                    {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
                  </>
                )}
              </div>
            </div>

            {/* Descuento */}
            <PrecioDescuento
              precioBase={precioActual}
              initialPrecioOriginal={precioOriginal}
              onChange={(final, original) => { setPrecioFinal(final); setPrecioOriginal(original) }}
            />

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Impuesto del producto</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Si está activo, Payphone separa automáticamente la base gravada y el IVA en el cobro.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAplicaIva(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aplicaIva ? 'bg-[#7d5c48]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${aplicaIva ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="mt-3 inline-flex rounded-full border border-[#d9ccbb] bg-white px-3 py-1 text-xs font-medium text-[#5d473b]">
                {aplicaIva ? 'Precio gravado con IVA' : 'Precio sin IVA'}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Imágenes */}
            <ImageManager value={imagenes} onChange={setImagenes} />

            <hr className="border-gray-100" />

            {/* Tallas — se adaptan según categoría */}
            <TallasSelector
              value={tallas}
              onChange={setTallas}
              categoriaNombre={categoriaNombreActual}
            />

            <hr className="border-gray-100" />

            {/* Colores */}
            {tallas.length > 0 && (
              <div className="rounded-lg border border-[#ede8df] bg-[#faf7f2] px-4 py-3 text-sm text-gray-600">
                <p className="font-semibold text-gray-700">Relación actual entre tallas y colores</p>
                <p className="mt-1">
                  Aquí ya puedes definir inventario por variante. Ejemplo:
                  <span className="font-medium"> rosa → S: 5, M: 12</span>.
                  Cada color tendrá sus propias tallas y cantidades.
                </p>
              </div>
            )}
            <ColoresSelector
              value={colores}
              tallas={tallas}
              stockPorColor={stockPorColor}
              stockPorColorTalla={stockPorColorTalla}
              onChange={setColores}
              onStockChange={setStockPorColor}
              onStockMatrixChange={setStockPorColorTalla}
            />

            <hr className="border-gray-100" />

            {/* Estado visible / oculto */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-700">Visibilidad en la tienda</p>
                <p className="text-xs text-gray-400">{activo ? 'El producto aparece en el catálogo' : 'El producto está oculto para los clientes'}</p>
              </div>
              <button
                type="button"
                onClick={() => setActivo(a => !a)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activo ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${activo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
              <button type="button" onClick={cerrar} className="btn-outline">Cancelar</button>
              {Object.keys(errors).length > 0 && (
                <p className="text-xs text-red-500 ml-1">
                  Completá los campos requeridos ({Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 'es' : ''})
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
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
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold hidden sm:table-cell">Estado</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold hidden md:table-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productos.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 ${!p.activo ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagenes[0]
                        ? <img src={p.imagenes[0]} alt="" className="w-10 h-12 object-cover rounded flex-shrink-0" />
                        : <div className="w-10 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0"><IconHanger size={20} className="text-gray-300" /></div>
                      }
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{p.nombre}</p>
                        {p.sku && <p className="text-[11px] text-gray-400 font-mono mt-0.5">{p.sku}</p>}
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.colores.slice(0, 4).map(c => (
                            <span key={c} className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${p.aplicaIva !== false ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.aplicaIva !== false ? 'Con IVA' : 'Sin IVA'}
                          </span>
                        </div>
                        {/* Info + acciones visibles solo en móvil */}
                        <div className="flex items-center gap-2 mt-1 md:hidden flex-wrap">
                          {p.categoriaNombre && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{p.categoriaNombre}</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          {isAdmin && (
                            <>
                              <button onClick={() => abrir(p)} className="text-blue-600 p-0.5 rounded hover:bg-blue-50" title="Editar"><IconEdit size={13} /></button>
                              <button onClick={() => { if (confirm(`¿Eliminar "${p.nombre}"?`)) deleteMut.mutate(p.id) }}
                                className="text-red-500 p-0.5 rounded hover:bg-red-50" title="Eliminar"><IconTrash size={13} /></button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-red-500">${p.precio.toFixed(2)}</span>
                    {p.precioOriginal && <p className="text-xs text-gray-400 line-through">${p.precioOriginal.toFixed(2)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {p.stockPorColorTalla && Object.keys(p.stockPorColorTalla).length > 0 ? (
                      <div>
                        <p className={`font-mono text-sm font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                          {p.stock}
                        </p>
                        <p className="text-[11px] text-gray-400">por variantes</p>
                      </div>
                    ) : editStock?.id === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0" value={editStock.stock}
                          onChange={e => setEditStock({ id: p.id, stock: Number(e.target.value) })}
                          className="w-16 border rounded px-1 py-0.5 text-xs"
                          autoFocus
                        />
                        <button onClick={() => stockMut.mutate({ id: p.id, stock: editStock.stock })} className="text-green-600 text-xs font-bold">OK</button>
                        <button onClick={() => setEditStock(null)} className="text-gray-400 text-xs">X</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditStock({ id: p.id, stock: p.stock })}
                        className={`font-mono text-sm font-bold hover:underline ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}
                        title="Click para editar stock">
                        {p.stock}{p.stock > 0 && p.stock <= 5 && <span className="text-orange-400 text-xs ml-0.5">!</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{p.categoriaNombre ?? '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {isAdmin ? (
                      <button onClick={() => toggleMut.mutate(p.id)}
                        title={p.activo ? 'Click para desactivar' : 'Click para activar'}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-70 transition-opacity ${p.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => abrir(p)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Editar"><IconEdit size={15} /></button>
                        <button onClick={() => { if (confirm(`¿Eliminar "${p.nombre}"?`)) deleteMut.mutate(p.id) }}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Eliminar"><IconTrash size={15} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
