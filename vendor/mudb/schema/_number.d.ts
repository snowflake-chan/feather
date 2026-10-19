import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export declare const ranges: {
    float32: [number, number];
    float64: [number, number];
    int8: [number, number];
    int16: [number, number];
    int32: [number, number];
    uint8: [number, number];
    uint16: [number, number];
    uint32: [number, number];
    varint: [number, number];
    rvarint: [number, number];
};
export type MuNumericType = 'float32' | 'float64' | 'int8' | 'int16' | 'int32' | 'uint8' | 'uint16' | 'uint32' | 'varint' | 'rvarint';
export declare abstract class MuNumber<T extends MuNumericType> implements MuSchema<number> {
    readonly muType: T;
    readonly identity: number;
    readonly json: object;
    constructor(identity_: number | undefined, type: T);
    alloc(): number;
    free(num: number): void;
    equal(a: number, b: number): boolean;
    clone(num: number): number;
    assign(dst: number, src: number): number;
    toJSON(num: number): number;
    fromJSON(x: number): number;
    abstract diff(base: number, target: number, out: MuWriteStream): boolean;
    abstract patch(base: number, inp: MuReadStream): number;
}
//# sourceMappingURL=_number.d.ts.map