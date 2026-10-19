import { MuWriteStream, MuReadStream } from '../stream';
import { MuString } from './_string';
export declare class MuASCII extends MuString<'ascii'> {
    constructor(identity?: string);
    diff(base: string, target: string, out: MuWriteStream): boolean;
    patch(base: string, inp: MuReadStream): string;
}
//# sourceMappingURL=ascii.d.ts.map