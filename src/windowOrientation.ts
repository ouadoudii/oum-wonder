export type WindowOrientation = 'Nord' | 'Ost' | 'Süd' | 'West'

export interface OrientationInsight {
  title: string
  detail: string
}

const orientationAdvice: Record<WindowOrientation, string> = {
  Nord: 'Nordlicht bleibt über den Tag relativ gleichmäßig und kühl. Helle, warme Oberflächen und mehrere sanfte Lichtquellen helfen, ohne künstlich zu überhellen.',
  Ost: 'Ostfenster bringen starkes Morgenlicht. Nutze die helle erste Tageshälfte für aktive Zonen und plane für den Nachmittag zusätzliche, warme Lichtschichten ein.',
  Süd: 'Südfenster liefern viel direktes Licht. Blend- und Hitzeschutz sind wichtiger als zusätzliche Helligkeit; matte Oberflächen verhindern harte Reflexe.',
  West: 'Westfenster werden am Nachmittag und Abend besonders hell und warm. Sitz- und Aufenthaltszonen profitieren davon, sollten aber mit flexiblem Blend- und Sonnenschutz geplant werden.',
}

export function buildOrientationInsight(orientation: WindowOrientation | null): OrientationInsight | null {
  if (!orientation) return null
  return {
    title: `${orientation}ausrichtung berücksichtigt`,
    detail: orientationAdvice[orientation],
  }
}

let orientationSelected: WindowOrientation | null = null
const orientationOptions: WindowOrientation[] = ['Nord', 'Ost', 'Süd', 'West']

function injectOrientationStyles(): void {
  if (document.querySelector('[data-orientation-styles]')) return
  const style = document.createElement('style')
  style.dataset.orientationStyles = 'true'
  style.textContent = `.orientation-section{display:flex;flex-direction:column;gap:10px}.orientation-section .section-heading{margin-bottom:0}.orientation-options{display:flex;flex-wrap:wrap;gap:8px}.orientation-chip{border:1px solid rgba(45,42,37,.16);background:#fff;border-radius:999px;padding:10px 13px;font:inherit;font-size:.82rem;font-weight:700;color:inherit;cursor:pointer}.orientation-chip[aria-pressed="true"]{background:#2f2a24;color:#fff;border-color:#2f2a24}.orientation-help{margin:0;color:#756f66;font-size:.78rem;line-height:1.45}`
  document.head.appendChild(style)
}

function orientationChip(option: WindowOrientation): string {
  return `<button type="button" class="orientation-chip" data-window-orientation="${option}" aria-pressed="${orientationSelected === option}">${option}</button>`
}

function injectOrientationInputs(): void {
  const form = document.querySelector<HTMLElement>('.brief-form')
  if (!form || form.querySelector('[data-window-orientation-section]')) return

  const section = document.createElement('section')
  section.dataset.windowOrientationSection = 'true'
  section.className = 'orientation-section'
  section.innerHTML = `<div class="section-heading"><span>Fensterausrichtung <small>(optional)</small></span><small>macht Lichttipps genauer</small></div><div class="orientation-options" role="group" aria-label="Fensterausrichtung">${orientationOptions.map(orientationChip).join('')}</div><p class="orientation-help">Falls du weißt, wohin die wichtigsten Fenster zeigen, kann Oum Wonder Tageslicht und Blendung realistischer einplanen.</p>`
  form.appendChild(section)
}

function injectOrientationInsight(): void {
  if (!document.querySelector('.result-hero')) return
  const insight = buildOrientationInsight(orientationSelected)
  if (!insight) return

  const detailGrids = document.querySelectorAll<HTMLElement>('.details-grid')
  const detailGrid = detailGrids[detailGrids.length - 1]
  if (!detailGrid || detailGrid.querySelector('[data-orientation-insight]')) return

  const article = document.createElement('article')
  article.dataset.orientationInsight = 'true'
  article.innerHTML = `<span class="glyph" aria-hidden="true">☼</span><span class="mini-label">Tageslicht</span><p><strong>${insight.title}</strong> – ${insight.detail}</p>`
  detailGrid.appendChild(article)
}

function enhanceOrientation(): void {
  injectOrientationStyles()
  injectOrientationInputs()
  injectOrientationInsight()
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const button = target.closest<HTMLButtonElement>('[data-window-orientation]')
    if (!button) return
    const option = button.dataset.windowOrientation as WindowOrientation | undefined
    if (!option || !orientationOptions.includes(option)) return

    orientationSelected = orientationSelected === option ? null : option
    document.querySelectorAll<HTMLButtonElement>('[data-window-orientation]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item.dataset.windowOrientation === orientationSelected))
    })
  })

  const observer = new MutationObserver(enhanceOrientation)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  enhanceOrientation()
}
