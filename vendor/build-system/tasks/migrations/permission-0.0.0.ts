import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.0.0';
export const toVersion = '0.0.1';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.0.1';
  permissions.prevHash = hash;

  delete permissions.allowGuest;
  permissions.accessLevel = 2;

  return bs.storeJSON(permissions);
}
