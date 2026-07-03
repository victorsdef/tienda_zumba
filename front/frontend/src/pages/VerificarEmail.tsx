import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { verificarEmail } from '../api/auth'
import { IconAlertTriangle, IconShield } from '../components/ui/Icon'

export default function VerificarEmail() {
  const [params] = useSearchParams()
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setEstado('error')
      setMensaje('El enlace de verificación no es válido.')
      return
    }
    verificarEmail(token)
      .then(msg => {
        setMensaje(msg)
        setEstado('ok')
      })
      .catch(err => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        setMensaje(msg ?? 'El enlace expiró o ya fue utilizado.')
        setEstado('error')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] px-4">
      <div className="bg-white rounded-lg shadow-md p-10 w-full max-w-md border border-[#ddd8d0] text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#7d5c48] tracking-tight">sofia couture ec</h1>

        {estado === 'cargando' && (
          <p className="text-[#6b5040]">Verificando tu correo...</p>
        )}

        {estado === 'ok' && (
          <>
            <div className="flex justify-center text-green-700">
              <IconShield size={44} />
            </div>
            <p className="text-green-700 font-semibold text-lg">¡Correo verificado!</p>
            <p className="text-sm text-[#6b5040]">{mensaje}</p>
            <Link
              to="/login"
              className="inline-block mt-2 bg-[#7d5c48] text-[#f5f0e8] px-6 py-2 rounded font-semibold hover:bg-[#4a3728] transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="flex justify-center text-red-700">
              <IconAlertTriangle size={44} />
            </div>
            <p className="text-red-700 font-semibold">No se pudo verificar</p>
            <p className="text-sm text-[#6b5040]">{mensaje}</p>
            <Link to="/registro" className="text-sm text-[#7d5c48] font-medium hover:underline">
              Registrarte nuevamente
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
