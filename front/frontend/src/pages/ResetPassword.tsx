import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { resetPassword } from '@api/auth'

export default function ResetPassword() {
  const [searchParams]        = useSearchParams()
  const token                  = searchParams.get('token') ?? ''
  const navigate               = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [listo, setListo]       = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Enlace inválido o expirado.</p>
          <Link to="/olvide-password" className="text-sm text-[#7d5c48] hover:underline">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm)  { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      await resetPassword(token, password)
      setListo(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch {
      setError('El enlace es inválido o ya expiró. Solicita uno nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#ede8df] p-8">
        <h1 className="text-xl font-bold text-[#2c1a10] mb-1">Nueva contraseña</h1>
        <p className="text-sm text-gray-500 mb-6">Elige una contraseña segura para tu cuenta.</p>

        {listo ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm text-gray-600">Contraseña actualizada. Redirigiendo al login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2c1a10] mb-1">Nueva contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-[#e2d9ce] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7d5c48]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2c1a10] mb-1">Confirmar contraseña</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full border border-[#e2d9ce] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7d5c48]"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a3728] hover:bg-[#3a2a1e] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
