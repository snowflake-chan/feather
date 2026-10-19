import { BuildSystem } from '../../type';
export interface ImageModel {
    width: number;
    height: number;
    data: string;
}
export declare function genImageFromUploader(bs: BuildSystem, hash: string, type: string, width: number, height: number): Promise<string>;
//# sourceMappingURL=img-process.d.ts.map