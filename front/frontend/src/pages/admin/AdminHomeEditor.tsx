import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getConfiguracion, updateConfiguracion } from '../../api/configuracion'
import ImageManager from '../../components/ui/ImageManager'
import { HOME_TEMPLATES, cloneTemplate, createBlock } from '../../data/homeTemplates'
import type { HomeBlock, HomeBlockType, HomeLayout } from '../../types/homeBuilder'
import HomeBuilderRenderer from '../../widgets/homeBuilder/HomeBuilderRenderer'

type Tab = 'templates' | 'editor' | 'preview'

const blockLabels: Record<HomeBlockType, string> = {
  hero: 'Portada principal',
  categories: 'Categorías',
  products: 'Productos',
  promo: 'Franja promocional',
  textImage: 'Texto + imagen',
  spacer: 'Espacio',
}

const blockIcons: Record<HomeBlockType, string> = {
  hero: '▣',
  categories: '◉',
  products: '▦',
  promo: '★',
  textImage: '◫',
  spacer: '↕',
}

function parseLayout(raw: string | undefined): HomeLayout | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as HomeLayout
    return parsed.version === 1 && Array.isArray(parsed.blocks) ? parsed : null
  } catch {
    return null
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

  const { data: config = [], isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: getConfiguracion,
  })

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

  const selected = useMemo(
    () => layout.blocks.find(block => block.id === selectedId) ?? null,
    [layout.blocks, selectedId]
  )

  const patchLayout = (values: Partial<HomeLayout>) => setLayout(current => ({ ...current, ...values }))
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

  const addBlock = (type: HomeBlockType) => {
    const presets: Partial<HomeBlock> = type === 'hero'
      ? { title: 'Nuevo banner principal', subtitle: 'Escribe aquí tu mensaje.' }
      : type === 'products'
        ? { title: 'Productos destacados' }
        : type === 'categories'
          ? { title: 'Explora nuestras categorías' }
          : type === 'promo'
            ? { title: 'Promoción especial', subtitle: 'Agrega los detalles de tu promoción.' }
            : type === 'textImage'
              ? { title: 'Cuenta una historia', subtitle: 'Combina una imagen con un mensaje para tus clientes.' }
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
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {HOME_TEMPLATES.map(template => {
                const hero = template.blocks.find(block => block.type === 'hero')
                return (
                  <article key={template.templateId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div style={{ background: hero?.background, color: hero?.textColor }} className="relative flex h-48 flex-col justify-end overflow-hidden p-6">
                      {hero?.image && <img src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
                      <div className="relative">
                        <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-70">{template.name}</p>
                        <h3 className="mt-2 text-3xl font-bold">{hero?.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-bold text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.blocks.length} bloques editables</p>
                      </div>
                      <button onClick={() => selectTemplate(template)} className="rounded-lg bg-[#4a3728] px-4 py-2 text-sm font-semibold text-white">Usar plantilla</button>
                    </div>
                  </article>
                )
              })}
            </div>
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

                  {selected.type !== 'spacer' && (
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
                    <div className="grid grid-cols-2 gap-2">
                      <label>
                        <span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Contenido</span>
                        <select value={selected.productMode} onChange={event => patchBlock(selected.id, { productMode: event.target.value as HomeBlock['productMode'] })} className="input-field">
                          <option value="new">Nuevos</option>
                          <option value="trending">Favoritos</option>
                          <option value="offers">Ofertas</option>
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
                  )}

                  {['hero', 'textImage'].includes(selected.type) && (
                    <ImageManager
                      value={selected.image ? [selected.image] : []}
                      onChange={images => patchBlock(selected.id, { image: images.at(-1) ?? '' })}
                      label="Imagen del bloque"
                      maxImages={1}
                    />
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

                  <div className="grid grid-cols-2 gap-2">
                    <ColorField label="Fondo" value={selected.background} onChange={background => patchBlock(selected.id, { background })} />
                    <ColorField label="Texto" value={selected.textColor} onChange={textColor => patchBlock(selected.id, { textColor })} />
                  </div>
                  <ColorField label="Color destacado" value={selected.accentColor} onChange={accentColor => patchBlock(selected.id, { accentColor })} />
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
            <HomeBuilderRenderer layout={layout} preview />
          </div>
        )}
      </div>
    </div>
  )
}
