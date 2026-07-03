interface Props {
  ordenId: number
  total: number
  email?: string
  celular?: string
}

export default function PayphoneWidget({ ordenId, total, email, celular }: Props) {
  const abrirPago = () => {
    const params = new URLSearchParams({ ordenId: String(ordenId), total: String(total) })
    if (email) params.set('email', email)
    if (celular) params.set('celular', celular)
    window.open(`/pagar?${params}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-2">
      <button onClick={abrirPago} className="btn-primary w-full text-base py-3">
        Pagar con tarjeta — ${total.toFixed(2)}
      </button>
      <p className="text-[11px] text-center text-gray-400">
        Se abrirá una pestaña segura · Visa · Mastercard · Diners · Discover
      </p>
    </div>
  )
}
