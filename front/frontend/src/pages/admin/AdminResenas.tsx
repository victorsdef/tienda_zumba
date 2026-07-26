import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getResenasAdmin, aprobarResena, eliminarResena, type ResenaAdmin } from '../../api/admin'

function Estrellas({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= n ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  )
}

export default function AdminResenas() {
  const qc = useQueryClient()
  const { data: resenas = [], isLoading } = useQuery({ queryKey: ['resenas-admin'], queryFn: getResenasAdmin })
  const invalidar = () => qc.invalidateQueries({ queryKey: ['resenas-admin'] })
  const aprobarMut = useMutation({ mutationFn: aprobarResena, onSuccess: invalidar })
  const eliminarMut = useMutation({ mutationFn: eliminarResena, onSuccess: invalidar })

  const pendientes = resenas.filter(r => !r.aprobada)
  const aprobadas = resenas.filter(r => r.aprobada)

  if (isLoading) return <div className="p-8 animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}</div>

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Reseñas</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pendientes.length} pendientes · {aprobadas.length} aprobadas</p>
      </div>

      {pendientes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-3">Pendientes de aprobación</h2>
          <div className="space-y-3">
            {pendientes.map(r => <ResenaCard key={r.id} r={r} onAprobar={() => aprobarMut.mutate(r.id)} onEliminar={() => { if (confirm('¿Eliminar reseña?')) eliminarMut.mutate(r.id) }} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3">Aprobadas</h2>
        {aprobadas.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay reseñas aprobadas aún.</p>
        ) : (
          <div className="space-y-3">
            {aprobadas.map(r => <ResenaCard key={r.id} r={r} onEliminar={() => { if (confirm('¿Eliminar reseña?')) eliminarMut.mutate(r.id) }} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function ResenaCard({ r, onAprobar, onEliminar }: { r: ResenaAdmin; onAprobar?: () => void; onEliminar: () => void }) {
  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm ${!r.aprobada ? 'border-orange-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-800">{r.usuarioNombre || 'Anónimo'}</span>
            <Estrellas n={r.calificacion} />
            <span className="text-xs text-gray-400">{new Date(r.fechaCreacion).toLocaleDateString('es-EC')}</span>
          </div>
          <p className="text-sm text-gray-600">{r.comentario}</p>
          <p className="text-xs text-gray-400 mt-1">Producto ID: {r.productoId}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {!r.aprobada && onAprobar && (
            <button onClick={onAprobar} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-200">
              Aprobar
            </button>
          )}
          <button onClick={onEliminar} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-100">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
