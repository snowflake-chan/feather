import { MuReadStream, MuWriteStream } from '../stream';
export interface MuSchema<Value> {
    readonly identity: Value;
    readonly muType: string;
    readonly muData?: any;
    readonly json: object;
    alloc(): Value;
    free(value: Value): void;
    equal(a: Value, b: Value): boolean;
    clone(value: Value): Value;
    assign(dst: Value, src: Value): Value;
    diff(base: Value, target: Value, out: MuWriteStream): boolean;
    patch(base: Value, inp: MuReadStream): Value;
    toJSON(value: Value): any;
    fromJSON(json: any): Value;
}
//# sourceMappingURL=schema.d.ts.map