import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProductos, getProductosTrending } from '@api/productos'
import { getBannersPublic, type Banner } from '@api/banners'
import { getCategorias } from '../api/categorias'
import { getHomeLayout } from '../api/configuracion'
import HeroBannerPreview from '@widgets/banners/HeroBannerPreview'
import ProductCard from '@entities/product/ProductCard'
import { ProductGridSkeleton } from '@shared/LoadingSkeleton'
import {
  IconArrowRight,
  IconChevronRight,
  IconWoman,
  IconMan,
  IconKid,
  IconShoe,
  IconJewelry,
  IconLipstick,
} from '@shared/Icon'
import styles from './Home.module.scss'
import HomeBuilderRenderer from '../widgets/homeBuilder/HomeBuilderRenderer'
import type { HomeLayout } from '../types/homeBuilder'

const BANNERS_DEFAULT: Banner[] = [
  {
    id: 0,
    tag: 'Sofia Couture EC',
    titulo: 'Pantalones que realzan tu esencia',
    subtitulo: 'Diseños elegantes para mujer, hombre y familia con una presencia más cuidada.',
    ctaTexto: 'Comprar ahora',
    tipoDestino: 'CATALOGO',
    destinoValor: '',
    colorDesde: '#2f1f17',
    colorHasta: '#7d5c48',
    orden: 0,
    activo: true,
  },
]

const ALL_CATEGORY_LINKS = [
  { genero: 'MUJER',      label: 'Mujer',      Icon: IconWoman,    to: '/catalogo?genero=MUJER'      },
  { genero: 'HOMBRE',     label: 'Hombre',     Icon: IconMan,      to: '/catalogo?genero=HOMBRE'     },
  { genero: 'NINO',       label: 'Niño/a',     Icon: IconKid,      to: '/catalogo?genero=NINO'       },
  { genero: 'CALZADO',    label: 'Calzado',    Icon: IconShoe,     to: '/catalogo?genero=CALZADO'    },
  { genero: 'ACCESORIOS', label: 'Accesorios', Icon: IconJewelry,  to: '/catalogo?genero=ACCESORIOS' },
  { genero: 'BELLEZA',    label: 'Belleza',    Icon: IconLipstick, to: '/catalogo?genero=BELLEZA'    },
]

function buildLink(tipo: string, valor: string): string {
  switch (tipo) {
    case 'GENERO':
      return `/catalogo?genero=${valor}`
    case 'CATEGORIA':
      return `/catalogo?categoriaId=${valor}`
    case 'PRODUCTO':
      return `/producto/${valor}`
    case 'URL':
      return valor || '/catalogo'
    default:
      return '/catalogo'
  }
}

function getHeroImage(banner: Banner | undefined, fallbackImage?: string) {
  return banner?.imagen || fallbackImage || ''
}

function SectionHeader({
  title,
  subtitle,
  link,
  linkLabel = 'Ver todo',
}: {
  title: string
  subtitle?: string
  link?: string
  linkLabel?: string
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {link && (
        <Link to={link} className={styles.sectionLink}>
          {linkLabel}
          <IconArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

function EditorialHero({
  banners,
  fallbackImage,
}: {
  banners: Banner[]
  fallbackImage?: string
}) {
  const list = banners.length > 0 ? banners : BANNERS_DEFAULT
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (list.length <= 1) return
    const timer = window.setInterval(() => {
      setCurrent(prev => (prev + 1) % list.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [list.length])

  useEffect(() => {
    if (current >= list.length) setCurrent(0)
  }, [current, list.length])

  const activeBanner = list[current] ?? list[0]
  const heroImage = getHeroImage(activeBanner, fallbackImage)

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroFrame}>
        <HeroBannerPreview
          tag={activeBanner.tag}
          titulo={activeBanner.titulo}
          subtitulo={activeBanner.subtitulo}
          ctaTexto={activeBanner.ctaTexto}
          imagen={heroImage}
          fallbackImage={fallbackImage}
          colorDesde={activeBanner.colorDesde}
          colorHasta={activeBanner.colorHasta}
          ctaHref={buildLink(activeBanner.tipoDestino, activeBanner.destinoValor)}
        />
          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrent(prev => (prev - 1 + list.length) % list.length)}
                className={`${styles.heroNav} ${styles.heroNavPrev}`}
                aria-label="Banner anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setCurrent(prev => (prev + 1) % list.length)}
                className={`${styles.heroNav} ${styles.heroNavNext}`}
                aria-label="Siguiente banner"
              >
                ›
              </button>
              <div className={styles.heroDots}>
                {list.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setCurrent(index)}
                    className={`${styles.heroDot} ${index === current ? styles.heroDotActive : ''}`}
                    aria-label={`Ir al banner ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { data: publishedLayoutRaw = '' } = useQuery({
    queryKey: ['home-layout'],
    queryFn: getHomeLayout,
    staleTime: 60_000,
  })
  const { data: banners = [] } = useQuery({
    queryKey: ['banners-public'],
    queryFn: getBannersPublic,
  })

  const { data: cats = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })
  const generosActivos = new Set(cats.map(c => c.genero).filter(Boolean))
  const categoryLinks = ALL_CATEGORY_LINKS.filter(c => generosActivos.has(c.genero))

  const { data: coleccionData, isLoading: loadingColeccion } = useQuery({
    queryKey: ['home', 'coleccion'],
    queryFn: () => getProductos({ size: 4, sort: 'id,desc' }),
  })

  const { data: favoritos = [], isLoading: loadingFavoritos } = useQuery({
    queryKey: ['home', 'favoritos'],
    queryFn: () => getProductosTrending(4),
  })

  const { data: ofertasData, isLoading: loadingOfertas } = useQuery({
    queryKey: ['home', 'ofertas'],
    queryFn: () => getProductos({ size: 8, sort: 'precio,asc' }),
  })

  const editorialTitulo = 'Moda que te hace sentir única en cada ocasión.'
  const editorialSubtitulo = 'Descubrí piezas pensadas para resaltar tu estilo. Envíos a todo Ecuador, atención personalizada y los mejores precios de la temporada.'
  const editorialBoton = 'Ver catálogo completo'
  const editorialLink = '/catalogo'

  const coleccion = coleccionData?.content ?? []
  const ofertas = ofertasData?.content ?? []
  const fallbackHeroImage =
    coleccion.find(producto => producto.imagenes?.[0])?.imagenes?.[0] ||
    favoritos.find(producto => producto.imagenes?.[0])?.imagenes?.[0] ||
    ofertas.find(producto => producto.imagenes?.[0])?.imagenes?.[0]
  const bannersOrdenados = useMemo(
    () => (banners.length > 0 ? [...banners].sort((a, b) => a.orden - b.orden) : BANNERS_DEFAULT),
    [banners]
  )

  const publishedLayout = useMemo(() => {
    if (!publishedLayoutRaw) return null
    try {
      const parsed = JSON.parse(publishedLayoutRaw) as HomeLayout
      return parsed.version === 1 && Array.isArray(parsed.blocks) ? parsed : null
    } catch {
      return null
    }
  }, [publishedLayoutRaw])

  if (publishedLayout) {
    return <HomeBuilderRenderer layout={publishedLayout} />
  }

  return (
    <div className={styles.page}>
      <EditorialHero banners={bannersOrdenados} fallbackImage={fallbackHeroImage} />

      <section className={styles.categoriesSection}>
        <div className={styles.pageContainer}>
          <div className={styles.categoryGrid}>
            {categoryLinks.map(({ label, Icon, to }) => (
              <Link
                key={label}
                to={to}
                className={styles.categoryCard}
              >
                <div className={styles.categoryIconWrap}>
                  <Icon size={26} className={styles.categoryIcon} />
                </div>
                <div>
                  <p className={styles.categoryTitle}>{label}</p>
                  <p className={styles.categoryMeta}>Explorar</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.pageContainer}>
          <SectionHeader
            title="Nueva colección"
            subtitle="Las últimas piezas que llegaron a la tienda."
            link="/catalogo?sort=id,desc"
          />

          {loadingColeccion ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className={styles.productGridFour}>
              {coleccion.map(producto => (
                <div key={producto.id} className={styles.productCardMuted}>
                  <ProductCard producto={producto} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.splitSection}>
        <div className={styles.splitGrid}>
          <div className={styles.editorialCard}>
            <div>
              <p className={styles.eyebrow}>Sofia Couture EC</p>
              <h2 className={styles.editorialTitle}>{editorialTitulo}</h2>
              <p className={styles.editorialCopy}>{editorialSubtitulo}</p>
            </div>

            <div className={styles.editorialFooter}>
              <Link to={editorialLink} className={styles.catalogLink}>
                {editorialBoton}
                <IconChevronRight size={16} />
              </Link>
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <svg className={styles.statValue} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className={styles.statLabel}>Pago seguro</p>
                </div>
                <div className={styles.statCard}>
                  <svg className={styles.statValue} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 24, height: 24 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <p className={styles.statLabel}>Envío Ecuador</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader
              title="Favoritos de la boutique"
              subtitle="Los más elegidos por nuestras clientas."
              link="/catalogo"
            />
            {loadingFavoritos ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className={styles.productGridCompact}>
                {favoritos.map(producto => (
                  <div key={producto.id} className={styles.productCardMuted}>
                    <ProductCard producto={producto} compact />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.offersSection}>
        <div className={styles.pageContainer}>
          <SectionHeader
            title="Precios irresistibles"
            subtitle="Las mejores piezas al mejor precio, solo por tiempo limitado."
            link="/catalogo?sort=precio,asc"
            linkLabel="Ver ofertas"
          />

          {loadingOfertas ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className={styles.offerGrid}>
              {ofertas.map(producto => (
                <div key={producto.id} className={styles.productCardWhite}>
                  <ProductCard producto={producto} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
