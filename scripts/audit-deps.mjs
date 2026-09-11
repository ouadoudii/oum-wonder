import pkg from '../package.json' with { type: 'json' }
import lock from '../package-lock.json' with { type: 'json' }

const runtime = Object.keys(pkg.dependencies ?? {})
if (runtime.length > 0) {
  process.stderr.write(`Runtime dependencies are not expected in this MVP: ${runtime.join(', ')}\n`)
  process.exit(1)
}

const approvedDev = { typescript: '5.8.3' }
const dev = pkg.devDependencies ?? {}
const unexpected = Object.keys(dev).filter((name) => !(name in approvedDev))
const mismatched = Object.entries(approvedDev).filter(([name, version]) => dev[name] !== version)
if (unexpected.length || mismatched.length) {
  process.stderr.write('Dependency policy failed: only the pinned TypeScript compiler is allowed as a dev dependency.\n')
  process.exit(1)
}

if (lock.packages?.['node_modules/typescript']?.version !== approvedDev.typescript) {
  process.stderr.write('package-lock.json does not pin the approved TypeScript version.\n')
  process.exit(1)
}

process.stdout.write('Dependency policy passed: no runtime dependencies; TypeScript compiler is pinned.\n')
