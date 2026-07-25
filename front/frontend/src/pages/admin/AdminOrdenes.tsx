import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrdenesAdmin } from '../../api/admin'
import { actualizarGuiaOrden, cambiarEstadoOrden } from '../../api/ordenes'
import api from '../../api/axios'
import { IconChevronDown, IconChevronRight, IconSearch } from '@shared/Icon'
import type { EstadoOrden, Orden, ItemOrden } from '../../types'
import { hexToNombre } from '../../components/ui/colores'

const ESTADOS: EstadoOrden[] = ['PENDIENTE', 'PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

function ItemsOrden({ items }: { items: ItemOrden[] }) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-2">
          {item.productoImagen ? (
            <img src={item.productoImagen} alt={item.nombreProducto}
              className="w-12 h-14 object-cover rounded-md flex-shrink-0 bg-gray-100" />
          ) : (
            <div className="w-12 h-14 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 text-xs">sin img</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{item.nombreProducto}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.talla && (
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                  Talla: {item.talla}
                </span>
              )}
              {item.color && (
                <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                  <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block flex-shrink-0"
                    style={{ backgroundColor: item.color }} />
                  {hexToNombre(item.color)}
                </span>
              )}
              <span className="text-[10px] bg-[#f0ebe4] text-[#4a3728] px-1.5 py-0.5 rounded font-medium">
                x{item.cantidad}
              </span>
            </div>
          </div>
          <p className="text-sm font-bold text-gray-900 flex-shrink-0">${(item.precio * item.cantidad).toFixed(2)}</p>
        </div>
      ))}
    </div>
  )
}

function generarReportePDF(ordenes: Orden[], filtroEstado: string) {
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const hora  = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const titulo = filtroEstado ? `Órdenes — ${filtroEstado.replace('_', ' ')}` : 'Reporte General de Órdenes'
  const totalVendido = ordenes.reduce((s, o) => s + o.total, 0)
  const totalItems   = ordenes.reduce((s, o) => s + o.items.reduce((a, i) => a + i.cantidad, 0), 0)

  const tarjetasOrdenes = ordenes.map(o => {
    const subtotalItems = o.items.reduce((s, i) => s + i.precio * i.cantidad, 0)

    const itemsHtml = o.items.map(item => `
      <div class="item-row">
        ${item.productoImagen
          ? `<img src="${item.productoImagen}" class="item-img" alt="${item.nombreProducto}" />`
          : `<div class="item-img item-img-placeholder"></div>`
        }
        <div class="item-info">
          <p class="item-nombre">${item.nombreProducto}</p>
          <div class="item-tags">
            ${item.talla ? `<span class="tag">Talla: ${item.talla}</span>` : ''}
            ${item.color ? `<span class="tag"><span class="color-dot" style="background:${item.color}"></span>${hexToNombre(item.color)}</span>` : ''}
            <span class="tag">x${item.cantidad}</span>
          </div>
        </div>
        <div class="item-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
      </div>
    `).join('')

    const dir = [o.calleEnvio, o.ciudadEnvio, o.provinciaEnvio].filter(Boolean).join(', ')

    return `
      <div class="orden-card">
        <!-- Cabecera de la orden -->
        <div class="orden-header">
          <div class="orden-header-left">
            <span class="orden-codigo">${o.codigoOrden ?? '#' + o.id}</span>
            <span class="badge badge-${o.estado}">${o.estado.replace('_', ' ')}</span>
          </div>
          <div class="orden-header-right">
            <span class="orden-fecha">${o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
          </div>
        </div>

        <!-- Info cliente + dirección -->
        <div class="orden-meta">
          <div class="meta-bloque">
            <p class="meta-label">Cliente</p>
            <p class="meta-val">${o.usuarioNombre ?? '—'}</p>
            ${o.telefonoEnvio ? `<p class="meta-sub">${o.telefonoEnvio}</p>` : ''}
          </div>
          <div class="meta-bloque">
            <p class="meta-label">Dirección de envío</p>
            <p class="meta-val">${dir || 'Retiro en tienda'}</p>
          </div>
          ${o.numeroGuia ? `
          <div class="meta-bloque">
            <p class="meta-label">Guía</p>
            <p class="meta-val">${o.numeroGuia}</p>
          </div>` : ''}
        </div>

        <!-- Artículos -->
        <div class="items-section">
          <p class="items-title">Artículos del pedido (${o.items.length})</p>
          ${itemsHtml}
        </div>

        <!-- Total de la orden -->
        <div class="orden-total-row">
          <span>Subtotal</span>
          <span>$${subtotalItems.toFixed(2)}</span>
        </div>
        ${o.total !== subtotalItems ? `
        <div class="orden-total-row orden-total-final">
          <span>Total pagado</span>
          <span>$${o.total.toFixed(2)}</span>
        </div>` : `
        <div class="orden-total-row orden-total-final">
          <span>Total pagado</span>
          <span>$${o.total.toFixed(2)}</span>
        </div>`}
      </div>
    `
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Sofia Couture EC — ${titulo}</title>
  <style>
    @page { size: A4; margin: 18mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #2c1a10; background: #fff; }

    /* ── ENCABEZADO ── */
    .page-header {
      background: #4a3728;
      color: #f5ede6;
      padding: 18px 22px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }
    .brand { font-size: 18px; font-weight: 700; letter-spacing: 1.5px; }
    .brand-sub { font-size: 10px; opacity: .7; margin-top: 3px; }
    .header-right { text-align: right; }
    .header-fecha { font-size: 11px; font-weight: 600; }
    .header-hora  { font-size: 9px; opacity: .6; margin-top: 2px; }

    /* ── RESUMEN SUPERIOR ── */
    .resumen {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
    }
    .resumen-card {
      flex: 1;
      border: 1.5px solid #e8dfd5;
      border-radius: 8px;
      padding: 10px 14px;
      background: #faf7f3;
    }
    .resumen-label { font-size: 8px; text-transform: uppercase; letter-spacing: .8px; color: #9c8a7a; }
    .resumen-value { font-size: 20px; font-weight: 800; color: #4a3728; margin-top: 3px; line-height: 1; }
    .resumen-value.small { font-size: 14px; }

    /* ── ORDEN CARD ── */
    .orden-card {
      border: 1.5px solid #e8dfd5;
      border-radius: 10px;
      margin-bottom: 18px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .orden-header {
      background: #f5ede6;
      border-bottom: 1px solid #e8dfd5;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .orden-header-left { display: flex; align-items: center; gap: 8px; }
    .orden-codigo { font-size: 12px; font-weight: 800; color: #4a3728; font-family: monospace; }
    .orden-fecha  { font-size: 10px; color: #7d5c48; }

    /* ── META CLIENTE ── */
    .orden-meta {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #f0ebe4;
    }
    .meta-bloque {
      flex: 1;
      padding: 10px 14px;
      border-right: 1px solid #f0ebe4;
    }
    .meta-bloque:last-child { border-right: none; }
    .meta-label { font-size: 8px; text-transform: uppercase; letter-spacing: .6px; color: #9c8a7a; margin-bottom: 3px; }
    .meta-val   { font-size: 10px; font-weight: 600; color: #2c1a10; }
    .meta-sub   { font-size: 9px; color: #7d5c48; margin-top: 1px; }

    /* ── ARTÍCULOS ── */
    .items-section { padding: 10px 14px; }
    .items-title {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: #9c8a7a;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 0;
      border-bottom: 1px solid #f5ede6;
    }
    .item-row:last-child { border-bottom: none; }
    .item-img {
      width: 48px;
      height: 58px;
      object-fit: cover;
      border-radius: 6px;
      flex-shrink: 0;
      border: 1px solid #e8dfd5;
    }
    .item-img-placeholder {
      background: #f0ebe4;
    }
    .item-info { flex: 1; min-width: 0; }
    .item-nombre {
      font-size: 10px;
      font-weight: 700;
      color: #2c1a10;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-tags { display: flex; flex-wrap: wrap; gap: 3px; }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: #f0ebe4;
      color: #4a3728;
      font-size: 8px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 20px;
    }
    .color-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,.15);
      flex-shrink: 0;
    }
    .item-precio {
      font-size: 11px;
      font-weight: 800;
      color: #4a3728;
      flex-shrink: 0;
      min-width: 52px;
      text-align: right;
    }

    /* ── TOTAL ORDEN ── */
    .orden-total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 14px;
      font-size: 10px;
      color: #7d5c48;
      border-top: 1px solid #f0ebe4;
    }
    .orden-total-final {
      background: #f5ede6;
      font-size: 12px;
      font-weight: 800;
      color: #4a3728;
      border-top: 2px solid #c4a882;
      padding: 8px 14px;
    }

    /* ── BADGES ── */
    .badge { padding: 3px 8px; border-radius: 20px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
    .badge-PENDIENTE      { background: #fef3c7; color: #92400e; }
    .badge-PAGADO         { background: #dbeafe; color: #1e40af; }
    .badge-EN_PREPARACION { background: #fed7aa; color: #9a3412; }
    .badge-ENVIADO        { background: #e0e7ff; color: #3730a3; }
    .badge-ENTREGADO      { background: #d1fae5; color: #065f46; }
    .badge-CANCELADO      { background: #fee2e2; color: #991b1b; }

    /* ── TOTAL FINAL ── */
    .total-final {
      background: #4a3728;
      color: #f5ede6;
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .total-final-label { font-size: 11px; opacity: .8; }
    .total-final-monto { font-size: 22px; font-weight: 800; }

    /* ── PIE ── */
    .page-footer {
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px solid #e8dfd5;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #b0a090;
    }
  </style>
</head>
<body>

  <!-- ENCABEZADO -->
  <div class="page-header">
    <div>
      <div class="brand">SOFIA COUTURE EC</div>
      <div class="brand-sub">${titulo}</div>
    </div>
    <div class="header-right">
      <div class="header-fecha">${fecha}</div>
      <div class="header-hora">${hora}</div>
    </div>
  </div>

  <!-- RESUMEN -->
  <div class="resumen">
    <div class="resumen-card">
      <div class="resumen-label">Órdenes</div>
      <div class="resumen-value">${ordenes.length}</div>
    </div>
    <div class="resumen-card">
      <div class="resumen-label">Artículos vendidos</div>
      <div class="resumen-value">${totalItems}</div>
    </div>
    <div class="resumen-card">
      <div class="resumen-label">Total recaudado</div>
      <div class="resumen-value small">$${totalVendido.toFixed(2)}</div>
    </div>
    ${filtroEstado ? `
    <div class="resumen-card">
      <div class="resumen-label">Estado filtrado</div>
      <div class="resumen-value small">${filtroEstado.replace('_', ' ')}</div>
    </div>` : ''}
  </div>

  <!-- ÓRDENES -->
  ${tarjetasOrdenes}

  <!-- TOTAL GENERAL -->
  <div class="total-final">
    <span class="total-final-label">TOTAL GENERAL — ${ordenes.length} orden${ordenes.length !== 1 ? 'es' : ''}</span>
    <span class="total-final-monto">$${totalVendido.toFixed(2)}</span>
  </div>

  <!-- PIE -->
  <div class="page-footer">
    <span>Sofia Couture EC · Reporte generado automáticamente</span>
    <span>${fecha} · ${hora}</span>
  </div>

</body>
</html>`

  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 600)
}

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:       'bg-yellow-100 text-yellow-800',
  PAGADO:          'bg-blue-100 text-blue-800',
  EN_PREPARACION:  'bg-orange-100 text-orange-800',
  ENVIADO:         'bg-indigo-100 text-indigo-800',
  ENTREGADO:       'bg-green-100 text-green-800',
  CANCELADO:       'bg-red-100 text-red-800',
}

const ESTADO_BORDER: Record<string, string> = {
  PENDIENTE:       'border-l-4 border-yellow-400',
  PAGADO:          'border-l-4 border-blue-500',
  EN_PREPARACION:  'border-l-4 border-orange-400',
  ENVIADO:         'border-l-4 border-indigo-500',
  ENTREGADO:       'border-l-4 border-green-500',
  CANCELADO:       'border-l-4 border-red-400',
}

export default function AdminOrdenes() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [expandida, setExpandida] = useState<number | null>(null)
  const [guiaModal, setGuiaModal] = useState<{ id: number } | null>(null)
  const [numeroGuia, setNumeroGuia] = useState('')
  const [guiaArchivoModal, setGuiaArchivoModal] = useState<Orden | null>(null)
  const [guiaNumeroEditar, setGuiaNumeroEditar] = useState('')
  const [guiaImagenUrl, setGuiaImagenUrl] = useState('')
  const [subiendoGuia, setSubiendoGuia] = useState(false)
  const [errorGuia, setErrorGuia] = useState('')
  const [pdfModal, setPdfModal] = useState(false)
  const [pdfEstado, setPdfEstado] = useState('')
  const [pdfFechaDesde, setPdfFechaDesde] = useState('')
  const [pdfFechaHasta, setPdfFechaHasta] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ordenes', page, filtroEstado],
    queryFn: () => getOrdenesAdmin(page, filtroEstado || undefined),
  })

  const cambiarMut = useMutation({
    mutationFn: ({ id, estado, guia }: { id: number; estado: string; guia?: string }) =>
      cambiarEstadoOrden(id, estado, guia),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ordenes'] })
      setGuiaModal(null)
      setNumeroGuia('')
    },
  })
  const actualizarGuiaMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { numeroGuia?: string; guiaImagenUrl?: string } }) =>
      actualizarGuiaOrden(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ordenes'] })
      setGuiaArchivoModal(null)
      setGuiaNumeroEditar('')
      setGuiaImagenUrl('')
      setErrorGuia('')
    },
  })

  const codigoVisible = (orden: { codigoOrden?: string; id: number }) => orden.codigoOrden || `#${orden.id}`
  const abrirModalGuia = (orden: Orden) => {
    setGuiaArchivoModal(orden)
    setGuiaNumeroEditar(orden.numeroGuia || '')
    setGuiaImagenUrl(orden.guiaImagenUrl || '')
    setErrorGuia('')
  }
  const subirArchivoGuia = async (file?: File | null) => {
    if (!file) return
    setSubiendoGuia(true)
    setErrorGuia('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post<{ url: string }>('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setGuiaImagenUrl(res.data.url)
    } catch {
      setErrorGuia('No se pudo subir la imagen de la guía.')
    } finally {
      setSubiendoGuia(false)
    }
  }
  const ordenesPDF = (data?.content ?? []).filter(o => {
    if (pdfEstado && o.estado !== pdfEstado) return false
    if (pdfFechaDesde && new Date(o.fechaCreacion) < new Date(pdfFechaDesde)) return false
    if (pdfFechaHasta) {
      const hasta = new Date(pdfFechaHasta)
      hasta.setHours(23, 59, 59)
      if (new Date(o.fechaCreacion) > hasta) return false
    }
    return true
  })

  const termino = busqueda.trim().toLowerCase()
  const ordenesFiltradas = (data?.content ?? []).filter(o => {
    if (!termino) return true

    const cliente = (o.usuarioNombre || '').toLowerCase()
    const codigo = (o.codigoOrden || '').toLowerCase()
    const ciudad = (o.ciudadEnvio || '').toLowerCase()
    const calle = (o.calleEnvio || '').toLowerCase()
    const estado = o.estado.toLowerCase()
    const idTexto = String(o.id)
    const productos = o.items.map(item => item.nombreProducto.toLowerCase()).join(' ')

    return (
      cliente.includes(termino) ||
      codigo.includes(termino) ||
      ciudad.includes(termino) ||
      calle.includes(termino) ||
      estado.includes(termino) ||
      idTexto.includes(termino) ||
      productos.includes(termino)
    )
  })

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Órdenes</h1>
        <button
          onClick={() => { setPdfEstado(filtroEstado); setPdfFechaDesde(''); setPdfFechaHasta(''); setPdfModal(true) }}
          className="flex items-center gap-2 bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border rounded-lg px-3 md:px-4 py-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => { setFiltroEstado(''); setPage(0) }}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${!filtroEstado ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
          Todas
        </button>
        {ESTADOS.map(e => (
          <button key={e} onClick={() => { setFiltroEstado(e); setPage(0) }}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${filtroEstado === e ? ESTADO_STYLE[e] + ' border-transparent' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
            {e}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{data?.totalElements ?? 0} órdenes</span>
      </div>

      <div className="bg-white border rounded-lg px-3 md:px-4 py-3 flex items-center gap-3">
        <IconSearch size={16} className="text-gray-400 flex-shrink-0" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por código, cliente, ciudad o producto..."
          className="flex-1 outline-none text-sm"
        />
        <span className="text-xs text-gray-400">{ordenesFiltradas.length} visibles</span>
      </div>

      {isLoading ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-400">Cargando órdenes...</div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-400">No hay órdenes con ese estado</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-4 py-3" />
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Orden</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Total</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase font-semibold">Cambiar estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ordenesFiltradas.map(o => (
                  <React.Fragment key={o.id}>
                    <tr className="hover:bg-gray-50">
                      <td className={`px-4 py-3 ${ESTADO_BORDER[o.estado]}`}>
                        <button onClick={() => setExpandida(expandida === o.id ? null : o.id)} className="text-gray-400 hover:text-gray-600">
                          {expandida === o.id
                            ? <IconChevronDown size={16} />
                            : <IconChevronRight size={16} />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">{codigoVisible(o)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{o.usuarioNombre}</p>
                        <p className="text-xs text-gray-400">{o.ciudadEnvio}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">${o.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLE[o.estado]}`}>{o.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(o.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <select value={o.estado}
                          onChange={e => {
                            if (e.target.value === 'ENVIADO') {
                              setGuiaModal({ id: o.id })
                            } else {
                              cambiarMut.mutate({ id: o.id, estado: e.target.value })
                            }
                          }}
                          onClick={e => e.stopPropagation()}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400">
                          {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                    </tr>
                    {expandida === o.id && (
                      <tr>
                        <td colSpan={7} className="px-8 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Dirección de envío</p>
                              <p className="text-sm">{o.calleEnvio}</p>
                              <p className="text-sm text-gray-500">{o.ciudadEnvio}{o.provinciaEnvio && `, ${o.provinciaEnvio}`} {o.codigoPostalEnvio}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Artículos ({o.items.length})</p>
                              <ItemsOrden items={o.items} />
                            </div>
                          </div>
                          {(o.estado === 'ENVIADO' || o.estado === 'ENTREGADO') && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                              <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-800">Guía de envío</p>
                                <p>{o.numeroGuia ? `Número: ${o.numeroGuia}` : 'Todavía no se cargó número de guía'}</p>
                                <p>{o.guiaImagenUrl ? 'Imagen cargada para el cliente' : 'Falta cargar imagen de la guía'}</p>
                              </div>
                              <button
                                onClick={() => abrirModalGuia(o)}
                                className="btn-outline text-sm"
                              >
                                {o.guiaImagenUrl ? 'Editar guía' : 'Cargar guía'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {ordenesFiltradas.map(o => (
              <div key={o.id} className={`bg-white border rounded-lg overflow-hidden ${ESTADO_BORDER[o.estado]}`}>
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandida(expandida === o.id ? null : o.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-700">{codigoVisible(o)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_STYLE[o.estado]}`}>{o.estado}</span>
                  </div>
                  <span className="font-bold text-gray-900">${o.total.toFixed(2)}</span>
                </div>
                <div className="px-4 pb-3 -mt-2 text-sm text-gray-500 flex items-center justify-between">
                  <span>{o.usuarioNombre}</span>
                  <span className="text-xs">{new Date(o.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                </div>
                {expandida === o.id && (
                  <div className="border-t px-4 py-3 space-y-3 bg-gray-50">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Dirección</p>
                      <p className="text-sm">{o.calleEnvio}, {o.ciudadEnvio}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Artículos</p>
                      <ItemsOrden items={o.items} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cambiar estado</p>
                      <select value={o.estado}
                        onChange={e => {
                          if (e.target.value === 'ENVIADO') {
                            setGuiaModal({ id: o.id })
                          } else {
                            cambiarMut.mutate({ id: o.id, estado: e.target.value })
                          }
                        }}
                        className="border border-gray-200 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:border-red-400">
                        {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    {(o.estado === 'ENVIADO' || o.estado === 'ENTREGADO') && (
                      <button onClick={() => abrirModalGuia(o)} className="btn-outline w-full text-sm">
                        {o.guiaImagenUrl ? 'Editar guía enviada' : 'Cargar guía para cliente'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">‹</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Página {page + 1} de {data.totalPages}</span>
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded text-sm disabled:opacity-40">›</button>
        </div>
      )}
      {/* Modal exportar PDF */}
      {pdfModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Exportar reporte PDF</h3>
            <p className="text-sm text-gray-500 mb-5">Selecciona los filtros que quieres incluir en el reporte.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Estado de la orden</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPdfEstado('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${!pdfEstado ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600'}`}
                  >Todas</button>
                  {ESTADOS.map(e => (
                    <button key={e} onClick={() => setPdfEstado(e)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${pdfEstado === e ? ESTADO_STYLE[e] + ' border-transparent' : 'border-gray-300 text-gray-600'}`}>
                      {e.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Desde</label>
                  <input type="date" value={pdfFechaDesde} onChange={e => setPdfFechaDesde(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7d5c48]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Hasta</label>
                  <input type="date" value={pdfFechaHasta} onChange={e => setPdfFechaHasta(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7d5c48]" />
                </div>
              </div>

              <div className="bg-[#f5ede6] rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-[#4a3728] font-medium">Órdenes a exportar</span>
                <span className="text-lg font-bold text-[#4a3728]">{ordenesPDF.length}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { generarReportePDF(ordenesPDF, pdfEstado); setPdfModal(false) }}
                disabled={ordenesPDF.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-[#4a3728] hover:bg-[#3a2a1e] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar PDF
              </button>
              <button onClick={() => setPdfModal(false)} className="btn-outline">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal número de guía Servientrega */}
      {guiaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Número de guía Servientrega</h3>
            <p className="text-sm text-gray-500 mb-4">Ingresá el número de guía para notificar al cliente. Es opcional.</p>
            <input
              value={numeroGuia}
              onChange={e => setNumeroGuia(e.target.value)}
              className="input-field w-full mb-4"
              placeholder="Ej: 9876543210"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => cambiarMut.mutate({ id: guiaModal.id, estado: 'ENVIADO', guia: numeroGuia || undefined })}
                disabled={cambiarMut.isPending}
                className="btn-primary flex-1"
              >
                {cambiarMut.isPending ? 'Guardando...' : 'Marcar como Enviado'}
              </button>
              <button
                onClick={() => { setGuiaModal(null); setNumeroGuia('') }}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {guiaArchivoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Guía de envío</h3>
            <p className="text-sm text-gray-500 mb-4">{codigoVisible(guiaArchivoModal)} · visible para el cliente en su pedido</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Número de guía</label>
                <input
                  value={guiaNumeroEditar}
                  onChange={e => setGuiaNumeroEditar(e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej: 9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Foto de la guía</label>
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#7d5c48] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => subirArchivoGuia(e.target.files?.[0])}
                  />
                  {subiendoGuia ? (
                    <p className="text-sm text-gray-500">Subiendo imagen...</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700">Haz clic para subir la foto de la guía</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP</p>
                    </>
                  )}
                </label>
              </div>

              {guiaImagenUrl && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <img src={guiaImagenUrl} alt="Guía de envío" className="w-full max-h-64 object-contain rounded bg-white" />
                  <div className="flex items-center justify-between gap-3 mt-3">
                    <a href={guiaImagenUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7d5c48] hover:underline">
                      Ver imagen completa
                    </a>
                    <button type="button" onClick={() => setGuiaImagenUrl('')} className="text-sm text-red-500 hover:underline">
                      Quitar imagen
                    </button>
                  </div>
                </div>
              )}

              {errorGuia && <p className="text-sm text-red-500">{errorGuia}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => actualizarGuiaMut.mutate({
                  id: guiaArchivoModal.id,
                  data: {
                    numeroGuia: guiaNumeroEditar || undefined,
                    guiaImagenUrl: guiaImagenUrl || undefined,
                  },
                })}
                disabled={actualizarGuiaMut.isPending}
                className="btn-primary flex-1"
              >
                {actualizarGuiaMut.isPending ? 'Guardando...' : 'Guardar guía'}
              </button>
              <button
                onClick={() => {
                  setGuiaArchivoModal(null)
                  setGuiaNumeroEditar('')
                  setGuiaImagenUrl('')
                  setErrorGuia('')
                }}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
