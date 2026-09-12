import test from 'node:test'
import assert from 'node:assert/strict'
import { analyseLightDistribution, describeLightDistribution } from '../../public/spatialLight.js'

function grayscaleZones(left, center, right, height = 2) {
  const width = 6
  const values = [left, left, center, center, right, right]
  const bytes = []
  for (let y = 0; y < height; y += 1) {
    for (const value of values) bytes.push(value, value, value, 255)
  }
  return { data: new Uint8ClampedArray(bytes), width, height }
}

test('detects a clearly brighter right side from pixel data', () => {
  const sample = grayscaleZones(35, 105, 235)
  const result = analyseLightDistribution(sample.data, sample.width, sample.height)
  assert.equal(result.dominant, 'right')
  assert.ok(result.right > result.center)
  assert.ok(result.center > result.left)
  assert.ok(result.imbalance > 0.7)
})

test('keeps evenly lit images balanced instead of inventing a light direction', () => {
  const sample = grayscaleZones(120, 121, 119)
  const result = analyseLightDistribution(sample.data, sample.width, sample.height)
  assert.equal(result.dominant, 'balanced')
  assert.ok(result.imbalance < 0.02)
})

test('turns the measured light direction into actionable room advice', () => {
  const sample = grayscaleZones(230, 120, 45)
  const result = analyseLightDistribution(sample.data, sample.width, sample.height)
  const description = describeLightDistribution(result)
  assert.equal(result.dominant, 'left')
  assert.equal(description.title, 'Links heller')
  assert.match(description.detail, /rechte Seite/)
  assert.match(description.detail, /indirektem Licht/)
})

test('returns a safe balanced result for invalid image buffers', () => {
  const result = analyseLightDistribution(new Uint8ClampedArray([0, 0, 0, 255]), 3, 3)
  assert.equal(result.dominant, 'balanced')
  assert.equal(result.imbalance, 0)
})
