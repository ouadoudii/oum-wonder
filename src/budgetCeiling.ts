export interface BudgetCeilingInsight {
  title: string
  detail: string
}

export function buildBudgetCeilingInsight(amount: number | undefined): BudgetCeilingInsight | null {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) return null

  if (amount < 1000) {
    return {
      title: 'Budget auf Quick Wins fokussieren',
      detail: 'Mit diesem Rahmen sollten Umstellen, Licht, Farbe, Textilien und wenige gezielte Einzelkäufe Vorrang haben. Maßanfertigungen oder größere bauliche Eingriffe bleiben bewusst außen vor.',
    }
  }

  if (amount < 5000) {
    return {
      title: 'Budget für gezielte Upgrades bündeln',
      detail: 'Konzentriere den verfügbaren Rahmen auf ein bis zwei starke Hebel – zum Beispiel Licht plus Oberfläche oder Stauraum plus Möblierung – statt viele kleine Maßnahmen gleichzeitig anzufangen.',
    }
  }

  if (amount < 15000) {
    return {
      title: 'Budget als Teilrenovierung planen',
      detail: 'Der Rahmen erlaubt mehrere abgestimmte Maßnahmen. Priorisiere zuerst funktionale Eingriffe und plane danach Oberflächen, Licht und Möbel als zusammenhängendes Paket mit Reserve für Montage und Unvorhergesehenes.',
    }
  }

  return {
    title: 'Budget für größere Eingriffe strukturieren',
    detail: 'Der Rahmen kann auch Einbauten oder bauliche Änderungen tragen. Teile ihn in Planung, feste Einbauten, Oberflächen, Licht und eine Reserve auf, damit der stärkste architektonische Hebel nicht von vielen Einzelkäufen aufgezehrt wird.',
  }
}

let budgetCeiling: number | undefined

function injectBudgetStyles(): void {
  if (document.querySelector('[data-budget-ceiling-styles]')) return
  const style = document.createElement('style')
  style.dataset.budgetCeilingStyles = 'true'
  style.textContent = `.budget-ceiling-section{display:flex;flex-direction:column;gap:8px}.budget-ceiling-section .section-heading{margin-bottom:0}.budget-ceiling-field{display:flex;align-items:center;border:1px solid rgba(45,42,37,.16);border-radius:14px;background:#fff;overflow:hidden;max-width:280px}.budget-ceiling-field input{width:100%;min-width:0;border:0;background:transparent;padding:13px 12px;font:inherit;color:inherit;outline:none}.budget-ceiling-field input:focus{box-shadow:inset 0 0 0 2px rgba(96,78,57,.22)}.budget-ceiling-field span{padding-right:12px;color:#756f66;font-weight:700}.budget-ceiling-help{margin:0;color:#756f66;font-size:.78rem;line-height:1.45}@media(max-width:430px){.budget-ceiling-field{max-width:none}.budget-ceiling-field input{padding:14px 12px}}`
  document.head.appendChild(style)
}

function injectBudgetInput(): void {
  const form = document.querySelector<HTMLElement>('.brief-form')
  if (!form || form.querySelector('[data-budget-ceiling-section]')) return

  const section = document.createElement('section')
  section.dataset.budgetCeilingSection = 'true'
  section.className = 'budget-ceiling-section'
  section.innerHTML = `<div class="section-heading"><span>Maximales Budget <small>(optional)</small></span><small>macht die Prioritäten realistischer</small></div><label class="budget-ceiling-field"><input type="number" inputmode="numeric" min="100" max="1000000" step="100" data-budget-ceiling value="${budgetCeiling ?? ''}" aria-label="Maximales Budget in Euro"><span>€</span></label><p class="budget-ceiling-help">Nur als Planungsrahmen – Oum Wonder erstellt daraus keine verbindliche Kostenschätzung.</p>`
  form.appendChild(section)
}

function injectBudgetInsight(): void {
  if (!document.querySelector('.result-hero')) return
  const insight = buildBudgetCeilingInsight(budgetCeiling)
  if (!insight) return

  const detailGrids = document.querySelectorAll<HTMLElement>('.details-grid')
  const detailGrid = detailGrids[detailGrids.length - 1]
  if (!detailGrid || detailGrid.querySelector('[data-budget-ceiling-insight]')) return

  const article = document.createElement('article')
  article.dataset.budgetCeilingInsight = 'true'
  article.innerHTML = `<span class="glyph" aria-hidden="true">€</span><span class="mini-label">Budgetrahmen</span><p><strong>${insight.title}</strong> – ${insight.detail}</p>`
  detailGrid.appendChild(article)
}

function enhanceBudgetCeiling(): void {
  injectBudgetStyles()
  injectBudgetInput()
  injectBudgetInsight()
}

if (typeof document !== 'undefined') {
  document.addEventListener('input', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement) || !target.matches('[data-budget-ceiling]')) return
    const value = Number(target.value)
    budgetCeiling = target.value.trim() && Number.isFinite(value) && value > 0 ? value : undefined
  })

  const observer = new MutationObserver(enhanceBudgetCeiling)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  enhanceBudgetCeiling()
}
