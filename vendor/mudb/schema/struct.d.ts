import { MuSchema } from './schema';
import { MuWriteStream, MuReadStream } from '../stream';
export type Struct<Spec extends {
    [prop: string]: MuSchema<any>;
}> = {
    [K in keyof Spec]: Spec[K]['identity'];
};
export declare class MuStruct<Spec extends {
    [prop: string]: MuSchema<any>;
}> implements MuSchema<Struct<Spec>> {
    readonly muType = "struct";
    readonly muData: Spec;
    readonly identity: Struct<Spec>;
    readonly json: object;
    pool: Struct<Spec>[];
    readonly alloc: () => Struct<Spec>;
    readonly free: (struct: Struct<Spec>) => void;
    readonly equal: (a: Struct<Spec>, b: Struct<Spec>) => boolean;
    readonly clone: (struct: Struct<Spec>) => Struct<Spec>;
    readonly assign: (dst: Struct<Spec>, src: Struct<Spec>) => Struct<Spec>;
    readonly diff: (base: Struct<Spec>, target: Struct<Spec>, out: MuWriteStream) => boolean;
    readonly patch: (base: Struct<Spec>, inp: MuReadStream) => Struct<Spec>;
    readonly toJSON: (struct: Struct<Spec>) => Struct<any>;
    readonly fromJSON: (json: Struct<any>) => Struct<Spec>;
    readonly stats: () => {
        allocCount: number;
        freeCount: number;
        poolSize: number;
    };
    constructor(spec: Spec);
}
//# sourceMappingURL=struct.d.ts.map