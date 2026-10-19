import {
  AssetsRDA,
  TreeNodes,
  DeleteAssetsRDA,
} from '@box/schema/project/project-rda';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.16';
export const toVersion = '0.3.17';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.17';
  project.prevHash = hash;
  const entitiesTree: TreeNodes = await bs.retrieveJSON(project.entitiesTree);

  // 添加默认动作ID
  Object.keys(entitiesTree).forEach((id) => {
    const node = entitiesTree[id];
    if (!node.value) {
      return;
    }
    node.value.defaultMotionId = '';
  });
  project.entitiesTree = await bs.storeJSON(entitiesTree);

  // add animated in assets
  const assets: typeof AssetsRDA.stateSchema.identity = await bs.retrieveJSON(
    project.assets,
  );
  Object.keys(assets).forEach((key) => {
    assets[key].animated = false;
  });

  // add animated in delete assets
  const deleteAssets: typeof DeleteAssetsRDA.stateSchema.identity =
    await bs.retrieveJSON(project.deleteAssets);
  deleteAssets.forEach((deleteAsset) => {
    deleteAsset.value.animated = false;
  });

  project.assets = await bs.storeJSON(assets);
  project.deleteAssets = await bs.storeJSON(deleteAssets);

  return bs.storeJSON(project);
}
