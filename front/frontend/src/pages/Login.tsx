import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login } from '../api/auth'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import logo from '../assets/logo.png'

interface FormData {
  email: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { fetchCarrito } = useCartStore()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await login(data.email, data.password)
      setUser(res)
      await fetchCarrito()
      navigate('/')
    } catch {
      setError('Email o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] px-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md border border-[#ddd8d0]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#7d5c48]">sofia couture ec</h1>
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email requerido' })}
              className="input-field"
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              {...register('password', { required: 'Contraseña requerida' })}
              className="input-field"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-[#7d5c48] font-medium hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
