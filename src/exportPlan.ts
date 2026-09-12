export interface PlanSections {
  title: string
  thesis: string
  signature: string
  recommendations: string[]
  details: string[]
  firstSteps: string[]
}

export function formatPlanText(sections: PlanSections): string {
  const recommendations = sections.recommendations.map((text, index) => `${index + 1}. ${text}`)
  const firstSteps = sections.firstSteps.map((text, index) => `${index + 1}. ${text}`)
  return [
    `Oum Wonder – ${sections.title || 'Raumvision'}`,
    sections.thesis,
    sections.signature ? `\nDer Oum-Wonder-Move\n${sections.signature}` : '',
    recommendations.length ? `\nPrioritäten\n${recommendations.join('\n')}` : '',
    sections.details.length ? `\nLicht, Raumfluss & Oberflächen\n${sections.details.join('\n\n')}` : '',
    firstSteps.length ? `\nErste Schritte\n${firstSteps.join('\n')}` : '',
  ].filter(Boolean).join('\n').trim()
}

function sectionText(root: ParentNode, selector: string): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).map((element) => element.innerText.trim()).filter(Boolean)
}

export function buildPlanText(root: ParentNode = document): string {
  return formatPlanText({
    title: root.querySelector<HTMLElement>('.result-hero h1')?.innerText.trim() ?? 'Raumvision',
    thesis: root.querySelector<HTMLElement>('.result-hero p')?.innerText.trim() ?? '',
    signature: root.querySelector<HTMLElement>('.signature-card h2')?.innerText.trim() ?? '',
    recommendations: sectionText(root, '.recommendation-list .recommendation'),
    details: sectionText(root, '.details-grid article'),
    firstSteps: sectionText(root, '.first-steps .step-row'),
  })
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('copy failed')
}

function enhanceExport(): void {
  const actions = document.querySelector<HTMLElement>('.result-actions')
  if (!actions || actions.querySelector('[data-copy-plan]')) return
  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'width:100%;display:flex;flex-direction:column;gap:8px'
  wrapper.innerHTML = '<button class="secondary-button" data-copy-plan type="button">Konzept kopieren</button><small data-copy-status aria-live="polite"></small>'
  const button = wrapper.querySelector<HTMLButtonElement>('[data-copy-plan]')
  const status = wrapper.querySelector<HTMLElement>('[data-copy-status]')
  if (!button || !status) return
  button.addEventListener('click', async () => {
    try {
      await copyText(buildPlanText(document))
      status.textContent = 'Konzept kopiert – bereit zum Teilen oder Speichern.'
      button.textContent = 'Kopiert ✓'
    } catch {
      status.textContent = 'Kopieren nicht möglich. Bitte versuche es erneut.'
    }
  })
  actions.insertBefore(wrapper, actions.firstChild)
}

if (typeof document !== 'undefined') {
  const observer = new MutationObserver(enhanceExport)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  enhanceExport()
}
