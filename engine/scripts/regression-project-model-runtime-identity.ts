import assert from 'assert';

import { resolveSeedMeshInfo } from '@box/build-system/project/bake';
import {
  HotProjectSchema,
  MeshAssetSchema,
} from '@box/schema/project/hot-schema';

const projectPath = 'mesh/New-model.vb';
const localPath = 'mesh/New-model__local_20.vb';
const meshAssets = HotProjectSchema.clone(HotProjectSchema.identity).meshAssets;

meshAssets[projectPath] = MeshAssetSchema.clone(MeshAssetSchema.identity);
meshAssets[projectPath].hash = 'project-edited-hash';
meshAssets[projectPath].bounds = [1, 2, 3];

meshAssets[localPath] = MeshAssetSchema.clone(MeshAssetSchema.identity);
meshAssets[localPath].hash = 'local-source-hash';
meshAssets[localPath].bounds = [4, 5, 6];

const collidingIdCache = {
  20: {
    hash: 'local-source-hash',
    path: localPath,
    bounds: [4, 5, 6] as [number, number, number],
    motionIds: [],
  },
};

assert.deepEqual(
  resolveSeedMeshInfo(projectPath, 20, meshAssets, collidingIdCache),
  {
    hash: 'project-edited-hash',
    path: projectPath,
    bounds: [1, 2, 3],
    motionIds: [],
  },
  'an edited project model must not be replaced by a local model with the same id',
);

assert.equal(
  resolveSeedMeshInfo(
    'mesh/old-name.vb',
    20,
    meshAssets,
    collidingIdCache,
  )?.path,
  localPath,
  'a missing legacy path must still fall back to the current model-id mapping',
);

console.log('project model runtime identity regression passed');
