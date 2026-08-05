import { useEffect, useMemo, useRef, useState } from 'react'
import type { Categoria } from '../../types'

interface Props {
  categorias: Categoria[]
  value?: number | null
  onChange: (id: number | undefined) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function CategoriaCombobox({
  categorias,
  value,
  onChange,
  placeholder = 'Buscar categoría…',
  disabled = false,
  required = false,
  className = '',
}: Props) {
  const seleccionada = categorias.find(c => c.id === value)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtradas = useMemo(() => {
    const q = norm(query.trim())
    const base = q === ''
      ? categorias
      : categorias.filter(c => norm(c.nombre).includes(q))
    const arr = [...base].sort((a, b) => {
      const na = norm(a.nombre), nb = norm(b.nombre)
      const aPref = na.startsWith(q) ? 0 : 1
      const bPref = nb.startsWith(q) ? 0 : 1
      if (aPref !== bPref) return aPref - bPref
      return na.localeCompare(nb)
    })
    return arr.slice(0, 5)
  }, [query, categorias])

  useEffect(() => setHighlight(0), [query, open])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const seleccionar = (c: Categoria) => {
    onChange(c.id)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const limpiar = () => {
    onChange(undefined)
    setQuery('')
    inputRef.current?.focus()
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight(h => Math.min(h + 1, filtradas.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && filtradas[highlight]) {
        e.preventDefault()
        seleccionar(filtradas[highlight])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {seleccionada ? (
        <div className="flex items-center gap-2 border border-[#e2d9ce] rounded-lg px-2.5 py-2 bg-white">
          <span className="flex-1 text-sm text-[#2c1a10] truncate">{seleccionada.nombre}</span>
          {!disabled && (
            <button
              type="button"
              onClick={limpiar}
              className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none w-5 h-5 flex items-center justify-center rounded hover:bg-red-50"
              aria-label="Limpiar categoría"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          disabled={disabled}
          aria-required={required}
          className="w-full border border-[#e2d9ce] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7d5c48] text-[#2c1a10] placeholder:text-gray-400 bg-white disabled:opacity-50"
        />
      )}

      {open && !seleccionada && filtradas.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#e2d9ce] rounded-lg shadow-lg max-h-64 overflow-auto">
          {filtradas.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => seleccionar(c)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  i === highlight
                    ? 'bg-[#f0ebe4] text-[#4a3728] font-medium'
                    : 'text-gray-700 hover:bg-[#faf7f2]'
                }`}
              >
                {c.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !seleccionada && filtradas.length === 0 && query.trim() !== '' && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-[#e2d9ce] rounded-lg shadow-lg px-3 py-2 text-xs text-gray-400">
          Sin resultados para "{query}"
        </div>
      )}
    </div>
  )
}
