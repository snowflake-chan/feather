import { apis } from 'src/apis/local-api';
import { CollaborationRoleVO } from '@box/apis';

let roleNameIDMap: CollaborationRoleVO[] = [];
export const refreshNameIDMap = async (mapId) => {
  const data = await apis.collaboration.roleListUsingGet({
    mapId,
  });
  roleNameIDMap = data;
  return data;
};

/**
 * 根据角色名获取角色id
 * @param roleName
 */
export function getRoleId(roleName: string) {
  const item = roleNameIDMap.find((role) => role.name === roleName);
  if (!item) {
    throw new Error('roleName not found');
  }
  return item.id;
}
