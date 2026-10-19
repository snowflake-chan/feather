import { AssetType } from '@box/schema/project/project-rda';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.25';
export const toVersion = '0.3.26';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.26';
  project.prevHash = hash;

  const assets = await bs.retrieveJSON(project.assets);

  const audioAssets = {};

  for (const key in assets) {
    const asset = assets[key];

    if (asset.type === AssetType.AUDIO) {
      audioAssets[key] = asset;
    }
  }

  project.audioAssets = await bs.storeJSON(audioAssets);

  return bs.storeJSON(project);
}
