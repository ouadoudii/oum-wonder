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

test('uses photo signals to identify low-light opportunities even without a written complaint', () => {
  const result = createConcept({ ...base, signals: { brightness: 0.43, warmth: 0.5, saturation: 0.3 } })
  assert.ok(result.recommendations.some((item) => item.title === 'Licht zuerst lösen'))
})

test('balances cool-looking rooms with warmer materials and light', () => {
  const result = createConcept({ ...base, signals: { brightness: 0.62, warmth: 0.3, saturation: 0.25 } })
  assert.ok(result.recommendations.some((item) => item.title === 'Kühle Raumwirkung ausbalancieren'))
})

test('recognizes window and daylight concerns as a distinct opportunity', () => {
  const result = createConcept({ ...base, mode: 'solve', concern: 'Das Fenster ist eigentlich groß, aber das Tageslicht kommt kaum tief in den Raum.' })
  assert.ok(result.recommendations.some((item) => item.title === 'Fensterzone als Raumverstärker nutzen'))
})

test('recognizes functional workflow issues beyond decoration', () => {
  const result = createConcept({ ...base, mode: 'solve', concern: 'Die Wege in der Küche sind unpraktisch und mir fehlt Arbeitsfläche.' })
  assert.ok(result.recommendations.some((item) => item.title === 'Funktion vor Dekoration ordnen'))
})

test('creates a more specific concept name for a dark problem-solving room', () => {
  const result = createConcept({ ...base, mode: 'solve', signals: { brightness: 0.3, warmth: 0.5, saturation: 0.3 } })
  assert.equal(result.name, 'Light & Flow Reset')
})

test('creates three genuinely distinct inspiration directions', () => {
  const calm = createConcept({ ...base, direction: 0 })
  const warm = createConcept({ ...base, direction: 1 })
  const bold = createConcept({ ...base, direction: 2 })
  assert.equal(calm.name, 'Kitchen, Reframed')
  assert.equal(warm.name, 'Warm Layers')
  assert.equal(bold.name, 'Bold Contrast')
  assert.notEqual(calm.signatureMove, warm.signatureMove)
  assert.notEqual(warm.signatureMove, bold.signatureMove)
  assert.ok(warm.recommendations.some((item) => item.title === 'Wärme in Schichten aufbauen'))
  assert.ok(bold.recommendations.some((item) => item.title === 'Einen mutigen Kontrast setzen'))
})

test('keeps targeted solve mode stable even if a direction value is present', () => {
  const result = createConcept({ ...base, mode: 'solve', concern: 'Mehr Ordnung', direction: 2 })
  assert.equal(result.name, 'Clear Space Reset')
  assert.doesNotMatch(result.thesis, /Bold Contrast/)
})

test('personalizes the first implementation step to the room workflow', () => {
  const kitchen = createConcept({ ...base, roomType: 'Küche', signals: { brightness: 0.7, warmth: 0.5, saturation: 0.3 } })
  const bedroom = createConcept({ ...base, roomType: 'Schlafzimmer', signals: { brightness: 0.7, warmth: 0.5, saturation: 0.3 } })
  assert.match(kitchen.firstSteps[0], /Kühlschrank, Spüle und Kochfeld/)
  assert.match(bedroom.firstSteps[0], /Bettposition und Schrankvolumen/)
  assert.notEqual(kitchen.firstSteps[0], bedroom.firstSteps[0])
})

test('turns dark photo signals into a concrete first lighting test', () => {
  const result = createConcept({ ...base, signals: { brightness: 0.25, warmth: 0.5, saturation: 0.3 } })
  assert.match(result.firstSteps[0], /Lichttest vor jedem Kauf/)
  assert.match(result.firstSteps[0], /drei Fotos aus gleicher Position/)
})

test('makes the final implementation step match the selected ambition budget', () => {
  const smart = createConcept({ ...base, budget: 'smart' })
  const balanced = createConcept({ ...base, budget: 'balanced' })
  const bold = createConcept({ ...base, budget: 'bold' })
  assert.match(smart.firstSteps[2], /Clever starten/)
  assert.match(balanced.firstSteps[2], /Ausgewogen planen/)
  assert.match(bold.firstSteps[2], /Neu gedacht vorbereiten/)
})

test('uses concern-specific decluttering before purchases in solve mode', () => {
  const result = createConcept({ ...base, mode: 'solve', concern: 'Die Möbel stehen chaotisch und alles ist zugestellt.', signals: { brightness: 0.7, warmth: 0.5, saturation: 0.3 } })
  assert.ok(result.firstSteps.some((step) => /Alles Bewegliche aus der wichtigsten Sicht- und Laufachse räumen/.test(step)))
})
