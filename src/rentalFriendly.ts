export interface RentalFriendlyInsight {
  title: string
  detail: string
}

export function buildRentalFriendlyInsight(isRental: boolean): RentalFriendlyInsight | null {
  if (!isRental) return null
  return {
    title: 'Mietfreundlich und reversibel planen',
    detail: 'Priorisiere Maßnahmen, die sich beim Auszug sauber zurückbauen lassen: Licht, Textilien, freistehender Stauraum, austauschbare Griffe und reversible Oberflächen. Bohrungen, feste Einbauten oder bauliche Änderungen nur einplanen, wenn sie ausdrücklich erlaubt sind; vorhandene Bauteile und den Ausgangszustand dokumentieren.',
  }
}

let rentalFriendly = false

function injectRentalStyles(): void {
  if (document.querySelector('[data-rental-friendly-styles]')) return
  const style = document.createElement('style')
  style.dataset.rentalFriendlyStyles = 'true'
  style.textContent = `.rental-friendly-section{display:flex;flex-direction:column;gap:8px}.rental-friendly-section .section-heading{margin-bottom:0}.rental-friendly-toggle{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;border:1px solid rgba(45,42,37,.16);border-radius:14px;background:#fff;cursor:pointer}.rental-friendly-toggle input{margin-top:3px;accent-color:#5f4e39}.rental-friendly-toggle span{display:flex;flex-direction:column;gap:3px;font-weight:700}.rental-friendly-toggle small{color:#756f66;font-weight:500;line-height:1.4}`
  document.head.appendChild(style)
}

function injectRentalInput(): void {
  const form = document.querySelector<HTMLElement>('.brief-form')
  if (!form || form.querySelector('[data-rental-friendly-section]')) return

  const section = document.createElement('section')
  section.dataset.rentalFriendlySection = 'true'
  section.className = 'rental-friendly-section'
  section.innerHTML = `<div class="section-heading"><span>Wohnsituation <small>(optional)</small></span><small>verhindert unpassende Umbauideen</small></div><label class="rental-friendly-toggle"><input type="checkbox" data-rental-friendly ${rentalFriendly ? 'checked' : ''}><span>Mietwohnung<small>Empfehlungen sollen möglichst reversibel und ohne unnötige feste Eingriffe sein.</small></span></label>`
  form.appendChild(section)
}

function injectRentalInsight(): void {
  if (!document.querySelector('.result-hero')) return
  const insight = buildRentalFriendlyInsight(rentalFriendly)
  if (!insight) return

  const detailGrids = document.querySelectorAll<HTMLElement>('.details-grid')
  const detailGrid = detailGrids[detailGrids.length - 1]
  if (!detailGrid || detailGrid.querySelector('[data-rental-friendly-insight]')) return

  const article = document.createElement('article')
  article.dataset.rentalFriendlyInsight = 'true'
  article.innerHTML = `<span class="glyph" aria-hidden="true">↺</span><span class="mini-label">Mietfreundlich</span><p><strong>${insight.title}</strong> – ${insight.detail}</p>`
  detailGrid.appendChild(article)
}

function enhanceRentalFriendly(): void {
  injectRentalStyles()
  injectRentalInput()
  injectRentalInsight()
}

if (typeof document !== 'undefined') {
  document.addEventListener('change', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || !target.matches('[data-rental-friendly]')) return
    rentalFriendly = target.checked
  })

  const observer = new MutationObserver(enhanceRentalFriendly)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  enhanceRentalFriendly()
}
