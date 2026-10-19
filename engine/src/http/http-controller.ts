import * as http from 'http';
import * as https from 'https';
import { MuRemoteClient, MuServer, MuServerProtocol } from '@box/mudb/server';
import { HttpScriptProtocol } from './http-protocol';

export class HttpScriptController {
  public protocol: MuServerProtocol<typeof HttpScriptProtocol>;
  public pendingBody: { [handle: number]: Promise<Buffer> } = {};
  public responses: { [handle: number]: http.IncomingMessage } = {};

  constructor(spec: { server: MuServer }) {
    this.protocol = spec.server.protocol(HttpScriptProtocol);
    this.protocol.configure({
      message: {
        fetch: (client, options) => {
          const { handle } = options;
          this.pendingBody[handle] = new Promise<Buffer>((resolve, reject) => {
            const httx = options.url.startsWith('https') ? https : http;
            const req = httx.request(
              options.url,
              {
                timeout: options.timeout,
                method: options.method,
                headers: options.headers,
              },
              (res) => {
                this.responses[handle] = res;
                const chunks: Buffer[] = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('error', (err) => {
                  res.destroy();
                  reject(err);
                });
                res.on('end', () => resolve(Buffer.concat(chunks)));
                const headers: { [name: string]: string[] } = {};
                for (const name in res.headers) {
                  const value = res.headers[name];
                  headers[name] = typeof value === 'string' ? [value] : value!;
                }
                client.message.fetchResponseHead({
                  handle,
                  statusCode: res.statusCode || 200,
                  statusMessage: res.statusMessage || 'OK',
                  headers,
                });
              },
            );
            req.on('error', (err) => {
              client.message.fetchError({
                handle,
                error: err.message,
              });
            });
            req.on('timeout', () => {
              client.message.fetchError({
                handle,
                error: `timeout when requesting ${options.url}`,
              });
            });
            req.end(options.body.data);
          });
        },
        readText: async (client, handle) => {
          await this.responseBody(client, handle, true);
        },
        readArrayBuffer: async (client, handle) => {
          await this.responseBody(client, handle);
        },
        close: (client, handle) => {
          const res = this.responses[handle];
          if (!res) {
            console.log('not found response of handle', handle);
            return;
          }
          res.emit('error', new Error(`Client closed`));
        },
      },
    });
  }

  private async responseBody(
    client: MuRemoteClient<typeof HttpScriptProtocol.client>,
    handle: number,
    isText = false,
  ) {
    const p = this.pendingBody[handle];
    if (!p) {
      client.message.readBodyError({
        handle,
        error: `bad request handle ${handle}`,
      });
      return;
    }
    try {
      const body = await this.pendingBody[handle];
      if (isText) {
        client.message.fetchBodyText({
          handle,
          body: body.toString(),
        });
      } else {
        client.message.fetchBodyArrayBuffer({
          handle,
          body,
        });
      }
    } catch (err) {
      client.message.readBodyError({
        handle,
        error: err.message,
      });
    } finally {
      delete this.pendingBody[handle];
      delete this.responses[handle];
    }
  }

  public reset() {
    this.pendingBody = {};
    this.responses = {};
  }
}
