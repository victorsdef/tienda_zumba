import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProductos, getProductosTrending } from '../api/productos'
import { getBannersPublic, type Banner } from '../api/banners'
import ProductCard from '../components/products/ProductCard'
import { ProductGridSkeleton } from '../components/ui/LoadingSkeleton'
import {
  IconTruck, IconRefresh, IconLock, IconGift, IconArrowRight,
  IconWoman, IconMan, IconKid, IconShoe, IconJewelry, IconLipstick,
} from '../components/ui/Icon'

const BANNERS_DEFAULT: Banner[] = [
  {
    id: 0, tag: 'Nueva Colección', titulo: 'ESTILO QUE TE DEFINE',
    subtitulo: 'Descubre las tendencias de la temporada', ctaTexto: 'VER COLECCIÓN',
    tipoDestino: 'CATALOGO', destinoValor: '', colorDesde: '#7d5c48', colorHasta: '#6b5040',
    orden: 0, activo: true,
  },
  {
    id: -1, tag: 'Sofia Couture EC', titulo: 'MODA PARA TODA LA FAMILIA',
    subtitulo: 'Mujer, hombre, niños y más — todo en un solo lugar', ctaTexto: 'COMPRAR AHORA',
    tipoDestino: 'CATALOGO', destinoValor: '', colorDesde: '#4a3728', colorHasta: '#7d5c48',
    orden: 1, activo: true,
  },
]

function buildLink(tipo: string, valor: string): string {
  switch (tipo) {
    case 'GENERO':    return `/catalogo?genero=${valor}`
    case 'CATEGORIA': return `/catalogo?categoriaId=${valor}`
    case 'PRODUCTO':  return `/producto/${valor}`
    case 'URL':       return valor || '/catalogo'
    default:          return '/catalogo'
  }
}

const ALL_GENEROS = [
  { genero: 'MUJER',      label: 'Mujer',      Icon: IconWoman,    link: '/catalogo?genero=MUJER',      color: 'text-pink-500'   },
  { genero: 'HOMBRE',     label: 'Hombre',     Icon: IconMan,      link: '/catalogo?genero=HOMBRE',     color: 'text-blue-500'   },
  { genero: 'NINO',       label: 'Niño/a',     Icon: IconKid,      link: '/catalogo?genero=NINO',       color: 'text-green-500'  },
  { genero: 'CALZADO',    label: 'Calzado',    Icon: IconShoe,     link: '/catalogo?genero=CALZADO',    color: 'text-yellow-500' },
  { genero: 'ACCESORIOS', label: 'Accesorios', Icon: IconJewelry,  link: '/catalogo?genero=ACCESORIOS', color: 'text-purple-500' },
  { genero: 'BELLEZA',    label: 'Belleza',    Icon: IconLipstick, link: '/catalogo?genero=BELLEZA',    color: 'text-rose-400'   },
]

const FEATURES = [
  { Icon: IconTruck,   title: 'Envío gratis',  desc: 'Desde $29',        color: 'text-blue-500' },
  { Icon: IconRefresh, title: 'Devolución',    desc: '30 días',          color: 'text-green-500' },
  { Icon: IconLock,    title: 'Pago seguro',   desc: '100% protegido',   color: 'text-purple-500' },
  { Icon: IconGift,    title: 'App exclusiva', desc: 'Más descuentos',   color: 'text-orange-500' },
]

function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const list = banners.length > 0 ? banners : BANNERS_DEFAULT

  useEffect(() => {
    if (list.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % list.length), 4000)
    return () => clearInterval(t)
  }, [list.length])

  const b = list[current] ?? list[0]

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(180px, 40vw, 280px)' }}>
      {/* Fondo gradiente siempre presente */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{ background: `linear-gradient(to right, ${b.colorDesde}, ${b.colorHasta})` }}
      />

      {/* Imagen a la derecha cuando existe */}
      {b.imagen && (
        <div className="absolute inset-y-0 right-0 w-1/2 md:w-[55%]">
          <img
            src={b.imagen}
            alt={b.titulo}
            className="w-full h-full object-cover"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 30%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%)' }}
          />
        </div>
      )}

      <div className="relative h-full flex items-center px-6 md:px-10 max-w-[1400px] mx-auto">
        <div className={`text-white ${b.imagen ? 'max-w-[45%] md:max-w-xs' : 'max-w-xs md:max-w-sm'}`}>
          {b.tag && <p className="text-xs md:text-sm font-bold mb-1 md:mb-2 opacity-90">{b.tag}</p>}
          <h2 className="text-xl md:text-3xl font-black leading-tight mb-2 md:mb-3">{b.titulo}</h2>
          {b.subtitulo && <p className="text-xs md:text-sm opacity-80 mb-3 md:mb-5">{b.subtitulo}</p>}
          {b.ctaTexto && (
            <Link
              to={buildLink(b.tipoDestino, b.destinoValor)}
              className="inline-block border-2 border-[#f5f0e8] text-[#f5f0e8] font-bold px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm hover:bg-[#f5f0e8] hover:text-[#7d5c48] transition-colors"
            >
              {b.ctaTexto}
            </Link>
          )}
        </div>
      </div>
      {list.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {list.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(c => (c - 1 + list.length) % list.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-lg">
            ‹
          </button>
          <button onClick={() => setCurrent(c => (c + 1) % list.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-lg">
            ›
          </button>
        </>
      )}
    </div>
  )
}

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <h2 className="text-base md:text-lg font-bold text-[#4a3728]">{title}</h2>
      {link && (
        <Link to={link} className="text-xs text-[#6b5040] hover:text-[#7d5c48] flex items-center gap-1">
          Ver todo <IconArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const { data: banners = [] } = useQuery({
    queryKey: ['banners-public'],
    queryFn: getBannersPublic,
  })
  // Mostrar siempre todos los géneros
  const catIcons = ALL_GENEROS

  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['productos', 'trending'],
    queryFn: () => getProductosTrending(10),
  })
  const { data: ofertas, isLoading: loadingOfertas } = useQuery({
    queryKey: ['productos', 'ofertas'],
    queryFn: () => getProductos({ size: 6 }),
  })

  return (
    <div className="bg-white">
      <HeroBanner banners={banners} />

      {/* Grupos de categorías — fondo crema, ancho completo */}
      <div className="bg-[#f5f0e8] py-4 md:py-6">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-6">
            {catIcons.map(({ label, Icon, link, color }) => (
              <Link key={label} to={link} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center group-hover:ring-2 group-hover:ring-[#7d5c48] transition-all group-hover:scale-105 shadow-sm">
                  <Icon size={30} className={color} />
                </div>
                <span className="text-xs md:text-sm text-center text-[#4a3728] font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Súper Ofertas */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:py-8">
        <SectionHeader title="Súper Ofertas" link="/catalogo?sort=precio,asc" />
        {loadingOfertas ? <ProductGridSkeleton count={6} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            {ofertas?.content.map(p => <ProductCard key={p.id} producto={p} compact />)}
          </div>
        )}
      </div>


      {/* Features — fondo crema, ancho completo */}
      <div className="bg-[#f5f0e8] py-6 md:py-8 px-4">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {FEATURES.map(({ Icon, title, desc, color }) => (
            <div key={title} className="flex flex-col items-center gap-1.5">
              <Icon size={28} className={color} />
              <p className="text-xs font-semibold text-[#4a3728] mt-1">{title}</p>
              <p className="text-[11px] text-[#8a7a6a]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
