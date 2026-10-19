import { BuildSystemAPI } from '../type';
import { Permissions } from '@box/schema/permissions/permission-rda';
export declare function storePermissions(bs: BuildSystemAPI, permissions: Permissions): Promise<string>;
export declare function retrievePermissions(bs: BuildSystemAPI, hash: string): Promise<{
    hash: string;
    permissions: Permissions;
}>;
//# sourceMappingURL=permission-serialize.d.ts.map