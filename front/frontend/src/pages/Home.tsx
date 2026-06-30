import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCategorias } from '../api/categorias'
import { getProductos } from '../api/productos'
import ProductCard from '../components/products/ProductCard'
import { ProductGridSkeleton } from '../components/ui/LoadingSkeleton'
import {
  IconTruck, IconRefresh, IconLock, IconGift, IconArrowRight,
  IconWoman, IconMan, IconKid, IconShoe, IconSmartphone, IconCar,
  IconToy, IconJewelry, IconLipstick, IconBaby, IconBag,
  IconJacket, IconSport, IconHanger, IconUnderwear, IconDress,
} from '../components/ui/Icon'

const BANNERS = [
  {
    bg: 'from-pink-400 to-red-500',
    tag: '#WinterSale',
    title: 'AHORRA A LO GRANDE EN MÁS DE 600.000 ARTÍCULOS',
    sub: 'Los más vendidos con hasta 70% off',
    cta: 'COMPRAR AHORA',
    link: '/catalogo',
  },
  {
    bg: 'from-purple-500 to-pink-500',
    tag: 'Nueva Colección',
    title: 'TENDENCIAS DE LA TEMPORADA',
    sub: 'Descubre los estilos más nuevos',
    cta: 'VER COLECCIÓN',
    link: '/catalogo?sort=id,desc',
  },
]

const CAT_ICONS = [
  { label: 'Mujer',      Icon: IconWoman,      link: '/catalogo?nombre=mujer' },
  { label: 'Hombre',     Icon: IconMan,        link: '/catalogo?nombre=hombre' },
  { label: 'Infantil',   Icon: IconKid,        link: '/catalogo?nombre=niños' },
  { label: 'Zapatos',    Icon: IconShoe,       link: '/catalogo?nombre=zapatos' },
  { label: 'Celulares',  Icon: IconSmartphone, link: '/catalogo?nombre=celulares' },
  { label: 'Automotriz', Icon: IconCar,        link: '/catalogo?nombre=auto' },
  { label: 'Juguetes',   Icon: IconToy,        link: '/catalogo?nombre=juguetes' },
  { label: 'Joyería',    Icon: IconJewelry,    link: '/catalogo?nombre=joyeria' },
  { label: 'Belleza',    Icon: IconLipstick,   link: '/catalogo?nombre=belleza' },
  { label: 'Bebé',       Icon: IconBaby,       link: '/catalogo?nombre=bebe' },
  { label: 'Bolsos',     Icon: IconBag,        link: '/catalogo?nombre=bolsos' },
  { label: 'Chaquetas',  Icon: IconJacket,     link: '/catalogo?nombre=chaquetas' },
  { label: 'Deporte',    Icon: IconSport,      link: '/catalogo?nombre=deporte' },
  { label: 'Tops',       Icon: IconHanger,     link: '/catalogo?nombre=tops' },
  { label: 'Interior',   Icon: IconUnderwear,  link: '/catalogo?nombre=interior' },
  { label: 'Vestidos',   Icon: IconDress,      link: '/catalogo?nombre=vestidos' },
]

const FEATURES = [
  { Icon: IconTruck,   title: 'Envío gratis',  desc: 'Desde $29',        color: 'text-blue-500' },
  { Icon: IconRefresh, title: 'Devolución',    desc: '30 días',          color: 'text-green-500' },
  { Icon: IconLock,    title: 'Pago seguro',   desc: '100% protegido',   color: 'text-purple-500' },
  { Icon: IconGift,    title: 'App exclusiva', desc: 'Más descuentos',   color: 'text-orange-500' },
]

function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  const b = BANNERS[current]

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(180px, 40vw, 280px)' }}>
      <div className={`absolute inset-0 bg-gradient-to-r ${b.bg} transition-all duration-500`} />
      <div className="relative h-full flex items-center px-6 md:px-10 max-w-[1400px] mx-auto">
        <div className="text-white max-w-xs md:max-w-sm">
          <p className="text-xs md:text-sm font-bold mb-1 md:mb-2 opacity-90">{b.tag}</p>
          <h2 className="text-xl md:text-3xl font-black leading-tight mb-2 md:mb-3">{b.title}</h2>
          <p className="text-xs md:text-sm opacity-80 mb-3 md:mb-5">{b.sub}</p>
          <Link
            to={b.link}
            className="inline-block border-2 border-white text-white font-bold px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm hover:bg-white hover:text-red-500 transition-colors"
          >
            {b.cta}
          </Link>
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
      <button onClick={() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-lg">
        ‹
      </button>
      <button onClick={() => setCurrent(c => (c + 1) % BANNERS.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-lg">
        ›
      </button>
    </div>
  )
}

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
      {link && (
        <Link to={link} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
          Ver todo <IconArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const { data: nuevos, isLoading: loadingNuevos } = useQuery({
    queryKey: ['productos', 'nuevos'],
    queryFn: () => getProductos({ size: 10, sort: 'id,desc' }),
  })
  const { data: ofertas, isLoading: loadingOfertas } = useQuery({
    queryKey: ['productos', 'ofertas'],
    queryFn: () => getProductos({ size: 6 }),
  })

  return (
    <div className="bg-[#f5f5f5]">
      <HeroBanner />

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-3 md:py-4 space-y-3 md:space-y-4">

        {/* Category icon grid */}
        <div className="bg-white rounded p-3 md:p-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 md:gap-3">
            {CAT_ICONS.map(({ label, Icon, link }) => (
              <Link key={label} to={link} className="flex flex-col items-center gap-1 md:gap-1.5 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:ring-2 group-hover:ring-red-400 transition-all group-hover:scale-105">
                  <Icon size={28} />
                </div>
                <span className="text-[10px] md:text-[11px] text-center text-gray-600 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Categorías reales de la BD */}
        {categorias && categorias.length > 0 && (
          <div className="bg-white rounded p-3 md:p-4">
            <SectionHeader title="Categorías de la tienda" link="/catalogo" />
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {categorias.map(cat => (
                <Link key={cat.id} to={`/catalogo?categoriaId=${cat.id}`} className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center group-hover:ring-2 group-hover:ring-red-400 transition-all">
                    {cat.imagen
                      ? <img src={cat.imagen} alt={cat.nombre} className="w-full h-full object-cover" />
                      : <IconDress size={28} />
                    }
                  </div>
                  <span className="text-[10px] md:text-[11px] text-center text-gray-600 w-16 leading-tight truncate">{cat.nombre}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Súper Ofertas */}
        <div className="bg-white rounded p-3 md:p-4">
          <SectionHeader title="Súper Ofertas" link="/catalogo?sort=precio,asc" />
          {loadingOfertas ? <ProductGridSkeleton count={6} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
              {ofertas?.content.map(p => <ProductCard key={p.id} producto={p} compact />)}
            </div>
          )}
        </div>

        {/* Top Trends */}
        <div className="bg-white rounded p-3 md:p-4">
          <SectionHeader title="Top Trends" link="/catalogo?sort=id,desc" />
          {loadingNuevos ? <ProductGridSkeleton count={10} /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {nuevos?.content.map(p => <ProductCard key={p.id} producto={p} compact />)}
            </div>
          )}
        </div>

        {/* Promo banner */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Oferta exclusiva</p>
            <h3 className="text-xl md:text-2xl font-black mb-1">Envío GRATIS</h3>
            <p className="text-sm opacity-90">En tu primer pedido sin mínimo</p>
          </div>
          <Link to="/registro" className="bg-white text-red-500 font-bold px-5 md:px-6 py-2 rounded-sm text-sm hover:bg-gray-100 flex-shrink-0 self-start sm:self-auto">
            Registrarse ahora
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white rounded p-3 md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:divide-x md:divide-gray-100 text-center">
            {FEATURES.map(({ Icon, title, desc, color }) => (
              <div key={title} className="py-2 md:py-3 px-2 md:px-4 flex flex-col items-center gap-1">
                <Icon size={28} className={color} />
                <p className="text-xs font-semibold text-gray-800 mt-1">{title}</p>
                <p className="text-[11px] text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
