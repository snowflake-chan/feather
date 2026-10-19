export interface TaggedId {
    id: number;
}
export declare function compareId(a: TaggedId, b: TaggedId): number;
export declare function indexEqRange(objects: TaggedId[], id: number, _l: number, _h: number): number;
export declare function indexEq(objects: TaggedId[], id: number): number;
export declare function indexPred(objects: TaggedId[], id: number): number;
export declare function zipId<Tables extends TaggedId[][]>(f: (...idx: {
    [index in keyof Tables]: Tables[index] extends (infer T)[] ? T : never;
}) => void, ...tables: Tables): void;
export declare function getById<T extends TaggedId>(data: T[], id: number): T | null;
//# sourceMappingURL=id.d.ts.map