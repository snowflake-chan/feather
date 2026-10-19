import { MuWriteStream, MuReadStream } from '../stream';
import { MuString } from './_string';
export declare class MuFixedASCII extends MuString<'fixed-ascii'> {
    readonly length: number;
    constructor(lengthOrIdentity: number | string);
    diff(base: string, target: string, out: MuWriteStream): boolean;
    patch(base: string, inp: MuReadStream): string;
}
//# sourceMappingURL=fixed-ascii.d.ts.map