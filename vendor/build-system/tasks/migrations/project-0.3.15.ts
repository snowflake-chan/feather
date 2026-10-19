import {
  ROOT_ID,
  ROOT_NAME,
  TreeNodeType,
} from '@box/schema/project/murda-tree';
import { TreeNode } from '@box/schema/project/project-rda';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.14';
export const toVersion = '0.3.15';

enum EditItemType {
  Folder = 'folder',
  Entity = 'entity',
}

interface EditItem {
  id: string;
  type: EditItemType;
}

interface EntityFolder {
  name: string;
  parentId: string;
  children: EditItem[];
}

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.15';
  project.prevHash = hash;

  // 构造根目录节点
  const editRoot: EditItem[] = await bs.retrieveJSON(project.editRoot);
  const entitiesTree: { [key: string]: TreeNode } = {
    [ROOT_ID]: {
      id: ROOT_ID,
      name: ROOT_NAME,
      type: TreeNodeType.root,
      parentId: '',
      childrenIds: editRoot.map((i) => i.id),
      value: undefined,
    },
  };
  delete project.editRoot;

  // 构造所有的父节点
  const folders = await bs.retrieveJSON(project.folders);
  Object.keys(folders).forEach((folderId) => {
    const folder: EntityFolder = folders[folderId];
    entitiesTree[folderId] = {
      id: folderId,
      name: folder.name,
      type: TreeNodeType.node,
      parentId: folder.parentId === '' ? ROOT_ID : folder.parentId,
      childrenIds: folder.children.map((i) => i.id),
      value: undefined,
    };
  });
  delete project.folders;

  // 构造所有的叶子节点
  const entities = await bs.retrieveJSON(project.entities);
  Object.keys(entities).forEach((entityId) => {
    const entity = entities[entityId];
    entitiesTree[entityId] = {
      id: entityId,
      name: entity.name,
      type: TreeNodeType.leaf,
      parentId: entity.folderId === '' ? ROOT_ID : entity.folderId,
      childrenIds: [],
      value: entity,
    };

    delete entity.folderId;
  });
  delete project.entities;

  project.entitiesTree = await bs.storeJSON(entitiesTree);

  return bs.storeJSON(project);
}
