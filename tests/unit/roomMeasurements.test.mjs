import test from 'node:test'
import assert from 'node:assert/strict'
import { analyseRoomMeasurements } from '../../public/roomMeasurements.js'

test('keeps measurements fully optional', () => {
  assert.equal(analyseRoomMeasurements({}), null)
})

test('flags low ceilings and narrow compact rooms', () => {
  const result = analyseRoomMeasurements({ width: 2.2, depth: 5, height: 2.3 })
  assert.ok(result)
  assert.match(result.detail, /Decke ist eher niedrig/)
  assert.match(result.detail, /Grundriss ist deutlich länglich/)
  assert.match(result.detail, /Fläche ist kompakt/)
})

test('recognizes generous height and area', () => {
  const result = analyseRoomMeasurements({ width: 6, depth: 6, height: 3.2 })
  assert.ok(result)
  assert.match(result.detail, /große Raumhöhe/)
  assert.match(result.detail, /Fläche ist großzügig/)
})

test('returns neutral guidance for ordinary proportions', () => {
  const result = analyseRoomMeasurements({ width: 4, depth: 5, height: 2.6 })
  assert.ok(result)
  assert.match(result.detail, /gut nutzbaren Bereich/)
})
