import { MuStruct, MuSchema, MuFloat64, MuVarint, MuSortedArray } from '@box/mudb/schema';
/**
 * 摄像机到body中心点的距离产生的缩放
 */
export declare enum OverlayInfoVisibleScaleEnum {
    /**
     * - 近视距( 0 - 30 studs) scale 为 1
     */
    NearScale = 1,
    /**
     * - 远视距(30 - 60 studs) scale 为 0.6
     */
    FarScale = 0.6,
    /**
     * - 不可见( 60 + studs) scale 为 0
     */
    Invisible = 0
}
export declare const RenderBoxSchema: MuStruct<{
    id: MuVarint;
    px: MuFloat64;
    py: MuFloat64;
    pz: MuFloat64;
    rx: MuFloat64;
    ry: MuFloat64;
    rz: MuFloat64;
    anchorX: MuFloat64;
    anchorY: MuFloat64;
    anchorZ: MuFloat64;
    qx: MuFloat64;
    qy: MuFloat64;
    qz: MuFloat64;
    qw: MuFloat64;
    overlayOffsetY: MuFloat64;
    playerChatBubbleOffsetY: MuFloat64;
    /**
     * 摄像机到body中心点的距离产生的缩放，适用于玩家信息和实体信息
     */
    overlayInfoVisibleScale: MuSchema<OverlayInfoVisibleScaleEnum | undefined>;
}>;
export type RenderBox = typeof RenderBoxSchema.identity;
export declare const RenderBoxSetSchema: MuSortedArray<MuStruct<{
    id: MuVarint;
    px: MuFloat64;
    py: MuFloat64;
    pz: MuFloat64;
    rx: MuFloat64;
    ry: MuFloat64;
    rz: MuFloat64;
    anchorX: MuFloat64;
    anchorY: MuFloat64;
    anchorZ: MuFloat64;
    qx: MuFloat64;
    qy: MuFloat64;
    qz: MuFloat64;
    qw: MuFloat64;
    overlayOffsetY: MuFloat64;
    playerChatBubbleOffsetY: MuFloat64;
    /**
     * 摄像机到body中心点的距离产生的缩放，适用于玩家信息和实体信息
     */
    overlayInfoVisibleScale: MuSchema<OverlayInfoVisibleScaleEnum | undefined>;
}>>;
export type RenderBoxSet = typeof RenderBoxSetSchema.identity;
//# sourceMappingURL=schema.d.ts.map