import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../api/categorias'
import type { Categoria } from '../../types'

type FormData = { nombre: string; descripcion: string; imagen: string }

export default function AdminCategorias() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>()

  const createMut = useMutation({ mutationFn: crearCategoria, onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); cerrar() } })
  const updateMut = useMutation({ mutationFn: ({ id, d }: { id: number; d: Partial<Categoria> }) => actualizarCategoria(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); cerrar() } })
  const deleteMut = useMutation({ mutationFn: eliminarCategoria, onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }) })

  const abrir = (c?: Categoria) => {
    setEditando(c ?? null)
    reset(c ? { nombre: c.nombre, descripcion: c.descripcion ?? '', imagen: c.imagen ?? '' } : {})
    setMostrarForm(true)
  }
  const cerrar = () => { setMostrarForm(false); setEditando(null); reset({}) }
  const onSubmit = (d: FormData) => editando ? updateMut.mutate({ id: editando.id, d }) : createMut.mutate(d)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button onClick={() => abrir()} className="btn-primary text-sm">+ Nueva categoría</button>
      </div>

      {mostrarForm && (
        <div className="bg-white border rounded-lg p-6 mb-6 max-w-lg">
          <h2 className="font-bold mb-4">{editando ? 'Editar' : 'Nueva'} categoría</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input {...register('nombre', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <input {...register('descripcion')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL imagen</label>
              <input {...register('imagen')} className="input-field" placeholder="https://..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">Guardar</button>
              <button type="button" onClick={cerrar} className="btn-outline text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categorias?.map(c => (
          <div key={c.id} className="bg-white border rounded-lg overflow-hidden">
            {c.imagen && <img src={c.imagen} alt={c.nombre} className="w-full h-32 object-cover" />}
            <div className="p-3">
              <h3 className="font-medium">{c.nombre}</h3>
              {c.descripcion && <p className="text-xs text-gray-500 mt-0.5">{c.descripcion}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => abrir(c)} className="text-blue-600 text-xs hover:underline">Editar</button>
                <button onClick={() => { if (confirm('¿Eliminar?')) deleteMut.mutate(c.id) }} className="text-red-600 text-xs hover:underline">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
