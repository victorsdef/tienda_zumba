import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRetiroInfo } from '../../api/configuracion'
import { IconLock, IconCreditCard, IconInstagram, IconTikTok, IconFacebook } from '@shared/Icon'
import styles from './Footer.module.scss'

const IconPinterest = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
)

export default function Footer() {
  const { data: retiro } = useQuery({ queryKey: ['retiro-info'], queryFn: getRetiroInfo, staleTime: 5 * 60_000 })
  const socials = [
    { href: retiro?.social_instagram, Icon: IconInstagram, label: 'Instagram' },
    { href: retiro?.social_tiktok,    Icon: IconTikTok,    label: 'TikTok' },
    { href: retiro?.social_facebook,  Icon: IconFacebook,  label: 'Facebook' },
    { href: retiro?.social_pinterest, Icon: IconPinterest, label: 'Pinterest' },
  ].filter(s => s.href && s.href.trim())
  const whatsappNum = (retiro?.retiro_whatsapp ?? '593983934596').replace(/\D/g, '')

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandBlock}>
            <h3 className={styles.brandTitle}>sofia couture ec</h3>
            <p className={styles.brandCopy}>Moda online con los mejores precios y las últimas tendencias.</p>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              +{whatsappNum.replace(/^(\d{3})(\d{2})(\d{3})(\d{4}).*/, '$1 $2 $3 $4')}
            </a>
            {socials.length > 0 && (
              <div className={styles.socials}>
                {socials.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label} className={styles.socialLink}>
                    <s.Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>
          {[
            { title: 'Atención al cliente', links: [{ label: 'Centro de ayuda', to: '#' }, { label: 'Seguimiento de pedido', to: '#' }, { label: 'Devoluciones', to: '#' }, { label: 'Contáctanos', to: '#' }] },
            { title: 'Empresa', links: [{ label: 'Sobre nosotros', to: '#' }, { label: 'Trabaja con nosotros', to: '#' }, { label: 'Afiliados', to: '#' }, { label: 'Blog', to: '#' }] },
            { title: 'Legal', links: [{ label: 'Términos de uso', to: '#' }, { label: 'Política de privacidad', to: '#' }, { label: 'Cookies', to: '#' }] },
            { title: 'Síguenos', links: [
              { label: 'Instagram', to: retiro?.social_instagram },
              { label: 'TikTok', to: retiro?.social_tiktok },
              { label: 'Facebook', to: retiro?.social_facebook },
              { label: 'Pinterest', to: retiro?.social_pinterest },
            ].filter(l => l.to) as { label: string; to: string }[] },
          ].map(col => (
            <div key={col.title}>
              <h4 className={styles.columnTitle}>{col.title}</h4>
              <ul className={styles.linkList}>
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.to?.startsWith('http')
                      ? <a href={l.to} target="_blank" rel="noopener noreferrer" className={styles.columnLink}>{l.label}</a>
                      : <Link to={l.to || '#'} className={styles.columnLink}>{l.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <span>© 2025 Sofia Couture EC. Todos los derechos reservados.</span>
          <div className={styles.payments}>
            <span className={styles.paymentItem}><IconLock size={13} className={styles.secureIcon} /> Pago seguro</span>
            <span className={styles.paymentItem}><IconCreditCard size={13} className={styles.cardIcon} /> Visa · Mastercard · PayPhone</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
