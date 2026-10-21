import {
  MuStruct,
  MuInt32,
  MuUint32,
  MuBoolean,
  MuUnion,
  MuArray,
  MuFloat32,
  MuFloat64,
  MuUint8,
  MuUint16,
  MuUTF8,
  MuASCII,
  MuSchema,
} from '@box/mudb/schema';
import {
  Vec3Schema,
  Vec2Schema,
  Mat4Schema,
  Vec4Schema,
  QuatSchema,
} from '@box/schema/utils/math-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { MeshMotionMatrix, Renderable } from '../mesh/renderable-schema';

// Event handlers
export const UI3DMouseEventSchema = new MuStruct({
  eye: Vec3Schema,
  mouseButton: new MuUint8(),
  mouseState: new MuUint8(),
  worldPosition: Vec3Schema,
  screenPosition: Vec2Schema,
});

export const UI3DConeMouseEventSchema = new MuStruct({
  mouseState: new MuUint8(),
  mouseButton: new MuUint8(),
  originPosition: Vec3Schema,
  scaleIndex: new MuFloat32(),
  worldPosition: Vec3Schema,
  screenPosition: Vec2Schema,
});

export const UI3DRingMouseEventSchema = new MuStruct({
  mouseState: new MuUint8(),
  mouseButton: new MuUint8(),
  ringCenter: Vec3Schema,
  scaleIndex: new MuFloat32(),
  uv_x: Vec3Schema,
  uv_y: Vec3Schema,
  worldPosition: Vec3Schema,
  screenPosition: Vec2Schema,
});

export type UI3DMouseEvent = typeof UI3DMouseEventSchema.identity;
export type UI3DRingMouseEvent = typeof UI3DRingMouseEventSchema.identity;
export type UI3DMouseHandler = (event: UI3DMouseEvent) => boolean;
export type UI3DRingMouseHandler = (event: UI3DRingMouseEvent) => boolean;
export type UI3DMouseOutHandler = () => boolean;

export const UI3DVoxelEventSchema = new MuStruct({
  mouseState: new MuUint8(),
  mouseButton: new MuUint8(),
  voxelPosition: Vec3Schema,
  worldPosition: Vec3Schema,
  screenPosition: Vec2Schema,
  hitNormal: Vec3Schema,
  block: new MuUint16(),
});
export type UI3DVoxelEvent = typeof UI3DVoxelEventSchema.identity;
export type UI3DVoxelHandler = (event: UI3DVoxelEvent) => boolean;
export type onContextMenuHandler = (
  screenPosition: typeof Vec2Schema.identity,
) => boolean;

export const UI3DEntityEventSchema = new MuStruct({
  id: new MuUint32(),
  mouseState: new MuUint8(),
  worldPosition: Vec3Schema,
  worldNormal: Vec3Schema,
  screenPosition: Vec2Schema,
});
export type UI3DEntityEvent = typeof UI3DEntityEventSchema.identity;
export type UI3DEntityHandler = (event: UI3DEntityEvent) => boolean;

export class UI3DEventHandlerNode {
  public next: UI3DEventHandlerNode | null = null;
  public prev: UI3DEventHandlerNode | null = null;

  public onMouseEntity: UI3DEntityHandler | null = null;
  public onMouseVoxel: UI3DVoxelHandler | null = null;
  public onMouseChange: UI3DMouseHandler | null = null;
  public onContextMenu: onContextMenuHandler | null = null;
  public onClick: UI3DMouseHandler | null = null;
  public onDragStart: UI3DMouseHandler | null = null;
  public onDrag: UI3DMouseHandler | null = null;
  public onDragEnd: UI3DMouseHandler | null = null;
}

export const UI3DLineSchema = new MuStruct({
  id: new MuInt32(),
  destroyed: new MuBoolean(false),
  enableDepth: new MuBoolean(false),
  isDragging: new MuBoolean(false),
  visiable: new MuBoolean(true),
  start: Vec3Schema,
  end: Vec3Schema,
  color: Vec3Schema,
  opacity: new MuFloat32(1),
  width: new MuFloat32(1),
  fixedSize: new MuFloat32(10),
  quadDetection: new MuBoolean(false),
  screenSizeFixed: new MuBoolean(false),
  onMouseChange: new MuRefSchema<UI3DMouseHandler>(),
  onDragStart: new MuRefSchema<UI3DMouseHandler>(),
  onMouseIn: new MuRefSchema<UI3DMouseHandler>(),
  onMouseOut: new MuRefSchema<UI3DMouseOutHandler>(),
  mouseOn: new MuBoolean(false),
});
export type UI3DLineSpec = typeof UI3DLineSchema.identity;

export const UI3DDirectionSignSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  enableDepth: new MuBoolean(false),
  start: Vec3Schema,
  end: Vec3Schema,
  color: Vec3Schema,
  opacity: new MuFloat32(1),
  width: new MuFloat32(1),
  faceToEye: new MuUint8(0),
  normal: Vec3Schema,
});
export type UI3DDirectionSignSpec = typeof UI3DDirectionSignSchema.identity;

export const UI3DTextSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),

  position: Vec3Schema,
  text: new MuUTF8(''),

  perspective: new MuBoolean(false),
  scale: new MuFloat64(1),
  fill: new MuUTF8('#000'),
  font: new MuUTF8('12pt sans-serif'),

  onMouseChange: new MuRefSchema<UI3DMouseHandler>(),
});

export type UI3DTextSpec = typeof UI3DTextSchema.identity;

export const UI3DConeSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  enableDepth: new MuBoolean(false),
  height: new MuFloat64(1),
  cosA: new MuFloat64(1),
  axis: new MuASCII('y'),
  color: Vec3Schema,
  radialSegments: new MuUint16(),
  fixedSize: new MuFloat32(10),
  screenSizeFixed: new MuBoolean(true),
  vertices: new MuArray(Vec3Schema, Infinity),
  normals: new MuArray(Vec3Schema, Infinity),
  indices: new MuArray(Vec3Schema, Infinity),
  position: Vec3Schema,
  offset: Vec3Schema,
  translateMat: Mat4Schema,
  rotateMat: Mat4Schema,
  onMouseChange: new MuRefSchema<UI3DMouseHandler>(),
  onDragStart: new MuRefSchema<UI3DMouseHandler>(),
});
export type UI3DConeSpec = typeof UI3DConeSchema.identity;

export const UI3DCursorIndicatorSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  normal: Vec3Schema,
  center: Vec3Schema,
  type: new MuUint8(0),
  radius: new MuFloat32(1),
  vertices: new MuArray(Vec3Schema, Infinity),
  indices: new MuArray(Vec3Schema, Infinity),
  translateMat: Mat4Schema,
  offset: Vec3Schema,
  uv: new MuArray(Vec2Schema, Infinity),
});
export type UI3DCursorIndicatorSpec = typeof UI3DCursorIndicatorSchema.identity;

export const UI3DQuadSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  enableDepth: new MuBoolean(false),
  normal: Vec3Schema,
  center: Vec3Schema,
  color: Vec3Schema,
  fence: new MuUint8(0),
  isDragging: new MuBoolean(false),
  opacity: new MuFloat32(),
  radius: new MuFloat32(1),
  vertices: new MuArray(Vec3Schema, Infinity),
  indices: new MuArray(Vec3Schema, Infinity),
  uv: new MuArray(Vec2Schema, Infinity),
  translateMat: Mat4Schema,
  offset: Vec3Schema,
  fixedSize: new MuFloat32(10),
  screenSizeFixed: new MuBoolean(true),
  onMouseChange: new MuRefSchema<UI3DMouseHandler>(),
  onMouseIn: new MuRefSchema<UI3DMouseHandler>(),
  onMouseOut: new MuRefSchema<UI3DMouseOutHandler>(),
  mouseOn: new MuBoolean(false),
});
export type UI3DQuadSpec = typeof UI3DQuadSchema.identity;

export const UI3DRingSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  enableDepth: new MuBoolean(false),
  highlight: new MuBoolean(false),
  startRad: new MuFloat32(0),
  currentRad: new MuFloat32(0),
  clockwise: new MuBoolean(false),
  normal: Vec3Schema,
  center: Vec3Schema,
  color: Vec3Schema,
  fillColor: Vec3Schema,
  uv_x: Vec3Schema,
  uv_y: Vec3Schema,
  radius: new MuFloat32(1),
  vertices: new MuArray(Vec3Schema, Infinity),
  indices: new MuArray(Vec3Schema, Infinity),
  uv: new MuArray(Vec2Schema, Infinity),
  cylinderVertices: new MuArray(Vec3Schema, Infinity),
  cylinderIndices: new MuArray(Vec3Schema, Infinity),
  cylinderUv: new MuArray(new MuFloat32(0), Infinity),
  translateMat: Mat4Schema,
  offset: Vec3Schema,
  fixedSize: new MuFloat32(10),
  screenSizeFixed: new MuBoolean(true),
  onMouseChange: new MuRefSchema<UI3DRingMouseHandler>(),
  onDragStart: new MuRefSchema<UI3DRingMouseHandler>(),
  onMouseIn: new MuRefSchema<UI3DMouseHandler>(),
  onMouseOut: new MuRefSchema<UI3DMouseOutHandler>(),
  mouseOn: new MuBoolean(false),
});
export type UI3DRingSpec = typeof UI3DRingSchema.identity;

export const UI3DBoxSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  wireFrame: new MuBoolean(false),
  centerAtBottom: new MuBoolean(false),
  enableDepth: new MuBoolean(false),
  dimension: Vec3Schema,
  opacity: new MuFloat32(),
  color: Vec3Schema,
  wireFrameColor: Vec3Schema,
  vertices: new MuArray(Vec4Schema, Infinity),
  uv: new MuArray(Vec2Schema, Infinity),
  lines: new MuArray(Vec4Schema, Infinity),
  fixedSize: new MuFloat32(10),
  screenSizeFixed: new MuBoolean(true),
  position: Vec3Schema,
  offset: Vec3Schema,
  translateMat: Mat4Schema,
  onMouseChange: new MuRefSchema<UI3DMouseHandler>(),
  onDragStart: new MuRefSchema<UI3DMouseHandler>(),
  onMouseIn: new MuRefSchema<UI3DMouseHandler>(),
  onMouseOut: new MuRefSchema<UI3DMouseOutHandler>(),
  mouseOn: new MuBoolean(false),
});
export type UI3DBoxSpec = typeof UI3DBoxSchema.identity;

export const UI3DTextureBoxSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  opacity: new MuFloat32(),
  dimension: Vec3Schema,
  vertices: new MuArray(Vec4Schema, Infinity),
  blockType: new MuUint32(0),
  position: Vec3Schema,
  offset: Vec3Schema,
  translateMat: Mat4Schema,
  texCoordXPos: Vec2Schema,
  texCoordXNeg: Vec2Schema,
  texCoordYPos: Vec2Schema,
  texCoordYNeg: Vec2Schema,
  texCoordZPos: Vec2Schema,
  texCoordZNeg: Vec2Schema,
  atlasRadius: new MuUint32(),
  rotation: new MuUint8(),
  frameLeft: new MuUint8(),
  frameRight: new MuUint8(),
  frameBottom: new MuUint8(),
  frameTop: new MuUint8(),
  frameFront: new MuUint8(),
  frameBack: new MuUint8(),
});
export type UI3DTextureBoxSpec = typeof UI3DTextureBoxSchema.identity;

export const UI3DSphereSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),

  position: Vec3Schema,
  radius: new MuFloat64(1),
  color: Vec3Schema,

  onMouseChange: new MuRefSchema<UI3DMouseHandler>(),
});

export type UI3DSphereSpec = typeof UI3DSphereSchema.identity;

export const UI3DSeedSchema = new MuStruct({
  id: new MuUint32(),
  destroyed: new MuBoolean(false),
  seedId: new MuASCII(''),
  // lightmap id
  lightmapId: new MuUint32(0),
  // reference to mesh object
  glRef: <MuSchema<Renderable>>new MuRefSchema<Renderable>(),

  // model render shadow
  renderShadow: new MuBoolean(true),
  staticShadow: new MuBoolean(false),

  // model color
  model: Mat4Schema,
  // mesh tint
  color: Vec4Schema,
  position: Vec3Schema,
  scale: Vec3Schema,
  orientation: QuatSchema,
  bounds: Vec3Schema,
  metalness: new MuFloat64(),
  shininess: new MuFloat64(),
  emissive: new MuFloat64(),
  defaultMotionId: new MuASCII(),
  animationStartTick: new MuFloat64(),
  meshIsTransparent: new MuBoolean(false),
  useMotionTexture: new MuBoolean(false),
  motionMatrix: <MuSchema<MeshMotionMatrix>>new MuRefSchema<MeshMotionMatrix>(),
  onMouseChange: new MuRefSchema<UI3DMouseHandler>(),
  onMouseIn: new MuRefSchema<UI3DMouseHandler>(),
  onMouseOut: new MuRefSchema<UI3DMouseOutHandler>(),
  mouseOn: new MuBoolean(false),
});

export type UI3DSeedSpec = typeof UI3DSeedSchema.identity;

export const UI3DElementSchema = new MuUnion({
  line: UI3DLineSchema,
  directionSign: UI3DDirectionSignSchema,
  text: UI3DTextSchema,
  point: UI3DSphereSchema,
  cone: UI3DConeSchema,
  quad: UI3DQuadSchema,
  ring: UI3DRingSchema,
  box: UI3DBoxSchema,
  seed: UI3DSeedSchema,
  cursorIndicator: UI3DCursorIndicatorSchema,
  textureBox: UI3DTextureBoxSchema,
});

// an event record
export const UI3DEventSchema = new MuStruct({
  // hit distance
  hitDistance: new MuFloat64(),

  // event type
  event: new MuUnion({
    mouse: UI3DMouseEventSchema,
    mouseRing: UI3DRingMouseEventSchema,
    mouseCone: UI3DConeMouseEventSchema,
    voxel: UI3DVoxelEventSchema,
    entity: UI3DEntityEventSchema,
    contextMenu: Vec2Schema,
  }),

  // event handler
  handler: new MuRefSchema<(event: any) => boolean>(),
});

export const UI3DEventQueueSchema = new MuArray(UI3DEventSchema, Infinity);

export type UI3DEventQueue = typeof UI3DEventQueueSchema.identity;

export const UI3DStateSchema = new MuStruct({
  idCounter: new MuUint32(),

  // elements list
  elements: new MuArray(UI3DElementSchema, Infinity),

  // event handler list
  eventHandlers: new MuRefSchema<UI3DEventHandlerNode>(),

  // previous event handler list
  prevEventStack: UI3DEventQueueSchema,
});

export type UI3DElement = typeof UI3DElementSchema.identity;
