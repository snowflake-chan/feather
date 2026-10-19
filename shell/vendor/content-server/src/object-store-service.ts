import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import FormData from 'form-data';
import type { Logger } from 'pino';

import {
  ContentServer,
  DEFAULT_OSS_CDN_PATH,
  Hash,
  OssCdnPath,
  OssStoreType,
} from './index';
import { Semaphore } from '@box/utils/semaphore';

interface ParsedURL {
  protocol: string;
  hostname: string;
  port: number;
  server: typeof http | typeof https;
}

export class ObjectStoreService implements ContentServer {
  public semaphore: Semaphore;
  public logger: Logger;
  public retryCount: number = 10;

  private parsedUri: ParsedURL;
  private parsedCdnPath: ParsedURL;

  constructor(spec: {
    logger: Logger;
    uri: string;
    maxConcurrency: number;
    cdnPath: string;
  }) {
    this.logger = spec.logger.child({ caller: 'oss' });
    this.semaphore = new Semaphore(spec.maxConcurrency);

    this.parsedUri = this.parseUrl(spec.uri);
    this.parsedCdnPath = this.parseUrl(spec.cdnPath);
  }

  private parseUrl(uri: string): ParsedURL {
    const info = url.parse(uri);
    return {
      protocol: info.protocol,
      hostname: info.hostname,
      port: +info.port,
      server: info.protocol === 'http:' ? http : https,
    };
  }

  public async init() {}

  public async store(
    _content: Uint8Array,
    spec?: {
      ossStoreType?: OssStoreType;
      contentType?: string;
    },
  ): Promise<Hash> {
    const options: http.RequestOptions = {
      protocol: this.parsedUri.protocol,
      hostname: this.parsedUri.hostname,
      port: this.parsedUri.port,
      method: 'POST',
      path: '/file-upload',
    };
    const data = _content instanceof Buffer ? _content : Buffer.from(_content);
    await this.semaphore.p();
    let contentType = spec?.contentType || 'application/octet-stream';
    // 这样js文件可以在浏览器中预览
    if (spec?.ossStoreType === OssStoreType.Script) {
      contentType = 'application/javascript';
    }
    try {
      for (let i = 0; i < this.retryCount; ++i) {
        const form = new FormData();
        form.append('file', data, {
          filename: 'file',
          contentType,
        });
        if (spec?.ossStoreType) {
          form.append('type', spec.ossStoreType);
        }
        options.headers = form.getHeaders();
        options.timeout = 5000 << i;
        try {
          return await new Promise<string>((resolve, reject) => {
            const req = this.parsedUri.server.request(options, (res) => {
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
                  this.logger.debug(`store ${info.data}`);
                  if (!info.data) {
                    reject(new Error('error storing content'));
                  } else {
                    resolve(info.data);
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
          this.logger.error(`Error oss store failed: ${e}`);
          form.destroy();
        }
      }
      throw new Error('failed to store content');
    } finally {
      this.semaphore.v();
    }
  }

  public async retrieve(
    hash: string,
    options?: { ossCdnPath?: OssCdnPath },
  ): Promise<Uint8Array> {
    const cdnPath: OssCdnPath = options?.ossCdnPath || DEFAULT_OSS_CDN_PATH;
    await this.semaphore.p();
    try {
      for (let i = 0; i < this.retryCount; ++i) {
        try {
          return await new Promise<Uint8Array | undefined>(
            (resolve, reject) => {
              const options: http.RequestOptions = {
                protocol: this.parsedCdnPath.protocol,
                hostname: this.parsedCdnPath.hostname,
                port: this.parsedCdnPath.port,
                method: 'GET',
                path: `${cdnPath}${hash}`,
                timeout: 5000 << i,
              };
              const req = this.parsedCdnPath.server.request(options, (res) => {
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
                    this.logger.error(
                      `failed retrieved: ${hash} ${res.statusCode}`,
                    );
                    reject(
                      new Error(
                        `hash: ${hash}. ${
                          buffers ? Buffer.concat(buffers).toString() : ''
                        }`,
                      ),
                    );
                  } else {
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
          this.logger.error(`Error oss retrieve hash ${hash} failed: ${e}`);
        }
      }
      return undefined;
    } finally {
      this.semaphore.v();
    }
  }
}
