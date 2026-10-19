import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import type { Logger } from 'pino';

import { ContentServer, Hash } from './index';
import FormData from 'form-data';
import { Semaphore } from '@box/utils/semaphore';

export class GoIPFSStore implements ContentServer {
  public semaphore: Semaphore;
  public protocol: string;
  public hostname: string;
  public port: number;
  public apiPrefix: string;
  public server: typeof http | typeof https;
  public logger: Logger;
  public pin: boolean;
  public retryCount: number = 10;

  constructor(spec: {
    logger: Logger;
    uri: string;
    pin: boolean;
    maxConcurrency: number;
  }) {
    this.logger = spec.logger.child({ caller: 'go-ipfs' });
    this.pin = spec.pin;
    this.semaphore = new Semaphore(spec.maxConcurrency);

    const info = url.parse(spec.uri || '');
    this.protocol = info.protocol || 'http:';
    this.hostname = info.hostname || 'localhost';
    this.port = +(info.port || '5001');
    this.apiPrefix = info.path && info.path !== '/' ? info.path : '/api/v0';
    this.server = this.protocol === 'http:' ? http : https;
  }

  public async init() {}

  public async store(_content: Uint8Array): Promise<Hash> {
    const options: http.RequestOptions = {
      protocol: this.protocol,
      hostname: this.hostname,
      port: this.port,
      method: 'POST',
      path: `${this.apiPrefix}/block/put?pin=${this.pin}`,
    };
    const data = _content instanceof Buffer ? _content : Buffer.from(_content);
    await this.semaphore.p();
    try {
      for (let i = 0; i < this.retryCount; ++i) {
        const form = new FormData();
        form.append('data', data);
        options.headers = form.getHeaders();
        options.timeout = 5000 << i;
        try {
          return await new Promise<string>((resolve, reject) => {
            const req = this.server.request(options, (res) => {
              if (res.statusCode !== 200) {
                return reject(new Error('invalid request: ' + res.statusCode));
              }
              const text: string[] = [];
              res.setEncoding('utf8');
              res.on('data', (chunk) => {
                if (typeof chunk !== 'string') {
                  if (chunk && chunk.toString) {
                    text.push(chunk.toString());
                  }
                } else {
                  text.push(chunk);
                }
              });
              res.on('end', () => {
                try {
                  const info = JSON.parse(text.join(''));
                  this.logger.debug(`store ${info.Key}`);
                  if (!info.Key) {
                    reject(new Error('error storing content'));
                  } else {
                    resolve(info.Key);
                  }
                } catch (e) {
                  reject(e);
                }
              });
            });
            req.on('timeout', () => reject(new Error('request timeout')));
            req.on('error', reject);
            form.pipe(req);
          });
        } catch (e) {
          this.logger.error(`Error ipfs store failed: ${e}`);
          form.destroy();
        }
      }
      throw new Error('failed to store content');
    } finally {
      this.semaphore.v();
    }
  }

  public async retrieve(hash: Hash): Promise<Uint8Array | undefined> {
    await this.semaphore.p();
    try {
      for (let i = 0; i < this.retryCount; ++i) {
        try {
          return await new Promise<Uint8Array | undefined>(
            (resolve, reject) => {
              const options: http.RequestOptions = {
                protocol: this.protocol,
                hostname: this.hostname,
                port: this.port,
                method: 'GET',
                path: `${this.apiPrefix}/block/get?arg=${hash}`,
                timeout: 5000 << i,
              };
              const req = this.server.request(options, (res) => {
                const buffers: Buffer[] = [];
                res.on('data', (chunk) => {
                  if (chunk && typeof chunk !== 'string') {
                    buffers.push(chunk);
                  } else {
                    reject(new Error(`Got string instead of buffer`));
                  }
                });
                res.on('end', () => {
                  if (res.statusCode !== 200) {
                    this.logger.error(`failed retrieved: ${hash}`);
                    reject(
                      new Error(
                        `hash: ${hash}. ${
                          buffers ? Buffer.concat(buffers).toString() : ''
                        }`,
                      ),
                    );
                  } else {
                    // this.logger.debug(`retrieved: ${hash}`);
                    resolve(Buffer.concat(buffers));
                  }
                });
              });
              req.on('timeout', reject);
              req.on('error', reject);
              req.end();
            },
          );
        } catch (e) {
          this.logger.error(`Error ipfs retrieve hash ${hash} failed: ${e}`);
        }
      }
      return undefined;
    } finally {
      this.semaphore.v();
    }
  }
}
