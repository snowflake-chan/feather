import { AssetsRDA, DeleteAssetsRDA } from '@box/schema/project/project-rda';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.12';
export const toVersion = '0.3.13';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.13';
  project.prevHash = hash;

  // add bounds in assets
  const assets: typeof AssetsRDA.stateSchema.identity = await bs.retrieveJSON(
    project.assets,
  );
  Object.keys(assets).forEach((key) => {
    assets[key].bounds = Vec3Schema.clone(Vec3Schema.identity);
  });

  // add bounds in delete assets
  const deleteAssets: typeof DeleteAssetsRDA.stateSchema.identity =
    await bs.retrieveJSON(project.deleteAssets);
  deleteAssets.forEach((deleteAsset) => {
    deleteAsset.value.bounds = Vec3Schema.clone(Vec3Schema.identity);
  });

  project.assets = await bs.storeJSON(assets);
  project.deleteAssets = await bs.storeJSON(deleteAssets);
  return bs.storeJSON(project);
}
