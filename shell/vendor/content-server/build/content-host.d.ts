import { ContentServer } from './index';
export interface ContentRouterOptions {
    deniedHashes?: ReadonlySet<string>;
    allowedOrigins?: ReadonlySet<string>;
    readOnly?: boolean;
}
export declare function createContentRouter(contentServer: ContentServer, options?: ContentRouterOptions): (req: any, res: any) => Promise<void>;
