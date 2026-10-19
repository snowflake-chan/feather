import type { Logger } from 'pino';
import { BuildSystemAPI } from '../type';
import { ContentServer } from '@box/content-server';
export declare function createDefaultPermissions(spec: {
    userId: number;
    projectHash: string;
    contentServer: ContentServer;
    buildSystem: BuildSystemAPI;
    logger: Logger;
}): Promise<string>;
//# sourceMappingURL=permission-init.d.ts.map