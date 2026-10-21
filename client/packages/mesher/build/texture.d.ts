declare class TextureNode {
    texture?: Texture;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    children: TextureNode[] | undefined;
    id: number;
    private static count;
    constructor(texture?: Texture);
}
interface FreeSpace {
    node: TextureNode;
    x: number;
    y: number;
    width: number;
    height: number;
    minWH: number;
    maxWH: number;
}
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}
export type TexturePositions = Map<Texture, Rect>;
export declare class Texture {
    width: number;
    height: number;
    data: number[];
    constructor(width: number, height: number, data?: number[]);
    set(x: number, y: number, value: number): void;
    get(x: number, y: number): number;
}
export declare function optimizeTexture(texture: Texture, extendEdge?: boolean): Texture;
export declare function scaleTexture(texture: Texture, widthScale?: number, heightScale?: number): Texture;
export declare function packTexture(a: TextureNode, b: TextureNode, freespaces: FreeSpace[]): TextureNode;
export declare function textureNodeToTexture(node: TextureNode): {
    texture: Texture;
    positions: Map<Texture, Rect>;
};
export declare function packTextures(textures: Texture[]): {
    texture: TextureNode;
    wastes: number;
};
export declare function flipTexture(a: Texture): Texture;
export declare function rotateTexture(a: Texture): Texture;
export declare function extendTextureEdge(a: Texture): Texture;
export {};
