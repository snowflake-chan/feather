const escaped = (value: string) => encodeURIComponent(value);

/** Stable paths consumed by the player administration application. */
export const playerAdminRoutes = {
  activity: '/api/play-admin/activity',
  admins: '/api/play-admin/admins',
  admin: (id: string) => `/api/play-admin/admins/${escaped(id)}`,
  containers: '/api/play-admin/containers',
  container: (mapId: string) => `/api/play-admin/containers/${escaped(mapId)}`,
  containerResourceGroups: '/api/play-admin/container-resource-groups',
  containerResourceGroup: (id: string) =>
    `/api/play-admin/container-resource-groups/${escaped(id)}`,
  identityBans: '/api/play-admin/identity-bans',
  login: '/api/play-admin/login',
  logout: '/api/play-admin/logout',
  libraryImport: '/api/play-admin/library/import',
  libraryImportPreview: '/api/play-admin/library/import?mode=preview',
  libraryImportReview: (reviewId: string) =>
    `/api/play-admin/library/import?reviewId=${escaped(reviewId)}`,
  libraryImportConfirm: (reviewId: string) =>
    `/api/play-admin/library/import?mode=confirm&reviewId=${escaped(reviewId)}`,
  libraryImportResource: (reviewId: string, resourceId: string) =>
    `/api/play-admin/library/import?mode=resource&reviewId=${escaped(reviewId)}&resourceId=${escaped(resourceId)}`,
  libraryWorlds: '/api/play-admin/library/worlds',
  libraryWorld: (id: string) => `/api/play-admin/library/worlds/${escaped(id)}`,
  libraryWorldStatus: '/api/play-admin/library/world-status',
  permissionGroups: '/api/play-admin/permission-groups',
  permissionGroup: (id: string) => `/api/play-admin/permission-groups/${escaped(id)}`,
  player: (subjectId: string) => `/api/play-admin/players/${escaped(subjectId)}`,
  players: '/api/play-admin/players',
  playerBatch: '/api/play-admin/players/batch',
  playerExport: '/api/play-admin/players/export',
  playerOverview: '/api/play-admin/players/overview',
  ownerSession: '/api/play-admin/owner-session',
  selfPassword: '/api/play-admin/self-password',
  verify: '/api/play-admin/verify',
} as const;
