export interface RentalFriendlyInsight {
  title: string
  detail: string
}

export interface RentalAlternative {
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

export function buildRentalAlternatives(isRental: boolean): RentalAlternative[] {
  if (!isRental) return []
  return [
    {
      title: 'Einbauten → modulare Möbel',
      detail: 'Raumhohe oder integrierte Ideen als freistehende, modulare Möbel übersetzen. So bleibt die klare Funktionswand-Idee erhalten, ohne dauerhaft in die Bausubstanz einzugreifen.',
    },
    {
      title: 'Feste Lichtlösung → steckbare Lichtschicht',
      detail: 'Lichtfugen oder bauliche Beleuchtung durch steckbare Wandleuchten, Bodenleuchten und indirekte LED-Profile ersetzen, die sich rückstandsfrei wieder entfernen lassen.',
    },
    {
      title: 'Neue Oberfläche → reversible Schicht',
      detail: 'Farbe, Paneele oder starke Wandakzente zuerst mit Textilien, mobilen Akustik- oder Dekopaneelen und geeigneten rückbaubaren Belägen testen, bevor dauerhaft verändert wird.',
    },
  ]
}

let rentalFriendly = false

function injectRentalStyles(): void {
  if (document.querySelector('[data-rental-friendly-styles]')) return
  const style = document.createElement('style')
  style.dataset.rentalFriendlyStyles = 'true'
  style.textContent = `.rental-friendly-section{display:flex;flex-direction:column;gap:8px}.rental-friendly-section .section-heading{margin-bottom:0}.rental-friendly-toggle{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;border:1px solid rgba(45,42,37,.16);border-radius:14px;background:#fff;cursor:pointer}.rental-friendly-toggle input{margin-top:3px;accent-color:#5f4e39}.rental-friendly-toggle span{display:flex;flex-direction:column;gap:3px;font-weight:700}.rental-friendly-toggle small{color:#756f66;font-weight:500;line-height:1.4}.rental-alternatives{display:flex;flex-direction:column;gap:10px}.rental-alternative-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.rental-alternative{padding:14px;border:1px solid rgba(45,42,37,.13);border-radius:14px;background:rgba(255,255,255,.78)}.rental-alternative strong{display:block;margin-bottom:6px}.rental-alternative p{margin:0;color:#655f56;line-height:1.5}.rental-caution{display:inline-flex;margin-top:8px;padding:5px 8px;border-radius:999px;background:#f3eadc;color:#6b5437;font-size:12px;font-weight:700}@media(max-width:720px){.rental-alternative-list{grid-template-columns:1fr}}`
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

function markStructuralRecommendations(): void {
  if (!rentalFriendly || !document.querySelector('.result-hero')) return
  const structuralPattern = /raumhoch|integriert|einbau|baulich|lichtfuge|anschluss|feste\s|festen\s/i
  document.querySelectorAll<HTMLElement>('.recommendation').forEach((recommendation) => {
    if (recommendation.querySelector('[data-rental-caution]')) return
    if (!structuralPattern.test(recommendation.textContent ?? '')) return
    const caution = document.createElement('small')
    caution.dataset.rentalCaution = 'true'
    caution.className = 'rental-caution'
    caution.textContent = 'Nur mit Freigabe – sonst reversible Alternative nutzen'
    recommendation.appendChild(caution)
  })
}

function injectRentalAlternatives(): void {
  if (!document.querySelector('.result-hero')) return
  const alternatives = buildRentalAlternatives(rentalFriendly)
  if (alternatives.length === 0 || document.querySelector('[data-rental-alternatives]')) return

  const firstSteps = document.querySelector<HTMLElement>('.first-steps')
  if (!firstSteps) return
  const section = document.createElement('section')
  section.dataset.rentalAlternatives = 'true'
  section.className = 'plan-section rental-alternatives'
  section.innerHTML = `<div class="section-heading"><span>Mietfreundlich übersetzt</span><small>gleiche Idee, ohne festen Eingriff</small></div><div class="rental-alternative-list">${alternatives.map((item) => `<article class="rental-alternative"><strong>${item.title}</strong><p>${item.detail}</p></article>`).join('')}</div>`
  firstSteps.before(section)
}

function enhanceRentalFriendly(): void {
  injectRentalStyles()
  injectRentalInput()
  injectRentalInsight()
  markStructuralRecommendations()
  injectRentalAlternatives()
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
