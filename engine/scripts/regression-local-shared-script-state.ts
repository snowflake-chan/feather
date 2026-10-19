import assert from 'node:assert/strict';
import {
  applyLocalSharedScriptMutation,
  canPersistLocalSharedScript,
  isSharedAfterLocalScriptAction,
  localSharedScriptLockOwnerId,
} from '../src/edit/replica/local-shared-script-state';

assert.equal(isSharedAfterLocalScriptAction('share'), true);
assert.equal(
  isSharedAfterLocalScriptAction('save'),
  true,
  'saving a shared script must keep its editor replica marked as shared',
);
assert.equal(isSharedAfterLocalScriptAction('unshare'), false);
assert.equal(canPersistLocalSharedScript('save', true), true);
assert.equal(
  canPersistLocalSharedScript('save', false),
  false,
  'a stale map must not recreate a script another map has unshared',
);

const shared = {
  id: 'script-1', name: 'shared.js', hash: 'before', isClient: false,
  isShare: true, order: 1, lockedMapId: 0, lockedMapTitle: '',
};
const locked = applyLocalSharedScriptMutation(shared, {
  action: 'lock', ownerId: 101, ownerTitle: '主地图',
})!;
assert.equal(locked.lockedMapId, 101, 'the first map owns the edit lock');
assert.throws(
  () => applyLocalSharedScriptMutation(locked, { action: 'rename', name: 'renamed.js' }, 202),
  /locked by 主地图/,
  'another map cannot rename a script while it is being edited',
);
const saved = applyLocalSharedScriptMutation(locked, {
  action: 'save', hash: 'after', name: 'renamed.js', isClient: false, order: 2,
}, 101)!;
assert.equal(saved.hash, 'after', 'shared content changes are authoritative');
assert.equal(saved.name, 'renamed.js', 'shared file names are authoritative');
const unlocked = applyLocalSharedScriptMutation(saved, { action: 'unlock', ownerId: 101 }, 101)!;
assert.equal(unlocked.lockedMapId, 0, 'only the lock owner can release it');
assert.equal(
  applyLocalSharedScriptMutation(unlocked, { action: 'delete' }),
  undefined,
  'deleting a shared script removes it from every map snapshot',
);
assert.equal(
  localSharedScriptLockOwnerId('edit-main-1'),
  localSharedScriptLockOwnerId('edit-main-1'),
  'a runtime lock owner must remain stable across requests',
);
assert.notEqual(
  localSharedScriptLockOwnerId('edit-main-1'),
  localSharedScriptLockOwnerId('edit-submap-1'),
  'different local map runtimes must not share a lock owner',
);

console.log('local shared-script state regression passed');
