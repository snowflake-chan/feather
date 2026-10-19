import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export declare class MuSortedArray<ValueSchema extends MuSchema<any>> implements MuSchema<ValueSchema['identity'][]> {
    readonly muType = "sorted-array";
    readonly identity: ValueSchema['identity'][];
    readonly muData: ValueSchema;
    readonly json: object;
    readonly compare: (a: ValueSchema['identity'], b: ValueSchema['identity']) => number;
    readonly capacity: number;
    private _arraySchema;
    stats(): {
        allocCount: number;
        freeCount: number;
        poolSize: number;
    };
    constructor(schema: ValueSchema, capacity: number, compare?: (a: ValueSchema['identity'], b: ValueSchema['identity']) => number, identity?: ValueSchema['identity'][]);
    alloc: () => ValueSchema['identity'][];
    free: (set: ValueSchema['identity'][]) => void;
    equal: (a: ValueSchema['identity'][], b: ValueSchema['identity'][]) => boolean;
    clone: (set: ValueSchema['identity'][]) => ValueSchema['identity'][];
    assign: (dst: ValueSchema['identity'][], src: ValueSchema['identity'][]) => ValueSchema['identity'][];
    toJSON: (set: ValueSchema['identity'][]) => any[];
    fromJSON: (json: any[]) => ValueSchema['identity'][];
    diff(base: ValueSchema['identity'][], target: ValueSchema['identity'][], out: MuWriteStream): boolean;
    patch(base: ValueSchema['identity'][], inp: MuReadStream): ValueSchema['identity'][];
}
//# sourceMappingURL=sorted-array.d.ts.map