import { MuClient, MuClientProtocol } from '@box/mudb/client';
import {
  GameHttpAPI,
  GameHttpFetchRequestOptions,
  GameHttpFetchResponse,
  GameHttpHandler,
} from '@box/schema/api/js/http';
import { HttpScriptProtocol } from './http-protocol';
import { isSafeUrl } from '../href/safe-url';

enum BodyType {
  TEXT = 'text',
  JSON = 'json',
  ARRAY_BUFFER = 'arrayBuffer',
}
export class FetchWrapper {
  public pendingHead!: {
    resolve: (
      message: typeof HttpScriptProtocol.client.fetchResponseHead.identity,
    ) => void;
    reject: (err?: any) => void;
  };
  public pendingBody!: {
    resolve: (body: string | ArrayBuffer) => void;
    reject: (err?: any) => void;
  };

  public response: Promise<GameHttpFetchResponse>;
  public body: Promise<string | ArrayBuffer>;
  private bodyType?: BodyType = undefined;

  constructor(
    public handle: number,
    private protocol: MuClientProtocol<typeof HttpScriptProtocol>,
    schedule: (event: () => void) => void,
  ) {
    this.response = new Promise<GameHttpFetchResponse>((resolve, reject) => {
      this.pendingHead = {
        reject,
        resolve: ({ statusCode, statusMessage, headers }) => {
          const h = {};
          for (const name in headers) {
            if (headers[name].length === 1) {
              h[name] = headers[name][0];
            } else {
              h[name] = headers[name].slice();
            }
          }
          schedule(() =>
            resolve(
              new GameHttpFetchResponse(
                statusCode,
                statusMessage,
                h,
                () => this.readBody(BodyType.JSON),
                () => this.readBody(BodyType.TEXT),
                () => this.readBody(BodyType.ARRAY_BUFFER),
                () => this.close(),
              ),
            ),
          );
        },
      };
    });
    this.body = new Promise<string | ArrayBuffer>((resolve, reject) => {
      this.pendingBody = {
        reject,
        resolve: (body) => schedule(() => resolve(body)),
      };
    });
  }

  private async close() {
    this.protocol.server.message.close(this.handle);
  }

  private async readBody(type: BodyType) {
    if (this.bodyType !== undefined) {
      throw new Error(
        `Failed to execute '${type}' on 'Response': body stream already read`,
      );
    }
    this.bodyType = type;
    if (type === BodyType.ARRAY_BUFFER) {
      this.protocol.server.message.readArrayBuffer(this.handle);
    } else {
      this.protocol.server.message.readText(this.handle);
    }
    if (type === BodyType.JSON) {
      return JSON.parse(await (<Promise<string>>this.body));
    }
    return this.body;
  }
}

export class HttpScriptShell {
  public protocol: MuClientProtocol<typeof HttpScriptProtocol>;
  public httpAPI: GameHttpAPI;
  public requests: { [handle: number]: FetchWrapper } = {};
  private requestCounter = 0;
  constructor(
    client: MuClient,
    private schedule: (event: () => void) => void,
  ) {
    this.protocol = client.protocol(HttpScriptProtocol);
    this.protocol.configure({
      message: {
        fetchError: ({ handle, error }) => {
          const req = this.requests[handle];
          if (req) {
            req.pendingHead.reject(error);
          }
        },
        fetchResponseHead: (head) => {
          const req = this.requests[head.handle];
          if (req) {
            req.pendingHead.resolve(head);
          }
        },
        readBodyError: ({ handle, error }) => {
          const req = this.requests[handle];
          if (req) {
            req.pendingBody.reject(error);
          }
        },
        fetchBodyText: ({ handle, body }) => {
          const req = this.requests[handle];
          if (req) {
            req.pendingBody.resolve(body);
          }
        },
        fetchBodyArrayBuffer: ({ handle, body }) => {
          const req = this.requests[handle];
          if (req) {
            req.pendingBody.resolve(body);
          }
        },
      },
    });
    this.httpAPI = new GameHttpAPI(
      // 'http://localhost',
      this.fetch,
      // this.onRequest,
    );
  }

  public fetch = async (
    url: string,
    options: GameHttpFetchRequestOptions = {},
  ) => {
    if (!isSafeUrl(url)) {
      throw new Error(`Blocked url ${url}`);
    }
    const handle = this.requestCounter++;
    let headers: { [name: string]: string[] } | undefined;
    if (options.headers) {
      headers = {};
      for (const name in options.headers) {
        const value = options.headers[name];
        headers[name] = typeof value === 'string' ? [value] : value!;
      }
    }

    this.protocol.server.message.fetch({
      handle,
      url,
      timeout:
        options.timeout || HttpScriptProtocol.server.fetch.identity.timeout,
      method: options.method || HttpScriptProtocol.server.fetch.identity.method,
      headers: headers || HttpScriptProtocol.server.fetch.identity.headers,
      body:
        options.body instanceof ArrayBuffer
          ? {
              type: 'arrayBuffer',
              data: new Uint8Array(options.body),
            }
          : {
              type: 'text',
              data: options.body || '',
            },
    });
    this.requests[handle] = new FetchWrapper(
      handle,
      this.protocol,
      this.schedule,
    );
    return this.requests[handle].response;
  };

  public onRequest = (handler: GameHttpHandler) => {
    // TODO
  };
}
