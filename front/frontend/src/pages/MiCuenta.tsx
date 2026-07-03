import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getPerfil, actualizarPerfil } from '../api/usuario'
import { useAuthStore } from '../store/useAuthStore'

export default function MiCuenta() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuthStore()
  const qc = useQueryClient()

  if (!isAuthenticated) { navigate('/login'); return null }

  const { data: perfil } = useQuery({ queryKey: ['perfil'], queryFn: getPerfil })

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: { nombre: perfil?.nombre ?? '' }
  })

  const updateMut = useMutation({
    mutationFn: ({ nombre }: { nombre: string }) => actualizarPerfil(nombre),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['perfil'] }),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#4a3728]">Mi cuenta</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Sidebar navegación */}
        <div className="space-y-2">
          {[
            { label: 'Mis pedidos', to: '/ordenes' },
            { label: 'Mis direcciones', to: '/mis-direcciones' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[#ddd8d0] bg-white text-sm text-[#4a3728] hover:border-[#7d5c48] hover:bg-[#f5f0e8] transition-colors"
            >
              {item.label}
              <span className="text-gray-400">›</span>
            </Link>
          ))}
          <button
            onClick={() => { logout(); navigate('/') }}
            className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 text-sm text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Formulario perfil */}
        <div className="md:col-span-2">
          <div className="bg-white border border-[#ddd8d0] rounded-lg p-5">
            <h2 className="font-bold text-[#4a3728] mb-4">Datos personales</h2>
            <form onSubmit={handleSubmit(d => updateMut.mutate(d))} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nombre</label>
                <input {...register('nombre', { required: true })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
                <input value={perfil?.email ?? ''} disabled className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {updateMut.isSuccess && <p className="text-green-600 text-sm">Perfil actualizado</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
