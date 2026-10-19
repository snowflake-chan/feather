"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentSplitter = void 0;
const stream_1 = require("@box/mudb/stream");
class ContentSplitter {
    constructor(content, blockSize = Infinity, hashLength = 46) {
        this.content = content;
        this.blockSize = blockSize;
        this.hashLength = hashLength;
    }
    init() {
        return this.content.init();
    }
    async store(bytes) {
        if (bytes.length <= this.blockSize) {
            return this.content.store(bytes);
        }
        const pending = [];
        for (let i = 0; i < bytes.length; i += this.blockSize) {
            pending.push(this.content.store(bytes.subarray(i, i + this.blockSize)));
        }
        const stream = new stream_1.MuWriteStream(1024);
        try {
            stream.writeVarint(pending.length);
            for (let i = 0; i < pending.length; ++i) {
                stream.writeASCII(await pending[i]);
            }
            return 'Z' + (await this.content.store(stream.bytes())).substr(1);
        }
        finally {
            stream.destroy();
        }
    }
    async retrieve(hash) {
        if (hash.length !== this.hashLength || hash.charAt(0) !== 'Z') {
            return this.content.retrieve(hash);
        }
        const nhash = 'Q' + hash.substr(1);
        const infoBlock = await this.content.retrieve(nhash);
        if (!infoBlock) {
            return void 0;
        }
        const stream = new stream_1.MuReadStream(infoBlock);
        const numHashes = stream.readVarint();
        if (stream.length - stream.offset !== numHashes * this.hashLength) {
            throw new Error('bad info block for hash ' + nhash);
        }
        const pending = [];
        for (let i = 0; i < numHashes; ++i) {
            const blockHash = stream.readASCII(this.hashLength);
            pending.push(this.content.retrieve(blockHash));
        }
        let byteLength = 0;
        const blocks = [];
        for (let i = 0; i < pending.length; ++i) {
            const block = await pending[i];
            if (!block) {
                return void 0;
            }
            byteLength += block.length;
            blocks.push(block);
        }
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
exports.ContentSplitter = ContentSplitter;
