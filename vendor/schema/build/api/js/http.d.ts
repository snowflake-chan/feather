export type GameHttpFetchHeaders = {
    [name: string]: string | string[];
};
export type GameHttpFetchRequestOptions = {
    timeout?: number;
    method?: 'OPTIONS' | 'GET' | 'HEAD' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';
    headers?: GameHttpFetchHeaders;
    body?: string | ArrayBuffer;
};
export declare class GameHttpFetchResponse {
    status: number;
    statusText: string;
    headers: GameHttpFetchHeaders;
    json: () => Promise<any>;
    text: () => Promise<string>;
    arrayBuffer: () => Promise<ArrayBuffer>;
    close: () => Promise<void>;
    constructor(status: number, statusText: string, headers: GameHttpFetchHeaders, json: () => Promise<any>, text: () => Promise<string>, arrayBuffer: () => Promise<ArrayBuffer>, close: () => Promise<void>);
    get ok(): boolean;
}
export declare class GameHttpRequest {
}
export declare class GameHttpResponse {
}
export type GameHttpHandler = (request: GameHttpRequest, response: GameHttpResponse) => void;
export declare class GameHttpAPI {
    fetch: (url: string, options?: GameHttpFetchRequestOptions) => Promise<GameHttpFetchResponse>;
    constructor(fetch: (url: string, options?: GameHttpFetchRequestOptions) => Promise<GameHttpFetchResponse>);
}
