import { FetchAPI, QueryType, isNon200Error } from './type';
import http from 'http';
export { isNon200Error };
export declare class NodeFetch implements FetchAPI {
    private requestOptions;
    private requestHeaders;
    constructor(baseURL: string, auth?: string);
    get(path: string, query?: QueryType): Promise<string>;
    post(path: string, data: {
        [name: string]: any;
    }): Promise<string>;
}
export declare function nodeRequest(options: http.RequestOptions, body?: string): Promise<string>;
//# sourceMappingURL=node.d.ts.map