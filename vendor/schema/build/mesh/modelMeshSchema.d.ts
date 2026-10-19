import { MuSchema } from '@box/mudb/schema/schema';
import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
export declare class CompactModel {
    material: {
        [key: number]: {
            rgb: number[];
            pbr: number[];
        };
    };
    sliceInfo: number[];
    data: Uint8Array;
    surfaceCount: number;
    constructor(data: Uint8Array, sliceInfo: number[], material: {
        [key: number]: {
            rgb: number[];
            pbr: number[];
        };
    }, surfaceCount: number);
    spread(): {
        meshBuffer: Uint8Array;
        pbrBuffer: Uint8Array;
    };
}
export declare class ModelMeshSchema implements MuSchema<CompactModel> {
    readonly identity: CompactModel;
    muType: string;
    json: {
        type: string;
    };
    alloc(): CompactModel;
    free(model: CompactModel): void;
    equal(a: CompactModel, b: CompactModel): boolean;
    clone(m: CompactModel): CompactModel;
    assign(dst: CompactModel, src: CompactModel): CompactModel;
    diff(base: CompactModel | undefined, target: CompactModel, out: MuWriteStream): boolean;
    patch(base: CompactModel | undefined, inp: MuReadStream): any;
    toJSON(m: CompactModel): number[];
    fromJSON(json: any): any;
}
//# sourceMappingURL=modelMeshSchema.d.ts.map