import assert from 'assert';

import {
  AssetType,
  DeleteAssetsRDA,
} from '@box/schema/project/project-rda';
import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';
import {
  moveProjectModelToTrash,
  purgeProjectModelFromTrash,
  restoreProjectModelFromTrash,
} from '../src/project/project-model-trash';

const meshPath = 'mesh/edited-project-model.vb';
const extra = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
const trash = DeleteAssetsRDA.stateSchema.clone(
  DeleteAssetsRDA.stateSchema.identity,
);
extra.meshAssets[meshPath] = {
  modelId: 20,
  hash: 'project-model-hash',
  modelPreviewHash: 'project-preview-hash',
  animated: true,
  updatedAt: '2026-08-13T00:00:00.000Z',
};

moveProjectModelToTrash(extra, trash, meshPath, [1, 2, 3], 42);
assert.equal(extra.meshAssets[meshPath], undefined);
assert.equal(trash.length, 1);
assert.deepEqual(trash[0], {
  key: meshPath,
  value: {
    ownerId: 0,
    contentId: 20,
    hash: 'project-model-hash',
    previewImage: 'project-preview-hash',
    type: AssetType.VOXEL_MODEL,
    size: 42,
    bounds: [1, 2, 3],
    animated: true,
  },
});

restoreProjectModelFromTrash(
  extra,
  trash,
  meshPath,
  '2026-08-13T01:00:00.000Z',
);
assert.equal(trash.length, 0);
assert.deepEqual(extra.meshAssets[meshPath], {
  modelId: 20,
  hash: 'project-model-hash',
  modelPreviewHash: 'project-preview-hash',
  animated: true,
  updatedAt: '2026-08-13T01:00:00.000Z',
});

moveProjectModelToTrash(extra, trash, meshPath);
purgeProjectModelFromTrash(trash, meshPath);
assert.equal(trash.length, 0);
assert.equal(extra.meshAssets[meshPath], undefined);

console.log('project model trash lifecycle regression passed');
