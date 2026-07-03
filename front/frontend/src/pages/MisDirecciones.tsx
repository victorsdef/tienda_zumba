import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDirecciones, crearDireccion, actualizarDireccion, eliminarDireccion, setPredeterminada } from '../api/direcciones'
import type { DireccionRequest } from '../api/direcciones'
import DireccionForm from '../components/ui/DireccionForm'
import type { Direccion } from '../types'
import { IconEdit, IconTrash } from '../components/ui/Icon'

export default function MisDirecciones() {
  const qc = useQueryClient()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Direccion | null>(null)

  const { data: direcciones = [], isLoading } = useQuery({
    queryKey: ['mis-direcciones'],
    queryFn: getDirecciones,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['mis-direcciones'] })

  const crearMut = useMutation({
    mutationFn: crearDireccion,
    onSuccess: () => { invalidate(); cerrar() },
  })
  const actualizarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DireccionRequest }) => actualizarDireccion(id, data),
    onSuccess: () => { invalidate(); cerrar() },
  })
  const eliminarMut = useMutation({ mutationFn: eliminarDireccion, onSuccess: invalidate })
  const predMut = useMutation({ mutationFn: setPredeterminada, onSuccess: invalidate })

  const cerrar = () => { setMostrarForm(false); setEditando(null) }

  const onSubmit = async (data: DireccionRequest) => {
    if (editando) {
      await actualizarMut.mutateAsync({ id: editando.id, data })
    } else {
      await crearMut.mutateAsync(data)
    }
  }

  if (isLoading) return <div className="py-8 text-center text-gray-400">Cargando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#4a3728] text-lg">Mis direcciones</h2>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)} className="btn-primary text-sm">
            + Nueva dirección
          </button>
        )}
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="bg-[#f5f0e8] border border-[#ddd8d0] rounded-lg p-4">
          <h3 className="font-semibold text-[#4a3728] mb-4">
            {editando ? 'Editar dirección' : 'Nueva dirección'}
          </h3>
          <DireccionForm
            initial={editando ? {
              nombreCompleto: editando.nombreCompleto,
              celular: editando.celular,
              provincia: editando.provincia,
              canton: editando.canton,
              ciudad: editando.ciudad,
              direccion: editando.direccion,
            } : undefined}
            onSubmit={onSubmit}
            onCancel={cerrar}
            loading={crearMut.isPending || actualizarMut.isPending}
          />
        </div>
      )}

      {/* Lista de direcciones */}
      {direcciones.length === 0 && !mostrarForm ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm mb-3">No tenés direcciones guardadas</p>
          <button onClick={() => setMostrarForm(true)} className="btn-primary text-sm">
            Agregar mi primera dirección
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {direcciones.map(d => (
            <div key={d.id} className={`bg-white border rounded-lg p-4 relative ${d.predeterminada ? 'border-[#7d5c48]' : 'border-[#ddd8d0]'}`}>
              {d.predeterminada && (
                <span className="absolute top-3 right-3 bg-[#7d5c48] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PREDETERMINADA
                </span>
              )}
              <p className="font-semibold text-[#4a3728] text-sm">{d.nombreCompleto}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.celular}</p>
              <p className="text-xs text-gray-600 mt-1">
                {d.direccion}, {d.ciudad}, {d.canton}, {d.provincia}
              </p>

              <div className="flex items-center gap-3 mt-3">
                {!d.predeterminada && (
                  <button
                    onClick={() => predMut.mutate(d.id)}
                    className="text-xs text-[#7d5c48] hover:underline font-medium"
                  >
                    Usar como predeterminada
                  </button>
                )}
                <button
                  onClick={() => { setEditando(d); setMostrarForm(true) }}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                  title="Editar"
                >
                  <IconEdit size={14} />
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar esta dirección?')) eliminarMut.mutate(d.id) }}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  title="Eliminar"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
