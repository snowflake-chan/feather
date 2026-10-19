import { MuReadStream, MuWriteStream } from '../stream';
import { MuSchema } from './schema';
import { MuNumber } from './_number';
declare const muTypeToTypedArray: {
    float32: Float32ArrayConstructor;
    float64: Float64ArrayConstructor;
    int8: Int8ArrayConstructor;
    int16: Int16ArrayConstructor;
    int32: Int32ArrayConstructor;
    uint8: Uint8ArrayConstructor;
    uint16: Uint16ArrayConstructor;
    uint32: Uint32ArrayConstructor;
};
type MuNumericType = keyof typeof muTypeToTypedArray;
interface MuFloat32Array<D extends number> extends Float32Array {
    readonly length: D;
}
interface MuFloat64Array<D extends number> extends Float64Array {
    readonly length: D;
}
interface MuInt8Array<D extends number> extends Int8Array {
    readonly length: D;
}
interface MuInt16Array<D extends number> extends Int16Array {
    readonly length: D;
}
interface MuInt32Array<D extends number> extends Int32Array {
    readonly length: D;
}
interface MuUint8Array<D extends number> extends Uint8Array {
    readonly length: D;
}
interface MuUint16Array<D extends number> extends Uint16Array {
    readonly length: D;
}
interface MuUint32Array<D extends number> extends Uint32Array {
    readonly length: D;
}
export type Vec<T extends MuNumericType, D extends number> = {
    float32: MuFloat32Array<D>;
    float64: MuFloat64Array<D>;
    int8: MuInt8Array<D>;
    int16: MuInt16Array<D>;
    int32: MuInt32Array<D>;
    uint8: MuUint8Array<D>;
    uint16: MuUint16Array<D>;
    uint32: MuUint32Array<D>;
}[MuNumber<T>['muType']];
export type FixedLengthArray<D extends number> = D extends 0 ? never[] : {
    0: number;
    length: D;
} & ReadonlyArray<number>;
export declare class MuVector<T extends MuNumericType, D extends number> implements MuSchema<Vec<T, D>> {
    readonly identity: Vec<T, D>;
    readonly muType = "vector";
    readonly muData: MuNumber<T>;
    readonly json: object;
    readonly dimension: D;
    readonly TypedArray: any;
    allocCount: number;
    freeCount: number;
    pool: Vec<T, D>[];
    stats(): {
        allocCount: number;
        freeCount: number;
        poolSize: number;
    };
    constructor(schema: MuNumber<T>, dimension: D);
    alloc(): Vec<T, D>;
    free(vec: Vec<T, D>): void;
    equal(a: Vec<T, D>, b: Vec<T, D>): boolean;
    clone(vec: Vec<T, D>): Vec<T, D>;
    assign(dst: Vec<T, D>, src: Vec<T, D>): Vec<T, D>;
    private __b;
    private __t;
    private _b;
    private _t;
    diff(base: Vec<T, D>, target: Vec<T, D>, out: MuWriteStream): boolean;
    patch(base: Vec<T, D>, inp: MuReadStream): Vec<T, D>;
    toJSON(vec: Vec<T, D>): FixedLengthArray<D>;
    fromJSON(x: FixedLengthArray<D>): Vec<T, D>;
}
export {};
//# sourceMappingURL=vector.d.ts.map