/**
 * Editor capabilities understood by the local Creator and VOXA clients.
 *
 * These stable wire values are kept outside the removed cloud-platform
 * clients because local permission checks still exchange them at runtime.
 */
export enum Permissions {
  UserEnginePlay = 'user:engine:play',
  UserEngineManage = 'user:engine:manage',
  UserEngineEditor = 'user:engine:editor',
  UserEngineEditorGenerate = 'user:engine:editor:generate',
  UserVoxelManage = 'user:voxel:manage',
  UserVoxelEditor = 'user:voxel:editor',
  UserVoxelEditorMultiObj = 'user:voxel:editor:multi_object',
  UserVoxelEditorMultiObjAnimation = 'user:voxel:editor:multi_object:animation',
  ResourceEnginePlay = 'resource:engine:play',
}
