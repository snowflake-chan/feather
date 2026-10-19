import type { Logger } from 'pino';
import { BuildSystem } from '../build-system';
import { ContentServer } from '@box/content-server';
export declare function buildResources(buildSystem: BuildSystem, contentServer: ContentServer, logger: Logger, paths: {
    tasksDir: string;
    assetsDir: string;
    targetDir: string;
}, skipPattern?: RegExp): Promise<void>;
//# sourceMappingURL=resource.d.ts.map