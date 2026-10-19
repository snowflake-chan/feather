import { Vec3Schema } from '@box/schema/utils/math-schema';
import type { BuildSystem } from '../../../build-system';

const fromVersion = '0.0.1';
const toVersion = '0.0.2';

async function noMigration(bs: BuildSystem, hash: string) {
  return hash;
}

export const UiTree_002 = {
  name: 'uiTree',
  fromVersion,
  toVersion,
  migration: noMigration,
};

/**
 * 音频也需要migration
 * - 0.3.17补充animated字段，设置为false
 * - 0.3.13补充bounds字段
 */
async function audioAssetsMigration(bs: BuildSystem, hash: string) {
  const audioAssets = await bs.retrieveJSON(hash);

  const newAudioAssets = {};

  Object.keys(audioAssets).forEach((key) => {
    const asset = audioAssets[key];

    if (!asset) {
      return;
    }

    asset.animated = false;

    if (!asset.bounds) {
      asset.bounds = Vec3Schema.clone(Vec3Schema.identity);
    }

    newAudioAssets[key] = asset;
  });

  return bs.storeJSON(newAudioAssets);
}

export const AudioAssets_002 = {
  name: 'audioAssets',
  fromVersion,
  toVersion,
  migration: audioAssetsMigration,
};
