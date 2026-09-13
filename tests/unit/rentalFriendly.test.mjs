import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

const source = await readFile(new URL('../../public/rentalFriendly.js', import.meta.url), 'utf8')
const transformed = `${source.replace('export function buildRentalFriendlyInsight', 'function buildRentalFriendlyInsight')}\nthis.buildRentalFriendlyInsight = buildRentalFriendlyInsight;`
const context = { document: undefined }
vm.createContext(context)
vm.runInContext(transformed, context)
const buildRentalFriendlyInsight = context.buildRentalFriendlyInsight

test('returns no insight when rental mode is not selected', () => {
  assert.equal(buildRentalFriendlyInsight(false), null)
})

test('prioritizes reversible changes for a rental', () => {
  const insight = buildRentalFriendlyInsight(true)
  assert.equal(insight.title, 'Mietfreundlich und reversibel planen')
  assert.match(insight.detail, /zurückbauen/)
  assert.match(insight.detail, /ausdrücklich erlaubt/)
  assert.match(insight.detail, /Ausgangszustand dokumentieren/)
})
