import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { ContentServer } from '.';

// This module splits large blocks into tiny pieces at regular sizes.
// I guess in the future we could replace this with Rabin finger prints or whatever if size becomes an issue but this seems fine for now.
// Big blocks are stored as normal hashes in IPFS but their first character is Z instead of Q because whatever.
export class ContentSplitter implements ContentServer {
  constructor(
    public content: ContentServer,
    public blockSize: number = Infinity,
    public hashLength: number = 46,
  ) {}

  public init() {
    return this.content.init();
  }

  public async store(bytes: Uint8Array): Promise<string> {
    if (bytes.length <= this.blockSize) {
      return this.content.store(bytes);
    }

    const pending: Promise<string>[] = [];
    for (let i = 0; i < bytes.length; i += this.blockSize) {
      pending.push(this.content.store(bytes.subarray(i, i + this.blockSize)));
    }

    const stream = new MuWriteStream(1024);
    try {
      stream.writeVarint(pending.length);
      for (let i = 0; i < pending.length; ++i) {
        stream.writeASCII(await pending[i]);
      }
      return 'Z' + (await this.content.store(stream.bytes())).substr(1);
    } finally {
      stream.destroy();
    }
  }

  public async retrieve(hash: string): Promise<Uint8Array | undefined> {
    if (hash.length !== this.hashLength || hash.charAt(0) !== 'Z') {
      return this.content.retrieve(hash);
    }

    const nhash = 'Q' + hash.substr(1);
    const infoBlock = await this.content.retrieve(nhash);
    if (!infoBlock) {
      return void 0;
    }

    const stream = new MuReadStream(infoBlock);
    const numHashes = stream.readVarint();
    if (stream.length - stream.offset !== numHashes * this.hashLength) {
      throw new Error('bad info block for hash ' + nhash);
    }

    const pending: Promise<Uint8Array | undefined>[] = [];
    for (let i = 0; i < numHashes; ++i) {
      const blockHash = stream.readASCII(this.hashLength);
      pending.push(this.content.retrieve(blockHash));
    }

    // await all the promises and compute the byte length
    let byteLength = 0;
    const blocks: Uint8Array[] = [];
    for (let i = 0; i < pending.length; ++i) {
      const block = await pending[i];
      if (!block) {
        return void 0;
      }
      byteLength += block.length;
      blocks.push(block);
    }

    // concatenate blocks
    const result = new Uint8Array(byteLength);
    let ptr = 0;
    for (let i = 0; i < blocks.length; ++i) {
      const b = blocks[i];
      result.set(b, ptr);
      ptr += b.length;
    }
    return result;
  }
}
