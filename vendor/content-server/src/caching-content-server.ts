import bs58 from 'bs58';
import type { Logger } from 'pino';

import { ContentServer, Hash } from './index';
import { createHash } from 'crypto';
import {
  ContentCache,
  copyContent,
  DEFAULT_CONTENT_CACHE,
} from './content-cache';
import { Semaphore } from '@box/utils/semaphore';

function ipfsHash(data: Uint8Array): string {
  const digest = createHash('sha256').update(data).digest();
  const digestSize = Buffer.from(digest.byteLength.toString(16), 'hex');
  const hashFunction = Buffer.from('12', 'hex'); // 0x20
  const combined = Buffer.concat([hashFunction, digestSize, digest]);
  const multihash = bs58.encode(combined);
  return multihash.toString();
}

export class CachingContentServer implements ContentServer {
  private _mutex: { [hash: string]: Semaphore } = {};

  private async _waitHash(hash: string) {
    const sem = this._mutex[hash];
    if (sem) {
      return sem.p();
    }
    this._mutex[hash] = new Semaphore(0);
  }

  private _signalHash(hash: string) {
    const sem = this._mutex[hash];
    if (sem) {
      delete this._mutex[hash];
      sem.v(Infinity);
    }
  }

  constructor(
    private logger: Logger,
    private baseServer: ContentServer,
    private cache: ContentCache = DEFAULT_CONTENT_CACHE,
    private maxCacheItemSize = Infinity,
  ) {}

  public async init() {
    return this.baseServer.init();
  }

  public async store(content: Uint8Array) {
    if (content.length < this.maxCacheItemSize) {
      const hash = ipfsHash(content);
      let cached = this.cache.getCache(hash);
      if (cached) {
        return hash;
      }
      const data = copyContent(content);
      await this._waitHash(hash);
      try {
        cached = this.cache.getCache(hash);
        if (cached) {
          return hash;
        }
        const realHash = await this.baseServer.store(data);
        this.cache.putCache(realHash, data, false);
        return realHash;
      } finally {
        this._signalHash(hash);
      }
    } else {
      return this.baseServer.store(content);
    }
  }

  public async retrieve(hash: Hash) {
    let data = this.cache.getCache(hash);
    if (data) {
      return data;
    }
    await this._waitHash(hash);
    try {
      data = this.cache.getCache(hash);
      if (data) {
        return data;
      }
      data = await this.baseServer.retrieve(hash);
      if (data && data.length < this.maxCacheItemSize) {
        this.cache.putCache(hash, data, true);
      }
      return data;
    } finally {
      this._signalHash(hash);
    }
  }
}
