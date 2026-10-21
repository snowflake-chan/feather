export type GameHttpFetchHeaders = {
  [name: string]: string | string[];
};

export type GameHttpFetchRequestOptions = {
  timeout?: number;
  method?: 'OPTIONS' | 'GET' | 'HEAD' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';
  headers?: GameHttpFetchHeaders;
  body?: string | ArrayBuffer;
};

export class GameHttpFetchResponse {
  constructor(
    public status: number,
    public statusText: string,
    public headers: GameHttpFetchHeaders,
    public json: () => Promise<any>,
    public text: () => Promise<string>,
    public arrayBuffer: () => Promise<ArrayBuffer>,
    public close: () => Promise<void>,
  ) {}

  public get ok() {
    return 200 <= this.status && this.status < 300;
  }
}

export class GameHttpRequest {}

export class GameHttpResponse {}

export type GameHttpHandler = (
  request: GameHttpRequest,
  response: GameHttpResponse,
) => void;

export class GameHttpAPI {
  constructor(
    // public url:string,
    public fetch: (
      url: string,
      options?: GameHttpFetchRequestOptions,
    ) => Promise<GameHttpFetchResponse>, // public onRequest:(handler:GameHttpHandler) => void,
  ) {}
}
