import { MuSchema } from '../schema';
import { MuWriteStream, MuReadStream } from '../stream';
export declare class MuBytes implements MuSchema<Uint8Array> {
    readonly muType = "bytes";
    readonly identity: Uint8Array;
    readonly json: object;
    pool: {
        [dimension: string]: Uint8Array[];
    };
    constructor(identity?: Uint8Array);
    private _allocBytes;
    alloc(): Uint8Array;
    free(bytes: Uint8Array): void;
    equal(a: Uint8Array, b: Uint8Array): boolean;
    clone(bytes: Uint8Array): Uint8Array;
    assign(dst: Uint8Array, src: Uint8Array): Uint8Array;
    diff(base: Uint8Array, target: Uint8Array, out: MuWriteStream): boolean;
    patch(base: Uint8Array, inp: MuReadStream): Uint8Array;
    toJSON(bytes: Uint8Array): number[];
    fromJSON(x: number[]): Uint8Array;
}
//# sourceMappingURL=bytes.d.ts.map