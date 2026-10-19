import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export declare class MuArray<ValueSchema extends MuSchema<any>> implements MuSchema<ValueSchema['identity'][]> {
    readonly muType = "array";
    readonly identity: ValueSchema['identity'][];
    readonly muData: ValueSchema;
    readonly json: object;
    readonly capacity: number;
    assign: (dst: ValueSchema['identity'][], src: ValueSchema['identity'][]) => ValueSchema['identity'][];
    free: (x: ValueSchema['identity'][]) => void;
    clone: (src: ValueSchema['identity'][]) => ValueSchema['identity'][];
    equal: (a: ValueSchema['identity'][], b: ValueSchema['identity'][]) => boolean;
    toJSON: (src: ValueSchema['identity'][]) => any;
    allocCount: number;
    freeCount: number;
    stats(): {
        allocCount: number;
        freeCount: number;
        poolSize: number;
    };
    constructor(schema: ValueSchema, capacity: number, identity?: ValueSchema['identity'][]);
    alloc(): ValueSchema['identity'][];
    diff(base: ValueSchema['identity'][], target: ValueSchema['identity'][], out: MuWriteStream): boolean;
    patch(base: ValueSchema['identity'][], inp: MuReadStream): ValueSchema['identity'][];
    fromJSON(x: any[]): ValueSchema['identity'][];
}
//# sourceMappingURL=array.d.ts.map