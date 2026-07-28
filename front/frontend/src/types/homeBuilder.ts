export type HomeBlockType =
  | 'hero'
  | 'bannerCarousel'
  | 'categories'
  | 'products'
  | 'promo'
  | 'textImage'
  | 'spacer'
  | 'coupon'
  | 'countdown'
  | 'reviews'
  | 'benefits'
  | 'gallery'
  | 'whatsapp'
  | 'newsletter'

export interface HomeBlock {
  id: string
  type: HomeBlockType
  visible: boolean
  title: string
  subtitle: string
  buttonText: string
  link: string
  image: string
  background: string
  textColor: string
  accentColor: string
  productMode: 'new' | 'trending' | 'offers' | 'manual'
  productCount: number
  productIds: number[]
  height: number
  imagePosition: 'left' | 'right'
  textAlign: 'left' | 'center' | 'right'
  contentWidth: 'normal' | 'wide' | 'full'
  borderRadius: number
  overlayOpacity: number
  paddingY: number
  marginY: number
  shadow: 'none' | 'soft' | 'strong'
  animation: 'none' | 'fade' | 'slide' | 'zoom'
  hideMobile: boolean
  hideDesktop: boolean
  columns: number
  images: string[]
  endDate: string
  items: string[]
  // Bloque de categorías: filtro por grupo(s) y selección específica
  categoryGroup?: string        // Deprecated — mantener por compatibilidad
  categoryGroups?: string[]     // Grupos seleccionados: ['MUJER', 'HOMBRE', ...]. Vacío = todos
  categoryIds?: number[]        // Categorías específicas a mostrar (si vacío, muestra todas de los grupos)
  categoryMode?: 'auto' | 'manual'  // auto = todas de los grupos, manual = solo las seleccionadas
}

export interface HomeLayout {
  version: 1
  name: string
  templateId: string
  pageBackground: string
  fontFamily: 'elegant' | 'modern' | 'classic'
  announcement: string
  announcementBackground: string
  announcementColor: string
  globalTheme: {
    enabled: boolean
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    mutedText: string
    border: string
    buttonText: string
    radius: number
    decoration: 'none' | 'snow' | 'hearts' | 'confetti' | 'sparkles'
  }
  blocks: HomeBlock[]
}
