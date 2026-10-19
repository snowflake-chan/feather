import { MuWriteStream, MuReadStream } from '../stream';
import { MuNumber } from './_number';
export declare class MuInt32 extends MuNumber<'int32'> {
    constructor(identity?: number);
    diff(base: number, target: number, out: MuWriteStream): boolean;
    patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=int32.d.ts.map