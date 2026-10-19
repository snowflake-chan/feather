import type { TreeNodes, AssetsRDA } from '@box/schema/project/project-rda';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.19';
export const toVersion = '0.3.20';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.20';
  project.prevHash = hash;
  const entitiesTree: TreeNodes = await bs.retrieveJSON(project.entitiesTree);
  const assets: typeof AssetsRDA.stateSchema.identity = await bs.retrieveJSON(
    project.assets,
  );

  // 添加模型ID
  Object.keys(entitiesTree).forEach((id) => {
    const node = entitiesTree[id];
    if (!node.value) {
      return;
    }
    node.value.meshId = assets[node.value.mesh]?.contentId || 0;
  });

  project.entitiesTree = await bs.storeJSON(entitiesTree);

  return bs.storeJSON(project);
}
