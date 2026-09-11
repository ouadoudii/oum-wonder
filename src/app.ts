import { createConcept } from './designEngine.js'
import { analyseImage, neutralSignals } from './imageAnalysis.js'
import type { Budget, ConceptDirection, DesignConcept, ImageSignals, Mode, RoomType } from './types.js'

const roomTypes: RoomType[] = ['Wohnzimmer', 'Küche', 'Schlafzimmer', 'Bad', 'Arbeitszimmer', 'Essbereich', 'Flur', 'Andere']
const budgets: Record<Budget, { title: string; sub: string }> = {
  smart: { title: 'Clever', sub: 'viel Wirkung, wenig Umbau' },
  balanced: { title: 'Ausgewogen', sub: 'gezielte Änderungen' },
  bold: { title: 'Neu gedacht', sub: 'auch größere Eingriffe' },
}
const directions: Record<ConceptDirection, string> = { 0: 'Architektonisch ruhig', 1: 'Warm & wohnlich', 2: 'Mutig & kontrastreich' }

type Step = 'start' | 'brief' | 'result'
interface State {
  step: Step
  imageUrl: string | null
  fileName: string
  signals: ImageSignals
  mode: Mode
  roomType: RoomType
  budget: Budget
  concern: string
  direction: ConceptDirection
  concept: DesignConcept | null
  isAnalysing: boolean
  activeMarker: number
}

const state: State = {
  step: 'start', imageUrl: null, fileName: '', signals: neutralSignals, mode: 'inspire', roomType: 'Wohnzimmer', budget: 'balanced', concern: '', direction: 0, concept: null, isAnalysing: false, activeMarker: 0,
}

const appRoot = document.querySelector<HTMLElement>('#app')
if (!appRoot) throw new Error('App root missing')
const root: HTMLElement = appRoot

function escapeHtml(value: string): string {
  return value.replace(/[&<>'\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char)
}
function icon(name: string): string {
  const glyphs: Record<string, string> = { sparkle: '✦', camera: '◉', arrow: '→', back: '←', check: '✓', light: '☼', paint: '◒', reset: '↻' }
  return `<span class="glyph" aria-hidden="true">${glyphs[name] ?? '•'}</span>`
}
function signalLabel(signals: ImageSignals): string {
  if (signals.brightness < 0.4) return 'eher dunkel'
  if (signals.brightness > 0.66) return 'lichtstark'
  return 'ausgeglichen'
}
function signalPercent(value: number): number { return Math.round(Math.min(1, Math.max(0, value)) * 100) }
function brightnessInsight(value: number): string {
  if (value < 0.4) return 'Wenig Helligkeit – Lichtführung und reflektierende Flächen bekommen Vorrang.'
  if (value > 0.66) return 'Viel Helligkeit – Kontraste und blendfreie Akzente können stärker inszeniert werden.'
  return 'Ausgewogene Helligkeit – vorhandenes Tageslicht wird gezielt weitergeführt.'
}
function warmthInsight(value: number): string {
  if (value < 0.42) return 'Kühle Bildwirkung – warme Materialien und Lichttemperaturen schaffen Balance.'
  if (value > 0.64) return 'Warme Bildwirkung – helle, gebrochene Kontraste sorgen für mehr Tiefe.'
  return 'Ausgewogene Wärme – die Materialwahl kann neutral und ruhig bleiben.'
}
function saturationInsight(value: number): string {
  if (value > 0.5) return 'Viele kräftige Farbreize – eine ruhigere Grundpalette bringt mehr Einheit.'
  if (value < 0.2) return 'Sehr zurückhaltende Farben – ein gezielter Akzent kann dem Raum Charakter geben.'
  return 'Ruhige Farbintensität – einzelne Akzente können präzise gesetzt werden.'
}
function renderPhotoAnalysis(): string {
  return `<section class="plan-section" aria-label="Fotoanalyse"><div class="section-heading"><span>Was dein Foto zeigt</span><small>direkt im Browser analysiert</small></div><p class="photo-analysis-intro">Diese Bildsignale fließen direkt in die Prioritäten deiner Raumvision ein.</p><div class="details-grid"><article>${icon('light')}<span class="mini-label">Lichtniveau · ${signalPercent(state.signals.brightness)}%</span><p>${brightnessInsight(state.signals.brightness)}</p></article><article>${icon('sparkle')}<span class="mini-label">Wärmewirkung · ${signalPercent(state.signals.warmth)}%</span><p>${warmthInsight(state.signals.warmth)}</p></article><article>${icon('paint')}<span class="mini-label">Farbintensität · ${signalPercent(state.signals.saturation)}%</span><p>${saturationInsight(state.signals.saturation)}</p></article></div></section>`
}
function renderDirectionPicker(): string {
  if (state.mode !== 'inspire') return ''
  return `<section class="plan-section" aria-label="Gestaltungsrichtung"><div class="section-heading"><span>Drei Richtungen für denselben Raum</span><small>direkt vergleichen</small></div><div class="chip-scroll" role="group" aria-label="Gestaltungsrichtung">${([0, 1, 2] as ConceptDirection[]).map((direction) => `<button class="chip ${state.direction === direction ? 'active' : ''}" data-direction="${direction}">${directions[direction]}</button>`).join('')}</div></section>`
}
function renderConceptPins(concept: DesignConcept): string {
  const positions = ['pin-one', 'pin-two', 'pin-three']
  return concept.recommendations.slice(0, 3).map((item, index) => `<button class="idea-pin ${positions[index]}" data-marker="${index}" aria-label="Idee ${index + 1}: ${escapeHtml(item.title)}" aria-pressed="${state.activeMarker === index}">${index + 1}</button>`).join('')
}
function renderMarkerDetail(concept: DesignConcept): string {
  const markerItems = concept.recommendations.slice(0, 3)
  const item = markerItems[state.activeMarker] ?? markerItems[0]
  if (!item) return ''
  const number = Math.min(state.activeMarker, markerItems.length - 1) + 1
  return `<div class="marker-explainer"><div class="section-heading"><span>Ideen im Bild</span><small>Marker antippen</small></div><article class="recommendation" data-testid="marker-detail" aria-live="polite"><div class="recommendation-number">${number}</div><div><div class="recommendation-title-row"><h3>${item.title}</h3><span>${item.impact}er Effekt</span></div><p>${item.detail}</p><small>Konzeptidee – keine vermessene Position im Foto.</small></div></article></div>`
}
function topbar(compact = false): string {
  return `<header class="topbar${compact ? ' compact' : ''}">${compact ? `<button class="icon-button" data-action="back-to-brief" aria-label="Zurück">${icon('back')}</button>` : ''}<div class="brand"><span class="brand-mark">O</span><span>Oum Wonder</span></div>${compact ? `<button class="icon-button" data-action="reset" aria-label="Neu starten">${icon('reset')}</button>` : `<span class="brand-tagline">Räume neu denken</span>`}</header>`
}
function renderStart(): string {
  const hasImage = Boolean(state.imageUrl)
  return `${topbar()}<section class="hero-copy"><div class="eyebrow">${icon('sparkle')} Renovieren beginnt mit einer besseren Idee</div><h1>Zeig mir den Raum.<br><em>Ich sehe, was möglich ist.</em></h1><p>Oum Wonder denkt Licht, Proportionen, Möbel, Farbe und Materialien als ein einziges Konzept – nicht als lose Deko-Tipps.</p></section><section class="upload-card"><input id="room-photo-input" data-testid="room-photo-input" type="file" accept="image/*" capture="environment" class="visually-hidden">${hasImage ? `<div class="photo-preview"><img src="${escapeHtml(state.imageUrl ?? '')}" alt="Ausgewählter Raum"><div class="photo-status"><span>${icon('check')} Foto bereit</span><button data-action="choose-photo">Ändern</button></div></div>` : `<button class="upload-zone" data-action="choose-photo"><div class="camera-orbit">${icon('camera')}</div><strong>Raum fotografieren</strong><span>oder Foto auswählen</span></button>`}${hasImage ? `<div class="image-insight">${icon('sparkle')}<span>${state.isAnalysing ? 'Foto wird gelesen …' : `Erster Eindruck: ${signalLabel(state.signals)}`}</span><small>${escapeHtml(state.fileName)}</small></div>` : ''}</section><section class="mode-section"><h2>Was soll Oum Wonder tun?</h2><div class="mode-grid"><button class="mode-card ${state.mode === 'inspire' ? 'selected' : ''}" data-mode="inspire"><div class="mode-icon">${icon('sparkle')}</div><strong>Überrasch mich</strong><span>Neue Perspektiven, an die du selbst noch nicht gedacht hast.</span><div class="radio-dot" aria-hidden="true"></div></button><button class="mode-card ${state.mode === 'solve' ? 'selected' : ''}" data-mode="solve"><div class="mode-icon">${icon('light')}</div><strong>Gezielt verbessern</strong><span>Beschreibe, was dich stört – wir lösen es als Ganzes.</span><div class="radio-dot" aria-hidden="true"></div></button></div></section><div class="bottom-actions sticky"><button class="primary-button full" data-action="continue" ${!hasImage || state.isAnalysing ? 'disabled' : ''}>Raum neu denken ${icon('arrow')}</button>${!hasImage ? '<small>Füge zuerst ein Foto hinzu.</small>' : ''}</div>`
}
function renderBrief(): string {
  return `${topbar()}<section class="brief-header"><button class="back-link" data-action="back-start">${icon('back')} Foto & Modus</button><div class="eyebrow">${icon('sparkle')} Fast fertig</div><h1>${state.mode === 'inspire' ? 'Gib mir nur den Rahmen.' : 'Was stört dich am Raum?'}</h1><p>${state.mode === 'inspire' ? 'Oum Wonder übernimmt die kreative Richtung. Du bestimmst nur Raum und Spielraum.' : 'Schreib es so, wie du es jemandem im Raum erklären würdest.'}</p></section><section class="brief-form"><div><label class="field-label">Welcher Raum ist das?</label><div class="chip-scroll" role="group" aria-label="Raumtyp">${roomTypes.map((room) => `<button class="chip ${state.roomType === room ? 'active' : ''}" data-room="${room}">${room}</button>`).join('')}</div></div>${state.mode === 'solve' ? `<div class="text-field-wrap"><label for="concern">Was soll besser werden?</label><textarea id="concern" maxlength="500" rows="5" placeholder="Zum Beispiel: Die Küche wirkt dunkel und eng. Ich möchte mehr Licht, mehr Arbeitsfläche und dass sie ruhiger und hochwertiger aussieht.">${escapeHtml(state.concern)}</textarea><small id="concern-count">${state.concern.length}/500</small></div>` : ''}<div class="budget-group"><label class="field-label">Wie weit dürfen wir denken?</label><div class="budget-options">${(Object.keys(budgets) as Budget[]).map((budget) => `<button class="budget-card ${state.budget === budget ? 'active' : ''}" data-budget="${budget}"><span>${budgets[budget].title}</span><small>${budgets[budget].sub}</small></button>`).join('')}</div></div></section><div class="bottom-actions sticky"><button class="primary-button full" data-action="generate" ${state.mode === 'solve' && state.concern.trim().length < 4 ? 'disabled' : ''}>${icon('sparkle')} Meine Raumvision erstellen</button>${state.mode === 'solve' && state.concern.trim().length < 4 ? '<small>Beschreibe kurz, was dich stört.</small>' : ''}</div>`
}
function renderResult(): string {
  const concept = state.concept
  if (!concept) return renderStart()
  return `${topbar(true)}<section class="result-hero"><div class="eyebrow">${icon('sparkle')} Deine Raumvision</div><h1>${concept.name}</h1><p>${concept.thesis}</p></section>${renderDirectionPicker()}<section class="vision-stage" aria-label="Raumvorschau"><div class="vision-image-wrap"><img src="${escapeHtml(state.imageUrl ?? '')}" alt="Hochgeladener Raum" class="vision-image"><div class="vision-filter"></div><div class="vision-label original">Heute</div><div class="vision-label concept">Vision</div>${renderConceptPins(concept)}</div><div class="palette-row" aria-label="Farbpalette">${concept.palette.map((color) => `<span style="background:${color}"></span>`).join('')}</div>${renderMarkerDetail(concept)}</section>${renderPhotoAnalysis()}<section class="signature-card"><div class="signature-icon">${icon('sparkle')}</div><div><span class="mini-label">Der Oum-Wonder-Move</span><h2>${concept.signatureMove}</h2></div></section><section class="plan-section"><div class="section-heading"><span>Was verändert den Raum wirklich?</span><small>Priorisiert statt überladen</small></div><div class="recommendation-list">${concept.recommendations.map((item, index) => `<article class="recommendation"><div class="recommendation-number">${index + 1}</div><div><div class="recommendation-title-row"><h3>${item.title}</h3><span>${item.impact}er Effekt</span></div><p>${item.detail}</p></div></article>`).join('')}</div></section><section class="details-grid"><article>${icon('light')}<span class="mini-label">Licht</span><p>${concept.lighting}</p></article><article>${icon('arrow')}<span class="mini-label">Raumfluss</span><p>${concept.layout}</p></article><article>${icon('paint')}<span class="mini-label">Oberflächen</span><p>${concept.surfaces}</p></article></section><section class="first-steps"><div class="section-heading"><span>So würdest du anfangen</span><small>ohne Fehlkäufe</small></div>${concept.firstSteps.map((item) => `<div class="step-row">${icon('check')}<span>${item}</span></div>`).join('')}</section><div class="bottom-actions result-actions"><button class="secondary-button" data-action="back-to-brief">Variante ändern</button><button class="primary-button" data-action="reset">Neuen Raum starten ${icon('arrow')}</button></div>`
}
function conceptInput() { return { mode: state.mode, roomType: state.roomType, concern: state.concern, budget: state.budget, signals: state.signals, direction: state.direction } }
function render(): void { root.innerHTML = state.step === 'start' ? renderStart() : state.step === 'brief' ? renderBrief() : renderResult(); bindEvents() }
function bindEvents(): void {
  root.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', () => {
    const action = element.dataset.action
    if (action === 'choose-photo') root.querySelector<HTMLInputElement>('#room-photo-input')?.click()
    if (action === 'continue' && state.imageUrl) { state.step = 'brief'; render(); window.scrollTo(0, 0) }
    if (action === 'back-start') { state.step = 'start'; render(); window.scrollTo(0, 0) }
    if (action === 'back-to-brief') { state.step = 'brief'; render(); window.scrollTo(0, 0) }
    if (action === 'generate') { state.direction = 0; state.activeMarker = 0; state.concept = createConcept(conceptInput()); state.step = 'result'; render(); window.scrollTo(0, 0) }
    if (action === 'reset') reset()
  }))
  root.querySelector<HTMLInputElement>('#room-photo-input')?.addEventListener('change', async (event) => {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl)
    state.imageUrl = URL.createObjectURL(file); state.fileName = file.name; state.isAnalysing = true; render(); state.signals = await analyseImage(file); state.isAnalysing = false; render()
  })
  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => { state.mode = button.dataset.mode as Mode; render() }))
  root.querySelectorAll<HTMLButtonElement>('[data-room]').forEach((button) => button.addEventListener('click', () => { state.roomType = button.dataset.room as RoomType; render() }))
  root.querySelectorAll<HTMLButtonElement>('[data-budget]').forEach((button) => button.addEventListener('click', () => { state.budget = button.dataset.budget as Budget; render() }))
  root.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach((button) => button.addEventListener('click', () => { state.direction = Number(button.dataset.direction) as ConceptDirection; state.activeMarker = 0; state.concept = createConcept(conceptInput()); render(); window.scrollTo(0, 0) }))
  root.querySelectorAll<HTMLButtonElement>('[data-marker]').forEach((button) => button.addEventListener('click', () => { state.activeMarker = Number(button.dataset.marker); render() }))
  root.querySelector<HTMLTextAreaElement>('#concern')?.addEventListener('input', (event) => {
    const textarea = event.currentTarget as HTMLTextAreaElement; state.concern = textarea.value
    const count = root.querySelector<HTMLElement>('#concern-count'); if (count) count.textContent = `${state.concern.length}/500`
    const generate = root.querySelector<HTMLButtonElement>('[data-action="generate"]'); if (generate) generate.disabled = state.concern.trim().length < 4
  })
}
function reset(): void {
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl)
  Object.assign(state, { step: 'start', imageUrl: null, fileName: '', signals: neutralSignals, mode: 'inspire', roomType: 'Wohnzimmer', budget: 'balanced', concern: '', direction: 0, concept: null, isAnalysing: false, activeMarker: 0 })
  render(); window.scrollTo(0, 0)
}
render()