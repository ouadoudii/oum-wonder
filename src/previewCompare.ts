type PreviewMode = 'today' | 'vision'

function enhancePreview(): void {
  const stage = document.querySelector<HTMLElement>('.vision-stage')
  if (!stage || stage.querySelector('[data-preview-compare]')) return

  const image = stage.querySelector<HTMLImageElement>('.vision-image')
  const overlay = stage.querySelector<HTMLElement>('.vision-filter')
  const originalLabel = stage.querySelector<HTMLElement>('.vision-label.original')
  const conceptLabel = stage.querySelector<HTMLElement>('.vision-label.concept')
  const pins = Array.from(stage.querySelectorAll<HTMLElement>('.idea-pin'))
  if (!image || !overlay) return

  const controls = document.createElement('div')
  controls.dataset.previewCompare = 'true'
  controls.setAttribute('role', 'group')
  controls.setAttribute('aria-label', 'Vorher-Nachher-Ansicht')
  controls.style.cssText = 'display:flex;gap:8px;padding:12px 4px 2px'
  controls.innerHTML = '<button class="chip" data-preview-mode="today" aria-pressed="false">Heute ansehen</button><button class="chip active" data-preview-mode="vision" aria-pressed="true">Vision ansehen</button>'

  const apply = (mode: PreviewMode): void => {
    const showingVision = mode === 'vision'
    image.style.filter = showingVision ? '' : 'none'
    overlay.style.display = showingVision ? '' : 'none'
    pins.forEach((pin) => { pin.style.display = showingVision ? '' : 'none' })
    if (originalLabel) originalLabel.style.display = showingVision ? 'none' : ''
    if (conceptLabel) conceptLabel.style.display = showingVision ? '' : 'none'
    controls.querySelectorAll<HTMLButtonElement>('[data-preview-mode]').forEach((button) => {
      const selected = button.dataset.previewMode === mode
      button.classList.toggle('active', selected)
      button.setAttribute('aria-pressed', String(selected))
    })
  }

  controls.querySelectorAll<HTMLButtonElement>('[data-preview-mode]').forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.previewMode as PreviewMode))
  })
  stage.insertBefore(controls, stage.querySelector('.palette-row'))
  apply('vision')
}

const observer = new MutationObserver(enhancePreview)
observer.observe(document.documentElement, { childList: true, subtree: true })
enhancePreview()
