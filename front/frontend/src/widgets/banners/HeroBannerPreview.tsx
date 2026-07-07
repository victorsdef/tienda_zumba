import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconLock, IconRefresh, IconShield } from '@shared/Icon'
import logo from '@assets/sofia_logo.svg'
import styles from './HeroBannerPreview.module.scss'

interface Props {
  tag?: string
  titulo: string
  subtitulo?: string
  ctaTexto?: string
  imagen?: string
  fallbackImage?: string
  colorDesde?: string
  colorHasta?: string
  ctaHref?: string
  compact?: boolean
  previewMode?: boolean
}

function resolveBannerImage(src?: string) {
  if (!src) return ''

  try {
    const normalized = src.trim()
    if (!normalized) return ''

    if (normalized.startsWith('/api/files/')) {
      return normalized
    }

    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      const url = new URL(normalized)
      if (url.pathname.startsWith('/api/files/')) {
        return `${url.pathname}${url.search}${url.hash}`
      }
      return normalized
    }

    if (normalized.startsWith('/')) {
      return normalized
    }

    return normalized
  } catch {
    return src
  }
}

export default function HeroBannerPreview({
  tag,
  titulo,
  subtitulo,
  ctaTexto,
  imagen,
  fallbackImage,
  colorDesde = '#2f1f17',
  colorHasta = '#7d5c48',
  ctaHref = '/catalogo',
  compact = false,
  previewMode = false,
}: Props) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const imageCandidates = useMemo(
    () => [resolveBannerImage(imagen), resolveBannerImage(fallbackImage)].filter(Boolean),
    [imagen, fallbackImage]
  )
  const imageUrl = imageCandidates[sourceIndex] || ''
  const showImage = Boolean(imageUrl)
  useEffect(() => {
    setSourceIndex(0)
  }, [imagen, fallbackImage])
  const shellStyle = showImage
    ? {
        backgroundImage: `linear-gradient(to right, rgba(43, 27, 21, 0.78), rgba(43, 27, 21, 0.28), rgba(43, 27, 21, 0.1)), url("${imageUrl}")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }
    : {
        background: `linear-gradient(135deg, ${colorDesde}, ${colorHasta})`,
      }

  const ctaNode = previewMode ? (
    <div className={`${styles.cta} ${compact ? styles.ctaCompact : ''}`}>{ctaTexto || 'Comprar ahora'}</div>
  ) : (
    <Link to={ctaHref} className={`${styles.cta} ${compact ? styles.ctaCompact : ''}`}>
      {ctaTexto || 'Comprar ahora'}
    </Link>
  )

  return (
    <div className={`${styles.root} ${compact ? styles.compactRoot : ''}`}>
      <div className={styles.topStripe}>
        Envios a todo Ecuador
      </div>
      <div className={styles.logoBar}>
        <div className={styles.logoWrap}>
          <img src={logo} alt="Sofia Couture EC" className={`${styles.logo} ${compact ? styles.logoCompact : ''}`} />
        </div>
      </div>
      <div
        className={`${styles.heroShell} ${compact ? styles.heroShellCompact : ''}`}
        style={shellStyle}
      >
        {showImage ? (
          <img
            src={imageUrl}
            alt={titulo}
            className="hidden"
            onError={() => {
              setSourceIndex(prev => {
                const next = prev + 1
                return next < imageCandidates.length ? next : prev
              })
            }}
          />
        ) : (
          <div className={styles.imageFallback} />
        )}

        <div className={styles.heroFrame}>
          <div className={`${styles.heroBody} ${compact ? styles.heroBodyCompact : ''}`}>
            <div className={`${styles.content} ${compact ? styles.contentCompact : ''}`}>
              {tag && <p className={`${styles.tag} ${compact ? styles.tagCompact : ''}`}>{tag}</p>}
              <p className={`${styles.brandTitle} ${compact ? styles.brandTitleCompact : ''}`}>Sofia</p>
              <p className={`${styles.brandSubtitle} ${compact ? styles.brandSubtitleCompact : ''}`}>Couture Pants</p>
              <p className={`${styles.title} ${compact ? styles.titleCompact : ''}`}>{titulo}</p>
              {subtitulo && <p className={`${styles.subtitle} ${compact ? styles.subtitleCompact : ''}`}>{subtitulo}</p>}
              {ctaNode}
            </div>
          </div>

          <div className={styles.featureStrip}>
            <div className={`${styles.featureGrid} ${compact ? styles.featureGridCompact : ''}`}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <IconRefresh size={18} />
                </div>
                <div>
                  <p className={styles.featureLabel}>Diseno exclusivo</p>
                  <p className={styles.featureText}>Piezas unicas y atemporales.</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <IconLock size={18} />
                </div>
                <div>
                  <p className={styles.featureLabel}>Pago seguro</p>
                  <p className={styles.featureText}>Checkout protegido y soporte post venta.</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <IconShield size={18} />
                </div>
                <div>
                  <p className={styles.featureLabel}>Calidad premium</p>
                  <p className={styles.featureText}>Confeccion de alta calidad.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
