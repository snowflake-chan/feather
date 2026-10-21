import { PermissionToken } from '@box/schema/permissions/permission-rda';
export declare function generatePermissionToken(secret: string, token: PermissionToken): string;
export declare function parsePermissionToken(secret: string, message: string): import("@box/mudb/schema/struct").Struct<{
    expireAt: import("@box/mudb/schema").MuDate;
    group: import("@box/mudb/schema").MuUTF8;
}> | null;
//# sourceMappingURL=permission-token.d.ts.map