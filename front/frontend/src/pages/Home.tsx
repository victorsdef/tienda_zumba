import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProductos, getProductosTrending } from '@api/productos'
import { getBannersPublic, type Banner } from '@api/banners'
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

const CATEGORY_LINKS = [
  { label: 'Mujer', Icon: IconWoman, to: '/catalogo?genero=MUJER' },
  { label: 'Hombre', Icon: IconMan, to: '/catalogo?genero=HOMBRE' },
  { label: 'Niño/a', Icon: IconKid, to: '/catalogo?genero=NINO' },
  { label: 'Calzado', Icon: IconShoe, to: '/catalogo?genero=CALZADO' },
  { label: 'Accesorios', Icon: IconJewelry, to: '/catalogo?genero=ACCESORIOS' },
  { label: 'Belleza', Icon: IconLipstick, to: '/catalogo?genero=BELLEZA' },
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
  const { data: banners = [] } = useQuery({
    queryKey: ['banners-public'],
    queryFn: getBannersPublic,
  })

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

  return (
    <div className={styles.page}>
      <EditorialHero banners={bannersOrdenados} fallbackImage={fallbackHeroImage} />

      <section className={styles.categoriesSection}>
        <div className={styles.pageContainer}>
          <div className={styles.categoryGrid}>
            {CATEGORY_LINKS.map(({ label, Icon, to }) => (
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
            title="Nueva coleccion"
            subtitle="Una portada mas limpia, productos mas visibles y acceso directo al catalogo."
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
              <h2 className={styles.editorialTitle}>
                Una home mas elegante para que tu marca venda mejor.
              </h2>
              <p className={styles.editorialCopy}>
                Este estilo le da mas presencia a la portada, mejora la lectura del catalogo y hace que la tienda se sienta
                mas premium desde el primer vistazo.
              </p>
            </div>

            <div className={styles.editorialFooter}>
              <Link to="/catalogo" className={styles.catalogLink}>
                Ir al catalogo completo
                <IconChevronRight size={16} />
              </Link>
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>Look</p>
                  <p className={styles.statLabel}>Editorial</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>UX</p>
                  <p className={styles.statLabel}>Mas clara</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader
              title="Favoritos de la boutique"
              subtitle="Productos con mejor salida para empujar conversion desde el inicio."
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
            title="Precios para rotacion"
            subtitle="Selecciones rapidas para quienes llegan buscando oportunidad."
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
