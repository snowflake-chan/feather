import assert from 'assert';

import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';
import { mergeExtraProjectInfo } from '../src/project/project-extra';

const validHash = 'QmSKfrPgmkCoomW2tbpHkynGL5aCd4qRA2JSBG1QDhRJzJ';

const packaged = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
packaged.meshAssets['mesh/valid.vb'] = {
  modelId: 1,
  hash: validHash,
  modelPreviewHash: '',
  animated: false,
  updatedAt: '',
};
// This is the exact corrupt state produced by the old partial-save path.
// It must not reach the model preload, which rejects an empty hash and makes
// the map and model panel appear to lose all models.
packaged.meshAssets['mesh/interrupted-save.vb'] = {
  modelId: 2,
  hash: '',
  modelPreviewHash: '',
  animated: false,
  updatedAt: '',
};

const localLibrary = ExtraProjectInfoSchema.clone(ExtraProjectInfoSchema.identity);
localLibrary.meshAssets['mesh/local-valid__local_3.vb'] = {
  modelId: 3,
  hash: validHash,
  modelPreviewHash: '',
  animated: false,
  updatedAt: '',
};
localLibrary.meshAssets['mesh/local-incomplete__local_4.vb'] = {
  modelId: 4,
  hash: ' ',
  modelPreviewHash: '',
  animated: false,
  updatedAt: '',
};

const merged = mergeExtraProjectInfo(packaged, localLibrary);
assert.deepEqual(
  Object.keys(merged.meshAssets).sort(),
  ['mesh/local-valid__local_3.vb', 'mesh/valid.vb'],
  'only renderable model assets may be exposed to the runtime',
);
assert.equal(merged.meshAssets['mesh/valid.vb'].hash, validHash);

console.log('project model asset integrity regression passed');
