import { type PlayerAdminCapability } from './policy';
export declare const PLAYER_ADMIN_VIEWS: readonly ["overview", "players", "online-sessions", "account-bans", "identity-bans", "security", "admins", "permission-groups", "script-moderation", "play-maps", "container-play", "container-creator", "container-profiles", "container-resource-groups", "creator-access", "creator-tokens"];
export type PlayerAdminView = (typeof PLAYER_ADMIN_VIEWS)[number];
export type PlayerAdminNavigationActor = {
    role: 'moderator' | 'admin' | 'owner';
    permissions: readonly string[];
};
/** The least privilege needed to reveal and open each console page. */
export declare const PLAYER_ADMIN_VIEW_REQUIREMENTS: Record<PlayerAdminView, PlayerAdminCapability | 'owner'>;
export declare function canOpenPlayerAdminView(actor: PlayerAdminNavigationActor | undefined, view: PlayerAdminView): boolean;
export declare function allowedPlayerAdminViews(actor: PlayerAdminNavigationActor | undefined): ("overview" | "players" | "online-sessions" | "account-bans" | "identity-bans" | "security" | "admins" | "permission-groups" | "script-moderation" | "play-maps" | "container-play" | "container-creator" | "container-profiles" | "container-resource-groups" | "creator-access" | "creator-tokens")[];
export declare function playerAdminFallbackView(actor: PlayerAdminNavigationActor | undefined): PlayerAdminView;
