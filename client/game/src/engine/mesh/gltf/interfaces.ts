import type { mat4, quat, vec3 } from 'gl-matrix';
import type { NodesInfo } from '../parse/mesh-controller';

/**
 * GLTF文件格式，参考资料：
 * - https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#properties-reference
 * - https://github.com/KhronosGroup/glTF-Tutorials/blob/main/gltfTutorial/gltfTutorial_003_MinimalGltfFile.md
 */
export type GLTF = {
  scene: number;

  scenes: GLTFScenes;

  nodes: GLTFNodes;

  meshes: GLTFMeshes;

  buffers: GLTFBuffers;

  bufferViews: GLTFBufferViews;

  accessors: GLTFAccessors;

  materials?: GLTFMaterials;

  textures?: GLTFTextures;

  images?: GLTFImages;

  asset: GLTFAsset;
};

export type GLTFScenes = GLTFScene[];

export type GLTFScene = {
  nodes: number[];
};

export type GLTFNodes = GLTFNode[];

export type GLTFNode = {
  mesh: number;

  translation?: vec3;
  rotation?: quat;
  scale?: vec3;

  matrix?: mat4;

  /**
   * 指向别的子节点的索引
   */
  children?: number[];
};

export type GLTFMeshes = GLTFMesh[];

export type GLTFMesh = {
  primitives: GLTFMeshPrimitives;
};

export type GLTFMeshPrimitives = GLTFMeshPrimitive[];

export type GLTFMeshPrimitive = {
  attributes: GLTFMeshAttributes;
  indices?: number;
  material?: number;
};

export type GLTFMeshAttributes = {
  // see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#meshes-overview
  POSITION: number;
  NORMAL?: number;
};

export type GLTFBuffers = GLTFBuffer[];

export type GLTFBuffer = {
  /**
   * 可能是引用外部资源，也可能是base64，皆有可能
   * - 如果是GLB的话，不会有uri字段，会生成独立于GLTF的二进制数据，默认都从该数据解析
   */
  uri?: string;
  byteLength: number;
};

export type GLTFBufferViews = GLTFBufferView[];

export type GLTFBufferView = {
  buffer: number;
  byteOffset: number;
  byteLength: number;
  target: number;
  /**
   * 只有当多个accessor复用同个bufferView时，才需要使用byteStride声明
   */
  byteStride?: number;
};

export type GLTFAccessors = GLTFAccessor[];

export type GLTFAccessor = {
  bufferView: number;
  byteOffset?: number;
  componentType: AccessorComponentType;
  count: number;
  type: AccessorType;
  max?: number[];
  min?: number[];
};

export type GLTFAsset = {
  version: number;
};

/**
 * see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#accessor-data-types
 * 拓展知识：ComponentType没有5124，GLTF 规范 故意省略 了 5124 (INT)，即 gl.INT。
 */
export enum AccessorComponentType {
  Byte = 5120,
  UnsignedByte = 5121,
  Short = 5122,
  UnsignedShort = 5123,
  UnsignedInt = 5125,
  Float = 5126,
}

/**
 * ComponentType对应的字节数
 */
export const ACCESSOR_COMPONENT_TYPE_TO_BYTES: Record<
  AccessorComponentType,
  number
> = {
  [AccessorComponentType.Byte]: 1,
  [AccessorComponentType.UnsignedByte]: 1,
  [AccessorComponentType.Short]: 2,
  [AccessorComponentType.UnsignedShort]: 2,
  [AccessorComponentType.UnsignedInt]: 4,
  [AccessorComponentType.Float]: 4,
};

// see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#accessor-data-types
export enum AccessorType {
  SCALAR = 'SCALAR',
  VEC2 = 'VEC2',
  VEC3 = 'VEC3',
  VEC4 = 'VEC4',
  MAT2 = 'MAT2',
  MAT3 = 'MAT3',
  MAT4 = 'MAT4',
}
/**
 * AccessorType对应的数据元长度
 */
export const ACCESSOR_TYPE_TO_NUM: Record<AccessorType, number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

export type GLTFMaterials = GLTFMaterial[];

// see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-material
export type GLTFMaterial = {
  pbrMetallicRoughness?: {
    baseColorFactor?: [number, number, number, number];
    /**
     * 指向texture
     */
    baseColorTexture?: GLTFTextureInfo;
  };
  /**
   * see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_material_emissivetexture
   */
  emissiveTexture?: GLTFTextureInfo;
};

/**
 * see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-textureinfo
 */
export type GLTFTextureInfo = {
  index: number;
  /**
   * 一定要有，没有就当0
   * 指向的是primitive中的TEXCOORD_N，N为该数值
   * @default 0
   */
  texCoord?: number;
};

/**
 * see: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-texture
 */
export type GLTFTexture = {
  /**
   * 采样器
   * The index of the sampler used by this texture.
   * When undefined, a sampler with repeat wrapping and auto filtering SHOULD be used.
   */
  sampler?: number;
  /**
   * 指向的是图片
   * The index of the image used by this texture.
   * When undefined, an extension or other mechanism SHOULD supply an alternate texture source,
   * otherwise behavior is undefined.
   */
  source?: number;
};

export type GLTFTextures = GLTFTexture[];

export type GLTFImage = {
  uri?: string;
  /**
   * 通过bufferView定义时，必须要有
   */
  mimeType?: string;
  /**
   * bufferView和uri二选一
   * The index of the bufferView that contains the image.
   * This field MUST NOT be defined when uri is defined.
   */
  bufferView?: number;
};

export type GLTFImages = GLTFImage[];

/**
 * 解析GLTF后生成的多部件模型
 */
export type ParsedGLTFMesh = {
  lox: number;
  loy: number;
  loz: number;
  hix: number;
  hiy: number;
  hiz: number;
  textures: ImageBitmap[];
  // 这里会和体素的不同，
  meshData: Float32Array;
  uvData: Float32Array;
  // 用于索引nodesInfo的
  idxData: Uint16Array;
  // GLTF独有的
  // 相当于elements，我们自己的mesh都是固定的elements
  indicesData: Uint16Array;
  // 我们自己的mesh是塞在了positions（s0）第四位，然后做解析，这也是为什么Positions是vec4
  normalData: Float32Array;
  // 应该是各个节点的count总和
  count: number;
  nodesInfo: NodesInfo;
};
