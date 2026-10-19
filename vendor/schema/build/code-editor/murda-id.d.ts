import { Id } from '@box/mudb/rda/_id';
export interface AllocIdsData {
    beginId: Id;
    step: number;
}
export declare function subII(a: Id, b: Id, depth: number, max: number): number;
export declare function allocId(begin: Id, end: Id): string;
export declare function allocIds(begin: Id, end: Id, count: number): string[];
export declare function preAllocIds(begin: Id, end: Id, count: number, out: AllocIdsData): void;
export declare function allocIdsEx({ beginId, step }: AllocIdsData, count: number): Id[];
//# sourceMappingURL=murda-id.d.ts.map