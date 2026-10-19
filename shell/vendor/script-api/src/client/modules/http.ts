export interface ClientHttp {
  fetch: (url: string, options?: RequestInit) => Promise<Response>;
}

/**
 * @internal 仅供内部项目使用
 */
export declare const http: ClientHttp;
