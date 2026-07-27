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
    textAlign: 'left',
    contentWidth: 'normal',
    borderRadius: 0,
    overlayOpacity: 35,
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
    name: 'Plantilla vacía',
    templateId: 'blank',
    pageBackground: '#ffffff',
    announcement: '',
    blocks: [],
  }),
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
  layout({
    name: 'Carnaval de Ecuador',
    templateId: 'ecuador-carnival',
    pageBackground: '#fffdf4',
    announcement: '🎭 Carnaval · Color, alegría y mucho estilo',
    announcementBackground: '#6d28d9',
    blocks: [
      createBlock('hero', { title: 'Vive el Carnaval con estilo', subtitle: 'Looks llenos de color para disfrutar cada celebración.', buttonText: 'Ver colección', background: '#fbbf24', accentColor: '#db2777' }),
      createBlock('categories', { title: 'Colores para celebrar', accentColor: '#6d28d9' }),
      createBlock('products', { title: 'Favoritos de Carnaval', productMode: 'trending', accentColor: '#db2777' }),
      createBlock('promo', { title: 'Alegría que se lleva puesta', subtitle: 'Arma el look perfecto para este feriado.', background: '#0ea5e9', textColor: '#ffffff', accentColor: '#fbbf24' }),
    ],
  }),
  layout({
    name: 'Día de la Mujer',
    templateId: 'womens-day',
    pageBackground: '#fff9ff',
    announcement: '8 de marzo · Celebramos la fuerza y esencia de cada mujer',
    announcementBackground: '#7e3a8f',
    blocks: [
      createBlock('hero', { title: 'Mujeres que inspiran', subtitle: 'Estilo, confianza y autenticidad en cada pieza.', buttonText: 'Descubrir colección', background: '#ead8ef', accentColor: '#7e3a8f' }),
      createBlock('products', { title: 'Elegidos para ti', productMode: 'trending', accentColor: '#7e3a8f' }),
      createBlock('textImage', { title: 'Tu estilo cuenta tu historia', subtitle: 'Celebra quién eres con prendas que te hacen sentir única.', background: '#f6ecf8', accentColor: '#7e3a8f' }),
    ],
  }),
  layout({
    name: 'Día del Padre',
    templateId: 'fathers-day',
    pageBackground: '#f7fafc',
    announcement: 'Para papá · Regalos con personalidad',
    announcementBackground: '#1e3a5f',
    blocks: [
      createBlock('hero', { title: 'Un estilo tan único como papá', subtitle: 'Encuentra el regalo ideal para celebrar su día.', buttonText: 'Ver regalos', background: '#dce6ef', accentColor: '#1e3a5f' }),
      createBlock('categories', { title: 'Regalos para cada estilo' }),
      createBlock('products', { title: 'Favoritos para papá', productMode: 'trending', accentColor: '#1e3a5f' }),
    ],
  }),
  layout({
    name: 'Fiestas Patrias',
    templateId: 'ecuador-national',
    pageBackground: '#fffdf3',
    announcement: '🇪🇨 Ecuador celebra · Viste con orgullo nuestros colores',
    announcementBackground: '#174ea6',
    announcementColor: '#ffffff',
    blocks: [
      createBlock('hero', { title: 'Orgullo que se lleva puesto', subtitle: 'Celebremos Ecuador con estilo, identidad y alegría.', buttonText: 'Explorar colección', background: '#f8d447', textColor: '#153d75', accentColor: '#d62828' }),
      createBlock('categories', { title: 'Moda para celebrar Ecuador', accentColor: '#174ea6' }),
      createBlock('products', { title: 'Selección tricolor', productMode: 'new', accentColor: '#d62828' }),
      createBlock('promo', { title: '¡Que viva Ecuador!', subtitle: 'Envíos a todo el país.', background: '#174ea6', textColor: '#ffffff', accentColor: '#f8d447' }),
    ],
  }),
  layout({
    name: 'Independencia de Guayaquil',
    templateId: 'guayaquil-independence',
    pageBackground: '#f7fdff',
    announcement: '9 de octubre · Guayaquil celebra su independencia',
    announcementBackground: '#4aa8d8',
    blocks: [
      createBlock('hero', { title: 'Guayaquil, libre y con estilo', subtitle: 'Celebra a la Perla del Pacífico con una colección fresca y elegante.', buttonText: 'Ver colección', background: '#d9f3ff', accentColor: '#4aa8d8' }),
      createBlock('products', { title: 'Estilo guayaquileño', productMode: 'new', accentColor: '#4aa8d8' }),
      createBlock('promo', { title: '¡Viva Guayaquil!', subtitle: 'Moda para celebrar con orgullo.', background: '#4aa8d8', textColor: '#ffffff' }),
    ],
  }),
  layout({
    name: 'Independencia de Cuenca',
    templateId: 'cuenca-festivities',
    pageBackground: '#fffaf5',
    announcement: '3 de noviembre · Independencia de Cuenca',
    announcementBackground: '#b22234',
    blocks: [
      createBlock('hero', { title: 'Cuenca, tradición y elegancia', subtitle: 'Celebremos a nuestra ciudad con estilo y orgullo.', buttonText: 'Descubrir colección', background: '#f4e2cf', accentColor: '#b22234' }),
      createBlock('categories', { title: 'Estilo para las fiestas de Cuenca' }),
      createBlock('products', { title: 'Favoritos de la Atenas del Ecuador', productMode: 'trending', accentColor: '#b22234' }),
      createBlock('promo', { title: '¡Que viva Cuenca!', subtitle: 'Compra local y celebra con Sofia Couture EC.', background: '#b22234', textColor: '#ffffff', accentColor: '#f4c95d' }),
    ],
  }),
  layout({
    name: 'Fundación de Cuenca',
    templateId: 'cuenca-foundation',
    pageBackground: '#fffaf5',
    announcement: '12 de abril · Celebramos la Fundación de Cuenca',
    announcementBackground: '#9f1d35',
    blocks: [
      createBlock('hero', { title: 'Cuenca, historia que inspira', subtitle: 'Celebra la belleza, tradición y elegancia de nuestra ciudad.', buttonText: 'Ver colección', background: '#ead8c4', accentColor: '#9f1d35' }),
      createBlock('categories', { title: 'Estilo hecho para Cuenca', subtitle: 'Encuentra el look perfecto para sus fiestas.' }),
      createBlock('products', { title: 'Selección morlaca', productMode: 'new', accentColor: '#9f1d35' }),
      createBlock('promo', { title: 'Cuenca, patrimonio y estilo', subtitle: 'Compra local en estas fiestas de Fundación.', background: '#9f1d35', textColor: '#ffffff', accentColor: '#e8c36a' }),
    ],
  }),
  layout({
    name: 'Corpus Christi Cuenca',
    templateId: 'cuenca-corpus-christi',
    pageBackground: '#fffcf5',
    announcement: 'Corpus Christi · Tradición, luces y dulces de Cuenca',
    announcementBackground: '#69458b',
    blocks: [
      createBlock('hero', { title: 'Una tradición llena de color', subtitle: 'Celebra el Septenario con un estilo especial para compartir en familia.', buttonText: 'Descubrir selección', background: '#f1df9b', accentColor: '#69458b' }),
      createBlock('products', { title: 'Looks para el Septenario', productMode: 'trending', accentColor: '#69458b' }),
      createBlock('textImage', { title: 'Luces, dulces y tradición', subtitle: 'Una campaña inspirada en una de las celebraciones más queridas de Cuenca.', background: '#f7eed1', accentColor: '#69458b' }),
      createBlock('promo', { title: 'Vive Corpus Christi en Cuenca', subtitle: 'Moda para disfrutar cada noche de fiesta.', background: '#69458b', textColor: '#ffffff', accentColor: '#f1df9b' }),
    ],
  }),
  layout({
    name: 'Carnaval Cuencano',
    templateId: 'cuenca-carnival',
    pageBackground: '#fffdf5',
    announcement: 'Carnaval en Cuenca · Color y alegría para celebrar',
    announcementBackground: '#177e89',
    blocks: [
      createBlock('hero', { title: 'Carnaval con esencia cuencana', subtitle: 'Looks cómodos, alegres y llenos de color para disfrutar el feriado.', buttonText: 'Ver colección', background: '#f6d365', accentColor: '#e14d72' }),
      createBlock('categories', { title: 'Prepárate para el feriado' }),
      createBlock('products', { title: 'Favoritos para Carnaval', productMode: 'trending', accentColor: '#177e89' }),
      createBlock('promo', { title: 'Cuenca se llena de color', subtitle: 'Elige tu look y disfruta la fiesta.', background: '#177e89', textColor: '#ffffff', accentColor: '#f6d365' }),
    ],
  }),
  layout({
    name: 'Pase del Niño Viajero',
    templateId: 'cuenca-pase-nino',
    pageBackground: '#fffaf2',
    announcement: '24 de diciembre · Tradición cuencana en familia',
    announcementBackground: '#8d1b22',
    blocks: [
      createBlock('hero', { title: 'Tradición que une generaciones', subtitle: 'Una selección especial para compartir el Pase del Niño Viajero en familia.', buttonText: 'Ver selección', background: '#ead7b7', accentColor: '#8d1b22' }),
      createBlock('products', { title: 'Estilo para toda la familia', productMode: 'new', productCount: 8, accentColor: '#8d1b22' }),
      createBlock('textImage', { title: 'Cuenca vive su tradición', subtitle: 'Celebra con elegancia, respeto y alegría una fecha llena de identidad.', background: '#f5ead7', accentColor: '#8d1b22' }),
    ],
  }),
  layout({
    name: 'Fiestas de Quito',
    templateId: 'quito-festivities',
    pageBackground: '#fffaf2',
    announcement: '6 de diciembre · Quito celebra sus fiestas',
    announcementBackground: '#1f4f8a',
    blocks: [
      createBlock('hero', { title: 'Quito, luz de América', subtitle: 'Looks para celebrar a la Carita de Dios.', buttonText: 'Ver colección', background: '#f2d06b', textColor: '#18385f', accentColor: '#c62828' }),
      createBlock('products', { title: 'Estilo quiteño', productMode: 'trending', accentColor: '#1f4f8a' }),
      createBlock('promo', { title: '¡Viva Quito!', subtitle: 'Celebra sus fiestas con un look especial.', background: '#1f4f8a', textColor: '#ffffff', accentColor: '#f2d06b' }),
    ],
  }),
  layout({
    name: 'Regreso a clases Ecuador',
    templateId: 'back-to-school-ecuador',
    pageBackground: '#f7fbff',
    announcement: 'Regreso a clases · Todo listo para una nueva etapa',
    announcementBackground: '#2563a6',
    blocks: [
      createBlock('hero', { title: 'Vuelve con todo tu estilo', subtitle: 'Prendas, calzado y accesorios para comenzar el año escolar.', buttonText: 'Comprar ahora', background: '#dceeff', accentColor: '#2563a6' }),
      createBlock('categories', { title: 'Todo para volver a clases' }),
      createBlock('products', { title: 'Esenciales para el regreso', productMode: 'new', productCount: 8, accentColor: '#2563a6' }),
    ],
  }),
  layout({
    name: 'Semana Santa',
    templateId: 'holy-week',
    pageBackground: '#fffdf8',
    announcement: 'Semana Santa · Días para compartir en familia',
    announcementBackground: '#6b5744',
    blocks: [
      createBlock('hero', { title: 'Elegancia para momentos especiales', subtitle: 'Una selección sobria y delicada para compartir en familia.', buttonText: 'Ver selección', background: '#eee6dc', accentColor: '#8a6d4b' }),
      createBlock('products', { title: 'Selección de temporada', productMode: 'new', accentColor: '#8a6d4b' }),
      createBlock('textImage', { title: 'Tiempo de encuentro', subtitle: 'Estilo sereno para días de tradición y familia.', background: '#f5efe7', accentColor: '#8a6d4b' }),
    ],
  }),
  layout({
    name: 'Fin de año',
    templateId: 'new-year',
    pageBackground: '#080808',
    announcement: '✨ Fin de año · Brilla en cada celebración',
    announcementBackground: '#b78b2e',
    blocks: [
      createBlock('hero', { title: 'Despide el año brillando', subtitle: 'Looks elegantes para celebrar nuevos comienzos.', buttonText: 'Ver colección de fiesta', background: '#111111', textColor: '#ffffff', accentColor: '#c9a84c' }),
      createBlock('products', { title: 'Looks para celebrar', productMode: 'trending', background: '#171717', textColor: '#ffffff', accentColor: '#c9a84c' }),
      createBlock('promo', { title: 'Tu mejor look comienza aquí', subtitle: 'Prepárate para una noche inolvidable.', background: '#b78b2e', textColor: '#ffffff' }),
    ],
  }),
]

export function cloneTemplate(template: HomeLayout): HomeLayout {
  return {
    ...template,
    blocks: template.blocks.map(block => ({ ...block, id: id() })),
  }
}
