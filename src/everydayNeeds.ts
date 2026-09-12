export type EverydayNeed = 'Kinder' | 'Haustiere' | 'Barrierearm'

export interface EverydayNeedsInsight {
  title: string
  detail: string
}

const needAdvice: Record<EverydayNeed, string> = {
  Kinder: 'Robuste, leicht zu reinigende Oberflächen, abgerundete Kanten und gut erreichbarer geschlossener Stauraum reduzieren Alltagschaos, ohne dass der Raum nach Kinderzimmer aussieht.',
  Haustiere: 'Kratz- und schmutzunempfindliche Materialien, freie Laufwege und ein fester Platz für Futter, Körbchen oder Zubehör sollten in die Gestaltung integriert werden statt nachträglich dazuzukommen.',
  Barrierearm: 'Breite, freie Laufwege, gut erreichbare Bedienelemente und möglichst wenig Stolperkanten haben Vorrang. Möbel sollten Wendeflächen und Zugänge zu Türen, Fenstern und Stauraum nicht einengen.',
}

export function buildEverydayNeedsInsight(needs: EverydayNeed[]): EverydayNeedsInsight | null {
  if (!needs.length) return null
  const unique = Array.from(new Set(needs))
  return {
    title: 'Alltag mitgedacht',
    detail: unique.map((need) => needAdvice[need]).join(' '),
  }
}

let selectedNeeds: EverydayNeed[] = []
const needOptions: EverydayNeed[] = ['Kinder', 'Haustiere', 'Barrierearm']

function injectNeedsStyles(): void {
  if (document.querySelector('[data-everyday-needs-styles]')) return
  const style = document.createElement('style')
  style.dataset.everydayNeedsStyles = 'true'
  style.textContent = `.needs-section{display:flex;flex-direction:column;gap:10px}.needs-section .section-heading{margin-bottom:0}.needs-options{display:flex;flex-wrap:wrap;gap:8px}.needs-chip{border:1px solid rgba(45,42,37,.16);background:#fff;border-radius:999px;padding:10px 13px;font:inherit;font-size:.82rem;font-weight:700;color:inherit;cursor:pointer}.needs-chip[aria-pressed="true"]{background:#2f2a24;color:#fff;border-color:#2f2a24}.needs-help{margin:0;color:#756f66;font-size:.78rem;line-height:1.45}`
  document.head.appendChild(style)
}

function needsChip(option: EverydayNeed): string {
  return `<button type="button" class="needs-chip" data-everyday-need="${option}" aria-pressed="${selectedNeeds.includes(option)}">${option}</button>`
}

function injectNeedsInputs(): void {
  const form = document.querySelector<HTMLElement>('.brief-form')
  if (!form || form.querySelector('[data-everyday-needs-section]')) return

  const section = document.createElement('section')
  section.dataset.everydayNeedsSection = 'true'
  section.className = 'needs-section'
  section.innerHTML = `<div class="section-heading"><span>Was muss im Alltag funktionieren? <small>(optional)</small></span><small>mehr als nur schön</small></div><div class="needs-options" role="group" aria-label="Alltagsanforderungen">${needOptions.map(needsChip).join('')}</div><p class="needs-help">Wähle nur aus, was wirklich relevant ist. Mehrere Optionen sind möglich.</p>`
  form.appendChild(section)
}

function injectNeedsInsight(): void {
  if (!document.querySelector('.result-hero')) return
  const insight = buildEverydayNeedsInsight(selectedNeeds)
  if (!insight) return

  const detailGrids = document.querySelectorAll<HTMLElement>('.details-grid')
  const detailGrid = detailGrids[detailGrids.length - 1]
  if (!detailGrid || detailGrid.querySelector('[data-everyday-needs-insight]')) return

  const article = document.createElement('article')
  article.dataset.everydayNeedsInsight = 'true'
  article.innerHTML = `<span class="glyph" aria-hidden="true">✓</span><span class="mini-label">Alltag</span><p><strong>${insight.title}</strong> – ${insight.detail}</p>`
  detailGrid.appendChild(article)
}

function enhanceEverydayNeeds(): void {
  injectNeedsStyles()
  injectNeedsInputs()
  injectNeedsInsight()
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const button = target.closest<HTMLButtonElement>('[data-everyday-need]')
    if (!button) return
    const option = button.dataset.everydayNeed as EverydayNeed | undefined
    if (!option || !needOptions.includes(option)) return

    selectedNeeds = selectedNeeds.includes(option)
      ? selectedNeeds.filter((item) => item !== option)
      : [...selectedNeeds, option]

    document.querySelectorAll<HTMLButtonElement>('[data-everyday-need]').forEach((item) => {
      item.setAttribute('aria-pressed', String(selectedNeeds.includes(item.dataset.everydayNeed as EverydayNeed)))
    })
  })

  const observer = new MutationObserver(enhanceEverydayNeeds)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  enhanceEverydayNeeds()
}
