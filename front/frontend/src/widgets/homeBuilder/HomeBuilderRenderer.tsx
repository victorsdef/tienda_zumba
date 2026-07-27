import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCategorias } from '../../api/categorias'
import { getProductos, getProductosTrending } from '../../api/productos'
import ProductCard from '../../entities/product/ProductCard'
import type { HomeBlock, HomeLayout } from '../../types/homeBuilder'
import { getBannersPublic } from '../../api/banners'
import HeroBannerPreview from '../banners/HeroBannerPreview'

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
          size: block.productCount,
          sort: block.productMode === 'offers' ? 'precio,asc' : 'id,desc',
        }).then(result => result.content),
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

function CategoriesBlock({ block, preview }: { block: HomeBlock; preview: boolean }) {
  const { data: categories = [] } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  return (
    <section style={{ background: block.background, color: block.textColor }} className={preview ? 'px-4 py-6' : 'px-4 py-12 md:px-8'}>
      <div className={`mx-auto ${blockWidth(block)}`} style={{ borderRadius: block.borderRadius, overflow: block.borderRadius ? 'hidden' : undefined }}>
        <h2 className={`${preview ? 'text-xl' : 'text-3xl'} font-bold ${block.textAlign === 'center' ? 'text-center' : block.textAlign === 'right' ? 'text-right' : ''}`}>{block.title}</h2>
        {block.subtitle && <p className="mt-2 opacity-70">{block.subtitle}</p>}
        <div className={`mt-6 grid gap-3 ${preview ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>
          {categories.slice(0, preview ? 6 : 12).map(category => (
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
    <section className={preview ? 'p-3' : 'px-4 py-8 md:px-8'}>
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl">
        <HeroBannerPreview
          tag={active.tag}
          titulo={active.titulo}
          subtitulo={active.subtitulo}
          ctaTexto={active.ctaTexto}
          imagen={active.imagen}
          colorDesde={active.colorDesde}
          colorHasta={active.colorHasta}
          ctaHref={link}
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
        if (block.type === 'hero') return <HeroBlock key={block.id} block={block} preview={preview} />
        if (block.type === 'bannerCarousel') return <BannerCarouselBlock key={block.id} preview={preview} />
        if (block.type === 'categories') return <CategoriesBlock key={block.id} block={block} preview={preview} />
        if (block.type === 'products') return <ProductsBlock key={block.id} block={block} preview={preview} />
        if (block.type === 'promo') return <PromoBlock key={block.id} block={block} preview={preview} />
        if (block.type === 'textImage') return <TextImageBlock key={block.id} block={block} preview={preview} />
        return <div key={block.id} style={{ height: preview ? Math.min(block.height, 32) : block.height, background: block.background }} />
      })}
    </div>
  )
}
