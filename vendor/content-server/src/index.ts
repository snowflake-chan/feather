import { MuASCII } from '@box/mudb/schema';

//
// FIXME: Given how many hashes we have, this should be easily optimizable.
//  1.  IPFS hashes are storeind bs58, so we could pack them into binary and save some space
//  2.  The multihash prefix could be huffman encoded to use less space, saving a few more bytes
// Overall the size of each hash could be reduced by 1/2 at least when we transmit them over the network
//
export const HashSchema = new MuASCII();
export type Hash = typeof HashSchema.identity;

export interface ContentServer {
  init(): Promise<void>;

  store(
    content: Uint8Array,
    options?: {
      /**
       * OSS存储类型
       * script 在 /engine/s/
       * model 在 /engine/m/
       * 默认是model
       */
      ossStoreType?: OssStoreType;
    },
  ): Promise<Hash>;

  retrieve(
    hash: Hash,
    options?: {
      /**
       * OSS CDN路径
       * 模型为/engine/m/，皮肤为/avatar/m/
       * 选填，默认为模型路径/engine/m/
       */
      ossCdnPath?: OssCdnPath;
    },
  ): Promise<Uint8Array | undefined>;
}

export type OssCdnPath =
  | '/engine/m/'
  | '/avatar/m/'
  | '/engine/s/'
  | '/tmp/'
  | '/engine/rusty/';

export const DEFAULT_OSS_CDN_PATH: OssCdnPath = '/engine/m/';
export const SCRIPT_OSS_CDN_PATH: OssCdnPath = '/engine/s/';
export const TEMP_OSS_CDN_PATH: OssCdnPath = '/tmp/';
export const RUSTY_OSS_CDN_PATH: OssCdnPath = '/engine/rusty/';

export enum OssStoreType {
  Script = 'script',
  Model = 'model',
  Temp = 'tmp',
  Rusty = 'rusty',
}
