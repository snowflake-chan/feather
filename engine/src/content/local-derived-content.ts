import type { ContentServer, Hash } from '@box/content-server';

/**
 * Read published/project blobs from an immutable source while writing build
 * products into a persistent runtime cache. This mirrors Boxes' shared
 * content store without allowing a play runtime to mutate its release.
 */
export class LocalDerivedContentServer implements ContentServer {
  public constructor(
    private readonly stores: {
      source: ContentServer;
      derived: ContentServer;
    },
  ) {}

  public async init() {
    await Promise.all([this.stores.source.init(), this.stores.derived.init()]);
  }

  public store(content: Uint8Array) {
    return this.stores.derived.store(content);
  }

  public async retrieve(hash: Hash) {
    return (
      (await this.stores.derived.retrieve(hash)) ||
      this.stores.source.retrieve(hash)
    );
  }
}
