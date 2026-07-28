import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDirecciones, crearDireccion, actualizarDireccion, eliminarDireccion, setPredeterminada } from '../api/direcciones'
import type { DireccionRequest } from '../api/direcciones'
import DireccionForm from '@shared/DireccionForm'
import type { Direccion } from '../types'
import { IconEdit, IconTrash, IconX } from '@shared/Icon'

export default function MisDirecciones() {
  const qc = useQueryClient()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState<Direccion | null>(null)

  const { data: direcciones = [], isLoading } = useQuery({
    queryKey: ['mis-direcciones'],
    queryFn: getDirecciones,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['mis-direcciones'] })

  const crearMut = useMutation({ mutationFn: crearDireccion, onSuccess: () => { invalidate(); cerrar() } })
  const actualizarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DireccionRequest }) => actualizarDireccion(id, data),
    onSuccess: () => { invalidate(); cerrar() },
  })
  const eliminarMut = useMutation({ mutationFn: eliminarDireccion, onSuccess: invalidate })
  const predMut = useMutation({ mutationFn: setPredeterminada, onSuccess: invalidate })

  const cerrar = () => { setMostrarForm(false); setEditando(null) }
  const abrirNueva = () => { setEditando(null); setMostrarForm(true) }
  const abrirEditar = (d: Direccion) => { setEditando(d); setMostrarForm(true) }

  const onSubmit = async (data: DireccionRequest) => {
    if (editando) await actualizarMut.mutateAsync({ id: editando.id, data })
    else await crearMut.mutateAsync(data)
  }

  if (isLoading) return (
    <div className="py-16 text-center">
      <div className="inline-block w-6 h-6 border-2 border-[#7d5c48] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-5">
      {/* Encabezado tipo card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 sm:px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-bold text-[#4a3728] text-lg sm:text-xl md:text-2xl leading-tight">Mis direcciones</h2>
          <p className="text-xs text-gray-400 mt-0.5">{direcciones.length} dirección{direcciones.length !== 1 ? 'es' : ''} guardada{direcciones.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={abrirNueva}
          className="flex items-center gap-1.5 bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">Nueva dirección</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Estado vacío */}
      {direcciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f5ede6] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#7d5c48]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold mb-1">No tenés direcciones guardadas</p>
          <p className="text-sm text-gray-400 mb-5">Guardá una dirección para que el checkout sea más rápido</p>
          <button onClick={abrirNueva} className="bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Agregar mi primera dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {direcciones.map(d => (
            <div
              key={d.id}
              className={`relative bg-white rounded-xl border p-4 transition-shadow hover:shadow-md ${
                d.predeterminada ? 'border-[#7d5c48] shadow-sm' : 'border-gray-200'
              }`}
            >
              {/* Badge predeterminada */}
              {d.predeterminada && (
                <span className="absolute top-3 right-3 bg-[#4a3728] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                  PREDETERMINADA
                </span>
              )}

              {/* Icono + datos */}
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f5ede6] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-[#7d5c48]" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{d.nombreCompleto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.celular}</p>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    {d.direccion}<br />
                    {d.ciudad}, {d.canton}<br />
                    {d.provincia}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                {!d.predeterminada && (
                  <button
                    onClick={() => predMut.mutate(d.id)}
                    disabled={predMut.isPending}
                    className="flex-1 text-xs text-[#7d5c48] hover:text-[#4a3728] font-semibold hover:underline text-left"
                  >
                    Usar como predeterminada
                  </button>
                )}
                {d.predeterminada && <div className="flex-1" />}
                <button
                  onClick={() => abrirEditar(d)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#7d5c48] hover:bg-[#f5ede6] transition-colors"
                  title="Editar"
                >
                  <IconEdit size={15} />
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar esta dirección?')) eliminarMut.mutate(d.id) }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <IconTrash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={cerrar} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-[#4a3728] text-base">
                {editando ? 'Editar dirección' : 'Nueva dirección'}
              </h3>
              <button onClick={cerrar} className="text-gray-400 hover:text-gray-600 p-1">
                <IconX size={20} />
              </button>
            </div>
            <div className="px-5 py-5">
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
          </div>
        </div>
      )}
    </div>
  )
}
