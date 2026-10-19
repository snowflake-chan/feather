import { MuReadStream, MuWriteStream } from '../stream';
import { MuSchema } from './schema';
export declare class MuBoolean implements MuSchema<boolean> {
    readonly muType = "boolean";
    readonly identity: boolean;
    readonly json: object;
    constructor(identity?: boolean);
    alloc(): boolean;
    free(bool: boolean): void;
    equal(a: boolean, b: boolean): boolean;
    clone(bool: boolean): boolean;
    assign(dst: boolean, src: boolean): boolean;
    diff(base: boolean, target: boolean, out: MuWriteStream): boolean;
    patch(base: boolean, inp: MuReadStream): boolean;
    toJSON(bool: boolean): boolean;
    fromJSON(x: boolean): boolean;
}
//# sourceMappingURL=boolean.d.ts.map