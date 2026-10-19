import { MuWriteStream, MuReadStream } from '../stream';
import { MuNumber } from './_number';
export declare class MuFloat32 extends MuNumber<'float32'> {
    constructor(identity?: number);
    diff(base: number, target: number, out: MuWriteStream): boolean;
    patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=float32.d.ts.map