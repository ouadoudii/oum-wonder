import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOrientationInsight } from '../../public/windowOrientation.js'

test('returns null when orientation is unknown', () => {
  assert.equal(buildOrientationInsight(null), null)
})

test('gives south-facing glare guidance', () => {
  const insight = buildOrientationInsight('Süd')
  assert.equal(insight?.title, 'Südausrichtung berücksichtigt')
  assert.match(insight?.detail ?? '', /Blend- und Hitzeschutz/)
})

test('gives north-facing warmth guidance', () => {
  const insight = buildOrientationInsight('Nord')
  assert.match(insight?.detail ?? '', /gleichmäßig und kühl/)
  assert.match(insight?.detail ?? '', /warme Oberflächen/)
})
