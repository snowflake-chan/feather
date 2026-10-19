import { Mesher } from './index';
export interface GLTFNode {
    name?: string;
    mesh?: number;
    alpha?: number;
    rotation?: number[];
    scale?: number[];
    translation?: number[];
    children?: number[];
}
export declare function exportToGLTF(name: string, mesher: Mesher, palette: number[] | [number, number, number][], emissivePalette: number[], nodes?: GLTFNode[]): Promise<string>;
