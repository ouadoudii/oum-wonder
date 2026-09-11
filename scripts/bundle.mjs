import { readFile, writeFile } from 'node:fs/promises'

const engine = (await readFile('public/designEngine.js', 'utf8'))
  .replace(/export function createConcept/, 'function createConcept')
const image = (await readFile('public/imageAnalysis.js', 'utf8'))
  .replace(/export const neutralSignals/, 'const neutralSignals')
  .replace(/export async function analyseImage/, 'async function analyseImage')
const app = (await readFile('public/app.js', 'utf8'))
  .replace(/^import .*?;?\n/gm, '')

await writeFile('public/bundle.js', `${engine}\n${image}\n${app}`)
