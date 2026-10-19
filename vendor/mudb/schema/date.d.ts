import { MuWriteStream, MuReadStream } from '../stream';
import { MuSchema } from './schema';
export declare class MuDate implements MuSchema<Date> {
    readonly muType = "date";
    readonly identity: Date;
    readonly json: any;
    constructor(identity?: Date);
    alloc(): Date;
    free(date: Date): void;
    equal(a: Date, b: Date): boolean;
    clone(date_: Date): Date;
    assign(dst: Date, src: Date): Date;
    diff(base: Date, target: Date, out: MuWriteStream): boolean;
    patch(base: Date, inp: MuReadStream): Date;
    toJSON(date: Date): string;
    fromJSON(x: string): Date;
}
//# sourceMappingURL=date.d.ts.map