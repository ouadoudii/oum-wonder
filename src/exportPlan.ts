function sectionText(root: ParentNode, selector: string): string[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector))
    .map((element) => element.innerText.trim())
    .filter(Boolean)
}

export function buildPlanText(root: ParentNode = document): string {
  const title = root.querySelector<HTMLElement>('.result-hero h1')?.innerText.trim() ?? 'Raumvision'
  const thesis = root.querySelector<HTMLElement>('.result-hero p')?.innerText.trim() ?? ''
  const signature = root.querySelector<HTMLElement>('.signature-card h2')?.innerText.trim() ?? ''
  const recommendations = sectionText(root, '.recommendation-list .recommendation').map((text, index) => `${index + 1}. ${text}`)
  const details = sectionText(root, '.details-grid article')
  const firstSteps = sectionText(root, '.first-steps .step-row').map((text, index) => `${index + 1}. ${text}`)

  return [
    `Oum Wonder – ${title}`,
    thesis,
    signature ? `\nDer Oum-Wonder-Move\n${signature}` : '',
    recommendations.length ? `\nPrioritäten\n${recommendations.join('\n')}` : '',
    details.length ? `\nLicht, Raumfluss & Oberflächen\n${details.join('\n\n')}` : '',
    firstSteps.length ? `\nErste Schritte\n${firstSteps.join('\n')}` : '',
  ].filter(Boolean).join('\n').trim()
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

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
    const text = buildPlanText(document)
    try {
      await copyText(text)
      status.textContent = 'Konzept kopiert – bereit zum Teilen oder Speichern.'
      button.textContent = 'Kopiert ✓'
    } catch {
      status.textContent = 'Kopieren nicht möglich. Bitte versuche es erneut.'
    }
  })

  actions.insertBefore(wrapper, actions.firstChild)
}

const observer = new MutationObserver(enhanceExport)
observer.observe(document.documentElement, { childList: true, subtree: true })
enhanceExport()
