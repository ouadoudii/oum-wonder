import test from 'node:test'
import assert from 'node:assert/strict'
import { formatPlanText } from '../../public/exportPlan.js'

test('formats a portable room concept with priorities and first steps', () => {
  const text = formatPlanText({
    title: 'Kitchen, Reframed',
    thesis: 'Eine ruhige, klare Küche mit besserem Licht.',
    signature: 'Eine durchgehende Lichtfuge.',
    recommendations: ['Licht zuerst lösen', 'Volumen bündeln'],
    details: ['Licht\nDrei Lichtschichten', 'Raumfluss\nArbeitsdreieck vereinfachen'],
    firstSteps: ['Lichttest machen', 'Arbeitsablauf prüfen'],
  })

  assert.match(text, /Oum Wonder – Kitchen, Reframed/)
  assert.match(text, /Der Oum-Wonder-Move\nEine durchgehende Lichtfuge/)
  assert.match(text, /Prioritäten\n1\. Licht zuerst lösen\n2\. Volumen bündeln/)
  assert.match(text, /Erste Schritte\n1\. Lichttest machen\n2\. Arbeitsablauf prüfen/)
})
