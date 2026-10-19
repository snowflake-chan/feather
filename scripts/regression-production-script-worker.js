'use strict'

// Production images deploy only runtime dependencies. The script worker is
// already compiled to JavaScript there, so it must never preload SWC.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const source = fs.readFileSync(
  path.join(__dirname, '../src/utils/script-server/ivmp/ivmp-script-socket-server.ts'),
  'utf8',
)

assert.match(
  source,
  /execArgv:\s*scriptWorkerExecArgv\(join\(__dirname, '\.\/ivmp-process-entry'\)\)/,
  'the worker must select its exec arguments from the compiled entry path',
)
assert.match(
  source,
  /function scriptWorkerExecArgv\([\s\S]*?extname\(entryPath\) === '\.ts'/,
  'only a TypeScript development worker may preload @swc-node/register',
)
assert.doesNotMatch(
  source,
  /execArgv:\s*\['-r', '@swc-node\/register'/,
  'production workers must not unconditionally preload a development dependency',
)

console.log('production script worker regression passed')
