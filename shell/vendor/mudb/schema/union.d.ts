import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export type UnionInstance<SubTypes extends {
    [type: string]: MuSchema<any>;
}, Type extends keyof SubTypes> = {
    type: Type;
    data: SubTypes[Type]['identity'];
};
export interface UnionTypes<SubTypes extends {
    [type: string]: MuSchema<any>;
}> {
    instance: UnionInstance<SubTypes, keyof SubTypes>;
    json: {
        type: keyof SubTypes;
        data: any;
    };
}
export declare class MuUnion<SubTypes extends {
    [type: string]: MuSchema<any>;
}> implements MuSchema<UnionTypes<SubTypes>['instance']> {
    readonly muType = "union";
    readonly identity: UnionTypes<SubTypes>['instance'];
    readonly muData: SubTypes;
    readonly json: object;
    private _types;
    constructor(schemaSpec: SubTypes, identityType?: keyof SubTypes);
    alloc(): UnionTypes<SubTypes>['instance'];
    free(union: UnionTypes<SubTypes>['instance']): void;
    equal(a: UnionTypes<SubTypes>['instance'], b: UnionTypes<SubTypes>['instance']): boolean;
    clone(union: UnionTypes<SubTypes>['instance']): UnionTypes<SubTypes>['instance'];
    assign(dst: UnionTypes<SubTypes>['instance'], src: UnionTypes<SubTypes>['instance']): UnionTypes<SubTypes>['instance'];
    diff(base: UnionTypes<SubTypes>['instance'], target: UnionTypes<SubTypes>['instance'], out: MuWriteStream): boolean;
    patch(base: UnionTypes<SubTypes>['instance'], inp: MuReadStream): UnionTypes<SubTypes>['instance'];
    toJSON(union: UnionTypes<SubTypes>['instance']): UnionTypes<SubTypes>['json'];
    fromJSON(x: UnionTypes<SubTypes>['json']): UnionTypes<SubTypes>['instance'];
}
//# sourceMappingURL=union.d.ts.map