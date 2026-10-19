import { MuReadStream, MuWriteStream } from '../stream';
import { MuString } from './_string';
export declare class MuUTF8 extends MuString<'utf8'> {
    constructor(identity?: string);
    diff(base: string, target: string, stream: MuWriteStream): boolean;
    patch(base: string, stream: MuReadStream): string;
}
//# sourceMappingURL=utf8.d.ts.map