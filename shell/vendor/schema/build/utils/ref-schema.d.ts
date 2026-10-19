import { MuSchema } from '@box/mudb/schema/schema';
export declare class MuRefSchema<T> implements MuSchema<T | null> {
    identity: T | null;
    muType: string;
    muData: {
        type: string;
    };
    json: {
        type: string;
    };
    constructor();
    diff: () => never;
    patch: () => never;
    toJSON: () => never;
    fromJSON: () => never;
    alloc(): T | null;
    free(): void;
    assign(dst: T | null, src: T | null): T | null;
    clone(x: any): any;
    equal(a: any, b: any): boolean;
}
