import { PrebakeCache } from '@box/build-system/project/prebake-schema';
import { CollaborationMigrationVO } from '@box/apis';
import {
  CreateraPermissionNameMap,
  mapPermissionToCreatera,
} from '@box/utils/createra-permissions';
import { PermissionMemberRDA } from '@box/schema/permissions/permission-rda';

/**
 * 转换prebake的权限到java接口入参
 * @param prebake
 * @param mapId
 */
export function getServerPermissionsFromPrebake(
  prebake: PrebakeCache,
  mapId: string,
) {
  return {
    mapId,
    mapPrivacy: prebake.permissions.accessLevel,
    members: prebake.permissions.collaborators.map((collaborator) => {
      return {
        ban: !!prebake.permissions.banned[collaborator],
        roles: Object.keys(prebake.permissions.groups).filter((groupName) => {
          return prebake.permissions.groups[groupName].members[collaborator];
        }),
        userId: collaborator,
      };
    }),
    //移除掉guest
    roles: Object.keys(prebake.permissions.groups)
      .filter((groupName) => groupName !== 'guest')
      .map((groupName) => {
        return {
          name: groupName,
          permissions: mapPermissionToCreatera(
            prebake.permissions.groups[groupName].permissions,
          ),
        };
      }),
  };
}

/**
 * 更新prebake的权限
 * @param res
 * @param prebake
 */
export function applyServerPermissions(
  res: CollaborationMigrationVO,
  prebake: PrebakeCache,
) {
  prebake.permissions.accessLevel = res.privacy;

  // 更新users
  prebake.permissions.users = res.members.reduce((acc, member) => {
    acc[member.userId] = {
      createdAt: new Date(),
    };
    return acc;
  }, {});

  // 更新group的permission
  res.roles.forEach(({ name: roleName, permissions }) => {
    const roleItem = prebake.permissions.groups[roleName];
    const roleMembers: string[] = [];
    res.members.forEach((member) => {
      if (member.roles && !member.ban) {
        member.roles.forEach((role) => {
          if (role.roleName === roleName) {
            roleMembers.push(member.userId);
          }
        });
      }
    });

    const members = PermissionMemberRDA.stateSchema.clone(
      PermissionMemberRDA.stateSchema.identity,
    );
    roleMembers.forEach((userId) => {
      members[userId] = {
        addedAt: new Date(),
      };
    });

    roleItem.members = members;

    if (roleItem) {
      roleItem.permissions = {
        ...roleItem.permissions,
        ...permissions.reduce((acc, permissionName) => {
          acc[CreateraPermissionNameMap[permissionName]] = true;
          return acc;
        }, {}),
      };
    }
  });

  const collaborators: string[] = [];
  res.members.forEach((member) => {
    if (member.roles.length && !member.ban && !member.guest) {
      collaborators.push(member.userId);
    }
  });

  prebake.permissions.collaborators = collaborators;
}
