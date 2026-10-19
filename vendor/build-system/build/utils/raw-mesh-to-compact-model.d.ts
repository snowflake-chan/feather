import { CompactModel } from '@box/schema/mesh/modelMeshSchema';
export interface PaletteEntry {
    r: number;
    g: number;
    b: number;
}
export declare function rawMeshToCompactModel(rawMesh: Uint8Array, palette: PaletteEntry[], MSE?: number[][]): CompactModel;
//# sourceMappingURL=raw-mesh-to-compact-model.d.ts.map