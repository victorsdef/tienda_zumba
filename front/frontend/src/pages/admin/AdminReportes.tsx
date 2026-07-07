import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { exportarReporteExcel, getDashboard, type ExportarReportePayload } from '../../api/admin'
import { IconAlertTriangle, IconBarChart, IconDollar, IconPackage, IconUsers } from '@shared/Icon'

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function descargarBlob(nombre: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

type ReportePreset = {
  id: string
  nombre: string
  descripcion: string
  form: Partial<ExportarReportePayload>
}

const REPORT_PRESETS: ReportePreset[] = [
  {
    id: 'ejecutivo',
    nombre: 'Ejecutivo',
    descripcion: 'Resumen compacto para revisar ventas y estado general.',
    form: {
      incluirResumen: true,
      incluirVentasPeriodo: true,
      incluirOrdenesEstado: true,
      incluirTopProductos: true,
      incluirStockBajo: false,
      incluirMetadatos: true,
      limiteTopProductos: 5,
      umbralStockBajo: 5,
    },
  },
  {
    id: 'operativo',
    nombre: 'Operativo',
    descripcion: 'Pensado para seguimiento diario de pedidos y stock.',
    form: {
      incluirResumen: true,
      incluirVentasPeriodo: false,
      incluirOrdenesEstado: true,
      incluirTopProductos: false,
      incluirStockBajo: true,
      incluirMetadatos: true,
      limiteTopProductos: 10,
      umbralStockBajo: 8,
    },
  },
  {
    id: 'comercial',
    nombre: 'Comercial',
    descripcion: 'Más útil para analizar ventas, ranking y rendimiento.',
    form: {
      incluirResumen: true,
      incluirVentasPeriodo: true,
      incluirOrdenesEstado: true,
      incluirTopProductos: true,
      incluirStockBajo: true,
      incluirMetadatos: true,
      limiteTopProductos: 15,
      umbralStockBajo: 5,
    },
  },
]

export default function AdminReportes() {
  const [mostrarExportador, setMostrarExportador] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [presetActivo, setPresetActivo] = useState<string>('comercial')
  const [form, setForm] = useState<ExportarReportePayload>({
    nombreReporte: 'reporte_sofia_couture',
    incluirResumen: true,
    incluirVentasPeriodo: true,
    incluirOrdenesEstado: true,
    incluirTopProductos: true,
    incluirStockBajo: true,
    incluirMetadatos: true,
    limiteTopProductos: 10,
    umbralStockBajo: 5,
  })
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-reportes'],
    queryFn: getDashboard,
  })

  const totalOrdenesEstado = useMemo(() => {
    if (!stats) return 0
    return Object.values(stats.ordenesPorEstado ?? {}).reduce((sum, value) => sum + value, 0)
  }, [stats])

  const resumenConfiguracion = useMemo(() => {
    const secciones = [
      form.incluirResumen && 'Resumen',
      form.incluirVentasPeriodo && 'Ventas',
      form.incluirOrdenesEstado && 'Estados',
      form.incluirTopProductos && `Top ${form.limiteTopProductos}`,
      form.incluirStockBajo && `Stock <= ${form.umbralStockBajo}`,
      form.incluirMetadatos && 'Metadatos',
    ].filter(Boolean)

    return secciones.join(' · ')
  }, [form])

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const exportarExcel = async () => {
    if (
      !form.incluirResumen &&
      !form.incluirVentasPeriodo &&
      !form.incluirOrdenesEstado &&
      !form.incluirTopProductos &&
      !form.incluirStockBajo &&
      !form.incluirMetadatos
    ) {
      window.alert('Selecciona al menos una sección para exportar.')
      return
    }

    setExportando(true)
    try {
      const blob = await exportarReporteExcel(form)
      descargarBlob(
        `${(form.nombreReporte || 'reporte_sofia_couture').replace(/\s+/g, '_')}.xlsx`,
        blob
      )
    } catch {
      window.alert('No se pudo generar el reporte en Excel.')
    } finally {
      setExportando(false)
      setMostrarExportador(false)
    }
  }

  const aplicarPreset = (preset: ReportePreset) => {
    setPresetActivo(preset.id)
    setForm(prev => ({
      ...prev,
      ...preset.form,
    }))
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500">Resumen comercial para revisar ventas, pedidos y señales operativas.</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="text-xs text-gray-400">Actualizado con datos del panel actual</div>
          <div className="flex gap-2">
            <button onClick={() => setMostrarExportador(true)} className="btn-primary text-sm">Excel personalizado</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Ventas totales</p>
              <p className="text-3xl font-bold text-gray-900">{formatMoney(stats.ventasTotales)}</p>
              <p className="text-sm text-gray-500 mt-1">Acumulado histórico</p>
            </div>
            <IconDollar size={22} className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Mes actual</p>
              <p className="text-3xl font-bold text-gray-900">{formatMoney(stats.ventasMes)}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.ordenesMes} órdenes registradas</p>
            </div>
            <IconBarChart size={22} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Pedidos totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrdenes}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.totalOrdenesPendientes} pendientes</p>
            </div>
            <IconPackage size={22} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Clientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClientes}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.totalClientesVerificados} activos/verificados</p>
            </div>
            <IconUsers size={22} className="text-violet-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 xl:col-span-2">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Distribución de órdenes</h2>
          <div className="space-y-3">
            {Object.entries(stats.ordenesPorEstado).map(([estado, count]) => {
              const percentage = totalOrdenesEstado > 0 ? (count / totalOrdenesEstado) * 100 : 0
              return (
                <div key={estado}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{estado.replaceAll('_', ' ')}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#7d5c48]" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Ritmo reciente</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.ventasHoy)}</p>
              <p className="text-sm text-gray-500">{stats.ordenesHoy} órdenes</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Últimos 7 días</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.ventasSemana)}</p>
              <p className="text-sm text-gray-500">{stats.ordenesSemana} órdenes</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Mes actual</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.ventasMes)}</p>
              <p className="text-sm text-gray-500">{stats.ordenesMes} órdenes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Top productos</h2>
          {stats.topProductos.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no hay suficientes ventas para el ranking.</p>
          ) : (
            <div className="space-y-3">
              {stats.topProductos.map((producto, index) => (
                <div key={producto.id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#f5f0e8] text-[#7d5c48] flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 truncate">{producto.nombre}</p>
                    <p className="text-xs text-gray-500">{producto.unidadesVendidas} unidades</p>
                  </div>
                  <span className="font-bold text-emerald-700">{formatMoney(producto.ingresos)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <IconAlertTriangle size={18} className="text-orange-500" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Alertas de stock</h2>
          </div>
          {stats.productosStockBajo.length === 0 ? (
            <p className="text-sm text-gray-400">No hay productos con stock crítico en este momento.</p>
          ) : (
            <div className="space-y-3">
              {stats.productosStockBajo.map(producto => (
                <div key={producto.id} className="flex items-center justify-between gap-3 border border-orange-100 bg-orange-50 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{producto.nombre}</p>
                    <p className="text-xs text-gray-500">Stock disponible</p>
                  </div>
                  <span className={`text-sm font-bold ${producto.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {producto.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Exportación avanzada</h2>
            <p className="text-sm text-gray-500 mt-1">Arma tu Excel con el nivel de detalle que necesites.</p>
          </div>
          <div className="rounded-lg border bg-[#f8f5f1] px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold text-[#4a3728]">Sugerencia:</span> usa un preset y luego ajusta el detalle fino.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
          {REPORT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                aplicarPreset(preset)
                setMostrarExportador(true)
              }}
              className={`text-left rounded-lg border p-4 transition ${
                presetActivo === preset.id
                  ? 'border-[#7d5c48] bg-[#f8f5f1]'
                  : 'border-gray-200 bg-white hover:border-[#c9b19d]'
              }`}
            >
              <div className="font-semibold text-gray-900">{preset.nombre}</div>
              <div className="text-sm text-gray-500 mt-1">{preset.descripcion}</div>
            </button>
          ))}
        </div>
      </div>

      {mostrarExportador && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Personalizar reporte Excel</h3>
                <p className="text-sm text-gray-500">Elige qué hojas incluir y ajusta el nivel de detalle del archivo.</p>
              </div>
              <button onClick={() => setMostrarExportador(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Preset base</label>
                  <div className="grid grid-cols-1 gap-2">
                    {REPORT_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => aplicarPreset(preset)}
                        className={`rounded-lg border px-3 py-2 text-left ${
                          presetActivo === preset.id
                            ? 'border-[#7d5c48] bg-[#f8f5f1] text-[#4a3728]'
                            : 'border-gray-200 text-gray-700 hover:border-[#c9b19d]'
                        }`}
                      >
                        <div className="font-medium">{preset.nombre}</div>
                        <div className="text-xs text-gray-500">{preset.descripcion}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nombre del reporte</label>
                  <input
                    value={form.nombreReporte}
                    onChange={e => setForm(prev => ({ ...prev, nombreReporte: e.target.value }))}
                    className="input-field w-full"
                    placeholder="reporte_sofia_couture"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Bloques incluidos</label>
                  <div className="space-y-2">
                    {[
                      ['incluirResumen', 'Resumen ejecutivo'],
                      ['incluirVentasPeriodo', 'Ventas por periodo'],
                      ['incluirOrdenesEstado', 'Órdenes por estado'],
                      ['incluirTopProductos', 'Top productos'],
                      ['incluirStockBajo', 'Alertas de stock'],
                      ['incluirMetadatos', 'Metadatos del reporte'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={form[key as keyof ExportarReportePayload] as boolean}
                          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="accent-[#7d5c48]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Límite top productos</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.limiteTopProductos}
                    onChange={e => setForm(prev => ({ ...prev, limiteTopProductos: Number(e.target.value) || 10 }))}
                    className="input-field w-full"
                    disabled={!form.incluirTopProductos}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Umbral stock bajo</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={form.umbralStockBajo}
                    onChange={e => setForm(prev => ({ ...prev, umbralStockBajo: Number(e.target.value) || 5 }))}
                    className="input-field w-full"
                    disabled={!form.incluirStockBajo}
                  />
                </div>

                <div className="rounded-lg border bg-[#f8f5f1] p-4 text-sm text-gray-600">
                  <p className="font-semibold text-[#4a3728] mb-1">Vista previa</p>
                  <p className="mb-2">Un archivo Excel `.xlsx` con hojas separadas según las opciones marcadas.</p>
                  <p className="text-xs text-gray-500">{resumenConfiguracion || 'Sin secciones seleccionadas'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={exportarExcel} disabled={exportando} className="btn-primary flex-1">
                {exportando ? 'Generando Excel...' : 'Descargar Excel'}
              </button>
              <button onClick={() => setMostrarExportador(false)} className="btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
