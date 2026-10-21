'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const protocol = require('..')

test('keeps Creator CLI script paths and writes behind one protocol contract', () => {
  assert.equal(
    protocol.creatorProjectScriptPath('0123456789abcdef0123', 'server', 'main.js'),
    '/api/creator/v1/projects/0123456789abcdef0123/scripts/server/main.js',
  )
  const input = protocol.parseCreatorProjectScriptWrite({
    projectId: ' 0123456789abcdef0123 ', side: 'server', entry: 'main.js', content: 'export {}',
  })
  assert.deepEqual(input, {
    projectId: '0123456789abcdef0123', side: 'server', entry: 'main.js', content: 'export {}',
  })
  assert.deepEqual(protocol.writeCreatorProjectScript({
    updateProjectScript(...args) {
      assert.deepEqual(args, ['0123456789abcdef0123', 'server', 'main.js', 'export {}'])
      return { entry: 'main.js', side: 'server', revision: 'next', hash: 'blob', shared: true }
    },
  }, input), { entry: 'main.js', side: 'server', revision: 'next', hash: 'blob', shared: true })
})

test('rejects malformed Creator CLI writes before they reach a storage adapter', () => {
  assert.throws(
    () => protocol.parseCreatorProjectScriptWrite({ projectId: 'map', side: 'server', entry: '../secret.js', content: '' }),
    { code: 'SCRIPT_ENTRY_INVALID' },
  )
  assert.throws(
    () => protocol.parseCreatorProjectScriptWrite({ projectId: 'map', side: 'worker', entry: 'main.js', content: '' }),
    { code: 'SCRIPT_SIDE_INVALID' },
  )
  assert.throws(
    () => protocol.parseCreatorProjectScriptWrite({ projectId: 'map', side: 'client', entry: 'main.js' }),
    { code: 'SCRIPT_CONTENT_REQUIRED' },
  )
})

test('does not own Creator authorization policy', () => {
  assert.equal('CREATOR_CAPABILITIES' in protocol, false)
  assert.equal('hasCreatorCapability' in protocol, false)
})
