import { MuSchema } from '@box/mudb/schema/schema';
export type ArrayUnionInstance<SubTypes extends [...MuSchema<unknown>[]]> = {
    id: number[];
    data: SubTypes[number]['identity'][];
};
export declare class MuArrayUnion<SubTypes extends [...MuSchema<unknown>[]]> implements MuSchema<ArrayUnionInstance<SubTypes>> {
    readonly muType = "array-union";
    readonly identity: ArrayUnionInstance<SubTypes>;
    readonly muData: SubTypes;
    readonly json: {
        type: 'array-union';
        data: SubTypes[number]['json'];
    };
    pool: ArrayUnionInstance<SubTypes>[];
    clone: MuSchema<ArrayUnionInstance<SubTypes>>['clone'];
    assign: MuSchema<ArrayUnionInstance<SubTypes>>['assign'];
    diff: MuSchema<ArrayUnionInstance<SubTypes>>['diff'];
    patch: MuSchema<ArrayUnionInstance<SubTypes>>['patch'];
    constructor(...subtypes: SubTypes);
    alloc(): ArrayUnionInstance<SubTypes>;
    free(instance: ArrayUnionInstance<SubTypes>): void;
    equal(a: ArrayUnionInstance<SubTypes>, b: ArrayUnionInstance<SubTypes>): boolean;
    toJSON(instance: ArrayUnionInstance<SubTypes>): {
        id: number[];
        data: any;
    };
    fromJSON(json: any): ArrayUnionInstance<SubTypes>;
}
//# sourceMappingURL=mu-array-union.d.ts.map