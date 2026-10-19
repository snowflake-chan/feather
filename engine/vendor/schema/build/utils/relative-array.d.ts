import { MuSchema, MuArray } from '@box/mudb/schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
export declare class RelativeArray<TSchema extends MuSchema<any>> implements MuSchema<TSchema['identity'][]> {
    identity: TSchema['identity'][];
    muType: string;
    muData: TSchema;
    json: any;
    arraySchema: MuArray<TSchema>;
    alloc: () => TSchema['identity'][];
    free: (x: TSchema['identity'][]) => void;
    clone: (x: TSchema['identity'][]) => TSchema['identity'][];
    equal: (x: TSchema['identity'][], y: TSchema['identity'][]) => boolean;
    assign: (x: TSchema['identity'][], y: TSchema['identity'][]) => TSchema['identity'][];
    toJSON: (x: TSchema['identity'][]) => any[];
    fromJSON: (x: any) => TSchema['identity'][];
    constructor(schema: TSchema, capacity: number, identity?: TSchema['identity'][]);
    diff(base: TSchema['identity'][], target: TSchema['identity'][], stream: MuWriteStream): boolean;
    patch(base: TSchema['identity'][], stream: MuReadStream): TSchema['identity'][];
}
//# sourceMappingURL=relative-array.d.ts.map