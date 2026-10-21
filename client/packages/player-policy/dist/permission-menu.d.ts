import type { PlayerAdminCapability } from './policy';
export type PlayerAdminPermissionMenuSection = {
    key: string;
    title: string;
    capabilities: readonly PlayerAdminCapability[];
};
export type PlayerAdminPermissionMenuCategory = {
    key: string;
    title: string;
    sections: readonly PlayerAdminPermissionMenuSection[];
};
/**
 * Permission-group presentation mirrors the player-admin navigation. Keep every
 * grantable capability here so the UI never presents an orphaned API permission.
 */
export declare const PLAYER_ADMIN_PERMISSION_MENU: readonly PlayerAdminPermissionMenuCategory[];
