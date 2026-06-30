import { Link } from 'react-router-dom'
import { IconLock, IconCreditCard, IconInstagram, IconTikTok, IconFacebook } from '../ui/Icon'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-6">
      <div className="max-w-[1400px] mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 text-xs">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-black text-xl mb-3 tracking-tighter">MODASTORE</h3>
            <p className="text-gray-500 text-[11px] leading-relaxed">Moda online con los mejores precios y las últimas tendencias.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-500 hover:text-pink-400 transition-colors"><IconInstagram size={18} /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><IconTikTok size={18} /></a>
              <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors"><IconFacebook size={18} /></a>
            </div>
          </div>
          {[
            { title: 'Atención al cliente', links: ['Centro de ayuda', 'Seguimiento de pedido', 'Devoluciones', 'Contáctanos'] },
            { title: 'Empresa', links: ['Sobre nosotros', 'Trabaja con nosotros', 'Afiliados', 'Blog'] },
            { title: 'Legal', links: ['Términos de uso', 'Política de privacidad', 'Cookies'] },
            { title: 'Síguenos', links: ['Instagram', 'TikTok', 'Facebook', 'Pinterest'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wide">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><Link to="#" className="hover:text-white transition-colors">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-600">
          <span>© 2024 MODASTORE. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><IconLock size={13} className="text-green-500" /> Pago seguro</span>
            <span className="flex items-center gap-1.5"><IconCreditCard size={13} className="text-blue-400" /> Visa · Mastercard · PayPhone</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
