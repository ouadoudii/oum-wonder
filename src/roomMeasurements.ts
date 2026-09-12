export interface RoomMeasurements {
  width?: number
  depth?: number
  height?: number
}

export interface MeasurementInsight {
  title: string
  detail: string
}

function valid(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function analyseRoomMeasurements(measurements: RoomMeasurements): MeasurementInsight | null {
  const { width, depth, height } = measurements
  const hasWidth = valid(width)
  const hasDepth = valid(depth)
  const hasHeight = valid(height)

  if (!hasWidth && !hasDepth && !hasHeight) return null

  const notes: string[] = []

  if (hasHeight && height < 2.45) {
    notes.push('Die Decke ist eher niedrig. Hohe Elemente bis zur Decke führen, horizontale Unterbrechungen reduzieren und Licht bevorzugt an Wänden statt nur nach unten einsetzen.')
  } else if (hasHeight && height >= 3) {
    notes.push('Die große Raumhöhe ist ein echter Vorteil. Vertikale Flächen, höhere Leuchtenpositionen und ein bewusstes raumhohes Element dürfen diese Höhe sichtbar nutzen.')
  }

  if (hasWidth && hasDepth) {
    const shortSide = Math.min(width, depth)
    const longSide = Math.max(width, depth)
    const ratio = shortSide / longSide
    const area = width * depth

    if (ratio < 0.65) {
      notes.push('Der Grundriss ist deutlich länglich. Funktionen entlang der langen Achse ordnen und die kurze Seite nicht mit tiefen Einzelmöbeln zusätzlich verengen.')
    }
    if (area < 12) {
      notes.push('Die Fläche ist kompakt. Freie Laufwege und wenige multifunktionale Möbel sind wichtiger als zusätzliche Einzelstücke; geschlossener Stauraum sollte gebündelt werden.')
    } else if (area > 30) {
      notes.push('Die Fläche ist großzügig. Statt Möbel an die Wände zu schieben, klare Zonen mit Licht, Teppichen oder Möbelgruppen bilden, damit der Raum nicht leer oder zufällig wirkt.')
    }
  }

  if (!notes.length) {
    notes.push('Die angegebenen Proportionen liegen in einem gut nutzbaren Bereich. Möbel können primär nach Blickachsen, Tageslicht und Laufwegen angeordnet werden, ohne einen offensichtlichen Proportionsnachteil ausgleichen zu müssen.')
  }

  return {
    title: 'Raummaße berücksichtigt',
    detail: notes.join(' '),
  }
}

const measurements: RoomMeasurements = {}

function numericValue(input: HTMLInputElement): number | undefined {
  if (!input.value.trim()) return undefined
  const value = Number(input.value)
  return valid(value) ? value : undefined
}

function measurementField(key: keyof RoomMeasurements, label: string, value: number | undefined): string {
  return `<label class="measurement-field"><span>${label}</span><div><input inputmode="decimal" type="number" min="0.5" max="20" step="0.01" data-room-measurement="${key}" value="${value ?? ''}" aria-label="${label} in Metern"><small>m</small></div></label>`
}

function injectMeasurementInputs(): void {
  const form = document.querySelector<HTMLElement>('.brief-form')
  if (!form || form.querySelector('[data-room-measurements]')) return

  const section = document.createElement('section')
  section.dataset.roomMeasurements = 'true'
  section.className = 'measurement-section'
  section.innerHTML = `<div class="section-heading"><span>Raummaße <small>(optional)</small></span><small>macht Proportionstipps genauer</small></div><div class="measurement-grid">${measurementField('width', 'Breite', measurements.width)}${measurementField('depth', 'Tiefe', measurements.depth)}${measurementField('height', 'Höhe', measurements.height)}</div><p class="measurement-help">Keine Maße zur Hand? Einfach frei lassen – die Raumvision funktioniert weiterhin nur mit dem Foto.</p>`
  form.appendChild(section)
}

function injectMeasurementInsight(): void {
  const resultHero = document.querySelector('.result-hero')
  if (!resultHero) return
  const insight = analyseRoomMeasurements(measurements)
  if (!insight) return

  const detailGrids = document.querySelectorAll<HTMLElement>('.details-grid')
  const detailGrid = detailGrids[detailGrids.length - 1]
  if (!detailGrid || detailGrid.querySelector('[data-measurement-insight]')) return

  const article = document.createElement('article')
  article.dataset.measurementInsight = 'true'
  article.innerHTML = `<span class="glyph" aria-hidden="true">↔</span><span class="mini-label">Raumproportionen</span><p><strong>${insight.title}</strong> – ${insight.detail}</p>`
  detailGrid.appendChild(article)
}

function enhanceMeasurements(): void {
  injectMeasurementInputs()
  injectMeasurementInsight()
}

if (typeof document !== 'undefined') {
  document.addEventListener('input', (event) => {
    const input = event.target
    if (!(input instanceof HTMLInputElement)) return
    const key = input.dataset.roomMeasurement as keyof RoomMeasurements | undefined
    if (!key) return
    measurements[key] = numericValue(input)
  })

  const observer = new MutationObserver(enhanceMeasurements)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  enhanceMeasurements()
}
