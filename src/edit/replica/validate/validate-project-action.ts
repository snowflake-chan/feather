import { PermissionSet } from '@box/schema/permissions/permission-rda';
import { ProjectAction } from '@box/schema/replica/replica-schema';

export function checkProjectActionSequence(
  permissions: PermissionSet,
  actions: ProjectAction[],
) {
  const { editModel, editScene, editFile, editProject } = permissions;
  const canEditProject = editProject || editModel || editScene || editFile;
  if (!canEditProject) {
    return false;
  }
  for (let i = 0; i < actions.length; ++i) {
    const type = actions[i].type;
    if (
      type === 'prevHash' ||
      type === 'voxels' ||
      type === 'version' ||
      type === 'type' ||
      type === 'timestamp'
    ) {
      return false;
    }
  }
  return true;
}
