import { MuNumber } from './_number';
import { MuWriteStream, MuReadStream } from '../stream';
export declare class MuRelativeVarint extends MuNumber<'rvarint'> {
    constructor(identity?: number);
    diff(base: number, target: number, out: MuWriteStream): boolean;
    patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=rvarint.d.ts.map