import { PermissionSet } from '@box/schema/permissions/permission-rda';
import { VoxelWrite } from '@box/schema/voxel/voxel-protocol';

export function checkVoxelWriteSequence(
  permissions: PermissionSet,
  writes: VoxelWrite[],
) {
  if (!permissions.editVoxels) {
    return false;
  }
  // TODO
  return true;
}
