import { MuSchema } from '@box/mudb/schema';
import { TaggedId } from '@box/utils/id';
export declare function deltaList<Schema extends MuSchema<TaggedId>>(schema: Schema, out: {
    upserts: Schema['identity'][];
    remove: number[];
}, base: Schema['identity'][], target: Schema['identity'][]): void;
export declare function patchList<Schema extends MuSchema<TaggedId>>(schema: Schema, base: Schema['identity'][], patch: {
    upserts: Schema['identity'][];
    remove: number[];
}): void;
export declare function deltaItem<Schema extends MuSchema<any>>(schema: Schema, out: {
    patch: Schema['identity'];
    changed: boolean;
}, base: Schema['identity'], target: Schema['identity']): void;
export declare function patchItem<Schema extends MuSchema<any>>(schema: Schema, base: Schema['identity'], patch: {
    patch: Schema['identity'];
    changed: boolean;
}): any;
//# sourceMappingURL=delta.d.ts.map