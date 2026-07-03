import { useState, useEffect } from 'react'

// ── Mapeo completo categoría → grupos de tallas ───────────────────
const MAPA: Record<string, { label: string; tallas: string[] }[]> = {
  // MUJER
  'vestidos': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
    { label: 'Números', tallas: ['32','34','36','38','40','42'] },
  ],
  'blusas': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'tops': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'pantalones_mujer': [
    { label: 'Cintura', tallas: ['26','28','30','32','34','36','38','40'] },
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'jeans_mujer': [
    { label: 'Cintura', tallas: ['26','28','30','32','34','36','38','40'] },
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'faldas': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'conjuntos': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'abrigos_mujer': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL','XXXL'] },
  ],
  'chaquetas_mujer': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL','XXXL'] },
  ],
  'ropa_interior_mujer': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
    { label: 'Brasier', tallas: ['75A','75B','80A','80B','80C','85B','85C','85D','90C','90D','95D'] },
  ],
  'pijamas': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'loungewear': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'activewear_mujer': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'deportiva_mujer': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'traje_bano': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
    { label: 'Números', tallas: ['32','34','36','38','40'] },
  ],
  'maternidad': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],

  // HOMBRE
  'camisas': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL','XXXL'] },
    { label: 'Cuello (cm)', tallas: ['38','39','40','41','42','43','44'] },
  ],
  'pantalones_hombre': [
    { label: 'Cintura', tallas: ['28','30','32','34','36','38','40','42'] },
  ],
  'jeans_hombre': [
    { label: 'Cintura', tallas: ['28','30','32','34','36','38','40','42'] },
  ],
  'abrigos_hombre': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL','XXXL'] },
  ],
  'chaquetas_hombre': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL','XXXL'] },
  ],
  'ropa_interior_hombre': [
    { label: 'Letras', tallas: ['S','M','L','XL','XXL'] },
  ],
  'activewear_hombre': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'deportiva_hombre': [
    { label: 'Letras', tallas: ['XS','S','M','L','XL','XXL'] },
  ],
  'trajes': [
    { label: 'Talla traje', tallas: ['38','40','42','44','46','48','50'] },
  ],
  'formales': [
    { label: 'Talla traje', tallas: ['38','40','42','44','46','48','50'] },
  ],

  // NIÑOS
  'bebe': [
    { label: 'Meses', tallas: ['0-3m','3-6m','6-9m','9-12m','12-18m','18-24m'] },
  ],
  'nina': [
    { label: 'Años', tallas: ['2','4','6','8','10','12','14'] },
    { label: 'Letras', tallas: ['XS','S','M','L','XL'] },
  ],
  'nino': [
    { label: 'Años', tallas: ['2','4','6','8','10','12','14'] },
    { label: 'Letras', tallas: ['XS','S','M','L','XL'] },
  ],

  // CALZADO
  'zapatos_mujer': [
    { label: 'EU', tallas: ['34','35','36','37','38','39','40','41'] },
  ],
  'zapatos_hombre': [
    { label: 'EU', tallas: ['38','39','40','41','42','43','44','45','46'] },
  ],
  'zapatillas': [
    { label: 'EU', tallas: ['34','35','36','37','38','39','40','41','42','43','44','45','46'] },
  ],
  'sneakers': [
    { label: 'EU', tallas: ['34','35','36','37','38','39','40','41','42','43','44','45','46'] },
  ],
  'botas': [
    { label: 'EU', tallas: ['34','35','36','37','38','39','40','41','42','43','44'] },
  ],
  'sandalias': [
    { label: 'EU', tallas: ['34','35','36','37','38','39','40','41'] },
  ],
  'calzado_ninos': [
    { label: 'EU', tallas: ['18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33'] },
  ],

  // ACCESORIOS
  'bolsos': [
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'carteras': [
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'joyeria': [
    { label: 'Talla única', tallas: ['Talla única'] },
    { label: 'Anillo (US)', tallas: ['5','6','7','8','9','10','11','12'] },
  ],
  'bisuteria': [
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'cinturones': [
    { label: 'cm', tallas: ['70','75','80','85','90','95','100','105','110'] },
  ],
  'sombreros': [
    { label: 'cm', tallas: ['54','56','57','58','59','60','61'] },
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'gorras': [
    { label: 'Talla', tallas: ['S/M','L/XL','Talla única'] },
  ],
  'bufandas': [
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'panuelos': [
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'gafas': [
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'relojes': [
    { label: 'Caja', tallas: ['38mm','40mm','42mm','44mm'] },
  ],

  // BELLEZA
  'maquillaje': [
    { label: 'Talla', tallas: ['Talla única'] },
  ],
  'perfumes': [
    { label: 'ml', tallas: ['30ml','50ml','75ml','100ml','150ml','200ml'] },
  ],
  'skincare': [
    { label: 'ml', tallas: ['15ml','30ml','50ml','75ml','100ml','150ml','200ml'] },
  ],
  'cabello': [
    { label: 'ml', tallas: ['200ml','400ml','500ml'] },
    { label: 'Talla', tallas: ['Talla única'] },
  ],
}

// ── Detección por nombre de categoría ────────────────────────────
function detectarClave(nombre: string): string {
  const n = nombre.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^a-z0-9\s]/g, '')

  // Calzado
  if (/zapato.*(mujer|dama|femenin)/.test(n)) return 'zapatos_mujer'
  if (/zapato.*(hombre|caballero|masculin)/.test(n)) return 'zapatos_hombre'
  if (/zapatill|sneaker/.test(n)) return 'zapatillas'
  if (/bota/.test(n)) return 'botas'
  if (/sandalia/.test(n)) return 'sandalias'
  if (/calzado.*(nino|nina|kid|infantil)/.test(n) || /nino.*(zapato|calzado)/.test(n)) return 'calzado_ninos'

  // Niños
  if (/bebe|bebé|0.24|infantil/.test(n)) return 'bebe'
  if (/nina|niña/.test(n)) return 'nina'
  if (/nino|niño/.test(n)) return 'nino'

  // Hombre
  if (/camisa/.test(n)) return 'camisas'
  if (/(pantalon|jean).*(hombre|caballero|masculin)/.test(n) || /hombre.*(pantalon|jean)/.test(n)) return 'pantalones_hombre'
  if (/(abrigo|chaqueta|chamarra).*(hombre|caballero)/.test(n) || /hombre.*(abrigo|chaqueta)/.test(n)) return 'abrigos_hombre'
  if (/ropa.interior.*(hombre|caballero)/.test(n)) return 'ropa_interior_hombre'
  if (/(activ|deport).*(hombre|caballero)/.test(n)) return 'activewear_hombre'
  if (/traje|formal/.test(n)) return 'trajes'

  // Mujer
  if (/vestido/.test(n)) return 'vestidos'
  if (/blusa/.test(n)) return 'blusas'
  if (/top/.test(n)) return 'tops'
  if (/falda/.test(n)) return 'faldas'
  if (/conjunto/.test(n)) return 'conjuntos'
  if (/abrigo|chaqueta|chamarra/.test(n)) return 'abrigos_mujer'
  if (/ropa.interior|lenceria/.test(n)) return 'ropa_interior_mujer'
  if (/pijama/.test(n)) return 'pijamas'
  if (/loungewear/.test(n)) return 'loungewear'
  if (/activ|deport/.test(n)) return 'activewear_mujer'
  if (/bano|baño|swim/.test(n)) return 'traje_bano'
  if (/maternidad/.test(n)) return 'maternidad'
  if (/pantalon|jean/.test(n)) return 'pantalones_mujer'

  // Accesorios
  if (/bolso/.test(n)) return 'bolsos'
  if (/cartera/.test(n)) return 'carteras'
  if (/joyeria|joyería/.test(n)) return 'joyeria'
  if (/bisuteria|bisutería/.test(n)) return 'bisuteria'
  if (/cinturon|cinturón/.test(n)) return 'cinturones'
  if (/sombrero/.test(n)) return 'sombreros'
  if (/gorra/.test(n)) return 'gorras'
  if (/bufanda/.test(n)) return 'bufandas'
  if (/pañuelo|panuelo/.test(n)) return 'panuelos'
  if (/gafa|lente|anteojos/.test(n)) return 'gafas'
  if (/reloj/.test(n)) return 'relojes'

  // Belleza
  if (/maquillaje|makeup/.test(n)) return 'maquillaje'
  if (/perfume|colonia/.test(n)) return 'perfumes'
  if (/skincare|piel|crema|serum/.test(n)) return 'skincare'
  if (/cabello|pelo|shampoo|acondicionador/.test(n)) return 'cabello'

  // Fallback ropa genérica
  return 'vestidos'
}

interface Props {
  value: string[]
  onChange: (tallas: string[]) => void
  categoriaNombre?: string
}

export default function TallasSelector({ value, onChange, categoriaNombre = '' }: Props) {
  const clave = detectarClave(categoriaNombre)
  const grupos = MAPA[clave] ?? []
  const [subgrupo, setSubgrupo] = useState(0)
  const [custom, setCustom] = useState('')

  useEffect(() => { setSubgrupo(0) }, [categoriaNombre])

  if (!categoriaNombre) {
    return (
      <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center">
        <p className="text-xs text-gray-400">Seleccioná una categoría para ver las tallas disponibles</p>
      </div>
    )
  }

  const toggle = (t: string) =>
    onChange(value.includes(t) ? value.filter(x => x !== t) : [...value, t])

  const addCustom = () => {
    const t = custom.trim().toUpperCase()
    if (t && !value.includes(t)) onChange([...value, t])
    setCustom('')
  }

  const tallasActuales = grupos[subgrupo]?.tallas ?? []

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-600 uppercase">
          Tallas
          {categoriaNombre && (
            <span className="ml-2 font-normal text-gray-400 normal-case">— {categoriaNombre}</span>
          )}
        </label>
        {value.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="text-xs text-gray-400 hover:text-red-500">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Subgrupo */}
      {grupos.length > 1 && (
        <div className="flex gap-1.5">
          {grupos.map((g, i) => (
            <button key={g.label} type="button" onClick={() => setSubgrupo(i)}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                subgrupo === i
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Tallas del grupo */}
      {tallasActuales.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tallasActuales.map(t => (
            <button key={t} type="button" onClick={() => toggle(t)}
              className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${
                value.includes(t)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Custom */}
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Talla personalizada..."
          className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-400"
        />
        <button type="button" onClick={addCustom}
          className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600">
          + Agregar
        </button>
      </div>

      {/* Seleccionadas */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded border">
          {value.map(t => (
            <span key={t} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs">
              {t}
              <button type="button" onClick={() => toggle(t)} className="text-gray-400 hover:text-red-500 leading-none">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
