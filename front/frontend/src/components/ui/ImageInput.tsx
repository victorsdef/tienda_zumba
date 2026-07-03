import { useState, useRef } from 'react'
import api from '../../api/axios'

interface Props {
  value: string        // URL actual (puede ser vacío)
  onChange: (url: string) => void
  label?: string
}

export default function ImageInput({ value, onChange, label = 'Imagen' }: Props) {
  const [tab, setTab] = useState<'url' | 'file'>('url')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post<{ url: string }>('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(res.data.url)
    } catch {
      setError('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-gray-600 uppercase">{label}</label>

      {/* Tabs */}
      <div className="flex border border-gray-200 rounded overflow-hidden text-xs">
        <button type="button" onClick={() => setTab('url')}
          className={`flex-1 py-1.5 font-medium transition-colors ${tab === 'url' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
          URL externa
        </button>
        <button type="button" onClick={() => setTab('file')}
          className={`flex-1 py-1.5 font-medium transition-colors ${tab === 'file' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
          Subir archivo
        </button>
      </div>

      {tab === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="input-field"
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 transition-colors"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {uploading ? (
            <p className="text-sm text-gray-500 animate-pulse">Subiendo...</p>
          ) : (
            <>
              <p className="text-sm text-gray-500">Haz click para seleccionar una imagen</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · máx 10MB</p>
            </>
          )}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
          <img src={value} alt="preview" className="w-14 h-14 object-cover rounded" onError={e => (e.currentTarget.style.display = 'none')} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{value}</p>
            <button type="button" onClick={() => onChange('')} className="text-xs text-red-500 hover:underline mt-0.5">
              Quitar imagen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
