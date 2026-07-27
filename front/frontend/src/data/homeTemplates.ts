import type { HomeBlock, HomeBlockType, HomeLayout } from '../types/homeBuilder'

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function createBlock(type: HomeBlockType, values: Partial<HomeBlock> = {}): HomeBlock {
  const defaults: HomeBlock = {
    id: id(),
    type,
    visible: true,
    title: '',
    subtitle: '',
    buttonText: 'Ver colección',
    link: '/catalogo',
    image: '',
    background: '#f7f1eb',
    textColor: '#2c1a10',
    accentColor: '#7d5c48',
    productMode: 'new',
    productCount: 4,
    height: 48,
    imagePosition: 'right',
  }
  return { ...defaults, ...values, id: id() }
}

const layout = (values: Partial<HomeLayout> & Pick<HomeLayout, 'name' | 'templateId'>): HomeLayout => ({
  version: 1,
  pageBackground: '#ffffff',
  fontFamily: 'elegant',
  announcement: '',
  announcementBackground: '#4a3728',
  announcementColor: '#ffffff',
  blocks: [],
  ...values,
})

export const HOME_TEMPLATES: HomeLayout[] = [
  layout({
    name: 'Diseño original',
    templateId: 'original',
    announcement: 'Envíos a todo Ecuador · Compra segura',
    blocks: [
      createBlock('hero', { title: 'Pantalones que realzan tu esencia', subtitle: 'Diseños elegantes para mujer, hombre y familia con una presencia más cuidada.', buttonText: 'Comprar ahora', background: '#4a3728', textColor: '#ffffff' }),
      createBlock('categories', { title: 'Compra por categoría', subtitle: 'Mujer, hombre, niños, calzado, accesorios y belleza.' }),
      createBlock('products', { title: 'Nueva colección', subtitle: 'Lo último que llegó a la boutique.', productMode: 'new' }),
      createBlock('textImage', {
        title: 'Moda que te hace sentir única en cada ocasión.',
        subtitle: 'Descubrí piezas pensadas para resaltar tu estilo. Envíos a todo Ecuador, atención personalizada y los mejores precios de la temporada.',
        buttonText: 'Ver catálogo completo',
        background: '#f5eee8',
      }),
      createBlock('products', { title: 'Favoritos de la boutique', subtitle: 'Los más elegidos por nuestras clientas.', productMode: 'trending' }),
      createBlock('products', { title: 'Precios irresistibles', subtitle: 'Las mejores piezas al mejor precio, solo por tiempo limitado.', productMode: 'offers', productCount: 8, background: '#f5eee8' }),
    ],
  }),
  layout({
    name: 'Navidad',
    templateId: 'christmas',
    pageBackground: '#fffaf3',
    announcement: '🎄 Navidad en Sofia Couture · Regalos con estilo',
    announcementBackground: '#8d1b22',
    blocks: [
      createBlock('hero', { title: 'Una Navidad para brillar', subtitle: 'Looks y regalos para celebrar momentos inolvidables.', buttonText: 'Comprar regalos', background: '#174b3a', textColor: '#ffffff', accentColor: '#d6b25e' }),
      createBlock('categories', { title: 'Regalos para todos', accentColor: '#8d1b22' }),
      createBlock('products', { title: 'Favoritos navideños', productMode: 'trending', accentColor: '#8d1b22' }),
      createBlock('promo', { title: 'El detalle perfecto está aquí', subtitle: 'Sorprende con moda esta Navidad.', background: '#8d1b22', textColor: '#ffffff', accentColor: '#d6b25e' }),
    ],
  }),
  layout({
    name: 'San Valentín',
    templateId: 'valentine',
    pageBackground: '#fff8fa',
    announcement: '💗 Celebra el amor con un look inolvidable',
    announcementBackground: '#9d294f',
    blocks: [
      createBlock('hero', { title: 'Enamórate de tu estilo', subtitle: 'Una colección creada para momentos especiales.', background: '#f5c9d7', accentColor: '#9d294f' }),
      createBlock('products', { title: 'Detalles que enamoran', productMode: 'trending', accentColor: '#9d294f' }),
      createBlock('promo', { title: 'Regala estilo', subtitle: 'Encuentra el obsequio perfecto.', background: '#9d294f', textColor: '#ffffff' }),
    ],
  }),
  layout({
    name: 'Día de la Madre',
    templateId: 'mothers',
    pageBackground: '#fffaf8',
    announcement: '🌷 Para mamá, todo el estilo que merece',
    announcementBackground: '#9a5d65',
    blocks: [
      createBlock('hero', { title: 'Celebremos a mamá', subtitle: 'Regalos elegantes para una mujer inolvidable.', background: '#efd9d5', accentColor: '#9a5d65' }),
      createBlock('categories', { title: 'Encuentra su regalo ideal' }),
      createBlock('products', { title: 'Elegidos para mamá', productMode: 'trending' }),
    ],
  }),
  layout({
    name: 'Black Friday',
    templateId: 'black-friday',
    pageBackground: '#111111',
    announcement: 'BLACK FRIDAY · Ofertas por tiempo limitado',
    announcementBackground: '#e11d2e',
    blocks: [
      createBlock('hero', { title: 'BLACK FRIDAY', subtitle: 'Los precios que estabas esperando.', buttonText: 'Ver ofertas', background: '#050505', textColor: '#ffffff', accentColor: '#e11d2e' }),
      createBlock('products', { title: 'Ofertas imperdibles', productMode: 'offers', productCount: 8, background: '#171717', textColor: '#ffffff', accentColor: '#e11d2e' }),
      createBlock('promo', { title: 'Últimas unidades', subtitle: 'Compra antes de que se agoten.', background: '#e11d2e', textColor: '#ffffff' }),
    ],
  }),
  layout({
    name: 'Verano',
    templateId: 'summer',
    pageBackground: '#fffdf5',
    announcement: '☀️ Nueva temporada · Fresca, ligera y llena de color',
    announcementBackground: '#e8793e',
    blocks: [
      createBlock('hero', { title: 'Vive el verano', subtitle: 'Prendas frescas para días llenos de sol.', background: '#f8d98b', accentColor: '#e8793e' }),
      createBlock('categories', { title: 'Estilos para disfrutar el sol' }),
      createBlock('products', { title: 'Esenciales de verano', productMode: 'new', accentColor: '#e8793e' }),
    ],
  }),
  layout({
    name: 'Liquidación',
    templateId: 'clearance',
    pageBackground: '#fffdf8',
    announcement: 'LIQUIDACIÓN · Hasta agotar existencias',
    announcementBackground: '#c61f2b',
    blocks: [
      createBlock('hero', { title: 'Precios de liquidación', subtitle: 'Tus favoritos ahora por mucho menos.', buttonText: 'Comprar ahora', background: '#ffd447', accentColor: '#c61f2b' }),
      createBlock('products', { title: 'Últimas oportunidades', productMode: 'offers', productCount: 8, accentColor: '#c61f2b' }),
    ],
  }),
]

export function cloneTemplate(template: HomeLayout): HomeLayout {
  return {
    ...template,
    blocks: template.blocks.map(block => ({ ...block, id: id() })),
  }
}
