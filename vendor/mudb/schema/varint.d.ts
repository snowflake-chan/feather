import { MuNumber } from './_number';
import { MuWriteStream, MuReadStream } from '../stream';
export declare class MuVarint extends MuNumber<'varint'> {
    constructor(identity?: number);
    diff(base: number, target: number, out: MuWriteStream): boolean;
    patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=varint.d.ts.map