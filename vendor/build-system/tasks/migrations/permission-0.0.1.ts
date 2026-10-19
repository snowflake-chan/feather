import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.0.1';
export const toVersion = '0.0.2';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.0.2';
  permissions.prevHash = hash;

  const groupIds = Object.keys(permissions.groups);
  groupIds.forEach((group) => {
    const { permissions: permission } = permissions.groups[group];
    if (permission.editProject) {
      permission.editModel = true;
      permission.editScene = true;
      permission.editFile = true;
      permission.editHierarchy = true;
    } else {
      permission.editModel = false;
      permission.editScene = false;
      permission.editFile = false;
      permission.editHierarchy = false;
    }
  });

  return bs.storeJSON(permissions);
}
