import {
  MuStruct,
  MuBoolean,
  MuInt32,
  MuDictionary,
  MuArray,
  MuSchema,
  MuUTF8,
  MuFloat32,
  MuASCII,
} from '@box/mudb/schema';
import {
  Mat3Schema,
  Mat4Schema,
  QuatSchema,
  Vec3Schema,
} from '@box/schema/utils/math-schema';
import { ProjectInterpolationType } from '@box/voxa-project';

export enum RenderableType {
  GLMesh,
  GLTexture,
  GPUMesh,
  GPUModelTexture,
}

export const NodeInfoSchema = new MuStruct({
  /**
   * 父节点索引值
   */
  parent: new MuInt32(-1),
  translate: Vec3Schema,
  rotation: QuatSchema,
  scale: Vec3Schema,
  parentScaleMat3: Mat3Schema,
  alpha: new MuFloat32(1),
});

export const NodesInfoSchema = new MuArray(NodeInfoSchema, Infinity);

export const NodeTransformSchema = new MuStruct({
  translate: Vec3Schema,
  rotation: QuatSchema,
  scale: Vec3Schema,
  alpha: new MuFloat32(1),
});

export const KeyframeSchema = new MuStruct({
  /**
   * 关键帧时间，单位是秒
   */
  time: new MuFloat32(),
  /**
   * 补帧方式，意义和计算方式见voxa-project
   */
  interpolation: <MuSchema<ProjectInterpolationType>>(
    new MuASCII(ProjectInterpolationType.Linear)
  ),
  translate: Vec3Schema,
  rotation: QuatSchema,
  scale: Vec3Schema,
  alpha: new MuFloat32(1),
});

export const NodeKeyframes = new MuArray(KeyframeSchema, Infinity);

export const AnimationSchema = new MuStruct({
  /**
   * 动画ID
   */
  id: new MuASCII(),
  /**
   * 动画名字
   */
  name: new MuUTF8(),
  /**
   * 动画持续时间
   */
  duration: new MuFloat32(),
  /**
   * 动画是否含有透明部件
   * 决定在当前动画下，实体在透明/非透明的队列渲染
   */
  isTransparent: new MuBoolean(false),
  /**
   * 节点的关键帧数据
   * key是节点索引值，value是关键帧数据
   */
  nodes: new MuDictionary(NodeKeyframes, Infinity),
});

export type Animation = typeof AnimationSchema.identity;

export const AnimationsSchema = new MuArray(AnimationSchema, Infinity);

export const NodesMatrixSchema = new MuArray(Mat4Schema, Infinity);
