export declare const PLAYER_ADMIN_CAPABILITIES: readonly ["players.view", "sessions.view", "account-bans.view", "players.manage", "players.ban", "sessions.manage", "identity-bans.view", "identity-bans.manage", "players.create", "players.export", "players.delete", "passwords.reset", "creator-access.view", "creator-access.manage", "creator-tokens.view", "creator-tokens.manage", "play-maps.view", "play-maps.manage", "containers.view", "containers.manage", "audit.view"];
export type PlayerAdminCapability = (typeof PLAYER_ADMIN_CAPABILITIES)[number];
export type PlayerAdminRequirement = PlayerAdminCapability | 'owner';
export type PlayerAdminRole = 'owner' | 'admin' | 'moderator';
export declare const PLAYER_ADMIN_GRANTABLE_CAPABILITIES: readonly ["players.view", "sessions.view", "account-bans.view", "players.manage", "players.ban", "sessions.manage", "identity-bans.view", "identity-bans.manage", "players.create", "players.export", "players.delete", "passwords.reset", "creator-access.view", "creator-access.manage", "creator-tokens.view", "creator-tokens.manage", "play-maps.view", "play-maps.manage", "containers.view", "containers.manage", "audit.view"];
export declare const PLAYER_ADMIN_CAPABILITY_META: Record<PlayerAdminCapability, {
    label: string;
    description: string;
}>;
export declare function normalizePlayerAdminCapabilities(value: unknown): PlayerAdminCapability[];
export declare function effectivePlayerAdminCapabilities(role: PlayerAdminRole, assigned?: readonly string[]): PlayerAdminCapability[];
export declare function roleHasPlayerAdminPermission(role: PlayerAdminRole, requirement: PlayerAdminRequirement, assigned?: readonly string[]): boolean;
