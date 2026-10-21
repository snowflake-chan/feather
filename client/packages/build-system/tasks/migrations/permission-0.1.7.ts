import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.1.6';
export const toVersion = '0.1.7';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.1.7';
  permissions.type = 'permission';
  permissions.prevHash = hash;

  const groups = await bs.retrieveJSON(permissions.groups);

  const groupNames = Object.keys(groups);

  for (let i = 0; i < groupNames.length; i++) {
    const group = groups[groupNames[i]];
    if (group.permissions) {
      group.permissions.editMarket = false;
      group.permissions.editStatisticsData = false;
      group.permissions.editPublish = false;
    }
  }
  const newGroupsHash = await bs.storeJSON(groups);
  permissions.groups = newGroupsHash;

  return bs.storeJSON(permissions);
}
