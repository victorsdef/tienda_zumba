import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfiguracion, updateConfiguracion } from '../../api/configuracion'
import { getCategorias } from '../../api/categorias'
import { getProductosAdmin } from '../../api/admin'

const CAMPOS_TEXTO = [
  {
    clave: 'home_editorial_titulo',
    label: 'Título principal',
    hint: 'Texto grande que aparece en el bloque central del home.',
    placeholder: 'Moda que te hace sentir única en cada ocasión.',
    multiline: false,
  },
  {
    clave: 'home_editorial_subtitulo',
    label: 'Descripción',
    hint: 'Párrafo debajo del título.',
    placeholder: 'Descubrí piezas pensadas para resaltar tu estilo...',
    multiline: true,
  },
  {
    clave: 'home_editorial_boton',
    label: 'Texto del botón',
    hint: 'Ej: "Ver catálogo completo", "Explorar colección".',
    placeholder: 'Ver catálogo completo',
    multiline: false,
  },
]

const DEFAULTS: Record<string, string> = {
  home_editorial_titulo:    'Moda que te hace sentir única en cada ocasión.',
  home_editorial_subtitulo: 'Descubrí piezas pensadas para resaltar tu estilo. Envíos a todo Ecuador, atención personalizada y los mejores precios de la temporada.',
  home_editorial_boton:     'Ver catálogo completo',
  home_editorial_link:      '/catalogo',
}

const TIPOS_DESTINO = [
  { value: 'CATALOGO',  label: 'Catálogo general',   desc: 'Lleva al catálogo completo' },
  { value: 'GENERO',    label: 'Por género',          desc: 'Filtra por género' },
  { value: 'CATEGORIA', label: 'Por categoría',       desc: 'Filtra por categoría' },
  { value: 'PRODUCTO',  label: 'Producto específico', desc: 'Abre un producto' },
  { value: 'URL',       label: 'URL personalizada',   desc: 'Ruta libre' },
]

const GENEROS = [
  { value: 'MUJER',      label: 'Mujer'      },
  { value: 'HOMBRE',     label: 'Hombre'     },
  { value: 'NINO',       label: 'Niño/a'     },
  { value: 'CALZADO',    label: 'Calzado'    },
  { value: 'ACCESORIOS', label: 'Accesorios' },
  { value: 'BELLEZA',    label: 'Belleza'    },
]

function buildLink(tipo: string, valor: string): string {
  switch (tipo) {
    case 'CATALOGO':  return '/catalogo'
    case 'GENERO':    return `/catalogo?genero=${valor}`
    case 'CATEGORIA': return `/catalogo?categoriaId=${valor}`
    case 'PRODUCTO':  return `/producto/${valor}`
    case 'URL':       return valor || '/catalogo'
    default:          return '/catalogo'
  }
}

function parseLink(link: string): { tipo: string; valor: string } {
  if (!link || link === '/catalogo') return { tipo: 'CATALOGO', valor: '' }
  const generoMatch = link.match(/[?&]genero=([^&]+)/)
  if (generoMatch) return { tipo: 'GENERO', valor: generoMatch[1] }
  const catMatch = link.match(/[?&]categoriaId=([^&]+)/)
  if (catMatch) return { tipo: 'CATEGORIA', valor: catMatch[1] }
  const prodMatch = link.match(/^\/producto\/(.+)/)
  if (prodMatch) return { tipo: 'PRODUCTO', valor: prodMatch[1] }
  return { tipo: 'URL', valor: link }
}

export default function AdminHomeEditor() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<string | null>(null)
  const [valor, setValor] = useState('')
  const [guardados, setGuardados] = useState<Set<string>>(new Set())

  // Estado del selector de destino
  const [tipoDestino, setTipoDestino] = useState('CATALOGO')
  const [destinoValor, setDestinoValor] = useState('')
  const [editandoDestino, setEditandoDestino] = useState(false)
  const [guardadoDestino, setGuardadoDestino] = useState(false)

  const { data: items = [] } = useQuery({ queryKey: ['configuracion'], queryFn: getConfiguracion })
  const { data: cats = [] } = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
  const { data: productosData } = useQuery({
    queryKey: ['admin-productos-banner'],
    queryFn: () => getProductosAdmin(0, 100),
  })
  const productos = productosData?.content ?? []

  const cfg = (clave: string) => items.find(i => i.clave === clave)?.valor ?? DEFAULTS[clave] ?? ''

  const linkActual = cfg('home_editorial_link')

  useEffect(() => {
    if (items.length > 0) {
      const parsed = parseLink(linkActual)
      setTipoDestino(parsed.tipo)
      setDestinoValor(parsed.valor)
    }
  }, [linkActual, items.length])

  const updateMut = useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: string }) => updateConfiguracion(clave, valor),
    onSuccess: (_, { clave }) => {
      qc.invalidateQueries({ queryKey: ['configuracion'] })
      setEditando(null)
      setGuardados(prev => new Set([...prev, clave]))
      setTimeout(() => setGuardados(prev => { const next = new Set(prev); next.delete(clave); return next }), 2500)
    },
  })

  const updateDestinoMut = useMutation({
    mutationFn: (link: string) => updateConfiguracion('home_editorial_link', link),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configuracion'] })
      setEditandoDestino(false)
      setGuardadoDestino(true)
      setTimeout(() => setGuardadoDestino(false), 2500)
    },
  })

  const abrir = (clave: string) => { setEditando(clave); setValor(cfg(clave)) }
  const guardar = () => { if (editando && valor.trim()) updateMut.mutate({ clave: editando, valor: valor.trim() }) }

  const abrirDestino = () => {
    const parsed = parseLink(linkActual)
    setTipoDestino(parsed.tipo)
    setDestinoValor(parsed.valor)
    setEditandoDestino(true)
  }

  const guardarDestino = () => {
    updateDestinoMut.mutate(buildLink(tipoDestino, destinoValor))
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Editor del Home</h1>
        <p className="text-sm text-gray-500 mt-1">Editá los textos del bloque editorial que aparece en la página principal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview en vivo */}
        <div className="lg:order-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vista previa</p>
          <div className="rounded-2xl border border-[#e8dfd5] bg-[#faf7f3] p-6 space-y-4 sticky top-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9c8a7a]">SOFIA COUTURE EC</p>
            <h2 className="text-2xl font-bold text-[#2c1a10] leading-snug">
              {cfg('home_editorial_titulo')}
            </h2>
            <p className="text-sm text-[#7d5c48] leading-relaxed">
              {cfg('home_editorial_subtitulo')}
            </p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#4a3728]">
              <span>{cfg('home_editorial_boton')}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-[10px] text-gray-400 font-mono border-t border-[#e8dfd5] pt-2">
              → {linkActual}
            </p>
          </div>
        </div>

        {/* Campos */}
        <div className="lg:order-1 space-y-3">
          {/* Campos de texto */}
          {CAMPOS_TEXTO.map(campo => {
            const estandoEditando = editando === campo.clave
            const guardado = guardados.has(campo.clave)
            const valorActual = cfg(campo.clave)

            return (
              <div
                key={campo.clave}
                className={`bg-white rounded-xl border transition-all ${estandoEditando ? 'border-[#7d5c48] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{campo.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{campo.hint}</p>
                    </div>
                    {!estandoEditando && (
                      <button
                        onClick={() => abrir(campo.clave)}
                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#7d5c48] hover:text-[#4a3728] border border-[#d9ccbb] hover:border-[#7d5c48] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    )}
                    {guardado && !estandoEditando && (
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Guardado
                      </span>
                    )}
                  </div>

                  {!estandoEditando ? (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 font-mono text-xs leading-relaxed line-clamp-3">
                      {valorActual}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {campo.multiline ? (
                        <textarea
                          value={valor}
                          onChange={e => setValor(e.target.value)}
                          rows={4}
                          className="w-full border border-[#c4b5a5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7d5c48] resize-none bg-[#faf7f3]"
                          placeholder={campo.placeholder}
                          autoFocus
                        />
                      ) : (
                        <input
                          type="text"
                          value={valor}
                          onChange={e => setValor(e.target.value)}
                          className="w-full border border-[#c4b5a5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7d5c48] bg-[#faf7f3]"
                          placeholder={campo.placeholder}
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') guardar(); if (e.key === 'Escape') setEditando(null) }}
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={guardar}
                          disabled={updateMut.isPending || !valor.trim()}
                          className="flex-1 bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-40"
                        >
                          {updateMut.isPending ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditando(null)}
                          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Selector de destino del botón */}
          <div className={`bg-white rounded-xl border transition-all ${editandoDestino ? 'border-[#7d5c48] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Destino del botón</p>
                  <p className="text-xs text-gray-400 mt-0.5">¿A dónde lleva el botón cuando el cliente hace click?</p>
                </div>
                {!editandoDestino && (
                  <button
                    onClick={abrirDestino}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#7d5c48] hover:text-[#4a3728] border border-[#d9ccbb] hover:border-[#7d5c48] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                )}
                {guardadoDestino && !editandoDestino && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardado
                  </span>
                )}
              </div>

              {!editandoDestino ? (
                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 font-mono">
                  {linkActual}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {TIPOS_DESTINO.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => { setTipoDestino(t.value); setDestinoValor('') }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                          tipoDestino === t.value
                            ? 'border-[#7d5c48] bg-[#faf7f2]'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          tipoDestino === t.value ? 'border-[#7d5c48]' : 'border-gray-300'
                        }`}>
                          {tipoDestino === t.value && <span className="w-2 h-2 rounded-full bg-[#7d5c48]" />}
                        </span>
                        <div>
                          <p className={`text-sm font-semibold ${tipoDestino === t.value ? 'text-[#4a3728]' : 'text-gray-700'}`}>{t.label}</p>
                          <p className="text-xs text-gray-400">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {tipoDestino === 'GENERO' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Género</label>
                      <div className="grid grid-cols-3 gap-2">
                        {GENEROS.map(g => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setDestinoValor(g.value)}
                            className={`py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${
                              destinoValor === g.value
                                ? 'border-[#7d5c48] bg-[#faf7f2] text-[#4a3728]'
                                : 'border-gray-100 text-gray-600 hover:border-gray-200'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {tipoDestino === 'CATEGORIA' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Categoría</label>
                      <select
                        value={destinoValor}
                        onChange={e => setDestinoValor(e.target.value)}
                        className="input-field"
                      >
                        <option value="">— Seleccionar categoría —</option>
                        {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                  )}

                  {tipoDestino === 'PRODUCTO' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Producto</label>
                      <select
                        value={destinoValor}
                        onChange={e => setDestinoValor(e.target.value)}
                        className="input-field"
                      >
                        <option value="">— Seleccionar producto —</option>
                        {productos.map(p => <option key={p.id} value={p.slug ?? String(p.id)}>{p.nombre}</option>)}
                      </select>
                    </div>
                  )}

                  {tipoDestino === 'URL' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">URL</label>
                      <input
                        type="text"
                        value={destinoValor}
                        onChange={e => setDestinoValor(e.target.value)}
                        className="w-full border border-[#c4b5a5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7d5c48] bg-[#faf7f3] font-mono"
                        placeholder="/catalogo?sort=precio,asc"
                      />
                    </div>
                  )}

                  <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">URL resultante</p>
                    <p className="text-xs font-mono text-gray-600 break-all">
                      {buildLink(tipoDestino, destinoValor)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={guardarDestino}
                      disabled={updateDestinoMut.isPending || (tipoDestino !== 'CATALOGO' && !destinoValor)}
                      className="flex-1 bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {updateDestinoMut.isPending ? 'Guardando...' : 'Guardar destino'}
                    </button>
                    <button
                      onClick={() => setEditandoDestino(false)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
