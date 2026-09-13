import test from 'node:test'
import assert from 'node:assert/strict'
import { buildBudgetCeilingInsight } from '../../public/budgetCeiling.js'

test('returns null without a valid budget ceiling', () => {
  assert.equal(buildBudgetCeilingInsight(undefined), null)
  assert.equal(buildBudgetCeilingInsight(0), null)
})

test('focuses sub-1000 budgets on quick wins', () => {
  const insight = buildBudgetCeilingInsight(800)
  assert.equal(insight?.title, 'Budget auf Quick Wins fokussieren')
  assert.match(insight?.detail ?? '', /Umstellen, Licht, Farbe/)
})

test('groups mid-range budgets into a coordinated partial renovation', () => {
  const insight = buildBudgetCeilingInsight(9000)
  assert.equal(insight?.title, 'Budget als Teilrenovierung planen')
  assert.match(insight?.detail ?? '', /Reserve/)
})

test('structures larger budgets instead of presenting a fake estimate', () => {
  const insight = buildBudgetCeilingInsight(25000)
  assert.equal(insight?.title, 'Budget für größere Eingriffe strukturieren')
  assert.match(insight?.detail ?? '', /Planung/)
})
