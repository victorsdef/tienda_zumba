import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getProductos, getProductosTrending } from '../../api/productos'
import ProductCard from '../../entities/product/ProductCard'
import type { HomeBlock, HomeLayout } from '../../types/homeBuilder'
import { getBannersPublic } from '../../api/banners'
import HeroBannerPreview from '../banners/HeroBannerPreview'
import api from '../../api/axios'
import rendererStyles from './HomeBuilderRenderer.module.scss'

interface Props {
  layout: HomeLayout
  preview?: boolean
}

const fonts = {
  elegant: 'Georgia, "Times New Roman", serif',
  modern: 'Inter, ui-sans-serif, system-ui, sans-serif',
  classic: '"Trebuchet MS", Arial, sans-serif',
}

function blockWidth(block: HomeBlock) {
  if (block.contentWidth === 'full') return 'max-w-none'
  if (block.contentWidth === 'wide') return 'max-w-[1500px]'
  return 'max-w-7xl'
}

function blockAlign(block: HomeBlock) {
  if (block.textAlign === 'center') return 'text-center items-center'
  if (block.textAlign === 'right') return 'text-right items-end'
  return 'text-left items-start'
}

function ProductsBlock({ block, preview }: { block: HomeBlock; preview: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ['home-builder-products', block.productMode, block.productCount],
    queryFn: () => block.productMode === 'trending'
      ? getProductosTrending(block.productCount)
      : getProductos({
          size: block.productMode === 'manual' ? 100 : block.productCount,
          sort: block.productMode === 'offers' ? 'precio,asc' : 'id,desc',
        }).then(result => block.productMode === 'manual'
          ? result.content.filter(product => (block.productIds ?? []).includes(product.id))
          : result.content),
  })
  const products = data ?? []

  return (
    <section style={{ background: block.background, color: block.textColor }} className={preview ? 'px-4 py-6' : 'px-4 py-12 md:px-8 md:py-16'}>
      <div className={`mx-auto ${blockWidth(block)}`} style={{ borderRadius: block.borderRadius, overflow: block.borderRadius ? 'hidden' : undefined }}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className={block.textAlign === 'center' ? 'text-center' : block.textAlign === 'right' ? 'text-right' : ''}>
            <h2 className={preview ? 'text-xl font-bold' : 'text-3xl font-bold'}>{block.title}</h2>
            {block.subtitle && <p className="mt-2 opacity-70">{block.subtitle}</p>}
          </div>
          {block.link && <Link to={block.link} style={{ color: block.accentColor }} className="text-sm font-bold">Ver todo →</Link>}
        </div>
        {isLoading ? (
          <div className="rounded-xl border border-dashed p-8 text-center opacity-50">Cargando productos…</div>
        ) : (
          <div className={`grid gap-3 ${preview ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
            {products.slice(0, preview ? 4 : block.productCount).map(product => (
              <div key={product.id} className="rounded-xl bg-white/95 p-1 text-gray-900 shadow-sm">
                <ProductCard producto={product} compact />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

interface FeaturedCoupon {
  codigo: string
  tipo: string
  valor: number
  montoMinimo: number
  fechaExpiracion: string
}

function CouponBlock({ block }: { block: HomeBlock }) {
  const { data: coupon } = useQuery({
    queryKey: ['featured-coupon'],
    queryFn: () => api.get<FeaturedCoupon>('/cupones/destacado').then(response => response.data),
    retry: false,
  })
  if (!coupon) return null
  const value = coupon.tipo === 'PORCENTAJE' ? `${coupon.valor}%` : `$${coupon.valor}`
  return (
    <section style={{ background: block.background, color: block.textColor }} className="px-5 py-10">
      <div className={`mx-auto flex flex-col items-center justify-between gap-5 border-2 border-dashed p-6 text-center md:flex-row md:text-left ${blockWidth(block)}`} style={{ borderColor: block.accentColor, borderRadius: block.borderRadius || 20 }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-60">Cupón activo</p>
          <h2 className="mt-2 text-3xl font-bold">{block.title || `Ahorra ${value}`}</h2>
          <p className="mt-2 opacity-75">{block.subtitle || (coupon.montoMinimo > 0 ? `Compra mínima de $${coupon.montoMinimo}` : 'Aplícalo en tu compra.')}</p>
        </div>
        <button type="button" onClick={() => navigator.clipboard?.writeText(coupon.codigo)} style={{ background: block.accentColor }} className="rounded-xl px-7 py-4 font-mono text-xl font-black tracking-[0.2em] text-white">
          {coupon.codigo}
        </button>
      </div>
    </section>
  )
}

function CountdownBlock({ block }: { block: HomeBlock }) {
  const calculate = () => {
    const difference = new Date(block.endDate).getTime() - Date.now()
    if (!block.endDate || difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(difference / 86_400_000),
      hours: Math.floor((difference / 3_600_000) % 24),
      minutes: Math.floor((difference / 60_000) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }
  const [time, setTime] = useState(calculate)
  useEffect(() => {
    const timer = window.setInterval(() => setTime(calculate()), 1000)
    return () => window.clearInterval(timer)
  }, [block.endDate])

  return (
    <section style={{ background: block.background, color: block.textColor }} className="px-4 py-12 text-center">
      <h2 className="text-3xl font-bold">{block.title || 'La promoción termina en'}</h2>
      {block.subtitle && <p className="mt-2 opacity-70">{block.subtitle}</p>}
      <div className="mx-auto mt-7 grid max-w-xl grid-cols-4 gap-2">
        {[
          ['Días', time.days],
          ['Horas', time.hours],
          ['Min', time.minutes],
          ['Seg', time.seconds],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white/15 p-3 backdrop-blur">
            <strong className="block text-3xl">{String(value).padStart(2, '0')}</strong>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

interface FeaturedReview {
  id: number
  nombreUsuario: string
  comentario: string
  calificacion: number
}

function ReviewsBlock({ block, preview }: { block: HomeBlock; preview: boolean }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['featured-reviews', block.productCount],
    queryFn: () => api.get<FeaturedReview[]>(`/resenas/destacadas?limit=${block.productCount}`).then(response => response.data),
  })
  return (
    <section style={{ background: block.background, color: block.textColor }} className="px-4 py-12">
      <div className={`mx-auto ${blockWidth(block)}`}>
        <h2 className={`text-3xl font-bold ${block.textAlign === 'center' ? 'text-center' : ''}`}>{block.title || 'Lo que dicen nuestras clientas'}</h2>
        <div className={`mt-7 grid gap-4 ${preview ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
          {reviews.map(review => (
            <article key={review.id} className="rounded-2xl bg-white p-5 text-gray-800 shadow-sm">
              <p style={{ color: block.accentColor }} className="tracking-widest">{'★'.repeat(review.calificacion)}{'☆'.repeat(5 - review.calificacion)}</p>
              <p className="mt-3 text-sm leading-relaxed">“{review.comentario}”</p>
              <p className="mt-4 text-xs font-bold uppercase text-gray-500">{review.nombreUsuario}</p>
            </article>
          ))}
          {reviews.length === 0 && <p className="text-sm opacity-50">Todavía no hay reseñas aprobadas para mostrar.</p>}
        </div>
      </div>
    </section>
  )
}

function BenefitsBlock({ block }: { block: HomeBlock }) {
  return (
    <section style={{ background: block.background, color: block.textColor }} className="px-4 py-10">
      <div className={`mx-auto grid gap-3 md:grid-cols-3 ${blockWidth(block)}`}>
        {(block.items ?? []).filter(Boolean).map((item, index) => (
          <div key={`${item}-${index}`} className="rounded-2xl border border-current/10 bg-white/10 p-5 text-center">
            <span style={{ color: block.accentColor }} className="text-2xl">✓</span>
            <p className="mt-2 font-bold">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function GalleryBlock({ block }: { block: HomeBlock }) {
  const columns = Math.max(1, Math.min(block.columns || 3, 4))
  return (
    <section style={{ background: block.background, color: block.textColor }} className="px-4 py-12">
      <div className={`mx-auto ${blockWidth(block)}`}>
        {block.title && <h2 className="mb-6 text-3xl font-bold">{block.title}</h2>}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {(block.images ?? []).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-square h-full w-full object-cover" style={{ borderRadius: block.borderRadius }} />)}
        </div>
      </div>
    </section>
  )
}

function WhatsAppBlock({ block }: { block: HomeBlock }) {
  const phone = block.link.replace(/\D/g, '') || '593983934596'
  return (
    <section style={{ background: block.background, color: block.textColor }} className="px-5 py-12 text-center">
      <h2 className="text-3xl font-bold">{block.title || '¿Necesitas ayuda?'}</h2>
      <p className="mt-2 opacity-75">{block.subtitle || 'Escríbenos y recibe atención personalizada.'}</p>
      <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded-full bg-[#25D366] px-7 py-3 font-bold text-white">Hablar por WhatsApp</a>
    </section>
  )
}

function NewsletterBlock({ block }: { block: HomeBlock }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('loading')
    try {
      await api.post('/newsletter', { email })
      setEmail('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }
  return (
    <section style={{ background: block.background, color: block.textColor }} className="px-5 py-14 text-center">
      <h2 className="text-3xl font-bold">{block.title || 'Recibe nuestras novedades'}</h2>
      <p className="mt-2 opacity-75">{block.subtitle || 'Colecciones, promociones y noticias de Sofia Couture.'}</p>
      <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-lg">
        <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Tu correo electrónico" className="min-w-0 flex-1 rounded-l-full border-0 px-5 py-3 text-gray-900 outline-none" />
        <button disabled={status === 'loading'} style={{ background: block.accentColor }} className="rounded-r-full px-6 py-3 font-bold text-white disabled:opacity-60">{status === 'loading' ? 'Guardando…' : 'Suscribirme'}</button>
      </form>
      {status === 'success' && <p className="mt-3 text-sm font-semibold">¡Gracias por suscribirte!</p>}
      {status === 'error' && <p className="mt-3 text-sm font-semibold text-red-500">No se pudo registrar el correo.</p>}
    </section>
  )
}

function CategoriesBlock({ block, preview }: { block: HomeBlock; preview: boolean }) {
  const { data: categories = [] } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })

  // Filtrado: grupo + modo (auto/manual)
  const filtradas = (() => {
    let base = categories
    if (block.categoryGroup) base = base.filter(c => c.genero === block.categoryGroup)
    if (block.categoryMode === 'manual' && (block.categoryIds ?? []).length > 0) {
      base = base.filter(c => (block.categoryIds ?? []).includes(c.id))
    }
    return base
  })()

  const cols = block.columns || (preview ? 3 : 6)
  const gridCols = preview
    ? cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'
    : cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : cols === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'

  return (
    <section style={{ background: block.background, color: block.textColor }} className={preview ? 'px-4 py-6' : 'px-4 py-12 md:px-8'}>
      <div className={`mx-auto ${blockWidth(block)}`} style={{ borderRadius: block.borderRadius, overflow: block.borderRadius ? 'hidden' : undefined }}>
        <h2 className={`${preview ? 'text-xl' : 'text-3xl'} font-bold ${block.textAlign === 'center' ? 'text-center' : block.textAlign === 'right' ? 'text-right' : ''}`}>{block.title}</h2>
        {block.subtitle && <p className="mt-2 opacity-70">{block.subtitle}</p>}
        {filtradas.length === 0 ? (
          <p className="mt-6 text-center text-sm opacity-60">No hay categorías para mostrar con estos filtros.</p>
        ) : (
          <div className={`mt-6 grid gap-3 ${gridCols}`}>
            {filtradas.slice(0, preview ? cols * 2 : 12).map(category => (
              <Link
                key={category.id}
                to={`/catalogo?categoriaId=${category.id}`}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white/80 p-3 text-center text-gray-900 transition-transform hover:-translate-y-1"
              >
                {category.imagen ? (
                  <img src={category.imagen} alt="" className="mx-auto mb-2 aspect-square w-full rounded-xl object-cover" />
                ) : (
                  <div style={{ background: block.accentColor }} className="mx-auto mb-2 aspect-square w-full rounded-xl opacity-20" />
                )}
                <span className="text-sm font-semibold">{category.nombre}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HeroBlock({ block, preview }: { block: HomeBlock; preview: boolean }) {
  return (
    <section
      className={`relative overflow-hidden ${preview ? 'min-h-72' : 'min-h-[520px]'}`}
      style={{ background: block.background, color: block.textColor }}
    >
      {block.image && <img src={block.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {block.image && <div className="absolute inset-0 bg-black" style={{ opacity: (block.overlayOpacity ?? 35) / 100 }} />}
      <div className={`relative z-10 mx-auto flex flex-col justify-center px-6 ${blockWidth(block)} ${blockAlign(block)} ${preview ? 'min-h-72 py-10' : 'min-h-[520px] py-20 md:px-12'}`} style={{ borderRadius: block.borderRadius }}>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] opacity-80">Sofia Couture EC</p>
        <h1 className={`max-w-3xl font-bold leading-tight ${preview ? 'text-3xl' : 'text-5xl md:text-7xl'}`}>{block.title}</h1>
        {block.subtitle && <p className={`mt-5 max-w-xl leading-relaxed ${preview ? 'text-sm' : 'text-lg'}`}>{block.subtitle}</p>}
        {block.buttonText && (
          <Link to={block.link || '/catalogo'} style={{ background: block.accentColor }} className="mt-7 w-fit rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg">
            {block.buttonText}
          </Link>
        )}
      </div>
    </section>
  )
}

function BannerCarouselBlock({ preview }: { preview: boolean }) {
  const { data: banners = [] } = useQuery({
    queryKey: ['banners-public'],
    queryFn: getBannersPublic,
  })
  const ordered = [...banners].sort((a, b) => a.orden - b.orden)
  const [current, setCurrent] = useState(0)
  const active = ordered[current] ?? ordered[0]

  useEffect(() => {
    if (preview || ordered.length <= 1) return
    const timer = window.setInterval(() => setCurrent(value => (value + 1) % ordered.length), 5000)
    return () => window.clearInterval(timer)
  }, [ordered.length, preview])

  useEffect(() => {
    if (current >= ordered.length) setCurrent(0)
  }, [current, ordered.length])

  if (!active) {
    return (
      <section className="bg-[#f5eee8] px-4 py-16 text-center text-sm text-[#7d5c48]">
        No hay banners activos. Crea uno en Administración → Banners.
      </section>
    )
  }

  const link = active.tipoDestino === 'GENERO'
    ? `/catalogo?genero=${active.destinoValor}`
    : active.tipoDestino === 'CATEGORIA'
      ? `/catalogo?categoriaId=${active.destinoValor}`
      : active.tipoDestino === 'PRODUCTO'
        ? `/producto/${active.destinoValor}`
        : active.tipoDestino === 'URL'
          ? active.destinoValor || '/catalogo'
          : '/catalogo'

  return (
    <section style={{ background: `linear-gradient(135deg, ${active.colorDesde || '#2f1f17'}, ${active.colorHasta || '#7d5c48'})` }}>
      <div className="w-full overflow-hidden">
        <HeroBannerPreview
          tag={active.tag}
          titulo={active.titulo}
          subtitulo={active.subtitulo}
          ctaTexto={active.ctaTexto}
          imagen={active.imagen}
          colorDesde={active.colorDesde}
          colorHasta={active.colorHasta}
          ctaHref={link}
          compact={preview}
        />
        {ordered.length > 1 && (
          <div className="-mt-8 relative z-10 flex justify-center gap-2 pb-4">
            {ordered.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Mostrar banner ${index + 1}`}
                className={`h-2.5 rounded-full shadow transition-all ${current === index ? 'w-7 bg-white' : 'w-2.5 bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PromoBlock({ block, preview }: { block: HomeBlock; preview: boolean }) {
  return (
    <section style={{ background: block.background, color: block.textColor, textAlign: block.textAlign, borderRadius: block.borderRadius }} className={`${preview ? 'px-5 py-8' : 'px-6 py-14'} ${block.textAlign === 'center' ? 'text-center' : block.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
      <h2 className={preview ? 'text-2xl font-bold' : 'text-4xl font-bold'}>{block.title}</h2>
      {block.subtitle && <p className="mx-auto mt-3 max-w-2xl opacity-80">{block.subtitle}</p>}
      {block.buttonText && <Link to={block.link || '/catalogo'} style={{ borderColor: block.accentColor }} className="mt-6 inline-block rounded-full border-2 px-6 py-2.5 font-bold">{block.buttonText}</Link>}
    </section>
  )
}

function TextImageBlock({ block, preview }: { block: HomeBlock; preview: boolean }) {
  const imageFirst = block.imagePosition === 'left'
  return (
    <section style={{ background: block.background, color: block.textColor }} className={preview ? 'p-4' : 'px-4 py-14 md:px-8'}>
      <div className={`mx-auto grid overflow-hidden border border-black/10 md:grid-cols-2 ${blockWidth(block)}`} style={{ borderRadius: block.borderRadius || 24 }}>
        <div className={`flex flex-col justify-center p-7 md:p-12 ${imageFirst ? 'md:order-2' : ''}`}>
          <h2 className={preview ? 'text-2xl font-bold' : 'text-4xl font-bold'}>{block.title}</h2>
          <p className="mt-4 leading-relaxed opacity-75">{block.subtitle}</p>
          {block.buttonText && <Link to={block.link || '/catalogo'} style={{ color: block.accentColor }} className="mt-6 font-bold">{block.buttonText} →</Link>}
        </div>
        <div className={`min-h-52 bg-black/5 ${imageFirst ? 'md:order-1' : ''}`}>
          {block.image ? <img src={block.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm opacity-40">Agrega una imagen</div>}
        </div>
      </div>
    </section>
  )
}

export default function HomeBuilderRenderer({ layout, preview = false }: Props) {
  return (
    <div style={{ background: layout.pageBackground, fontFamily: fonts[layout.fontFamily] }} className="min-h-full">
      {layout.announcement && (
        <div style={{ background: layout.announcementBackground, color: layout.announcementColor }} className="px-4 py-2.5 text-center text-xs font-bold tracking-wide">
          {layout.announcement}
        </div>
      )}
      {layout.blocks.filter(block => block.visible).map(block => {
        let content
        if (block.type === 'hero') content = <HeroBlock block={block} preview={preview} />
        else if (block.type === 'bannerCarousel') content = <BannerCarouselBlock preview={preview} />
        else if (block.type === 'categories') content = <CategoriesBlock block={block} preview={preview} />
        else if (block.type === 'products') content = <ProductsBlock block={block} preview={preview} />
        else if (block.type === 'promo') content = <PromoBlock block={block} preview={preview} />
        else if (block.type === 'textImage') content = <TextImageBlock block={block} preview={preview} />
        else if (block.type === 'coupon') content = <CouponBlock block={block} />
        else if (block.type === 'countdown') content = <CountdownBlock block={block} />
        else if (block.type === 'reviews') content = <ReviewsBlock block={block} preview={preview} />
        else if (block.type === 'benefits') content = <BenefitsBlock block={block} />
        else if (block.type === 'gallery') content = <GalleryBlock block={block} />
        else if (block.type === 'whatsapp') content = <WhatsAppBlock block={block} />
        else if (block.type === 'newsletter') content = <NewsletterBlock block={block} />
        else content = <div style={{ height: preview ? Math.min(block.height, 32) : block.height, background: block.background }} />

        const classes = [
          rendererStyles.block,
          block.hideMobile ? rendererStyles.hideMobile : '',
          block.hideDesktop ? rendererStyles.hideDesktop : '',
          block.shadow === 'soft' ? rendererStyles.shadowSoft : '',
          block.shadow === 'strong' ? rendererStyles.shadowStrong : '',
          block.animation === 'fade' ? rendererStyles.fade : '',
          block.animation === 'slide' ? rendererStyles.slide : '',
          block.animation === 'zoom' ? rendererStyles.zoom : '',
        ].filter(Boolean).join(' ')
        return <div key={block.id} className={classes} style={{ marginTop: block.marginY ?? 0, marginBottom: block.marginY ?? 0 }}>{content}</div>
      })}
    </div>
  )
}
