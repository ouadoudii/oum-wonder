import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const source = await readFile(new URL('../../public/rentalFriendly.js', import.meta.url), 'utf8')
const transformed = `${source
  .replace('export function buildRentalFriendlyInsight', 'function buildRentalFriendlyInsight')
  .replace('export function buildRentalAlternatives', 'function buildRentalAlternatives')}\nthis.buildRentalFriendlyInsight = buildRentalFriendlyInsight; this.buildRentalAlternatives = buildRentalAlternatives;`
const context = { document: undefined }
vm.createContext(context)
vm.runInContext(transformed, context)
const buildRentalFriendlyInsight = context.buildRentalFriendlyInsight
const buildRentalAlternatives = context.buildRentalAlternatives

test('returns no insight when rental mode is not selected', () => {
  assert.equal(buildRentalFriendlyInsight(false), null)
  assert.deepEqual(buildRentalAlternatives(false), [])
})

test('prioritizes reversible changes for a rental', () => {
  const insight = buildRentalFriendlyInsight(true)
  assert.equal(insight.title, 'Mietfreundlich und reversibel planen')
  assert.match(insight.detail, /zurückbauen/)
  assert.match(insight.detail, /ausdrücklich erlaubt/)
  assert.match(insight.detail, /Ausgangszustand dokumentieren/)
})

test('translates fixed interventions into actionable reversible alternatives', () => {
  const alternatives = buildRentalAlternatives(true)
  assert.equal(alternatives.length, 3)
  assert.match(alternatives[0].title, /Einbauten/)
  assert.match(alternatives[0].detail, /freistehende, modulare Möbel/)
  assert.match(alternatives[1].detail, /steckbare Wandleuchten/)
  assert.match(alternatives[2].detail, /rückbaubaren Belägen/)
})
