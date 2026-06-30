import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { register as registerApi } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'

interface FormData {
  nombre: string
  email: string
  password: string
  confirmarPassword: string
}

export default function Registro() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { fetchCarrito } = useCartStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await registerApi(data.nombre, data.email, data.password)
      setUser(res)
      await fetchCarrito()
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Error al registrarse. Intenta con otro email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">MODASTORE</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              {...register('nombre', { required: 'Nombre requerido' })}
              className="input-field" placeholder="Juan Pérez"
            />
            {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email requerido' })}
              className="input-field" placeholder="tu@email.com"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              {...register('password', { required: 'Contraseña requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              className="input-field" placeholder="••••••••"
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type="password"
              {...register('confirmarPassword', {
                required: 'Confirma tu contraseña',
                validate: v => v === watch('password') || 'Las contraseñas no coinciden',
              })}
              className="input-field" placeholder="••••••••"
            />
            {errors.confirmarPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmarPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-red-600 font-medium hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
