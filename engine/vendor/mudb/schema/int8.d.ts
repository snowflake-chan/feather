import { MuWriteStream, MuReadStream } from '../stream';
import { MuNumber } from './_number';
export declare class MuInt8 extends MuNumber<'int8'> {
    constructor(identity?: number);
    diff(base: number, target: number, out: MuWriteStream): boolean;
    patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=int8.d.ts.map