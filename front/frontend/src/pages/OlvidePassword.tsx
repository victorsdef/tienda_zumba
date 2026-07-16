import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '@api/auth'

export default function OlvidePassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setEnviado(true)
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#ede8df] p-8">
        <h1 className="text-xl font-bold text-[#2c1a10] mb-1">¿Olvidaste tu contraseña?</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        {enviado ? (
          <div className="text-center">
            <div className="text-4xl mb-3">📩</div>
            <p className="text-sm text-gray-600 mb-4">
              Si el correo está registrado, recibirás el enlace en breve. Revisa también tu carpeta de spam.
            </p>
            <Link to="/login" className="text-sm text-[#7d5c48] hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2c1a10] mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full border border-[#e2d9ce] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7d5c48]"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a3728] hover:bg-[#3a2a1e] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-xs text-[#7d5c48] hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
