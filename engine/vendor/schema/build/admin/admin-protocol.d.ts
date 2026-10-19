import { MuUnion, MuBoolean, MuVarint, MuStruct, MuASCII, MuUTF8, MuVoid, MuArray } from '@box/mudb/schema';
export declare const AdminCommandSchema: MuUnion<{
    pollUsers: MuVoid;
    ghost: MuBoolean;
    kick: MuVarint;
    ban: MuVarint;
    banIp: MuASCII;
    redirect: MuStruct<{
        userId: MuVarint;
        href: MuUTF8;
    }>;
    alert: MuStruct<{
        userId: MuVarint;
        message: MuUTF8;
    }>;
    scriptEval: MuUTF8;
    serverEval: MuUTF8;
    stopScripts: MuVoid;
    reloadProject: MuVoid;
    exitProcess: MuVoid;
    restartContainer: MuVoid;
    updateHash: MuASCII;
}>;
export type AdminCommand = typeof AdminCommandSchema.identity;
export declare const AdminUserSchema: MuStruct<{
    name: MuUTF8;
    entityId: MuVarint;
    userId: MuUTF8;
    ipAddress: MuASCII;
}>;
export type AdminUser = typeof AdminUserSchema.identity;
export declare const AdminUserSetSchema: MuArray<MuStruct<{
    name: MuUTF8;
    entityId: MuVarint;
    userId: MuUTF8;
    ipAddress: MuASCII;
}>>;
export declare const AdminEventSchema: MuUnion<{
    users: MuArray<MuStruct<{
        name: MuUTF8;
        entityId: MuVarint;
        userId: MuUTF8;
        ipAddress: MuASCII;
    }>>;
    log: MuUTF8;
}>;
export type AdminEvent = typeof AdminEventSchema.identity;
//# sourceMappingURL=admin-protocol.d.ts.map