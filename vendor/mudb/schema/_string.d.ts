import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export type MuStringType = 'ascii' | 'fixed-ascii' | 'utf8';
export declare abstract class MuString<T extends MuStringType> implements MuSchema<string> {
    readonly muType: T;
    readonly identity: string;
    readonly json: object;
    constructor(identity: string, type: T);
    alloc(): string;
    free(str: string): void;
    equal(a: string, b: string): boolean;
    clone(str: string): string;
    assign(dst: string, src: string): string;
    toJSON(str: string): string;
    fromJSON(x: string): string;
    abstract diff(base: string, target: string, out: MuWriteStream): boolean;
    abstract patch(base: string, inp: MuReadStream): string;
}
//# sourceMappingURL=_string.d.ts.map