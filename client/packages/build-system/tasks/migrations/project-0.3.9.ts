import { BuildSystem } from '../../type';

enum EditItemType {
  Folder = 'folder',
  Entity = 'entity',
}

interface EditItem {
  id: string;
  type: EditItemType;
}

export const name = 'project';
export const fromVersion = '0.3.8';
export const toVersion = '0.3.9';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.9';
  project.prevHash = hash;

  // add folder data
  const editRoot: EditItem[] = [];
  const entities = await bs.retrieveJSON(project.entities);
  Object.keys(entities).forEach((id) => {
    entities[id].folderId = '';
    editRoot.push({
      id,
      type: EditItemType.Entity,
    });
  });

  project.entities = await bs.storeJSON(entities);
  project.editRoot = await bs.storeJSON(editRoot);
  project.folders = await bs.storeJSON({});

  return bs.storeJSON(project);
}
