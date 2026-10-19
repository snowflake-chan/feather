import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.1.5';
export const toVersion = '0.1.6';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.1.6';
  permissions.type = 'permission';
  permissions.prevHash = hash;

  // migrate the accessLevel changed 0 to 1
  if (permissions.accessLevel < 1) {
    permissions.accessLevel = 1;
  }

  return bs.storeJSON(permissions);
}
