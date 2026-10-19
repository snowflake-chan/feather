import assert from 'node:assert/strict';

import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';
import {
  resolveRenamedProjectMesh,
  runtimeMeshAssets,
} from '../src/project/runtime-mesh-assets';

const validHash = 'QmSKfrPgmkCoomW2tbpHkynGL5aCd4qRA2JSBG1QDhRJzJ';
const meshAssets = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity).meshAssets;
meshAssets['mesh/valid.vb'] = {
  modelId: 1,
  hash: validHash,
  modelPreviewHash: '',
  animated: false,
  updatedAt: '',
};
// This is the partial model data retained by older VOXA imports. Passing this
// to migrateVoxel('') causes the exact "retrieveContent ... invalid hash" error.
meshAssets['mesh/legacy-incomplete.vb'] = {
  modelId: 2,
  hash: '',
  modelPreviewHash: '',
  animated: false,
  updatedAt: '',
};

assert.deepEqual(
  runtimeMeshAssets(meshAssets).map(([path]) => path),
  ['mesh/valid.vb'],
  'runtime model preparation must discard entries without a usable content hash',
);

const renamedModelId = 43;
const oldPath = 'mesh/改名前模型.vb';
const newPath = 'mesh/改名后模型.vb';
meshAssets[newPath] = {
  modelId: renamedModelId,
  hash: validHash,
  modelPreviewHash: '',
  animated: false,
  updatedAt: '',
};

assert.deepEqual(
  resolveRenamedProjectMesh(oldPath, renamedModelId, meshAssets, {
    [renamedModelId]: {
      hash: validHash,
      path: newPath,
      bounds: [2, 3, 4],
      motionIds: [],
    },
  }),
  {
    hash: validHash,
    path: newPath,
    bounds: [2, 3, 4],
    motionIds: [],
  },
  'renaming a saved project model must retain every placed entity through its stable model id',
);

console.log('runtime mesh asset integrity regression passed');
