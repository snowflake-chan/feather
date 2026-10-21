export type LocalPlayerRole = 'player' | 'moderator' | 'admin';
export type LocalPlayerStatus = 'active' | 'banned';
export type RuntimePlayerIdentity = {
    deviceHash?: string;
    subjectId: string;
    userId: string;
    username: string;
    boxId: string;
    userKey: string;
    displayName: string;
    avatar: string;
    avatarSkinId: string;
    creatorAccess: boolean;
    creatorPermissions: readonly string[];
    creatorCliPermissions?: readonly string[];
    role: LocalPlayerRole;
    status: LocalPlayerStatus;
    expiresAt: number;
};
export declare function signRuntimePlayerIdentity(identity: Omit<RuntimePlayerIdentity, 'expiresAt' | 'userKey'> & Partial<Pick<RuntimePlayerIdentity, 'userKey'>>, secret: string, ttlMs?: number): string;
export declare function verifyRuntimePlayerIdentity(token: string, secret: string, now?: number): RuntimePlayerIdentity | null;
export declare function createPlayerUserKey(subjectId: string, secret: string): string;
//# sourceMappingURL=local-player-identity.d.ts.map