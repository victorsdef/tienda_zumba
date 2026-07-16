import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import api from '../../api/axios'
import { IconTrash, IconX, IconEdit } from './Icon'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  renderCropPreview?: (previewUrl: string) => React.ReactNode
  label?: string
  maxImages?: number
}

// Genera la imagen recortada como Blob usando canvas
async function cropToBlob(img: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const scaleX = img.naturalWidth / img.width
  const scaleY = img.naturalHeight / img.height
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height)
  return new Promise(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.92))
}

function initCrop(): Crop {
  return { unit: '%', x: 0, y: 0, width: 100, height: 100 }
}

// ──── Modal preview GIF (sin recorte) ────────────────────────────
interface GifPreviewModalProps {
  src: string
  blob: Blob
  filename: string
  onConfirm: (blob: Blob, filename: string) => void
  onClose: () => void
  renderCropPreview?: (previewUrl: string) => React.ReactNode
}

function GifPreviewModal({ src, blob, filename, onConfirm, onClose, renderCropPreview }: GifPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] sm:mx-4 sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Vista previa — GIF animado</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Los GIF no se pueden recortar — se suben con la animación completa</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX size={20} /></button>
        </div>

        {/* Cuerpo */}
        <div className={`flex-1 min-h-0 grid ${renderCropPreview ? 'sm:grid-cols-[1fr_1.4fr]' : 'grid-cols-1'}`}>
          {/* GIF */}
          <div className="flex items-center justify-center bg-gray-900 overflow-auto p-4">
            <img src={src} alt="gif preview" style={{ maxHeight: '60vh', maxWidth: '100%', display: 'block' }} />
          </div>
          {/* Preview banner */}
          {renderCropPreview && (
            <div className="flex flex-col min-h-0 border-l border-gray-200 bg-white">
              <div className="flex-shrink-0 px-4 py-2 border-b bg-white">
                <p className="text-xs font-semibold text-gray-500 uppercase">Así se verá</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 bg-[#faf7f2]">
                {renderCropPreview(src)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50">
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 hidden sm:block">
            ⚠ El recorte no está disponible para GIF animados
          </p>
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={onClose} className="btn-outline text-sm py-2 px-3">Cancelar</button>
            <button type="button" onClick={() => onConfirm(blob, filename)} className="btn-primary text-sm py-2 px-4">
              Subir GIF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──── Modal de recorte ────────────────────────────────────────────
interface CropModalProps {
  src: string
  filename: string
  onConfirm: (blob: Blob, filename: string) => void
  onClose: () => void
  renderCropPreview?: (previewUrl: string) => React.ReactNode
}

function CropModal({ src, filename, onConfirm, onClose, renderCropPreview }: CropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>(initCrop())
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState('')

  const onLoad = useCallback(() => {
    setCrop(initCrop())
  }, [])

  const updatePreview = useCallback((px: PixelCrop) => {
    if (!imgRef.current || !renderCropPreview) return
    try {
      const canvas = document.createElement('canvas')
      const img = imgRef.current
      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height
      canvas.width = px.width
      canvas.height = px.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, px.x * scaleX, px.y * scaleY, px.width * scaleX, px.height * scaleY, 0, 0, px.width, px.height)
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85))
    } catch {
      // imagen cross-origin no permite canvas export — preview no disponible
    }
  }, [renderCropPreview])

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return
    const blob = await cropToBlob(imgRef.current, completedCrop)
    onConfirm(blob, filename)
  }

  const ASPECTS = [
    { label: 'Libre', value: undefined },
    { label: '1:1', value: 1 },
    { label: '3:4', value: 3 / 4 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
  ]

  const [showPreviewTab, setShowPreviewTab] = useState(false)

  return (
    <div className="fixed inset-0 z-[200] flex flex-col sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:mx-4 sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-bold text-gray-800 text-sm">Recortar imagen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX size={20} /></button>
        </div>

        {/* Aspect ratio + toggle preview (mobile) */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 border-b overflow-x-auto">
          <span className="text-xs text-gray-500 font-medium flex-shrink-0">Prop:</span>
          {ASPECTS.map(a => (
            <button key={a.label} type="button"
              onClick={() => setAspect(a.value)}
              className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${aspect === a.value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600'}`}>
              {a.label}
            </button>
          ))}
          {/* Botón ver preview solo en mobile */}
          {renderCropPreview && (
            <button
              type="button"
              onClick={() => setShowPreviewTab(v => !v)}
              className={`sm:hidden flex-shrink-0 ml-auto px-2.5 py-1 rounded text-xs font-medium border transition-colors ${showPreviewTab ? 'bg-[#4a3728] text-white border-[#4a3728]' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              {showPreviewTab ? 'Ver recorte' : 'Ver preview'}
            </button>
          )}
        </div>

        {/* Cuerpo — crop + preview */}
        <div className={`flex-1 min-h-0 grid ${renderCropPreview ? 'sm:grid-cols-[1fr_1.4fr]' : 'grid-cols-1'}`}>

          {/* Área de recorte — oculta en mobile cuando se ve preview */}
          <div className={`flex items-center justify-center bg-gray-900 overflow-auto p-3 ${showPreviewTab ? 'hidden sm:flex' : 'flex'}`}>
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => { setCompletedCrop(c); updatePreview(c) }}
              aspect={aspect}
              minWidth={20}
              minHeight={20}
            >
              <img
                ref={imgRef}
                src={src}
                crossOrigin="anonymous"
                onLoad={onLoad}
                style={{ maxHeight: '60vh', maxWidth: '100%', display: 'block', objectFit: 'contain' }}
                alt="crop"
              />
            </ReactCrop>
          </div>

          {/* Preview — en mobile solo si se activó el toggle */}
          {renderCropPreview && (
            <div className={`border-gray-200 bg-white flex flex-col min-h-0 sm:border-l ${showPreviewTab ? 'flex' : 'hidden sm:flex'}`}>
              <div className="flex-shrink-0 px-4 py-2 border-b bg-white">
                <p className="text-xs font-semibold text-gray-500 uppercase">Así se verá</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 bg-[#faf7f2]">
                {previewUrl ? renderCropPreview(previewUrl) : (
                  <div className="flex h-full min-h-[140px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-4 text-center text-xs text-gray-400">
                    Mové el recorte para ver la vista previa
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50">
          <p className="text-xs text-gray-400 hidden sm:block">Arrastrá para seleccionar el área</p>
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={onClose} className="btn-outline text-sm py-2 px-3">Cancelar</button>
            <button type="button" onClick={handleConfirm} className="btn-primary text-sm py-2 px-4">
              Usar recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──── Componente principal ────────────────────────────────────────
export default function ImageManager({ value, onChange, renderCropPreview, label = 'Imágenes del producto', maxImages }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropFilename, setCropFilename] = useState('')
  const [gifPreview, setGifPreview] = useState<{ src: string; blob: Blob; filename: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlPreview, setUrlPreview] = useState('')
  const [urlError, setUrlError] = useState(false)
  const [tab, setTab] = useState<'file' | 'url'>('file')
  const [uploadError, setUploadError] = useState('')
  const [editIdx, setEditIdx] = useState<number | null>(null)

  // ── Selección de archivo → abre modal de crop (GIF sube directo) ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.type === 'image/gif') {
      // GIF: mostrar preview antes de subir
      const reader = new FileReader()
      reader.onload = ev => setGifPreview({ src: ev.target?.result as string, blob: file, filename: file.name })
      reader.readAsDataURL(file)
      return
    }

    setCropFilename(file.name)
    const reader = new FileReader()
    reader.onload = ev => setCropSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── Subida directa (sin crop) ─────────────────────────────────
  const uploadBlob = async (blob: Blob, filename: string, idx: number | null = null) => {
    setUploading(true)
    setUploadError('')
    try {
      const form = new FormData()
      form.append('file', blob, filename)
      const res = await api.post<{ url: string }>('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (idx !== null) {
        const next = [...value]
        next[idx] = res.data.url
        onChange(next)
      } else {
        onChange([...value, res.data.url])
      }
    } catch {
      setUploadError('Error al subir la imagen, intenta de nuevo')
    } finally {
      setUploading(false)
    }
  }

  // ── Tras confirmar crop → sube al backend ─────────────────────
  const handleCropConfirm = (blob: Blob, filename: string) => {
    const idx = editIdx
    setCropSrc(null)
    setEditIdx(null)
    uploadBlob(blob, filename, idx)
  }

  // ── Agregar URL — descarga en el backend para evitar CORS ────
  const addUrl = async () => {
    const url = urlInput.trim()
    if (!url) return
    setUploading(true)
    setUploadError('')
    try {
      const res = await api.post<{ url: string }>('/files/upload-url', { url })
      onChange([...value, res.data.url])
      setUrlInput('')
      setUrlPreview('')
    } catch {
      setUploadError('No se pudo descargar la imagen. Verifica la URL.')
    } finally {
      setUploading(false)
    }
  }

  const handleUrlKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addUrl() }
  }

  const handleUrlBlur = () => {
    if (urlInput.trim()) setUrlPreview(urlInput.trim())
  }

  const urlParecePagina = (url: string) => {
    if (!url) return false
    try {
      const { pathname } = new URL(url)
      const ext = pathname.split('.').pop()?.toLowerCase() ?? ''
      const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg']
      // si tiene extensión y NO es imagen → es página
      if (ext && ext.length <= 5 && !imageExts.includes(ext)) return true
      // si termina en .html, .php, etc.
      return ['html', 'htm', 'php', 'asp', 'aspx'].includes(ext)
    } catch { return false }
  }

  // ── Quitar imagen ─────────────────────────────────────────────
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  // ── Mover imagen ─────────────────────────────────────────────
  const move = (from: number, to: number) => {
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-600 uppercase">{label}</label>
        <span className="text-xs text-gray-400">{value.length}{maxImages ? `/${maxImages}` : ''} imagen{value.length !== 1 ? 'es' : ''}</span>
      </div>

      {/* Galería de imágenes actuales */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {value.map((url, idx) => (
              <div key={url + idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                {/* Overlay acciones */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  {idx > 0 && (
                    <button type="button" onClick={() => move(idx, idx - 1)}
                      className="text-white text-xs bg-black/50 rounded px-2 py-0.5 hover:bg-black/80">
                      ← Mover
                    </button>
                  )}
                  {idx < value.length - 1 && (
                    <button type="button" onClick={() => move(idx, idx + 1)}
                      className="text-white text-xs bg-black/50 rounded px-2 py-0.5 hover:bg-black/80">
                      Mover →
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button type="button"
                      onClick={() => { setEditIdx(idx); setCropSrc(url); setCropFilename(`imagen-${idx}.jpg`) }}
                      className="text-white bg-blue-500/80 rounded p-1 hover:bg-blue-600" title="Recortar">
                      <IconEdit size={14} />
                    </button>
                    <button type="button" onClick={() => remove(idx)}
                      className="text-white bg-red-500/80 rounded p-1 hover:bg-red-600">
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
                {/* Badge principal */}
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold rounded px-1 py-0.5">
                    PRINCIPAL
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tabs agregar */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button type="button" onClick={() => setTab('file')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === 'file' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
            Subir archivo
          </button>
          <button type="button" onClick={() => setTab('url')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === 'url' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
            Pegar URL
          </button>
        </div>

        {tab === 'file' ? (
          <div key="file" className="p-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-red-400 transition-colors"
            >
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Subiendo imagen...</p>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">Hacé click para seleccionar</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, GIF · Máx 10MB · GIF se sube sin recortar</p>
                </>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
          </div>
        ) : (
          <div key="url" className="p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={e => { setUrlInput(e.target.value); setUrlPreview(''); setUrlError(false) }}
                onBlur={handleUrlBlur}
                onKeyDown={handleUrlKey}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-400"
              />
              <button type="button" onClick={addUrl}
                disabled={!urlInput.trim() || uploading}
                className="px-4 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 disabled:opacity-40 whitespace-nowrap">
                {uploading ? 'Descargando...' : 'Agregar'}
              </button>
            </div>
            {urlParecePagina(urlInput) && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                Esa URL parece ser una página web, no una imagen. Usá el enlace directo al archivo (ej: termina en <strong>.jpg</strong>, <strong>.png</strong>, <strong>.webp</strong>).
              </p>
            )}

            {/* Preview de URL */}
            {urlPreview && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-1.5 text-xs text-gray-500 flex items-center justify-between">
                  <span>Vista previa</span>
                  <button type="button" onClick={() => { setUrlPreview(''); setUrlInput('') }} className="text-gray-400 hover:text-gray-600">
                    <IconX size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <img
                    src={urlPreview}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded border border-gray-100 flex-shrink-0"
                    onError={() => setUrlError(true)}
                    onLoad={() => setUrlError(false)}
                  />
                  <div className="min-w-0 flex-1">
                    {urlError ? (
                      <p className="text-xs text-red-500">No se pudo cargar la imagen. Verifica la URL.</p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 break-all line-clamp-2">{urlPreview}</p>
                        <button type="button" onClick={addUrl}
                          className="mt-2 text-xs text-red-500 font-medium hover:underline">
                          + Agregar esta imagen
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de recorte */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          filename={cropFilename}
          onConfirm={handleCropConfirm}
          onClose={() => setCropSrc(null)}
          renderCropPreview={renderCropPreview}
        />
      )}

      {/* Modal preview GIF */}
      {gifPreview && (
        <GifPreviewModal
          src={gifPreview.src}
          blob={gifPreview.blob}
          filename={gifPreview.filename}
          onConfirm={(blob, filename) => { setGifPreview(null); uploadBlob(blob, filename, editIdx); setEditIdx(null) }}
          onClose={() => setGifPreview(null)}
          renderCropPreview={renderCropPreview}
        />
      )}
    </div>
  )
}
