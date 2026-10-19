import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.29';
export const toVersion = '0.3.30';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.30';
  project.prevHash = hash;

  // 由于 entitiesTree 可能非常大，存取都会比较耗时
  const entitiesTree = await bs.retrieveJSON(project.entitiesTree);

  Object.keys(entitiesTree).forEach((id) => {
    const node = entitiesTree[id];
    if (!node.value) {
      return;
    }
    node.value.staticShadow = true;

    // 某次发版后实体添加了editLock字段但没有做过数据迁移
    // 本次顺便修正一下
    if (node.value.editLock) {
      return;
    }
    node.value.editLock = false;
  });

  project.entitiesTree = await bs.storeJSON(entitiesTree);

  // update bakedShadow for environment
  const environment = await bs.retrieveJSON(project.environment);

  environment.bakedShadow = {
    texture: '',
    data: '',
    chunkShift: 6,
  };

  project.environment = await bs.storeJSON(environment);

  return bs.storeJSON(project);
}
