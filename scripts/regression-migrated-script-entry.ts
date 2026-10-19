import assert from 'node:assert/strict';

import { resolveRuntimeScriptEntry } from '../src/script/script-entry';

assert.equal(
  resolveRuntimeScriptEntry('_migrated_index.js', { 'index.js': {} }),
  'index.js',
  'legacy migrated maps must run their map index.js directly',
);
assert.equal(
  resolveRuntimeScriptEntry('game.js', { 'index.js': {} }),
  'game.js',
  'a non-migrated custom entry must remain unchanged',
);

console.log('migrated script entry regression passed');
