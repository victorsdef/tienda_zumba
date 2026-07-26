import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import { useAuthStore } from '../../store/useAuthStore'

interface Resena {
  id: number
  usuarioNombre: string
  calificacion: number
  comentario: string
  fechaCreacion: string
}

function Estrellas({ value, onChange, readonly = false }: { value: number; onChange?: (n: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button
          key={i} type="button"
          disabled={readonly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <svg className={`w-5 h-5 ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-200'} transition-colors`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
    </span>
  )
}

export default function ResenaSection({ productoId }: { productoId: number }) {
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [calificacion, setCalificacion] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  const { data: resenas = [] } = useQuery<Resena[]>({
    queryKey: ['resenas', productoId],
    queryFn: () => api.get(`/resenas/producto/${productoId}`).then(r => r.data),
  })

  const { data: stats } = useQuery<{ total: number; promedio: number }>({
    queryKey: ['resenas-stats', productoId],
    queryFn: () => api.get(`/resenas/admin/stats/${productoId}`).then(r => r.data),
  })

  const crearMut = useMutation({
    mutationFn: () => api.post('/resenas', {
      productoId,
      usuarioId: user?.id,
      usuarioNombre: user?.nombre,
      calificacion,
      comentario,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resenas', productoId] })
      qc.invalidateQueries({ queryKey: ['resenas-stats', productoId] })
      setComentario('')
      setCalificacion(5)
      setEnviado(true)
    },
  })

  const promedio = stats?.promedio ?? 0
  const total = stats?.total ?? 0

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Reseñas</h2>
          {total > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Estrellas value={Math.round(promedio)} readonly />
              <span className="text-sm text-gray-500">{promedio.toFixed(1)} · {total} reseña{total !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {resenas.length === 0 && (
        <p className="text-sm text-gray-400 mb-6">Sé el primero en dejar una reseña.</p>
      )}

      {resenas.length > 0 && (
        <div className="space-y-4 mb-8">
          {resenas.map(r => (
            <div key={r.id} className="bg-[#faf8f5] rounded-xl p-4 border border-[#ede8df]">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-gray-800">{r.usuarioNombre || 'Cliente'}</span>
                <Estrellas value={r.calificacion} readonly />
                <span className="text-xs text-gray-400 ml-auto">{new Date(r.fechaCreacion).toLocaleDateString('es-EC')}</span>
              </div>
              {r.comentario && <p className="text-sm text-gray-600">{r.comentario}</p>}
            </div>
          ))}
        </div>
      )}

      {isAuthenticated && !enviado && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Dejar una reseña</h3>
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Tu calificación</label>
            <Estrellas value={calificacion} onChange={setCalificacion} />
          </div>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={3}
            placeholder="Cuéntanos tu experiencia con este producto..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7d5c48]/30 mb-3"
          />
          <button
            onClick={() => crearMut.mutate()}
            disabled={crearMut.isPending}
            className="bg-[#4a3728] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#3a2a1e] disabled:opacity-50 transition-colors"
          >
            {crearMut.isPending ? 'Enviando...' : 'Publicar reseña'}
          </button>
          {crearMut.isError && (
            <p className="text-xs text-red-500 mt-2">Ya dejaste una reseña para este producto.</p>
          )}
        </div>
      )}

      {enviado && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          Reseña enviada. Será visible una vez que sea aprobada.
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-gray-400">
          <a href="/login" className="text-[#7d5c48] underline">Inicia sesión</a> para dejar una reseña.
        </p>
      )}
    </section>
  )
}
