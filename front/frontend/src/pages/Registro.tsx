import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { register as registerApi } from '../api/auth'

interface FormData {
  nombre: string
  email: string
  password: string
  confirmarPassword: string
}

export default function Registro() {
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    setExito('')
    try {
      const response = await registerApi(data.nombre, data.email, data.password)
      setExito(response.mensaje)
    } catch (err: unknown) {
      const response = (err as {
        response?: { status?: number; data?: { error?: string; mensaje?: string } | string }
      })?.response

      const rawData = response?.data
      const msg = typeof rawData === 'string'
        ? rawData
        : rawData?.error ?? rawData?.mensaje

      const normalized = msg?.toLowerCase() ?? ''
      const alreadyExists = response?.status === 409 || normalized.includes('ya está registrado')

      if (alreadyExists) {
        setExito('Ese correo ya tiene una cuenta. Puedes iniciar sesión directamente.')
        return
      }

      setError(msg ?? 'Error al registrarse. Intenta con otro email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] px-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md border border-[#ddd8d0]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#7d5c48]">sofia couture ec</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        {exito ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-5 py-6 text-center space-y-3">
            <div className="text-4xl">📬</div>
            <p className="font-semibold text-base">¡Cuenta creada!</p>
            <p className="text-sm leading-relaxed">{exito}</p>
            <Link to="/login" className="inline-block mt-2 text-sm text-[#7d5c48] font-medium hover:underline">
              Ir a iniciar sesión →
            </Link>
          </div>
        ) : (
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
          <p className="text-center text-sm text-gray-600 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#7d5c48] font-medium hover:underline">Inicia sesión</Link>
          </p>
        </form>
        )}
      </div>
    </div>
  )
}
