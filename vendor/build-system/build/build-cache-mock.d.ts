import { BuildCacheAPI } from './type';
export declare class MockBuildCache implements BuildCacheAPI {
    private cache;
    private mutex;
    constructor();
    private token;
    retrieve(name: string, params: any[]): Promise<string>;
    invalidate(name: string, params: any[], result?: string): Promise<void>;
    store(name: string, params: any[], method: () => Promise<string>): Promise<string>;
}
//# sourceMappingURL=build-cache-mock.d.ts.map