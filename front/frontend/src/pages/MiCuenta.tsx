import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getPerfil, actualizarPerfil, getDirecciones, agregarDireccion, eliminarDireccion } from '../api/usuario'
import { useAuthStore } from '../store/useAuthStore'
import type { Direccion } from '../types'

export default function MiCuenta() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuthStore()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'perfil' | 'direcciones'>('perfil')
  const [showAddDir, setShowAddDir] = useState(false)

  if (!isAuthenticated) { navigate('/login'); return null }

  const { data: perfil } = useQuery({ queryKey: ['perfil'], queryFn: getPerfil })
  const { data: direcciones } = useQuery({ queryKey: ['direcciones'], queryFn: getDirecciones })

  const { register: rPerfil, handleSubmit: hsPerfil, formState: { isSubmitting: sp } } = useForm({ values: { nombre: perfil?.nombre ?? '' } })
  const { register: rDir, handleSubmit: hsDir, reset: resetDir, formState: { isSubmitting: sd } } = useForm<Omit<Direccion, 'id'>>()

  const updateMut = useMutation({
    mutationFn: ({ nombre }: { nombre: string }) => actualizarPerfil(nombre),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perfil'] }),
  })

  const addDirMut = useMutation({
    mutationFn: (data: Omit<Direccion, 'id'>) => agregarDireccion(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['direcciones'] }); setShowAddDir(false); resetDir() },
  })

  const delDirMut = useMutation({
    mutationFn: (id: number) => eliminarDireccion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['direcciones'] }),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi cuenta</h1>

      <div className="flex gap-1 border-b mb-8">
        {(['perfil', 'direcciones'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
          >{t}</button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div className="max-w-md">
          <form onSubmit={hsPerfil(d => updateMut.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input {...rPerfil('nombre', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={perfil?.email ?? ''} disabled className="input-field bg-gray-50 text-gray-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={sp} className="btn-primary">Guardar cambios</button>
              <button type="button" onClick={() => { logout(); navigate('/') }} className="btn-outline">Cerrar sesión</button>
            </div>
            {updateMut.isSuccess && <p className="text-green-600 text-sm">Perfil actualizado ✓</p>}
          </form>
        </div>
      )}

      {tab === 'direcciones' && (
        <div>
          <div className="space-y-3 mb-6">
            {direcciones?.map(d => (
              <div key={d.id} className="border rounded-lg p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium">{d.calle}</p>
                  <p className="text-sm text-gray-600">{d.ciudad}{d.provincia && `, ${d.provincia}`} {d.codigoPostal}</p>
                  {d.referencias && <p className="text-xs text-gray-500 mt-1">{d.referencias}</p>}
                </div>
                <button onClick={() => delDirMut.mutate(d.id)} className="text-red-600 hover:underline text-sm">Eliminar</button>
              </div>
            ))}
            {(!direcciones || direcciones.length === 0) && (
              <p className="text-gray-500 text-sm">No tienes direcciones guardadas</p>
            )}
          </div>

          {!showAddDir ? (
            <button onClick={() => setShowAddDir(true)} className="btn-outline text-sm">+ Agregar dirección</button>
          ) : (
            <form onSubmit={hsDir(d => addDirMut.mutate(d))} className="border rounded-lg p-4 space-y-3 max-w-md">
              <h3 className="font-semibold">Nueva dirección</h3>
              <input {...rDir('calle', { required: true })} className="input-field" placeholder="Calle y número *" />
              <input {...rDir('ciudad', { required: true })} className="input-field" placeholder="Ciudad *" />
              <div className="grid grid-cols-2 gap-3">
                <input {...rDir('provincia')} className="input-field" placeholder="Provincia" />
                <input {...rDir('codigoPostal')} className="input-field" placeholder="Código postal" />
              </div>
              <input {...rDir('referencias')} className="input-field" placeholder="Referencias" />
              <div className="flex gap-2">
                <button type="submit" disabled={sd} className="btn-primary text-sm">Guardar</button>
                <button type="button" onClick={() => setShowAddDir(false)} className="text-sm text-gray-600 hover:underline">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
