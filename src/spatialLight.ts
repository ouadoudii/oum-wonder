export type LightZone = 'left' | 'center' | 'right' | 'balanced'

export interface LightDistribution {
  left: number
  center: number
  right: number
  dominant: LightZone
  imbalance: number
}

const balancedDistribution: LightDistribution = {
  left: 0.5,
  center: 0.5,
  right: 0.5,
  dominant: 'balanced',
  imbalance: 0,
}

export function analyseLightDistribution(data: Uint8ClampedArray, width: number, height: number): LightDistribution {
  if (width <= 0 || height <= 0 || data.length < width * height * 4) return balancedDistribution

  const sums: [number, number, number] = [0, 0, 0]
  const counts: [number, number, number] = [0, 0, 0]

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4
      const r = (data[index] ?? 0) / 255
      const g = (data[index + 1] ?? 0) / 255
      const b = (data[index + 2] ?? 0) / 255
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const zone = Math.min(2, Math.floor((x / width) * 3))
      if (zone === 0) {
        sums[0] += luminance
        counts[0] += 1
      } else if (zone === 1) {
        sums[1] += luminance
        counts[1] += 1
      } else {
        sums[2] += luminance
        counts[2] += 1
      }
    }
  }

  const left = counts[0] > 0 ? sums[0] / counts[0] : 0
  const center = counts[1] > 0 ? sums[1] / counts[1] : 0
  const right = counts[2] > 0 ? sums[2] / counts[2] : 0
  const values: [number, number, number] = [left, center, right]
  const max = Math.max(...values)
  const min = Math.min(...values)
  const imbalance = max - min

  let dominant: LightZone = 'balanced'
  if (imbalance >= 0.08) {
    const maxIndex = values.indexOf(max)
    dominant = maxIndex === 0 ? 'left' : maxIndex === 1 ? 'center' : 'right'
  }

  return { left, center, right, dominant, imbalance }
}

export function describeLightDistribution(distribution: LightDistribution): { title: string; detail: string } {
  if (distribution.dominant === 'left') {
    return {
      title: 'Links heller',
      detail: 'Die linke Bildzone bekommt sichtbar mehr Licht. Nutze sie für die aktivste Funktion und gleiche die rechte Seite mit hellen vertikalen Flächen oder indirektem Licht aus.',
    }
  }
  if (distribution.dominant === 'right') {
    return {
      title: 'Rechts heller',
      detail: 'Die rechte Bildzone bekommt sichtbar mehr Licht. Nutze sie für die aktivste Funktion und gleiche die linke Seite mit hellen vertikalen Flächen oder indirektem Licht aus.',
    }
  }
  if (distribution.dominant === 'center') {
    return {
      title: 'Mitte heller',
      detail: 'Das Licht konzentriert sich in der Raummitte. Halte diese Sichtachse offen und führe Helligkeit mit reflektierenden Flächen in die dunkleren Randzonen weiter.',
    }
  }
  return {
    title: 'Gleichmäßig verteilt',
    detail: 'Das Licht ist über das Foto relativ ausgewogen. Du kannst Funktionen freier platzieren und mit wenigen gezielten Akzenten Tiefe statt zusätzliche Helligkeit erzeugen.',
  }
}

function readDistribution(image: HTMLImageElement): LightDistribution | null {
  if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) return null
  const canvas = document.createElement('canvas')
  const width = 60
  const height = 40
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.drawImage(image, 0, 0, width, height)
  return analyseLightDistribution(context.getImageData(0, 0, width, height).data, width, height)
}

function injectDistribution(): void {
  const section = document.querySelector<HTMLElement>('section[aria-label="Fotoanalyse"]')
  const grid = section?.querySelector<HTMLElement>('.details-grid')
  if (!section || !grid || grid.querySelector('[data-spatial-light]')) return

  const image = document.querySelector<HTMLImageElement>('.vision-image')
  if (!image) return

  const render = (): void => {
    if (grid.querySelector('[data-spatial-light]')) return
    const distribution = readDistribution(image)
    if (!distribution) return
    const copy = describeLightDistribution(distribution)
    const article = document.createElement('article')
    article.dataset.spatialLight = 'true'
    article.dataset.spatialLightDirection = distribution.dominant
    article.setAttribute('aria-label', `Lichtverteilung: ${copy.title}`)
    article.innerHTML = `<span class="glyph" aria-hidden="true">↔</span><span class="mini-label">Lichtverteilung</span><p><strong>${copy.title}</strong> – ${copy.detail}</p>`
    grid.appendChild(article)
  }

  if (image.complete) render()
  else image.addEventListener('load', render, { once: true })
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(injectDistribution)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  injectDistribution()
}
