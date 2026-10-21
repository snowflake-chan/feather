import {
  MuStruct,
  MuUnion,
  MuArray,
  MuFloat64,
  MuUTF8,
  MuUint32,
  MuBoolean,
  MuASCII,
  MuDictionary,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import { GameClientState } from '../game-client-schema';
import type { ParsedGIF } from '../gl/gif-parser';

export const TextOverlaySchema = new MuStruct({
  id: new MuUint32(0),
  zIndex: new MuFloat64(0),
  scale: new MuFloat64(1),
  x: new MuFloat64(0),
  y: new MuFloat64(0),
  text: new MuUTF8(),
  font: new MuUTF8('12pt Sans-Serif'),
  fillStyle: new MuUTF8('#000'),
});

export type TextOverlay = typeof TextOverlaySchema.identity;

export const BloodStripOverlaySchema = new MuStruct({
  id: new MuUint32(0),
  zIndex: new MuFloat64(0),
  scale: new MuFloat64(1),
  x: new MuFloat64(0),
  y: new MuFloat64(0),
  percentage: new MuFloat64(1),
  barLen: new MuFloat64(50),
  barWidth: new MuFloat64(10),
  fillStyle: new MuUTF8('#000'),
});

export type BloodStripOverlay = typeof BloodStripOverlaySchema.identity;

export const InteractUIOverlaySchema = new MuStruct({
  id: new MuUint32(0),
  zIndex: new MuFloat64(0),
  scale: new MuFloat64(1),
  x: new MuFloat64(0),
  y: new MuFloat64(0),
  selected: new MuBoolean(false),
  interacting: new MuBoolean(false),
});

export type InteractUIOverlay = typeof InteractUIOverlaySchema.identity;

export const StyleNumberOverlaySchema = new MuStruct({
  id: new MuUint32(0),
  zIndex: new MuFloat64(0),
  scale: new MuFloat64(1),
  x: new MuFloat64(0),
  y: new MuFloat64(0),
  text: new MuASCII(''),
});

export type StyleNumberOverlay = typeof StyleNumberOverlaySchema.identity;

export const PlayerIndicatorSchema = new MuStruct({
  id: new MuUint32(0),
  zIndex: new MuFloat64(0),
  scale: new MuFloat64(1),
  x: new MuFloat64(0),
  y: new MuFloat64(0),
});

export type PlayerIndicatorOverlay = typeof PlayerIndicatorSchema.identity;

export const OverlaySchema = new MuUnion({
  text: TextOverlaySchema,
  bloodStrip: BloodStripOverlaySchema,
  styleNumber: StyleNumberOverlaySchema,
  interactUI: InteractUIOverlaySchema,
  playerIndicator: PlayerIndicatorSchema,
});

export const OverlayListSchema = new MuArray(OverlaySchema, Infinity);

export const Text3DOverlaySchema = new MuStruct({
  id: new MuUint32(0),
  scale: new MuFloat64(1),
  position: Vec3Schema,
  text: new MuUTF8(),
  font: new MuUTF8('12pt Sans-Serif'),
  fillStyle: new MuUTF8('#000'),
  perspective: new MuBoolean(false),
});

export const Overlay3DSchema = new MuUnion({
  text: Text3DOverlaySchema,
});

export const InteractAnimationSchema = new MuStruct({
  /**
   * 当前播放按钮动画的对应实体id
   * 在移动端所有按钮都会播放动画，此id为当前选中的实体id
   */
  id: new MuUint32(0),
  /**
   * 是否显示按钮动画（附近没有可交互按钮时不显示动画）
   */
  show: new MuBoolean(false),
  /**
   * 动画播放比例
   */
  phase: new MuFloat64(0),
  /**
   * 上一次计算动画播放比例的时间
   */
  lastTime: new MuFloat64(0),
});

export type InteractAnimation = typeof InteractAnimationSchema.identity;

export const StickerSchema = new MuStruct({
  id: new MuUint32(),
  url: new MuASCII(),
});

export const StickerPackSchema = new MuDictionary(StickerSchema, Infinity);
export type StickerPack = typeof StickerPackSchema.identity;

export const OverlayStateSchema = new MuStruct({
  context: new MuRefSchema<CanvasRenderingContext2D>(),
  overlay3D: Overlay3DSchema,
  overlays: OverlayListSchema,
  interactAnimation: InteractAnimationSchema,
  stickerPackList: new MuDictionary(StickerPackSchema, Infinity),
  gifCache: new MuDictionary(new MuRefSchema<ParsedGIF>(), Infinity),
});

export async function loadStickerPackList(state: GameClientState) {
  state.overlays.stickerPackList = {};
}
