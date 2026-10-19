import { MuSchema } from './schema';
import { MuWriteStream, MuReadStream } from '../stream';
export declare class MuVoid implements MuSchema<void> {
    readonly identity: void;
    readonly muType = "void";
    readonly json: {
        type: string;
    };
    alloc(): void;
    free(_: void): void;
    equal(a: void, b: void): true;
    clone(_: void): void;
    assign(d: void, s: void): void;
    diff(b: any, t: any, out: MuWriteStream): false;
    patch(b: any, inp: MuReadStream): void;
    toJSON(_: void): null;
    fromJSON(_: null): void;
}
//# sourceMappingURL=void.d.ts.map