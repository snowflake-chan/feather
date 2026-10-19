import assert from 'assert';

import { resolveActiveSeedMeshId } from '../src/seed/active-seed-mesh';

const historicalMeshTable = ['', 'mesh/deleted-model.vb'];

assert.equal(
  resolveActiveSeedMeshId(
    historicalMeshTable,
    {},
    'mesh/deleted-model.vb',
  ),
  -1,
  'a deleted project model must not resolve through the runtime historical mesh table',
);

assert.equal(
  resolveActiveSeedMeshId(
    historicalMeshTable,
    { 'mesh/deleted-model.vb': {} },
    'mesh/deleted-model.vb',
  ),
  1,
  'an active project model should keep resolving to its runtime mesh id',
);

console.log('deleted project model regression passed');
