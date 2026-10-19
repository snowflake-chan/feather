import {
  PermissionSet,
  PermissionAction,
} from '@box/schema/permissions/permission-rda';

export function checkPermissionActionSequence(
  permissions: PermissionSet,
  actions: PermissionAction[],
) {
  if (!permissions.editPermissions) {
    return false;
  }
  // don't alllow users to directly modify version control structure, force them to use separate synchronized api
  for (let i = 0; i < actions.length; ++i) {
    const action = actions[i];
    if (
      action.type === 'versionControl' ||
      action.type === 'prevHash' ||
      action.type === 'owner' ||
      action.type === 'type' ||
      action.type === 'timestamp'
    ) {
      return false;
    }
  }
  return true;
}
