import { BuildSystem } from './build-system';
export declare function start(paths: {
    tasksDir: string;
    assetsDir: string;
    targetDir: string;
}, config: {
    contentHostURL: string;
    maxIPFSConnections: number;
    ossUploadURL: string;
    ossCdnURL: string;
    nextUidListUsingGet: (query: {
        num: number;
    }) => Promise<string[]>;
}): Promise<{
    buildSystem: BuildSystem;
    logger: import("pino").Logger<never>;
}>;
//# sourceMappingURL=build.d.ts.map