import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export interface Dictionary<Schema extends MuSchema<any>> {
    [key: string]: Schema['identity'];
}
export declare class MuDictionary<ValueSchema extends MuSchema<any>> implements MuSchema<Dictionary<ValueSchema>> {
    readonly muType = "dictionary";
    readonly identity: Dictionary<ValueSchema>;
    readonly muData: ValueSchema;
    readonly json: object;
    readonly capacity: number;
    private _isPrimitive;
    allocCount: number;
    freeCount: number;
    stats(): {
        allocCount: number;
        freeCount: number;
        poolSize: number;
    };
    constructor(schema: ValueSchema, capacity: number, identity?: Dictionary<ValueSchema>);
    alloc(): Dictionary<ValueSchema>;
    free(dict: Dictionary<ValueSchema>): void;
    equal(a: Dictionary<ValueSchema>, b: Dictionary<ValueSchema>): boolean;
    clone(dict: Dictionary<ValueSchema>): Dictionary<ValueSchema>;
    assign: (dst: Dictionary<ValueSchema>, src: Dictionary<ValueSchema>) => Dictionary<ValueSchema>;
    diff(base: Dictionary<ValueSchema>, target: Dictionary<ValueSchema>, out: MuWriteStream): boolean;
    patch(base: Dictionary<ValueSchema>, inp: MuReadStream): Dictionary<ValueSchema>;
    toJSON(dict: Dictionary<ValueSchema>): Dictionary<any>;
    fromJSON(x: Dictionary<any>): Dictionary<ValueSchema>;
}
//# sourceMappingURL=dictionary.d.ts.map