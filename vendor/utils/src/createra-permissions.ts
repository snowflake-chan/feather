/**
 * 映射平台定义的权限点
 */
export const Permissions: Record<string, string> = {
  editPublish: 'engine:publish',
  debugger: 'engine:debug',
  editScripts: 'engine:script',
  editVoxels: 'engine:terrain',
  editModel: 'engine:model',
  editScene: 'engine:scene',
  editFile: 'engine:file',
  playButton: 'engine:run',
  editMarket: 'engine:market',
  editStatisticsData: 'statistics:data',
  editPlayer: 'engine:player',
};

/**
 * 映射平台权限点到本地权限点
 */
export const CreateraPermissionNameMap: Record<string, string> = {
  ...Object.entries(Permissions).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {}),
};

/**
 * 映射权限到平台权限点
 * @param enginePermissions
 */
export function mapPermissionToCreatera(enginePermissions: any) {
  const res: string[] = [];
  Object.entries(enginePermissions).forEach(([key, havePermission]) => {
    if (havePermission && Permissions[key]) {
      res.push(Permissions[key]);
    }
  });
  return res;
}
