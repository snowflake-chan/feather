'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { minify } = require('@swc/core')

function collectJavaScript(target, files) {
  const stat = fs.statSync(target, { throwIfNoEntry: false })
  if (!stat) throw new Error(`Runtime JavaScript target does not exist: ${target}`)
  if (stat.isFile()) {
    if (target.endsWith('.js')) files.push(target)
    return
  }
  if (!stat.isDirectory()) return
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    collectJavaScript(path.join(target, entry.name), files)
  }
}

async function compactFile(file) {
  const source = fs.readFileSync(file, 'utf8')
  const result = await minify(source, {
    compress: false,
    mangle: false,
    module: false,
    sourceMap: false,
  })
  if (!result.code) throw new Error(`SWC produced an empty runtime file: ${file}`)
  fs.writeFileSync(file, `${result.code}\n`)
}

async function main(targets = process.argv.slice(2)) {
  if (targets.length === 0) {
    throw new Error('Usage: node compact-runtime-javascript.js <file-or-directory> [...]')
  }
  const files = []
  for (const target of targets) collectJavaScript(path.resolve(target), files)
  files.sort()
  for (const file of files) await compactFile(file)
  console.log(`Compacted ${files.length} first-party runtime JavaScript files`)
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}

module.exports = { collectJavaScript, compactFile, main }
