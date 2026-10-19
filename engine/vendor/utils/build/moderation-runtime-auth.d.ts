export type ModerationRuntimeIdentity = {
    mapId: string;
    runtimeId: string;
    mode: 'edit' | 'play';
    issuedAt: number;
    expiresAt: number;
};
export declare function issueModerationRuntimeToken(identity: Omit<ModerationRuntimeIdentity, 'issuedAt' | 'expiresAt'>, secret: string, now?: number): string;
export declare function verifyModerationRuntimeToken(token: string, secret: string, now?: number): ModerationRuntimeIdentity | null;
//# sourceMappingURL=moderation-runtime-auth.d.ts.map