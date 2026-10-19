"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderBoxSetSchema = exports.RenderBoxSchema = exports.OverlayInfoVisibleScaleEnum = void 0;
const float64_1 = require("@box/mudb/schema/float64");
const option_1 = require("@box/mudb/schema/option");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const varint_1 = require("@box/mudb/schema/varint");
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
exports.RenderBoxSchema = new struct_1.MuStruct({
    // entity id
    id: new varint_1.MuVarint(),
    px: new float64_1.MuFloat64(0),
    py: new float64_1.MuFloat64(0),
    pz: new float64_1.MuFloat64(0),
    rx: new float64_1.MuFloat64(1),
    ry: new float64_1.MuFloat64(1),
    rz: new float64_1.MuFloat64(1),
    anchorX: new float64_1.MuFloat64(0),
    anchorY: new float64_1.MuFloat64(0),
    anchorZ: new float64_1.MuFloat64(0),
    qx: new float64_1.MuFloat64(0),
    qy: new float64_1.MuFloat64(0),
    qz: new float64_1.MuFloat64(0),
    qw: new float64_1.MuFloat64(0),
    // 2D offsetY
    overlayOffsetY: new float64_1.MuFloat64(0),
    playerChatBubbleOffsetY: new float64_1.MuFloat64(0),
    /**
     * 摄像机到body中心点的距离产生的缩放，适用于玩家信息和实体信息
     */
    overlayInfoVisibleScale: (new option_1.MuOption(new varint_1.MuVarint(OverlayInfoVisibleScaleEnum.Invisible), undefined, true)),
});
exports.RenderBoxSetSchema = new sorted_array_1.MuSortedArray(exports.RenderBoxSchema, Infinity, id_1.compareId);
