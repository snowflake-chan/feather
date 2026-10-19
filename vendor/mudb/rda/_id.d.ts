import { MuASCII } from '../schema/ascii';
import { MuSortedArray } from '../schema/sorted-array';
export declare const IdSchema: MuASCII;
export type Id = typeof IdSchema['identity'];
export declare const IdSetSchema: MuSortedArray<MuASCII>;
export type IdSet = typeof IdSetSchema['identity'];
export declare const ID_MAX: string;
export declare const ID_MIN = "";
export declare function initialIds(count: number): Id[];
export declare function allocIds(begin: Id, end: Id, count: number): Id[];
export declare function compareId(a: Id, b: Id): number;
export declare function compareTaggedId<T extends {
    id: Id;
}>(a: T, b: T): number;
export declare function searchId(list: Id[], id: Id): number;
//# sourceMappingURL=_id.d.ts.map