import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getConfiguracion, updateConfiguracion } from '../../api/configuracion'
import ImageManager from '../../components/ui/ImageManager'
import { HOME_TEMPLATES, cloneTemplate, createBlock } from '../../data/homeTemplates'
import type { HomeBlock, HomeBlockType, HomeLayout } from '../../types/homeBuilder'
import HomeBuilderRenderer from '../../widgets/homeBuilder/HomeBuilderRenderer'
import { getProductos } from '../../api/productos'
import StorefrontTheme from '../../app/StorefrontTheme'

type Tab = 'templates' | 'editor' | 'preview'

const blockLabels: Record<HomeBlockType, string> = {
  hero: 'Banner personalizado',
  bannerCarousel: 'Carrusel de banners',
  categories: 'Categorías',
  products: 'Productos',
  promo: 'Franja promocional',
  textImage: 'Texto + imagen',
  spacer: 'Espacio',
  coupon: 'Cupón destacado',
  countdown: 'Cuenta regresiva',
  reviews: 'Reseñas',
  benefits: 'Beneficios',
  gallery: 'Galería',
  whatsapp: 'WhatsApp',
  newsletter: 'Suscripción',
}

const blockIcons: Record<HomeBlockType, string> = {
  hero: '▣',
  bannerCarousel: '▤',
  categories: '◉',
  products: '▦',
  promo: '★',
  textImage: '◫',
  spacer: '↕',
  coupon: '✂',
  countdown: '◷',
  reviews: '★',
  benefits: '✓',
  gallery: '▦',
  whatsapp: '◉',
  newsletter: '✉',
}

function parseLayout(raw: string | undefined): HomeLayout | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as HomeLayout
    if (parsed.version !== 1 || !Array.isArray(parsed.blocks)) return null
    if (!parsed.globalTheme) {
      parsed.globalTheme = {
        enabled: true,
        primary: parsed.announcementBackground || '#4a3728',
        secondary: '#7d5c48',
        accent: '#b78b72',
        background: parsed.pageBackground || '#faf7f3',
        surface: '#ffffff',
        text: '#2c1a10',
        mutedText: '#7d6c61',
        border: '#e4d9cf',
        buttonText: '#ffffff',
        radius: 12,
        decoration: 'none',
      }
    }
    return parsed
  } catch {
    return null
  }
}

function parseCustomTemplates(raw: string | undefined): HomeLayout[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as HomeLayout[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(item => parseLayout(JSON.stringify(item)))
      .filter((item): item is HomeLayout => item !== null)
  } catch {
    return []
  }
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1.5">
        <input type="color" value={value} onChange={event => onChange(event.target.value)} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent" />
        <input value={value} onChange={event => onChange(event.target.value)} className="min-w-0 flex-1 text-xs font-mono outline-none" />
      </div>
    </label>
  )
}

export default function AdminHomeEditor() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('templates')
  const [layout, setLayout] = useState<HomeLayout>(() => cloneTemplate(HOME_TEMPLATES[0]))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [message, setMessage] = useState('')
  const [templateSearch, setTemplateSearch] = useState('')

  const { data: config = [], isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: getConfiguracion,
  })
  const { data: productsData } = useQuery({
    queryKey: ['home-builder-product-options'],
    queryFn: () => getProductos({ size: 100, sort: 'id,desc' }),
  })
  const productOptions = productsData?.content ?? []
  const customTemplates = useMemo(
    () => parseCustomTemplates(config.find(item => item.clave === 'home_builder_plantillas')?.valor),
    [config]
  )
  const allTemplates = useMemo(() => [...HOME_TEMPLATES, ...customTemplates], [customTemplates])
  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().toLocaleLowerCase('es')
    if (!query) return allTemplates
    return allTemplates.filter(template => {
      const searchable = [
        template.name,
        template.templateId,
        template.announcement,
        ...template.blocks.flatMap(block => [
          blockLabels[block.type],
          block.title,
          block.subtitle,
          block.type === 'hero' || block.type === 'bannerCarousel' ? 'banner' : '',
          block.type === 'products' ? 'productos ofertas colección' : '',
        ]),
      ].join(' ').toLocaleLowerCase('es')
      return searchable.includes(query)
    })
  }, [allTemplates, templateSearch])

  useEffect(() => {
    if (initialized || config.length === 0) return
    const draft = parseLayout(config.find(item => item.clave === 'home_builder_borrador')?.valor)
    const published = parseLayout(config.find(item => item.clave === 'home_builder_publicado')?.valor)
    const initial = draft ?? published ?? cloneTemplate(HOME_TEMPLATES[0])
    setLayout(initial)
    setSelectedId(initial.blocks[0]?.id ?? null)
    setInitialized(true)
  }, [config, initialized])

  const saveMutation = useMutation({
    mutationFn: (next: HomeLayout) => updateConfiguracion('home_builder_borrador', JSON.stringify(next)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configuracion'] })
      setMessage('Borrador guardado')
      window.setTimeout(() => setMessage(''), 2500)
    },
  })

  const publishMutation = useMutation({
    mutationFn: async (next: HomeLayout) => {
      const json = JSON.stringify(next)
      await updateConfiguracion('home_builder_borrador', json)
      await updateConfiguracion('home_builder_publicado', json)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configuracion'] })
      qc.invalidateQueries({ queryKey: ['home-layout'] })
      setMessage('Diseño publicado en la tienda')
      window.setTimeout(() => setMessage(''), 3000)
    },
  })

  const customTemplatesMutation = useMutation({
    mutationFn: (templates: HomeLayout[]) => updateConfiguracion('home_builder_plantillas', JSON.stringify(templates)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configuracion'] })
    },
  })

  const selected = useMemo(
    () => layout.blocks.find(block => block.id === selectedId) ?? null,
    [layout.blocks, selectedId]
  )

  const patchLayout = (values: Partial<HomeLayout>) => setLayout(current => ({ ...current, ...values }))
  const patchTheme = (values: Partial<HomeLayout['globalTheme']>) => {
    setLayout(current => ({ ...current, globalTheme: { ...current.globalTheme, ...values } }))
  }
  const patchBlock = (id: string, values: Partial<HomeBlock>) => {
    setLayout(current => ({
      ...current,
      blocks: current.blocks.map(block => block.id === id ? { ...block, ...values } : block),
    }))
  }

  const selectTemplate = (template: HomeLayout) => {
    const next = cloneTemplate(template)
    setLayout(next)
    setSelectedId(next.blocks[0]?.id ?? null)
    setTab('editor')
    setMessage(`Plantilla “${template.name}” aplicada al borrador`)
    window.setTimeout(() => setMessage(''), 2500)
  }

  const saveAsTemplate = () => {
    const name = layout.name.trim() || 'Mi plantilla'
    const saved: HomeLayout = {
      ...cloneTemplate(layout),
      name,
      templateId: `custom-${Date.now()}`,
    }
    customTemplatesMutation.mutate([...customTemplates, saved], {
      onSuccess: () => {
        setMessage(`Plantilla “${name}” guardada`)
        window.setTimeout(() => setMessage(''), 2500)
      },
    })
  }

  const deleteCustomTemplate = (templateId: string) => {
    customTemplatesMutation.mutate(customTemplates.filter(template => template.templateId !== templateId))
  }

  const addBlock = (type: HomeBlockType) => {
    const presets: Partial<HomeBlock> = type === 'hero'
      ? { title: 'Nuevo banner personalizado', subtitle: 'Escribe aquí tu mensaje.' }
      : type === 'bannerCarousel'
        ? { title: 'Banners de la tienda', subtitle: 'Muestra automáticamente los banners activos.' }
      : type === 'products'
        ? { title: 'Productos destacados' }
        : type === 'categories'
          ? { title: 'Explora nuestras categorías' }
          : type === 'promo'
            ? { title: 'Promoción especial', subtitle: 'Agrega los detalles de tu promoción.' }
            : type === 'textImage'
              ? { title: 'Cuenta una historia', subtitle: 'Combina una imagen con un mensaje para tus clientes.' }
              : type === 'coupon'
                ? { title: 'Cupón especial', subtitle: 'Copia el código y úsalo en tu compra.' }
                : type === 'countdown'
                  ? { title: 'La promoción termina en', endDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 16), background: '#4a3728', textColor: '#ffffff' }
                  : type === 'reviews'
                    ? { title: 'Lo que dicen nuestras clientas', productCount: 6 }
                    : type === 'benefits'
                      ? { title: 'Compra con confianza', items: ['Envíos a todo Ecuador', 'Pago seguro', 'Atención personalizada'] }
                      : type === 'gallery'
                        ? { title: 'Inspiración Sofia Couture', images: [], columns: 3 }
                        : type === 'whatsapp'
                          ? { title: '¿Necesitas ayuda?', subtitle: 'Habla con una asesora.', link: '593983934596' }
                          : type === 'newsletter'
                            ? { title: 'Recibe nuestras novedades', subtitle: 'Colecciones y promociones directamente en tu correo.' }
              : {}
    const block = createBlock(type, presets)
    setLayout(current => ({ ...current, blocks: [...current.blocks, block] }))
    setSelectedId(block.id)
  }

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= layout.blocks.length) return
    setLayout(current => {
      const blocks = [...current.blocks]
      const [block] = blocks.splice(index, 1)
      blocks.splice(target, 0, block)
      return { ...current, blocks }
    })
  }

  const duplicateBlock = (block: HomeBlock) => {
    const copy = createBlock(block.type, block)
    const index = layout.blocks.findIndex(item => item.id === block.id)
    setLayout(current => {
      const blocks = [...current.blocks]
      blocks.splice(index + 1, 0, copy)
      return { ...current, blocks }
    })
    setSelectedId(copy.id)
  }

  const removeBlock = (id: string) => {
    setLayout(current => ({ ...current, blocks: current.blocks.filter(block => block.id !== id) }))
    if (selectedId === id) setSelectedId(null)
  }

  if (isLoading) return <div className="p-8 text-sm text-gray-500">Cargando editor…</div>

  return (
    <div className="min-h-screen bg-[#f4f1ed]">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Constructor del Home</h1>
            <p className="text-xs text-gray-500">Plantillas y edición libre por bloques</p>
          </div>
          <div className="flex items-center gap-2">
            {message && <span className="hidden text-xs font-semibold text-green-700 sm:inline">{message}</span>}
            <button onClick={() => saveMutation.mutate(layout)} disabled={saveMutation.isPending} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              {saveMutation.isPending ? 'Guardando…' : 'Guardar borrador'}
            </button>
            <button onClick={saveAsTemplate} disabled={customTemplatesMutation.isPending} className="rounded-lg border border-[#7d5c48] bg-[#faf7f2] px-4 py-2 text-sm font-semibold text-[#4a3728] hover:bg-[#f2e9df] disabled:opacity-50">
              Guardar como plantilla
            </button>
            <button onClick={() => publishMutation.mutate(layout)} disabled={publishMutation.isPending} className="rounded-lg bg-[#4a3728] px-4 py-2 text-sm font-semibold text-white hover:bg-[#35271d] disabled:opacity-50">
              {publishMutation.isPending ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {([
            ['templates', 'Plantillas'],
            ['editor', 'Editar libre'],
            ['preview', 'Vista previa'],
          ] as Array<[Tab, string]>).map(([value, label]) => (
            <button key={value} onClick={() => setTab(value)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tab === value ? 'bg-[#4a3728] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'templates' && (
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Elige un punto de partida</h2>
              <p className="mt-1 text-sm text-gray-500">Aplicar una plantilla reemplaza el borrador actual. La tienda no cambia hasta presionar Publicar.</p>
            </div>
            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-400">⌕</span>
                <input
                  type="search"
                  value={templateSearch}
                  onChange={event => setTemplateSearch(event.target.value)}
                  placeholder="Buscar Navidad, Cuenca, banner, ofertas…"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-gray-800 outline-none"
                />
                {templateSearch && (
                  <button type="button" onClick={() => setTemplateSearch('')} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100">
                    Limpiar
                  </button>
                )}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map(template => {
                const hero = template.blocks.find(block => block.type === 'hero')
                const isCustom = template.templateId.startsWith('custom-')
                const isBlank = template.templateId === 'blank'
                return (
                  <article key={template.templateId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div style={{ background: hero?.background ?? '#ffffff', color: hero?.textColor ?? '#4a3728' }} className="relative flex h-48 flex-col justify-end overflow-hidden border-b border-gray-100 p-6">
                      {hero?.image && <img src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
                      <div className="relative">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-70">{isCustom ? 'Mi plantilla' : isBlank ? 'Comenzar desde cero' : template.name}</p>
                        <h3 className="mt-2 text-3xl font-bold">{hero?.title ?? 'Lienzo en blanco'}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-bold text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.blocks.length} bloques editables</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCustom && <button onClick={() => deleteCustomTemplate(template.templateId)} className="rounded-lg border border-red-200 px-2.5 py-2 text-sm text-red-500" title="Eliminar plantilla">×</button>}
                        <button onClick={() => selectTemplate(template)} className="rounded-lg bg-[#4a3728] px-4 py-2 text-sm font-semibold text-white">Usar plantilla</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
            {filteredTemplates.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <p className="font-semibold text-gray-600">No encontramos plantillas para “{templateSearch}”.</p>
                <button type="button" onClick={() => setTemplateSearch('')} className="mt-3 text-sm font-semibold text-[#7d5c48]">Ver todas las plantillas</button>
              </div>
            )}
          </div>
        )}

        {tab === 'editor' && (
          <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-bold text-gray-900">Estilo general</h2>
                <label className="mb-3 block">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Nombre del diseño</span>
                  <input value={layout.name} onChange={event => patchLayout({ name: event.target.value })} className="input-field" />
                </label>
                <label className="mb-3 block">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Tipografía</span>
                  <select value={layout.fontFamily} onChange={event => patchLayout({ fontFamily: event.target.value as HomeLayout['fontFamily'] })} className="input-field">
                    <option value="elegant">Elegante</option>
                    <option value="modern">Moderna</option>
                    <option value="classic">Clásica</option>
                  </select>
                </label>
                <ColorField label="Fondo de página" value={layout.pageBackground} onChange={pageBackground => patchLayout({ pageBackground })} />
                <label className="mt-3 block">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Barra de anuncio</span>
                  <input value={layout.announcement} onChange={event => patchLayout({ announcement: event.target.value })} className="input-field" placeholder="Envíos a todo Ecuador" />
                </label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ColorField label="Fondo anuncio" value={layout.announcementBackground} onChange={announcementBackground => patchLayout({ announcementBackground })} />
                  <ColorField label="Texto anuncio" value={layout.announcementColor} onChange={announcementColor => patchLayout({ announcementColor })} />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Tema global</h2>
                    <p className="text-[11px] text-gray-500">Se aplica a toda la tienda pública.</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    Activar
                    <input type="checkbox" checked={layout.globalTheme.enabled} onChange={event => patchTheme({ enabled: event.target.checked })} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ColorField label="Principal" value={layout.globalTheme.primary} onChange={primary => patchTheme({ primary })} />
                  <ColorField label="Secundario" value={layout.globalTheme.secondary} onChange={secondary => patchTheme({ secondary })} />
                  <ColorField label="Destacado" value={layout.globalTheme.accent} onChange={accent => patchTheme({ accent })} />
                  <ColorField label="Fondo" value={layout.globalTheme.background} onChange={background => patchTheme({ background })} />
                  <ColorField label="Superficies" value={layout.globalTheme.surface} onChange={surface => patchTheme({ surface })} />
                  <ColorField label="Texto" value={layout.globalTheme.text} onChange={text => patchTheme({ text })} />
                  <ColorField label="Texto suave" value={layout.globalTheme.mutedText} onChange={mutedText => patchTheme({ mutedText })} />
                  <ColorField label="Bordes" value={layout.globalTheme.border} onChange={border => patchTheme({ border })} />
                </div>
                <label className="mt-3 block">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Redondeado global: {layout.globalTheme.radius}px</span>
                  <input type="range" min={0} max={28} value={layout.globalTheme.radius} onChange={event => patchTheme({ radius: Number(event.target.value) })} className="w-full" />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Decoración estacional</span>
                  <select value={layout.globalTheme.decoration} onChange={event => patchTheme({ decoration: event.target.value as HomeLayout['globalTheme']['decoration'] })} className="input-field">
                    <option value="none">Sin decoración</option>
                    <option value="snow">Copos de nieve</option>
                    <option value="hearts">Corazones</option>
                    <option value="confetti">Confeti</option>
                    <option value="sparkles">Destellos</option>
                  </select>
                </label>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-bold text-gray-900">Agregar bloque</h2>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(blockLabels) as HomeBlockType[]).map(type => (
                    <button key={type} onClick={() => addBlock(type)} className="rounded-xl border border-gray-200 p-3 text-left hover:border-[#7d5c48] hover:bg-[#faf7f2]">
                      <span className="text-lg">{blockIcons[type]}</span>
                      <span className="mt-1 block text-xs font-semibold text-gray-700">{blockLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <main className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Estructura de la página</h2>
                  <p className="text-xs text-gray-500">Selecciona un bloque para editarlo.</p>
                </div>
                <button onClick={() => setTab('preview')} className="text-sm font-semibold text-[#7d5c48]">Ver página completa →</button>
              </div>
              <div className="space-y-2">
                {layout.blocks.map((block, index) => (
                  <div key={block.id} onClick={() => setSelectedId(block.id)} className={`group flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${selectedId === block.id ? 'border-[#7d5c48] bg-[#faf7f2]' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div style={{ background: block.background, color: block.textColor }} className="flex h-12 w-14 flex-shrink-0 items-center justify-center rounded-lg text-xl">{blockIcons[block.type]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-800">{block.title || blockLabels[block.type]}</p>
                      <p className="text-xs text-gray-400">{blockLabels[block.type]} · {block.visible ? 'Visible' : 'Oculto'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={event => { event.stopPropagation(); moveBlock(index, -1) }} disabled={index === 0} className="rounded p-1.5 text-gray-400 hover:bg-white disabled:opacity-20">↑</button>
                      <button onClick={event => { event.stopPropagation(); moveBlock(index, 1) }} disabled={index === layout.blocks.length - 1} className="rounded p-1.5 text-gray-400 hover:bg-white disabled:opacity-20">↓</button>
                      <button onClick={event => { event.stopPropagation(); duplicateBlock(block) }} className="rounded p-1.5 text-gray-400 hover:bg-white" title="Duplicar">⧉</button>
                      <button onClick={event => { event.stopPropagation(); removeBlock(block.id) }} className="rounded p-1.5 text-red-400 hover:bg-red-50" title="Eliminar">×</button>
                    </div>
                  </div>
                ))}
                {layout.blocks.length === 0 && <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-sm text-gray-400">Agrega tu primer bloque desde el panel izquierdo.</div>}
              </div>
            </main>

            <aside className="min-w-0">
              {selected ? (
                <div className="sticky top-24 max-h-[calc(100vh-120px)] space-y-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#7d5c48]">{blockLabels[selected.type]}</p>
                      <h2 className="font-bold text-gray-900">Editar bloque</h2>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      Visible
                      <input type="checkbox" checked={selected.visible} onChange={event => patchBlock(selected.id, { visible: event.target.checked })} />
                    </label>
                  </div>

                  {selected.type !== 'spacer' && selected.type !== 'bannerCarousel' && (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Título</span>
                        <input value={selected.title} onChange={event => patchBlock(selected.id, { title: event.target.value })} className="input-field" />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Descripción</span>
                        <textarea value={selected.subtitle} onChange={event => patchBlock(selected.id, { subtitle: event.target.value })} rows={3} className="input-field resize-none" />
                      </label>
                    </>
                  )}

                  {['hero', 'promo', 'textImage'].includes(selected.type) && (
                    <>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Texto del botón</span>
                        <input value={selected.buttonText} onChange={event => patchBlock(selected.id, { buttonText: event.target.value })} className="input-field" />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Enlace</span>
                        <input value={selected.link} onChange={event => patchBlock(selected.id, { link: event.target.value })} className="input-field font-mono text-xs" />
                      </label>
                    </>
                  )}

                  {selected.type === 'products' && (
                    <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Contenido</span>
                        <select value={selected.productMode} onChange={event => patchBlock(selected.id, { productMode: event.target.value as HomeBlock['productMode'] })} className="input-field">
                          <option value="new">Nuevos</option>
                          <option value="trending">Favoritos</option>
                          <option value="offers">Ofertas</option>
                          <option value="manual">Selección manual</option>
                        </select>
                      </label>
                      <label>
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Cantidad</span>
                        <select value={selected.productCount} onChange={event => patchBlock(selected.id, { productCount: Number(event.target.value) })} className="input-field">
                          <option value={4}>4</option>
                          <option value={8}>8</option>
                          <option value={12}>12</option>
                        </select>
                      </label>
                    </div>
                    {selected.productMode === 'manual' && (
                      <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
                        {productOptions.map(product => {
                          const checked = (selected.productIds ?? []).includes(product.id)
                          return (
                            <label key={product.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => patchBlock(selected.id, {
                                  productIds: checked
                                    ? (selected.productIds ?? []).filter(id => id !== product.id)
                                    : [...(selected.productIds ?? []), product.id],
                                })}
                              />
                              <span className="min-w-0 truncate text-xs text-gray-700">{product.nombre}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                    </div>
                  )}

                  {['hero', 'textImage'].includes(selected.type) && (
                    <ImageManager
                      value={selected.image ? [selected.image] : []}
                      onChange={images => patchBlock(selected.id, { image: images.at(-1) ?? '' })}
                      label="Imagen del bloque"
                      maxImages={1}
                    />
                  )}

                  {selected.type === 'gallery' && (
                    <>
                      <ImageManager
                        value={selected.images ?? []}
                        onChange={images => patchBlock(selected.id, { images })}
                        label="Imágenes de la galería"
                      />
                      <label>
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Columnas</span>
                        <select value={selected.columns ?? 3} onChange={event => patchBlock(selected.id, { columns: Number(event.target.value) })} className="input-field">
                          <option value={1}>1 columna</option>
                          <option value={2}>2 columnas</option>
                          <option value={3}>3 columnas</option>
                          <option value={4}>4 columnas</option>
                        </select>
                      </label>
                    </>
                  )}

                  {selected.type === 'countdown' && (
                    <label>
                      <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Fecha de finalización</span>
                      <input type="datetime-local" value={selected.endDate ?? ''} onChange={event => patchBlock(selected.id, { endDate: event.target.value })} className="input-field" />
                    </label>
                  )}

                  {selected.type === 'benefits' && (
                    <label>
                      <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Beneficios, uno por línea</span>
                      <textarea
                        value={(selected.items ?? []).join('\n')}
                        onChange={event => patchBlock(selected.id, { items: event.target.value.split('\n') })}
                        rows={5}
                        className="input-field resize-none"
                      />
                    </label>
                  )}

                  {selected.type === 'whatsapp' && (
                    <label>
                      <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Número con código de país</span>
                      <input value={selected.link} onChange={event => patchBlock(selected.id, { link: event.target.value })} className="input-field" placeholder="593983934596" />
                    </label>
                  )}

                  {selected.type === 'textImage' && (
                    <label>
                      <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Posición de imagen</span>
                      <select value={selected.imagePosition} onChange={event => patchBlock(selected.id, { imagePosition: event.target.value as HomeBlock['imagePosition'] })} className="input-field">
                        <option value="left">Izquierda</option>
                        <option value="right">Derecha</option>
                      </select>
                    </label>
                  )}

                  {selected.type === 'spacer' && (
                    <label>
                      <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Altura: {selected.height}px</span>
                      <input type="range" min={8} max={200} value={selected.height} onChange={event => patchBlock(selected.id, { height: Number(event.target.value) })} className="w-full" />
                    </label>
                  )}

                  {selected.type !== 'spacer' && selected.type !== 'bannerCarousel' && (
                    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Diseño avanzado</p>
                      <div className="grid grid-cols-2 gap-2">
                        <label>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Alineación</span>
                          <select value={selected.textAlign ?? 'left'} onChange={event => patchBlock(selected.id, { textAlign: event.target.value as HomeBlock['textAlign'] })} className="input-field">
                            <option value="left">Izquierda</option>
                            <option value="center">Centro</option>
                            <option value="right">Derecha</option>
                          </select>
                        </label>
                        <label>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Ancho</span>
                          <select value={selected.contentWidth ?? 'normal'} onChange={event => patchBlock(selected.id, { contentWidth: event.target.value as HomeBlock['contentWidth'] })} className="input-field">
                            <option value="normal">Normal</option>
                            <option value="wide">Amplio</option>
                            <option value="full">Completo</option>
                          </select>
                        </label>
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Esquinas: {selected.borderRadius ?? 0}px</span>
                        <input type="range" min={0} max={48} value={selected.borderRadius ?? 0} onChange={event => patchBlock(selected.id, { borderRadius: Number(event.target.value) })} className="w-full" />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Sombra</span>
                          <select value={selected.shadow ?? 'none'} onChange={event => patchBlock(selected.id, { shadow: event.target.value as HomeBlock['shadow'] })} className="input-field">
                            <option value="none">Sin sombra</option>
                            <option value="soft">Suave</option>
                            <option value="strong">Intensa</option>
                          </select>
                        </label>
                        <label>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Animación</span>
                          <select value={selected.animation ?? 'none'} onChange={event => patchBlock(selected.id, { animation: event.target.value as HomeBlock['animation'] })} className="input-field">
                            <option value="none">Ninguna</option>
                            <option value="fade">Aparecer</option>
                            <option value="slide">Deslizar</option>
                            <option value="zoom">Acercar</option>
                          </select>
                        </label>
                      </div>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Margen vertical: {selected.marginY ?? 0}px</span>
                        <input type="range" min={0} max={120} value={selected.marginY ?? 0} onChange={event => patchBlock(selected.id, { marginY: Number(event.target.value) })} className="w-full" />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-xs font-semibold text-gray-600">
                          <input type="checkbox" checked={selected.hideMobile ?? false} onChange={event => patchBlock(selected.id, { hideMobile: event.target.checked })} />
                          Ocultar en celular
                        </label>
                        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-xs font-semibold text-gray-600">
                          <input type="checkbox" checked={selected.hideDesktop ?? false} onChange={event => patchBlock(selected.id, { hideDesktop: event.target.checked })} />
                          Ocultar en escritorio
                        </label>
                      </div>
                      {selected.type === 'hero' && (
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Oscurecer imagen: {selected.overlayOpacity ?? 35}%</span>
                          <input type="range" min={0} max={80} value={selected.overlayOpacity ?? 35} onChange={event => patchBlock(selected.id, { overlayOpacity: Number(event.target.value) })} className="w-full" />
                        </label>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <ColorField label="Fondo" value={selected.background} onChange={background => patchBlock(selected.id, { background })} />
                    <ColorField label="Texto" value={selected.textColor} onChange={textColor => patchBlock(selected.id, { textColor })} />
                  </div>
                  <ColorField label="Color destacado" value={selected.accentColor} onChange={accentColor => patchBlock(selected.id, { accentColor })} />
                  {selected.type === 'bannerCarousel' && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-700">
                      Este bloque toma automáticamente los banners activos de <strong>Administración → Banners</strong>. Edita allí sus imágenes, textos, colores, enlaces y orden.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">Selecciona un bloque para editar sus opciones.</div>
              )}
            </aside>
          </div>
        )}

        {tab === 'preview' && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-gray-800">Vista previa: {layout.name}</p>
                <p className="text-xs text-gray-500">Esta vista todavía no está publicada.</p>
              </div>
              <button onClick={() => setTab('editor')} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold">Volver a editar</button>
            </div>
            <StorefrontTheme themeOverride={layout.globalTheme}>
              <HomeBuilderRenderer layout={layout} preview />
            </StorefrontTheme>
          </div>
        )}
      </div>
    </div>
  )
}
