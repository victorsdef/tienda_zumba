import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsuariosAdmin, cambiarRolUsuario } from '../../api/admin'
import { IconSearch } from '../../components/ui/Icon'

export default function AdminUsuarios() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [busqueda, setBusqueda] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-usuarios', page],
    queryFn: () => getUsuariosAdmin(page),
  })

  const rolMut = useMutation({
    mutationFn: ({ id, rol }: { id: number; rol: string }) => cambiarRolUsuario(id, rol),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  })

  const usuarios = (data?.content ?? []).filter((u: { nombre: string; email: string }) =>
    !busqueda || u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Usuarios</h1>

      <div className="bg-white border rounded-lg px-3 md:px-4 py-3 flex items-center gap-3">
        <IconSearch size={16} className="text-gray-400 flex-shrink-0" />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o email..."
          className="flex-1 outline-none text-sm min-w-0" />
        <span className="text-xs text-gray-400 flex-shrink-0">{data?.totalElements ?? 0} usuarios</span>
      </div>

      {isLoading ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-400">Cargando usuarios...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Email</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Rol</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Cambiar rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map((u: { id: number; nombre: string; email: string; rol: string }) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={u.rol}
                        onChange={e => {
                          if (confirm(`¿Cambiar rol de "${u.nombre}" a ${e.target.value}?`)) {
                            rolMut.mutate({ id: u.id, rol: e.target.value })
                          }
                        }}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400">
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {usuarios.map((u: { id: number; nombre: string; email: string; rol: string }) => (
              <div key={u.id} className="bg-white border rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold flex-shrink-0">
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{u.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                    {u.rol}
                  </span>
                  <select value={u.rol}
                    onChange={e => {
                      if (confirm(`¿Cambiar rol de "${u.nombre}" a ${e.target.value}?`)) {
                        rolMut.mutate({ id: u.id, rol: e.target.value })
                      }
                    }}
                    className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400">
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">‹</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Página {page + 1} de {data.totalPages}</span>
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">›</button>
        </div>
      )}
    </div>
  )
}
