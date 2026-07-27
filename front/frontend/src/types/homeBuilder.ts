export type HomeBlockType = 'hero' | 'bannerCarousel' | 'categories' | 'products' | 'promo' | 'textImage' | 'spacer'

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
  productMode: 'new' | 'trending' | 'offers'
  productCount: number
  height: number
  imagePosition: 'left' | 'right'
  textAlign: 'left' | 'center' | 'right'
  contentWidth: 'normal' | 'wide' | 'full'
  borderRadius: number
  overlayOpacity: number
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
  blocks: HomeBlock[]
}
