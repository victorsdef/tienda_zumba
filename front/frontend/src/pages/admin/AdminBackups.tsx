import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'

interface Backup {
  id: number
  fechaProceso: string
  estado: 'OK' | 'ERROR' | 'EN_PROCESO'
  tamanoBytes?: number
  duracionMs?: number
  ubicacionUrl?: string
  mensaje?: string
  esManual: boolean
}

const fmtBytes = (n?: number) => {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const fmtDuracion = (ms?: number) => {
  if (!ms) return '—'
  if (ms < 1000) return `${ms} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`
}

const fmtFecha = (iso: string) => {
  try {
    const d = new Date(iso)
    return d.toLocaleString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function AdminBackups() {
  const qc = useQueryClient()
  const [confirmando, setConfirmando] = useState(false)

  const { data: backups = [], isLoading } = useQuery({
    queryKey: ['backups-admin'],
    queryFn: () => api.get<Backup[]>('/admin/backups').then(r => r.data),
    refetchInterval: 10_000,
  })

  const ejecutarMut = useMutation({
    mutationFn: () => api.post<Backup>('/admin/backups/ejecutar').then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['backups-admin'] }); setConfirmando(false) },
  })

  const eliminarMut = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/backups/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['backups-admin'] }),
  })

  const ok = backups.filter(b => b.estado === 'OK').length
  const err = backups.filter(b => b.estado === 'ERROR').length
  const ultimoOk = backups.find(b => b.estado === 'OK')

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      {/* Encabezado */}
      <div className="sticky top-14 lg:top-2 z-20 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 flex-wrap">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">Backups</h1>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
              {backups.length} registros · {ok} correctos · {err} con error
              {ultimoOk && ` · Último OK: ${fmtFecha(ultimoOk.fechaProceso)}`}
            </p>
          </div>
          <button onClick={() => setConfirmando(true)} disabled={ejecutarMut.isPending}
            className="bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50">
            {ejecutarMut.isPending
              ? <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Ejecutando…</>
              : <>+ Backup ahora</>}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
        <strong className="block mb-1">Sobre los backups</strong>
        Se ejecuta automáticamente todos los días a las <strong>3:00 AM</strong>. Los archivos se suben a Cloudinary y se conservan los últimos <strong>7 días</strong>. Puedes ejecutar uno manualmente en cualquier momento con el botón "Backup ahora".
      </div>

      {/* Modal confirmación */}
      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmando(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-1">Ejecutar backup ahora</h3>
            <p className="text-sm text-gray-500 mb-4">Se hará una copia completa de la base de datos. Puede tomar unos minutos.</p>
            <div className="flex gap-2">
              <button onClick={() => ejecutarMut.mutate()} disabled={ejecutarMut.isPending}
                className="flex-1 bg-[#4a3728] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#3a2a1e] disabled:opacity-50">
                {ejecutarMut.isPending ? 'Ejecutando…' : 'Sí, ejecutar'}
              </button>
              <button onClick={() => setConfirmando(false)}
                className="text-sm text-gray-500 hover:text-gray-700 px-4">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla / cards */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L9 18l-5-5" />
          </svg>
          <p className="font-medium">Todavía no se ha ejecutado ningún backup</p>
          <p className="text-sm mt-1">El primero se hará automáticamente esta noche.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Desktop */}
          <table className="w-full text-sm hidden md:table">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Fecha proceso</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3">Duración</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{fmtFecha(b.fechaProceso)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${b.esManual ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {b.esManual ? 'Manual' : 'Automático'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={b.estado} />
                    {b.mensaje && b.estado === 'ERROR' && (
                      <p className="text-[10px] text-red-500 mt-0.5 line-clamp-1" title={b.mensaje}>{b.mensaje}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{fmtBytes(b.tamanoBytes)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDuracion(b.duracionMs)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {b.ubicacionUrl && b.estado === 'OK' && (
                        <a href={b.ubicacionUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-[#f5f0e8] text-[#7d5c48] hover:bg-[#e7dccb] font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          Descargar
                        </a>
                      )}
                      <button onClick={() => { if (confirm('¿Eliminar este registro?')) eliminarMut.mutate(b.id) }}
                        className="text-xs text-red-500 hover:bg-red-50 font-semibold px-2 py-1.5 rounded-lg transition-colors">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {backups.map(b => (
              <div key={b.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-gray-800">{fmtFecha(b.fechaProceso)}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <EstadoBadge estado={b.estado} />
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${b.esManual ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {b.esManual ? 'Manual' : 'Auto'}
                      </span>
                      <span className="text-[10px] text-gray-400">{fmtBytes(b.tamanoBytes)} · {fmtDuracion(b.duracionMs)}</span>
                    </div>
                    {b.mensaje && b.estado === 'ERROR' && <p className="text-[10px] text-red-500 mt-1">{b.mensaje}</p>}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {b.ubicacionUrl && b.estado === 'OK' && (
                      <a href={b.ubicacionUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] bg-[#f5f0e8] text-[#7d5c48] font-semibold px-2 py-1 rounded text-center">
                        Descargar
                      </a>
                    )}
                    <button onClick={() => { if (confirm('¿Eliminar este registro?')) eliminarMut.mutate(b.id) }}
                      className="text-[10px] text-red-500 font-semibold px-2 py-1">✕ Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const style = estado === 'OK'          ? 'bg-green-100 text-green-700'
              : estado === 'EN_PROCESO'   ? 'bg-yellow-100 text-yellow-700 animate-pulse'
              : 'bg-red-100 text-red-700'
  const label = estado === 'OK' ? '✓ Correcto' : estado === 'EN_PROCESO' ? '⏳ En proceso' : '✕ Error'
  return <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${style}`}>{label}</span>
}
