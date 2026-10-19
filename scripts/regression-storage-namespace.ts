import assert from 'assert';

import { resolveGroupStorageNamespace } from '../src/storage/storage-namespace';
const {
  resolveMapRuntimeNamespace,
  resolveGroupRuntimeNamespace,
} = require('../../../apps/local-engine/src/runtime-storage-namespace');

assert.equal(resolveGroupStorageNamespace({
  groupStorageNamespace: 'group-main',
  dataStorageNamespace: 'map-one',
}), 'group-main');
assert.equal(resolveGroupStorageNamespace({
  groupId: 42,
  dataStorageNamespace: 'map-one',
}), '42');
assert.equal(resolveGroupStorageNamespace({
  dataStorageNamespace: 'map-one',
}), 'map-one');
assert.equal(resolveGroupStorageNamespace({
  containerName: 'map-two',
}), 'map-two');
assert.notEqual(resolveGroupStorageNamespace({}), 'global');

const mainPermanentMapId = '11111111111111111111';
const subPermanentMapId = '22222222222222222222';
const permanentGroupId = '33333333333333333333';
assert.equal(resolveMapRuntimeNamespace({
  permanentMapId: mainPermanentMapId,
}), mainPermanentMapId);
assert.equal(resolveMapRuntimeNamespace({
  permanentMapId: subPermanentMapId,
}), subPermanentMapId);
assert.equal(resolveGroupRuntimeNamespace({
  permanentMapGroupId: permanentGroupId,
  permanentMapId: mainPermanentMapId,
  explicitNamespace: 'global',
}), permanentGroupId);
assert.equal(resolveGroupRuntimeNamespace({
  permanentMapGroupId: permanentGroupId,
  permanentMapId: subPermanentMapId,
  explicitNamespace: 'global',
}), permanentGroupId);
assert.notEqual(resolveGroupRuntimeNamespace({
  permanentMapGroupId: '44444444444444444444',
  permanentMapId: '55555555555555555555',
  explicitNamespace: 'global',
}), permanentGroupId);

console.log('storage namespace regression passed');
