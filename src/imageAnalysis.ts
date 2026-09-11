import type { ImageSignals } from './types.js'

export const neutralSignals: ImageSignals = {
  brightness: 0.5,
  warmth: 0.5,
  saturation: 0.35,
}

export async function analyseImage(file: File): Promise<ImageSignals> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 48
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        URL.revokeObjectURL(url)
        resolve(neutralSignals)
        return
      }
      ctx.drawImage(img, 0, 0, size, size)
      const { data } = ctx.getImageData(0, 0, size, size)
      let brightness = 0
      let warmth = 0
      let saturation = 0
      let count = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = (data[i] ?? 0) / 255
        const g = (data[i + 1] ?? 0) / 255
        const b = (data[i + 2] ?? 0) / 255
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        brightness += 0.2126 * r + 0.7152 * g + 0.0722 * b
        warmth += Math.min(1, Math.max(0, 0.5 + (r - b) / 2))
        saturation += max === 0 ? 0 : (max - min) / max
        count += 1
      }
      URL.revokeObjectURL(url)
      resolve({ brightness: brightness / count, warmth: warmth / count, saturation: saturation / count })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(neutralSignals)
    }
    img.src = url
  })
}
