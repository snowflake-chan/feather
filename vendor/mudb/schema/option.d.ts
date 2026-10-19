import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export declare class MuOption<ValueSchema extends MuSchema<any>> implements MuSchema<ValueSchema['identity'] | undefined> {
    readonly muType = "option";
    readonly identity: ValueSchema['identity'] | undefined;
    readonly muData: ValueSchema;
    readonly json: object;
    constructor(schema: ValueSchema, identity?: ValueSchema['identity'], identityIsUndefined?: boolean);
    alloc(): ValueSchema['identity'];
    free(val: ValueSchema['identity'] | undefined): void;
    equal(a: ValueSchema['identity'] | undefined, b: ValueSchema['identity'] | undefined): boolean;
    clone(val: ValueSchema['identity'] | undefined): ValueSchema['identity'] | undefined;
    assign(dst: ValueSchema['identity'] | undefined, src: ValueSchema['identity'] | undefined): ValueSchema['identity'];
    diff(base: ValueSchema['identity'] | undefined, target: ValueSchema['identity'] | undefined, out: MuWriteStream): boolean;
    patch(base: ValueSchema['identity'] | undefined, inp: MuReadStream): ValueSchema['identity'] | undefined;
    toJSON(val: ValueSchema['identity'] | undefined): ReturnType<ValueSchema['toJSON']> | undefined;
    fromJSON(json: any): ValueSchema['identity'] | undefined;
}
//# sourceMappingURL=option.d.ts.map