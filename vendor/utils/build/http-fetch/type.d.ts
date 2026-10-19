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
export interface FetchAPI {
    post(url: string, body: {
        [name: string]: any;
    }): Promise<string>;
    get(url: string, query?: QueryType): Promise<string>;
}
//# sourceMappingURL=type.d.ts.map