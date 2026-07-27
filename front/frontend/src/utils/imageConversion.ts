const GIF_MIME = 'image/gif'

export function isGif(file: Blob & { name?: string }) {
  return file.type.toLowerCase() === GIF_MIME || file.name?.toLowerCase().endsWith('.gif') === true
}

function pngName(filename: string) {
  const base = filename.replace(/\.[^.]+$/, '') || 'imagen'
  return `${base}.png`
}

async function heicToJpeg(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 })
  return Array.isArray(converted) ? converted[0] : converted
}

function isHeic(file: File) {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return type === 'image/heic' || type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif')
}

async function loadImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function convertImageForUpload(file: File): Promise<File> {
  if (isGif(file)) return file

  try {
    const source = isHeic(file) ? await heicToJpeg(file) : file
    const image = await loadImage(source)
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas no disponible')
    context.drawImage(image, 0, 0)

    const png = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!png) throw new Error('No se pudo generar el PNG')
    return new File([png], pngName(file.name), { type: 'image/png' })
  } catch {
    throw new Error('Este formato de imagen no se pudo convertir a PNG.')
  }
}
