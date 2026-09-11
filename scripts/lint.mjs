import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const forbidden = [
  { pattern: /\beval\s*\(/, message: 'eval is forbidden' },
  { pattern: /@ts-ignore/, message: '@ts-ignore is forbidden' },
  { pattern: /:\s*any\b/, message: 'explicit any is forbidden' },
  { pattern: /console\.log\s*\(/, message: 'console.log is forbidden in production source' },
  { pattern: /sk-[A-Za-z0-9_-]{10,}/, message: 'possible API secret detected' },
]

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const result = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) result.push(...await files(full))
    else if (/\.(ts|html|css)$/.test(entry.name)) result.push(full)
  }
  return result
}

let failures = 0
for (const file of [...await files('src'), 'index.html', 'styles.css']) {
  const text = await readFile(file, 'utf8')
  for (const rule of forbidden) {
    if (rule.pattern.test(text)) {
      process.stderr.write(`${file}: ${rule.message}\n`)
      failures += 1
    }
  }
}
if (failures) process.exit(1)
process.stdout.write('Lint checks passed: no unsafe or suppressed patterns found.\n')
