import { MuSchema } from '@box/mudb/schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
export declare class MuNullable<ValueSchema extends MuSchema<any>> implements MuSchema<ValueSchema['identity'] | null> {
    readonly muType = "nullable";
    readonly identity: ValueSchema['identity'] | null;
    readonly muData: ValueSchema;
    readonly json: object;
    constructor(schema: ValueSchema, identity?: ValueSchema['identity'] | null, identityIsNull?: boolean);
    alloc(): ValueSchema['identity'];
    free(val: ValueSchema['identity'] | null): void;
    equal(a: ValueSchema['identity'] | null, b: ValueSchema['identity'] | null): boolean;
    clone(val: ValueSchema['identity'] | null): ValueSchema['identity'] | null;
    assign(dst: ValueSchema['identity'] | null, src: ValueSchema['identity'] | null): ValueSchema['identity'];
    diff(base: ValueSchema['identity'] | null, target: ValueSchema['identity'] | null, out: MuWriteStream): boolean;
    patch(base: ValueSchema['identity'] | null, inp: MuReadStream): ValueSchema['identity'] | null;
    toJSON(val: ValueSchema['identity'] | null): ReturnType<ValueSchema['toJSON']> | null;
    fromJSON(json: any): ValueSchema['identity'] | null;
}
//# sourceMappingURL=nullable-schema.d.ts.map