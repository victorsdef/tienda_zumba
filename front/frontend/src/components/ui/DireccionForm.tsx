import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { PROVINCIAS, PROVINCIAS_CANTONES } from '../../data/ecuador'
import type { DireccionRequest } from '../../api/direcciones'

interface Props {
  initial?: Partial<DireccionRequest>
  onSubmit: (data: DireccionRequest) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
}

export default function DireccionForm({ initial, onSubmit, onCancel, submitLabel = 'Guardar', loading }: Props) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DireccionRequest>({
    defaultValues: { nombreCompleto: '', celular: '', cedula: '', provincia: '', canton: '', ciudad: '', direccion: '', predeterminada: false, ...initial }
  })

  const provinciaSeleccionada = watch('provincia')
  const cantones = provinciaSeleccionada ? (PROVINCIAS_CANTONES[provinciaSeleccionada] ?? []) : []

  useEffect(() => {
    setValue('canton', '')
  }, [provinciaSeleccionada, setValue])

  useEffect(() => {
    if (initial) reset({ nombreCompleto: '', celular: '', cedula: '', provincia: '', canton: '', ciudad: '', direccion: '', predeterminada: false, ...initial })
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(data => onSubmit(data))} className="space-y-4">
      {/* Nombre y cédula */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            {...register('nombreCompleto', { required: 'Requerido' })}
            className="input-field"
            placeholder="Quién recibe el pedido"
          />
          {errors.nombreCompleto && <p className="text-xs text-red-500 mt-1">{errors.nombreCompleto.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Cédula <span className="text-red-500">*</span>
          </label>
          <input
            {...register('cedula', { required: 'Requerido', pattern: { value: /^[0-9]{10}$/, message: '10 dígitos numéricos' } })}
            className="input-field"
            placeholder="0123456789"
            maxLength={10}
          />
          {errors.cedula && <p className="text-xs text-red-500 mt-1">{errors.cedula.message}</p>}
        </div>
      </div>

      {/* Celular */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Celular <span className="text-red-500">*</span>
        </label>
        <input
          {...register('celular', { required: 'Requerido', pattern: { value: /^0[0-9]{9}$/, message: 'Formato: 09XXXXXXXX' } })}
          className="input-field"
          placeholder="09XXXXXXXX"
        />
        {errors.celular && <p className="text-xs text-red-500 mt-1">{errors.celular.message}</p>}
      </div>

      {/* Provincia y cantón */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Provincia <span className="text-red-500">*</span>
          </label>
          <select
            {...register('provincia', { required: 'Requerido' })}
            className="input-field"
          >
            <option value="">— Seleccionar —</option>
            {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.provincia && <p className="text-xs text-red-500 mt-1">{errors.provincia.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Cantón <span className="text-red-500">*</span>
          </label>
          <select
            {...register('canton', { required: 'Requerido' })}
            className="input-field"
            disabled={!provinciaSeleccionada}
          >
            <option value="">{provinciaSeleccionada ? '— Seleccionar —' : '← Elige la provincia'}</option>
            {cantones.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.canton && <p className="text-xs text-red-500 mt-1">{errors.canton.message}</p>}
        </div>
      </div>

      {/* Ciudad */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Ciudad / Parroquia <span className="text-red-500">*</span>
        </label>
        <input
          {...register('ciudad', { required: 'Requerido' })}
          className="input-field"
          placeholder="Ej: La Mariscal, Tumbaco..."
        />
        {errors.ciudad && <p className="text-xs text-red-500 mt-1">{errors.ciudad.message}</p>}
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
          Dirección completa <span className="text-red-500">*</span>
        </label>
        <input
          {...register('direccion', { required: 'Requerido' })}
          className="input-field"
          placeholder="Calle, número, referencia (ej: frente al parque)"
        />
        {errors.direccion && <p className="text-xs text-red-500 mt-1">{errors.direccion.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">Cancelar</button>
        )}
      </div>
    </form>
  )
}
