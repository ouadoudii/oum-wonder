import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEverydayNeedsInsight } from '../../public/everydayNeeds.js'

test('returns null without everyday needs', () => {
  assert.equal(buildEverydayNeedsInsight([]), null)
})

test('combines multiple everyday constraints without duplicates', () => {
  const insight = buildEverydayNeedsInsight(['Kinder', 'Haustiere', 'Kinder'])
  assert.equal(insight?.title, 'Alltag mitgedacht')
  assert.match(insight?.detail ?? '', /abgerundete Kanten/)
  assert.match(insight?.detail ?? '', /Kratz- und schmutzunempfindliche Materialien/)
  assert.equal((insight?.detail.match(/abgerundete Kanten/g) ?? []).length, 1)
})

test('gives barrier-reduced circulation guidance', () => {
  const insight = buildEverydayNeedsInsight(['Barrierearm'])
  assert.match(insight?.detail ?? '', /Breite, freie Laufwege/)
  assert.match(insight?.detail ?? '', /Stolperkanten/)
})
