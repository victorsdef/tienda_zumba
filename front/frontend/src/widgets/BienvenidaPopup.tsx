import { useState, useEffect } from 'react'

export default function BienvenidaPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const ya = localStorage.getItem('popup_bienvenida_visto')
    if (!ya) {
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  if (!visible) return null

  const cerrar = () => {
    localStorage.setItem('popup_bienvenida_visto', '1')
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={cerrar}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#4a3728] px-6 py-8 text-center">
          <p className="text-[#f5ede6] text-xs font-bold uppercase tracking-widest mb-2">Bienvenida a</p>
          <h2 className="text-white text-2xl font-bold tracking-tight">sofia couture ec</h2>
          <p className="text-[#c9b8a8] text-sm mt-2">Moda femenina con estilo</p>
        </div>

        <div className="px-6 py-6 text-center">
          <div className="bg-[#f5f0e8] border border-[#ddd8d0] rounded-xl px-6 py-4 mb-5">
            <p className="text-xs text-[#7d5c48] uppercase tracking-wider font-semibold mb-1">Descuento de bienvenida</p>
            <p className="text-3xl font-bold text-[#4a3728]">10% OFF</p>
            <p className="text-xs text-gray-500 mt-1">en tu primera compra</p>
            <div className="mt-3 bg-white border-2 border-dashed border-[#c4a882] rounded-lg px-4 py-2">
              <span className="font-mono font-bold text-[#4a3728] tracking-wider text-lg">BIENVENIDA10</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-5">Ingresa el código al finalizar tu compra. Válido en tu primer pedido.</p>

          <button
            onClick={cerrar}
            className="w-full bg-[#4a3728] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#3a2a1e] transition-colors"
          >
            ¡Empezar a comprar!
          </button>
          <button onClick={cerrar} className="mt-3 text-xs text-gray-400 hover:text-gray-600">
            No gracias
          </button>
        </div>
      </div>
    </div>
  )
}
