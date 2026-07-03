import { useParams, Link } from 'react-router-dom'
import { IconShield } from '../components/ui/Icon'

export default function OrdenConfirmada() {
  const { id } = useParams()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center text-[#4a3728] mb-4">
          <IconShield size={52} />
        </div>
        <h1 className="text-2xl font-bold text-[#4a3728] mb-2">¡Pedido confirmado!</h1>
        <p className="text-[#6b5040] mb-1">Tu orden <strong>{id}</strong> fue recibida.</p>
        <p className="text-[#6b5040] text-sm mb-6">
          Te enviamos un correo con los detalles. Nos pondremos en contacto para coordinar la entrega.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/593983934596"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Consultar por WhatsApp
          </a>
          <Link to="/catalogo" className="btn-primary">Seguir comprando</Link>
        </div>
      </div>
    </div>
  )
}
