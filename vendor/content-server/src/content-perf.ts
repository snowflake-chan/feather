import { ContentServer, Hash, OssCdnPath, OssStoreType } from '.';

export class ContentPerf implements ContentServer {
  public storeBytes: number = 0;
  public retrieveBytes: number = 0;
  public cacheMiss: number = 0;

  constructor(public content: ContentServer) {}

  public init() {
    return this.content.init();
  }

  public async store(
    content: Uint8Array,
    options?: { ossStoreType?: OssStoreType },
  ): Promise<Hash> {
    this.storeBytes += content.length;
    return this.content.store(content, options);
  }

  public async retrieve(
    hash: Hash,
    options?: { ossCdnPath?: OssCdnPath },
  ): Promise<Uint8Array | undefined> {
    const result = await this.content.retrieve(hash, options);
    if (result) {
      this.retrieveBytes += result.length;
    } else {
      this.cacheMiss += 1;
    }
    return result;
  }
}
