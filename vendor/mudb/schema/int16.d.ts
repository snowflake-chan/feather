import { MuWriteStream, MuReadStream } from '../stream';
import { MuNumber } from './_number';
export declare class MuInt16 extends MuNumber<'int16'> {
    constructor(identity?: number);
    diff(base: number, target: number, out: MuWriteStream): boolean;
    patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=int16.d.ts.map