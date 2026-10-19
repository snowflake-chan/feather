/**
 * @module HTTP
 */

/**
 * HTTP 请求相关的API
 */
export interface GameHttp {
  /**
   * 发起一个HTTP请求
   *
   * ```typescript
   * const res = await http.fetch('https://your.site');
   * console.log(await res.text())
   * ```
   * @param url 请求的 URL，支持任意 HTTP 与 HTTPS 地址，不支持脚本协议等危险 URL
   * @param options 请求的选项
   * @returns 请求的响应，以Promise形式返回
   */
  fetch: (
    url: string,
    options?: GameHttpFetchRequestOptions,
  ) => Promise<GameHttpFetchResponse>;
}

export interface GameHttpFetchRequestOptions {
  timeout?: number;
  method?: 'OPTIONS' | 'GET' | 'HEAD' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';
  headers?: GameHttpFetchHeaders;
  body?: string | ArrayBuffer;
}

export interface GameHttpFetchResponse {
  status: number;
  statusText: string;
  headers: GameHttpFetchHeaders;
  json: () => Promise<any>;
  text: () => Promise<string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
  close: () => Promise<void>;
  get ok(): boolean;
}

export type GameHttpFetchHeaders = {
  [name: string]: string | string[];
};
