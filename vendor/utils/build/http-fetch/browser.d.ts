import { FetchAPI, QueryType, isNon200Error } from './type';
export { isNon200Error };
export declare class BrowserFetch implements FetchAPI {
    private baseURL;
    constructor(baseURL?: string);
    get(path: string, query?: QueryType): Promise<string>;
    post(path: string, data: {
        [name: string]: any;
    }): Promise<string>;
}
export declare function fetch(method: string, url: string, data?: string | FormData, timeout?: number): Promise<string>;
//# sourceMappingURL=browser.d.ts.map