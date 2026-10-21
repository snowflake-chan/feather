import { MuWriteStream, MuReadStream } from '../stream';
import { MuNumber } from './_number';
export declare class MuUint32 extends MuNumber<'uint32'> {
    constructor(identity?: number);
    diff(base: number, target: number, out: MuWriteStream): boolean;
    patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=uint32.d.ts.map