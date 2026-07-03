import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsuariosAdmin, cambiarRolUsuario, toggleUsuario, crearUsuarioAdmin } from '../../api/admin'
import { IconSearch } from '../../components/ui/Icon'

interface UsuarioAdmin {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
  emailVerificado: boolean
}

const ROLES = ['CLIENTE', 'VENDEDOR', 'BODEGUERO', 'ADMIN']

const ROL_STYLE: Record<string, string> = {
  ADMIN:     'bg-purple-100 text-purple-800',
  VENDEDOR:  'bg-blue-100 text-blue-800',
  BODEGUERO: 'bg-orange-100 text-orange-800',
  CLIENTE:   'bg-gray-100 text-gray-600',
}

const ROL_LABEL: Record<string, string> = {
  ADMIN: 'Admin', VENDEDOR: 'Vendedor', BODEGUERO: 'Bodeguero', CLIENTE: 'Cliente'
}

interface FormData { nombre: string; email: string; password: string; rol: string }

export default function AdminUsuarios() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<FormData>({ nombre: '', email: '', password: '', rol: 'VENDEDOR' })
  const [formError, setFormError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-usuarios', page],
    queryFn: () => getUsuariosAdmin(page),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] })

  const rolMut = useMutation({
    mutationFn: ({ id, rol }: { id: number; rol: string }) => cambiarRolUsuario(id, rol),
    onSuccess: invalidate,
  })

  const toggleMut = useMutation({
    mutationFn: (id: number) => toggleUsuario(id),
    onSuccess: invalidate,
  })

  const crearMut = useMutation({
    mutationFn: crearUsuarioAdmin,
    onSuccess: () => { invalidate(); setModal(false); setForm({ nombre: '', email: '', password: '', rol: 'VENDEDOR' }); setFormError('') },
    onError: (e: any) => setFormError(e?.response?.data?.message ?? 'Error al crear el usuario'),
  })

  const usuarios: UsuarioAdmin[] = (data?.content ?? []).filter((u: UsuarioAdmin) =>
    !busqueda || u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={() => setModal(true)}
          className="btn-primary text-sm px-4 py-2"
        >
          + Crear usuario
        </button>
      </div>

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
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Cambiar rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${!u.activo ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          u.activo ? 'bg-[#f5f0e8] text-[#7d5c48]' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.nombre}</p>
                          {!u.emailVerificado && <p className="text-[10px] text-amber-500">Email no verificado</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROL_STYLE[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ROL_LABEL[u.rol] ?? u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (u.rol === 'ADMIN') return
                          if (confirm(`¿${u.activo ? 'Desactivar' : 'Activar'} a "${u.nombre}"?`)) toggleMut.mutate(u.id)
                        }}
                        disabled={u.rol === 'ADMIN'}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-opacity ${
                          u.rol === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 cursor-not-allowed'
                            : u.activo
                              ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer'
                        }`}
                      >
                        {u.rol === 'ADMIN' ? 'Admin' : u.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.rol}
                        onChange={e => {
                          if (confirm(`¿Cambiar rol de "${u.nombre}" a ${ROL_LABEL[e.target.value] ?? e.target.value}?`))
                            rolMut.mutate({ id: u.id, rol: e.target.value })
                        }}
                        className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#7d5c48]"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {usuarios.map(u => (
              <div key={u.id} className={`bg-white border rounded-lg p-4 flex items-center gap-3 ${!u.activo ? 'opacity-60' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                  u.activo ? 'bg-[#f5f0e8] text-[#7d5c48]' : 'bg-gray-100 text-gray-400'
                }`}>
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{u.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  {!u.emailVerificado && <p className="text-[10px] text-amber-500">Email no verificado</p>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROL_STYLE[u.rol] ?? 'bg-gray-100'}`}>
                    {ROL_LABEL[u.rol] ?? u.rol}
                  </span>
                  <button
                    onClick={() => {
                      if (u.rol === 'ADMIN') return
                      if (confirm(`¿${u.activo ? 'Desactivar' : 'Activar'} a "${u.nombre}"?`)) toggleMut.mutate(u.id)
                    }}
                    disabled={u.rol === 'ADMIN'}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700 cursor-not-allowed'
                        : u.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {u.rol === 'ADMIN' ? 'Admin' : u.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <select value={u.rol}
                    onChange={e => {
                      if (confirm(`¿Cambiar rol a ${ROL_LABEL[e.target.value]}?`))
                        rolMut.mutate({ id: u.id, rol: e.target.value })
                    }}
                    className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#7d5c48]">
                    {ROLES.map(r => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
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

      {/* Modal crear usuario */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Crear usuario</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nombre completo *</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Ana García"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field w-full"
                  placeholder="ana@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Contraseña *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Rol *</label>
                <select
                  value={form.rol}
                  onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                  className="input-field w-full"
                >
                  {ROLES.map(r => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  {form.rol === 'VENDEDOR' && 'Puede gestionar órdenes y cambiar estados'}
                  {form.rol === 'BODEGUERO' && 'Puede actualizar stock de productos'}
                  {form.rol === 'ADMIN' && 'Acceso total al sistema'}
                  {form.rol === 'CLIENTE' && 'Acceso de cliente regular'}
                </p>
              </div>
              {formError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">{formError}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => crearMut.mutate(form)}
                disabled={crearMut.isPending || !form.nombre || !form.email || !form.password}
                className="btn-primary flex-1"
              >
                {crearMut.isPending ? 'Creando...' : 'Crear usuario'}
              </button>
              <button onClick={() => { setModal(false); setFormError('') }} className="btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
