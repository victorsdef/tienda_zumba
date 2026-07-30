export const COLORES = [
  { nombre: 'Negro',    hex: '#000000' },
  { nombre: 'Blanco',   hex: '#FFFFFF' },
  { nombre: 'Gris',     hex: '#9CA3AF' },
  { nombre: 'Rojo',     hex: '#EF4444' },
  { nombre: 'Rosa',     hex: '#F9A8D4' },
  { nombre: 'Fucsia',   hex: '#EC4899' },
  { nombre: 'Naranja',  hex: '#F97316' },
  { nombre: 'Amarillo', hex: '#FACC15' },
  { nombre: 'Verde',    hex: '#22C55E' },
  { nombre: 'Azul',     hex: '#3B82F6' },
  { nombre: 'Marino',   hex: '#1E3A5F' },
  { nombre: 'Morado',   hex: '#A855F7' },
  { nombre: 'Café',     hex: '#92400E' },
  { nombre: 'Beige',    hex: '#D4B896' },
  { nombre: 'Crema',    hex: '#FEF3C7' },
]

// Registry global de colores personalizados guardados por el admin.
// Se actualiza desde ColoresSelector cuando se cargan del backend.
const coloresPersonalizados: Record<string, string> = {}

export function registrarColoresPersonalizados(items: { hex: string; nombre: string }[]) {
  for (const item of items) coloresPersonalizados[item.hex.toLowerCase()] = item.nombre
}

export function hexToNombre(hex: string): string {
  const key = hex.toLowerCase()
  return coloresPersonalizados[key]
    ?? COLORES.find(c => c.hex.toLowerCase() === key)?.nombre
    ?? hex
}
