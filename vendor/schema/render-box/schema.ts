import {
  MuStruct,
  MuSchema,
  MuFloat64,
  MuVarint,
  MuSortedArray,
  MuOption,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';

/**
 * 摄像机到body中心点的距离产生的缩放
 */
export enum OverlayInfoVisibleScaleEnum {
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
  Invisible = 0,
}

export const RenderBoxSchema = new MuStruct({
  // entity id
  id: new MuVarint(),

  px: new MuFloat64(0),
  py: new MuFloat64(0),
  pz: new MuFloat64(0),

  rx: new MuFloat64(1),
  ry: new MuFloat64(1),
  rz: new MuFloat64(1),

  anchorX: new MuFloat64(0),
  anchorY: new MuFloat64(0),
  anchorZ: new MuFloat64(0),

  qx: new MuFloat64(0),
  qy: new MuFloat64(0),
  qz: new MuFloat64(0),
  qw: new MuFloat64(0),

  // 2D offsetY
  overlayOffsetY: new MuFloat64(0),
  playerChatBubbleOffsetY: new MuFloat64(0),
  /**
   * 摄像机到body中心点的距离产生的缩放，适用于玩家信息和实体信息
   */
  overlayInfoVisibleScale: <MuSchema<OverlayInfoVisibleScaleEnum | undefined>>(
    new MuOption(
      new MuVarint(OverlayInfoVisibleScaleEnum.Invisible),
      undefined,
      true,
    )
  ),
});

export type RenderBox = typeof RenderBoxSchema.identity;

export const RenderBoxSetSchema = new MuSortedArray(
  RenderBoxSchema,
  Infinity,
  compareId,
);

export type RenderBoxSet = typeof RenderBoxSetSchema.identity;
