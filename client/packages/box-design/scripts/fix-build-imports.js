'use strict'

const fs = require('fs')
const path = require('path')

const buildRoot = path.resolve(__dirname, '../build')
const replacements = [
  [
    /(?:\.\.\/)+(?:common\/temp\/)?node_modules\/\.pnpm\/style-inject@[^/]+\/node_modules\/style-inject\/dist\/style-inject\.es\.js/g,
    'style-inject',
  ],
  [
    /(?:\.\.\/)+(?:common\/temp\/)?node_modules\/\.pnpm\/[^'"\n]+\/node_modules\/tslib\/tslib\.es6\.js/g,
    'tslib',
  ],
]

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      visit(filePath)
      continue
    }
    if (!entry.name.endsWith('.js')) continue

    const source = fs.readFileSync(filePath, 'utf8')
    const output = replacements.reduce(
      (text, [pattern, replacement]) => text.replace(pattern, replacement),
      source,
    )
    if (output !== source) fs.writeFileSync(filePath, output)
  }
}

visit(buildRoot)
