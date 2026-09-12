export type RoomConstraint = 'Fenster' | 'Türen' | 'Heizkörper' | 'Einbauten'

export interface ConstraintInsight {
  title: string
  detail: string
}

const constraintAdvice: Record<RoomConstraint, string> = {
  Fenster: 'Fensterflächen und ihre Öffnungsbereiche bleiben frei; hohe Möbel und schwere Elemente werden nicht davor geplant.',
  Türen: 'Türflügel und Hauptlaufwege bleiben frei, damit die neue Anordnung nicht auf Kosten der Bewegungsfläche geht.',
  Heizkörper: 'Heizkörper werden nicht mit tiefen Möbeln zugestellt; Luftzirkulation und Bedienbarkeit bleiben erhalten.',
  Einbauten: 'Bestehende Einbauten werden als feste Architektur behandelt und in Material-, Licht- und Stauraumkonzept integriert statt ignoriert.',
}

export function buildConstraintInsight(constraints: RoomConstraint[]): ConstraintInsight | null {
  const unique = [...new Set(constraints)]
  if (!unique.length) return null

  return {
    title: `Feste Elemente berücksichtigt: ${unique.join(', ')}`,
    detail: unique.map((constraint) => constraintAdvice[constraint]).join(' '),
  }
}

const selected = new Set<RoomConstraint>()
const options: RoomConstraint[] = ['Fenster', 'Türen', 'Heizkörper', 'Einbauten']

function injectConstraintStyles(): void {
  if (document.querySelector('[data-constraint-styles]')) return
  const style = document.createElement('style')
  style.dataset.constraintStyles = 'true'
  style.textContent = `.constraint-section{display:flex;flex-direction:column;gap:10px}.constraint-section .section-heading{margin-bottom:0}.constraint-options{display:flex;flex-wrap:wrap;gap:8px}.constraint-chip{border:1px solid rgba(45,42,37,.16);background:#fff;border-radius:999px;padding:10px 13px;font:inherit;font-size:.82rem;font-weight:700;color:inherit;cursor:pointer}.constraint-chip[aria-pressed="true"]{background:#2f2a24;color:#fff;border-color:#2f2a24}.constraint-help{margin:0;color:#756f66;font-size:.78rem;line-height:1.45}`
  document.head.appendChild(style)
}

function chip(option: RoomConstraint): string {
  return `<button type="button" class="constraint-chip" data-room-constraint="${option}" aria-pressed="${selected.has(option)}">${option}</button>`
}

function injectConstraintInputs(): void {
  const form = document.querySelector<HTMLElement>('.brief-form')
  if (!form || form.querySelector('[data-room-constraints]')) return

  const section = document.createElement('section')
  section.dataset.roomConstraints = 'true'
  section.className = 'constraint-section'
  section.innerHTML = `<div class="section-heading"><span>Was muss bleiben? <small>(optional)</small></span><small>verhindert unpraktische Vorschläge</small></div><div class="constraint-options" role="group" aria-label="Feste Elemente im Raum">${options.map(chip).join('')}</div><p class="constraint-help">Markiere feste Elemente, die Oum Wonder bei der Raumidee respektieren soll.</p>`
  form.appendChild(section)
}

function injectConstraintInsight(): void {
  const resultHero = document.querySelector('.result-hero')
  if (!resultHero) return
  const insight = buildConstraintInsight([...selected])
  if (!insight) return

  const detailGrids = document.querySelectorAll<HTMLElement>('.details-grid')
  const detailGrid = detailGrids[detailGrids.length - 1]
  if (!detailGrid || detailGrid.querySelector('[data-constraint-insight]')) return

  const article = document.createElement('article')
  article.dataset.constraintInsight = 'true'
  article.innerHTML = `<span class="glyph" aria-hidden="true">⌂</span><span class="mini-label">Planungsgrenzen</span><p><strong>${insight.title}</strong> – ${insight.detail}</p>`
  detailGrid.appendChild(article)
}

function enhanceConstraints(): void {
  injectConstraintStyles()
  injectConstraintInputs()
  injectConstraintInsight()
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const button = target.closest<HTMLButtonElement>('[data-room-constraint]')
    if (!button) return
    const option = button.dataset.roomConstraint as RoomConstraint | undefined
    if (!option || !options.includes(option)) return

    if (selected.has(option)) selected.delete(option)
    else selected.add(option)
    button.setAttribute('aria-pressed', String(selected.has(option)))
  })

  const observer = new MutationObserver(enhanceConstraints)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  enhanceConstraints()
}
