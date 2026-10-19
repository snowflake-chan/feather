'use strict'

const fs = require('fs')
const path = require('path')

const distRoot = path.resolve(__dirname, '../dist')
const pending = [distRoot]

while (pending.length) {
  const directory = pending.pop()
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      pending.push(entryPath)
      continue
    }
    if (!entry.isFile()) continue
    const source = fs.readFileSync(entryPath, 'utf8')
    const normalized = source.replace(/\r\n/g, '\n')
    if (normalized !== source) fs.writeFileSync(entryPath, normalized)
  }
}
