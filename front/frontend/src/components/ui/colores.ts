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

export function hexToNombre(hex: string): string {
  return COLORES.find(c => c.hex.toLowerCase() === hex.toLowerCase())?.nombre ?? hex
}
