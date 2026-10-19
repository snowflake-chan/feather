import { ContentServer } from '@box/content-server';
import { Semaphore } from '@box/utils/semaphore';
import { EmscriptenWasm } from './emscripten-types';

import * as path from 'path';

export function instantiateEmscriptenWasm<T>(
  factory: (
    require: any,
  ) => EmscriptenWasm.ModuleFactory<T & EmscriptenWasm.Module>,
  hash: string,
): (content: ContentServer) => Promise<T> {
  const mutex = new Semaphore(1);
  let instance: any = null;
  return async (content: ContentServer) => {
    if (instance) {
      return instance;
    }
    await mutex.p();
    try {
      if (!instance) {
        const bytes = await content.retrieve(hash);
        if (!bytes) {
          throw new Error('Error retrieving hash: ' + hash);
        }
        const mockRequire = (mod: string) => {
          if (mod === 'path') {
            return path;
          } else if (mod === 'fs') {
            return {
              readFileSync: () => Buffer.from(bytes),
            };
          } else if (mod === 'crypto') {
            return {
              getRandomValues: (x) => {
                for (let i = 0; i < x.length; ++i) {
                  x[i] = Math.random() * (1 << 32);
                }
              },
              randomBytes: (n) => {
                const r = new Uint8Array(n);
                for (let i = 0; i < n; ++i) {
                  r[i] = Math.random() * 255;
                }
                return r;
              },
            };
          } else {
            return {};
          }
        };

        instance = await factory(mockRequire)({
          locateFile: () => 'XXXX',
        });
      }
      return instance;
    } finally {
      mutex.v();
    }
  };
}
