"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderBoxSetSchema = exports.RenderBoxSchema = exports.OverlayInfoVisibleScaleEnum = void 0;
const schema_1 = require("@box/mudb/schema");
const id_1 = require("@box/utils/id");
/**
 * 摄像机到body中心点的距离产生的缩放
 */
var OverlayInfoVisibleScaleEnum;
(function (OverlayInfoVisibleScaleEnum) {
    /**
     * - 近视距( 0 - 30 studs) scale 为 1
     */
    OverlayInfoVisibleScaleEnum[OverlayInfoVisibleScaleEnum["NearScale"] = 1] = "NearScale";
    /**
     * - 远视距(30 - 60 studs) scale 为 0.6
     */
    OverlayInfoVisibleScaleEnum[OverlayInfoVisibleScaleEnum["FarScale"] = 0.6] = "FarScale";
    /**
     * - 不可见( 60 + studs) scale 为 0
     */
    OverlayInfoVisibleScaleEnum[OverlayInfoVisibleScaleEnum["Invisible"] = 0] = "Invisible";
})(OverlayInfoVisibleScaleEnum || (exports.OverlayInfoVisibleScaleEnum = OverlayInfoVisibleScaleEnum = {}));
exports.RenderBoxSchema = new schema_1.MuStruct({
    // entity id
    id: new schema_1.MuVarint(),
    px: new schema_1.MuFloat64(0),
    py: new schema_1.MuFloat64(0),
    pz: new schema_1.MuFloat64(0),
    rx: new schema_1.MuFloat64(1),
    ry: new schema_1.MuFloat64(1),
    rz: new schema_1.MuFloat64(1),
    anchorX: new schema_1.MuFloat64(0),
    anchorY: new schema_1.MuFloat64(0),
    anchorZ: new schema_1.MuFloat64(0),
    qx: new schema_1.MuFloat64(0),
    qy: new schema_1.MuFloat64(0),
    qz: new schema_1.MuFloat64(0),
    qw: new schema_1.MuFloat64(0),
    // 2D offsetY
    overlayOffsetY: new schema_1.MuFloat64(0),
    playerChatBubbleOffsetY: new schema_1.MuFloat64(0),
    /**
     * 摄像机到body中心点的距离产生的缩放，适用于玩家信息和实体信息
     */
    overlayInfoVisibleScale: (new schema_1.MuOption(new schema_1.MuVarint(OverlayInfoVisibleScaleEnum.Invisible), undefined, true)),
});
exports.RenderBoxSetSchema = new schema_1.MuSortedArray(exports.RenderBoxSchema, Infinity, id_1.compareId);
//# sourceMappingURL=schema.js.map