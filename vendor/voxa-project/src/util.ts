import {
  MuFloat32,
  MuUint16,
  MuUint8,
  MuVector,
  MuArray,
  MuASCII,
  MuSchema,
  MuStruct,
  MuUnion,
} from '@box/mudb/schema';

export const Vec3Schema = new MuVector(new MuFloat32(), 3);
export const Vec4Schema = new MuVector(new MuFloat32(), 4);
export const Uint8Vec3Schema = new MuVector(new MuUint8(), 3);
export const Uint16Vec3Schema = new MuVector(new MuUint16(), 3);
export const Mat4Schema = new MuVector(new MuFloat32(), 16);
export const Mat3Schema = new MuVector(new MuFloat32(), 9);

export const TimeAccessorSchema = new MuArray(new MuFloat32(), Infinity);
export const RotationAccessorSchema = new MuArray(Vec4Schema, Infinity);
export const TranslationAccessorSchema = new MuArray(Vec3Schema, Infinity);
export const AlphaAccessorSchema = new MuArray(new MuFloat32(), Infinity);

/**
 * 工程文件节点类型
 * 已存在属性对应的值(枚举顺序)不可修改，如需增加属性在后面添加
 */
export enum ProjectNodeType {
  Root,
  SkinPart,
  Group,
  Bone,
}

/**
 * 体素渲染的维度
 * YZ - 渲染YZ平面的2D图，不渲染X维度
 * XZ - 渲染XZ平面的2D图，不渲染Y维度
 * XY - 渲染XY平面的2D图，不渲染Z维度
 * XYZ - 正常渲染3D
 * 已存在属性对应的值(枚举顺序)不可修改，如需增加属性在后面添加
 */
export enum VoxelDimension {
  YZ,
  XZ,
  XY,
  XYZ,
}

/**
 * 物理碰撞框模式
 * 已存在属性对应的值(枚举顺序)不可修改，如需增加属性在后面添加
 */
export enum HitBoxMode {
  /**
   * 默认物理碰撞框
   */
  Default,
  /**
   * 自定义物理碰撞框
   */
  Custom,
}

/**
 * 节点变化的属性
 */
export enum ChannelNodePath {
  Rotation = 'rotation',
  Translation = 'translation',
  Alpha = 'alpha',
  Scale = 'scale',
}

/**
 * voxa定义的补帧方式枚举
 */
export enum ProjectInterpolationType {
  Step = 'STEP',
  Linear = 'LINEAR',
  EaseInSine = 'EASE_IN_SINE',
  EaseOutSine = 'EASE_OUT_SINE',
  EaseInOutSine = 'EASE_IN_OUT_SINE',
}

/**
 * 根据插值类型计算缓动数值
 * @param type 插值类型
 * @param weight 当前时间比重
 * @returns 缓动比重
 */
export function calcEasing(type: ProjectInterpolationType, weight: number) {
  switch (type) {
    case ProjectInterpolationType.EaseInSine:
      return 1 - Math.cos((weight * Math.PI) / 2);
    case ProjectInterpolationType.EaseOutSine:
      return Math.sin((weight * Math.PI) / 2);
    case ProjectInterpolationType.EaseInOutSine:
      return -(Math.cos(Math.PI * weight) - 1) / 2;
    case ProjectInterpolationType.Step:
      return weight === 1 ? 1 : 0;
    case ProjectInterpolationType.Linear:
      return weight;
    default:
      return weight;
  }
}

export function lerp(a: number, b: number, weight: number) {
  return (1 - weight) * a + weight * b;
}

/**
 * 表示动画时间节点对应的translation/rotation/alpha/scale
 */
export const OutputSchema = new MuUnion({
  rotation: RotationAccessorSchema,
  translation: TranslationAccessorSchema,
  alpha: AlphaAccessorSchema,
  scale: TranslationAccessorSchema,
});

export const SamplerSchema = new MuStruct({
  /**
   * 表示动画的时间节点
   * 对应gltf指向accessor索引值
   */
  input: TimeAccessorSchema,
  /**
   * 表示动画时间节点对应的translation/rotation/alpha
   * 对应gltf指向accessor的索引值
   */
  output: OutputSchema,
  /**
   * 补帧方式
   */
  interpolation: <MuSchema<ProjectInterpolationType>>(
    new MuASCII(ProjectInterpolationType.Linear)
  ),
});
