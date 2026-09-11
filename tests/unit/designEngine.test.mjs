import test from 'node:test'
import assert from 'node:assert/strict'
import { createConcept } from '../../public/designEngine.js'

const base = {
  mode: 'inspire', roomType: 'Küche', concern: '', budget: 'balanced', signals: { brightness: 0.5, warmth: 0.5, saturation: 0.3 },
}

test('creates a coherent concept with all core sections', () => {
  const result = createConcept(base)
  assert.ok(result.name)
  assert.equal(result.palette.length, 4)
  assert.ok(result.recommendations.length >= 2)
  assert.match(result.lighting, /Licht|licht/)
  assert.equal(result.firstSteps.length, 3)
})

test('prioritizes lighting when the image is dark', () => {
  const result = createConcept({ ...base, signals: { ...base.signals, brightness: 0.2 } })
  assert.equal(result.recommendations[0].title, 'Licht zuerst lösen')
  assert.match(result.lighting, /Drei Lichtschichten/)
})

test('understands natural-language proportion problems', () => {
  const result = createConcept({ ...base, mode: 'solve', concern: 'Der Raum wirkt eng und niedrig und die Tiefe geht verloren.' })
  assert.ok(result.recommendations.some((item) => item.title === 'Proportionen optisch strecken'))
})

test('combines multiple free-form concerns instead of a single rigid keyword path', () => {
  const result = createConcept({ ...base, mode: 'solve', concern: 'Es ist dunkel, die Möbel wirken chaotisch und der Raum fühlt sich klein an.' })
  const titles = result.recommendations.map((item) => item.title)
  assert.ok(titles.includes('Licht zuerst lösen'))
  assert.ok(titles.includes('Volumen bündeln'))
  assert.ok(titles.includes('Proportionen optisch strecken'))
})

test('budget changes the ambition framing', () => {
  assert.match(createConcept({ ...base, budget: 'smart' }).thesis, /wenig Umbau/)
  assert.match(createConcept({ ...base, budget: 'bold' }).thesis, /architektonischen Eingriffen/)
})
