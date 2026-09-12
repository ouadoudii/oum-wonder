import test from 'node:test'
import assert from 'node:assert/strict'
import { buildConstraintInsight } from '../../public/roomConstraints.js'

test('keeps fixed room elements fully optional', () => {
  assert.equal(buildConstraintInsight([]), null)
})

test('builds guidance for windows and radiators', () => {
  const result = buildConstraintInsight(['Fenster', 'Heizkörper'])
  assert.ok(result)
  assert.match(result.title, /Fenster, Heizkörper/)
  assert.match(result.detail, /Fensterflächen/)
  assert.match(result.detail, /Luftzirkulation/)
})

test('deduplicates repeated constraints', () => {
  const result = buildConstraintInsight(['Türen', 'Türen'])
  assert.ok(result)
  assert.equal(result.title, 'Feste Elemente berücksichtigt: Türen')
  assert.equal((result.detail.match(/Türflügel/g) ?? []).length, 1)
})
