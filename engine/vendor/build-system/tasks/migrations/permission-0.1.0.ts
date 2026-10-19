import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.0.2';
export const toVersion = '0.1.0';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.1.0';
  permissions.type = 'permission';
  permissions.prevHash = hash;

  //  will be handled when we call fromJSON on the project

  const versionControl = permissions.versionControl;
  const groups = permissions.groups;
  const users = permissions.users;
  const banned = permissions.banned;

  const [versionControlHash, groupsHash, usersHash, bannedHash] =
    await Promise.all([
      bs.storeJSON(versionControl),
      bs.storeJSON(groups),
      bs.storeJSON(users),
      bs.storeJSON(banned),
    ]);

  permissions.versionControl = versionControlHash;
  permissions.groups = groupsHash;
  permissions.users = usersHash;
  permissions.banned = bannedHash;

  return bs.storeJSON(permissions);
}
