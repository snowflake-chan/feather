import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.1.2';
export const toVersion = '0.1.3';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.1.3';
  permissions.type = 'permission';
  permissions.prevHash = hash;

  const users = await bs.retrieveJSON(permissions.users);
  const groups = await bs.retrieveJSON(permissions.groups);
  const banned = await bs.retrieveJSON(permissions.banned);

  const userList: any = [];
  const groupNames = Object.keys(groups);
  const userIds = Object.keys(users).sort(
    (a, b) => users[a].createdAt - users[b].createdAt,
  );
  for (let i = 0; i < userIds.length; i++) {
    const userId = +userIds[i];
    userList[i] = { userId: userId, roles: [] };
    if (userId === permissions.owner) {
      userList[i].roles.push('owner');
    }
    for (let j = 0; j < groupNames.length; j++) {
      const members = groups[groupNames[j]].members;
      if (members[userId]) {
        userList[i].roles.push(groupNames[j]);
      }
    }
  }

  const collaborators = userList
    .filter(({ userId, roles }) => {
      if (permissions.owner === userId) {
        return false;
      }
      if (banned[userId]) {
        return false;
      }
      if (roles.length === 1 && roles[0] === 'guest') {
        return false;
      }
      return true;
    })
    .map((user) => user.userId);

  const collaboratorsHash = await bs.storeJSON(collaborators);

  permissions.collaborators = collaboratorsHash;

  return bs.storeJSON(permissions);
}
