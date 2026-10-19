import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.1.3';
export const toVersion = '0.1.4';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.1.4';
  permissions.type = 'permission';
  permissions.prevHash = hash;

  // migrate the collaborator list duplicate

  const collaboratorsHash = permissions.collaborators;
  let collaborators = await bs.retrieveJSON(collaboratorsHash);

  const users = await bs.retrieveJSON(permissions.users);
  const groups = await bs.retrieveJSON(permissions.groups);
  const banned = await bs.retrieveJSON(permissions.banned);

  collaborators = [];

  const bannedId = Object.keys(banned);
  for (let i = 0; i < bannedId.length; i++) {
    const index = collaborators.indexOf(+bannedId[i]);
    if (index !== -1) {
      collaborators.splice(index, 1);
    }
  }

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

  collaborators = userList
    .filter(({ userId, roles }) => {
      if (permissions.owner === userId) {
        return false;
      }
      if (banned[userId]) {
        return false;
      }
      if (roles.length === 0 || (roles.length === 1 && roles[0] === 'guest')) {
        return false;
      }
      return true;
    })
    .map((user) => user.userId);

  const newCollaboratorsHash = await bs.storeJSON(collaborators);

  permissions.collaborators = newCollaboratorsHash;

  return bs.storeJSON(permissions);
}
