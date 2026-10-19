import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
declare function equal(a: any, b: any): boolean;
declare function clone(x: any): any;
export declare const deepEqual: typeof equal;
export declare const deepClone: typeof clone;
export declare class MuJSON implements MuSchema<object> {
    readonly muType = "json";
    readonly identity: object;
    readonly json: object;
    constructor(identity?: object);
    alloc(): object;
    free(): void;
    equal(a: object, b: object): boolean;
    clone(obj: object): object;
    assign(dst: object, src: object): object;
    diff(base: object, target: object, out: MuWriteStream): boolean;
    patch(base: object, inp: MuReadStream): object;
    toJSON(obj: object): object;
    fromJSON(x: object): object;
}
export {};
//# sourceMappingURL=json.d.ts.map