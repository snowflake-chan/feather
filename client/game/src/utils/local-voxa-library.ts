/**
 * The local VOXA workspace is server-wide. A map id scopes project-owned
 * assets, so sending it while listing the Local library hides ordinary VOXA
 * models and skins that have no map association.
 */
export function getLibraryMapId(
  isLocalGameServer: boolean,
  mapId: number,
) {
  return isLocalGameServer ? undefined : mapId;
}
