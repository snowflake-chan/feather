export type QueryType = {
    [name: string]: any;
};
export interface Non200Error {
    non200: true;
    method: string;
    url: string;
    data?: any;
    status: string;
    res: string;
}
export declare function isNon200Error(e: any): e is Non200Error;
/**
 * If we get a proper response, but it is not status 200, a Non200Error object
 * will be thrown.
 */
export interface FetchAPI {
    post(url: string, body: {
        [name: string]: any;
    }): Promise<string>;
    get(url: string, query?: QueryType): Promise<string>;
}
//# sourceMappingURL=node-type.d.ts.map