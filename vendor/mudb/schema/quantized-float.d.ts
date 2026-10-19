import { MuSchema } from './schema';
import { MuWriteStream, MuReadStream } from '../stream';
export declare class MuQuantizedFloat implements MuSchema<number> {
    precision: number;
    invPrecision: number;
    identity: number;
    json: {
        type: 'quantized-float';
        precision: number;
        identity: number;
    };
    muData: {
        type: 'quantized-float';
        precision: number;
        identity: number;
    };
    readonly muType = "quantized-float";
    constructor(precision: number, identity?: number);
    assign(x: number, y: number): number;
    clone(y: number): number;
    alloc(): number;
    free(): void;
    toJSON(x: number): number;
    fromJSON(x: any): number;
    equal(x: number, y: number): boolean;
    diff(base: number, target: number, stream: MuWriteStream): boolean;
    patch(base: number, stream: MuReadStream): number;
}
//# sourceMappingURL=quantized-float.d.ts.map