import { NodeType } from './const';

/**
 * .vb / .vd 格式的作品数据结构
 */
export interface VbProjectData {
  /**
   * RGB色表。有4个Tab。
   */
  HEXCOLORS: (string | null)[][];
  /**
   * 材质属性，三个向量分别为金属感、（荧光度）发光、粗糙度。有4个Tab。
   */
  PBRATTRBS: (SerializedVec3 | null)[][];
  /**
   * 额外的材质属性，两个向量分别为透明度、折射率。有4个Tab。
   * 原版只在VoxelEditor渲染模式生效。会被抛弃，不用处理。
   */
  TR: SerializedVec2[][];
  /**
   * 当前使用的是色表的哪个Tab，范围[0, 3]。
   */
  CURRENTCOLORINDEX: number;
  /**
   * 经过长度行程编码压缩后的体素点数据。应按照Uint8Array解析。
   */
  ENCODEVOXELS: number[];
}

/**
 * 生成compactModel时使用的RGB格式。
 * 数值范围为[0, 255]。
 */
export interface CompactModelRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * .vb / .vd 格式的作品文件结构
 */
export interface VbFileData extends VbProjectData {
  filename: string;
}

export type SerializedVec2 = [number, number];

export type SerializedVec3 = [number, number, number];

export type SerializedQuat = [number, number, number, number];

/**
 * Voxa工程数据结构v1
 */
export interface VoxaProjectDataV1 {
  /***
   * 作品版本。
   */
  version: number;
  /**
   * 部件数据，与animator中的parts对应，有可能是组、部件、骨骼
   */
  nodes: Nodes;
  /**
   * 体素资源，被skinPartNode引用。
   */
  voxels: Voxels;
  /**
   * 全局的色表信息
   */
  palette: PaletteData;
}

export type Nodes = Record<string, Node>;

export type Node = RootNode | SkinPartNode | GroupNode;

interface BaseNodeData {
  id: string;
  /**
   * 类型
   */
  type: NodeType;
  name: string;
  parentId?: string;
  childrenIds?: string[];
}

interface NodeData extends BaseNodeData {
  /**
   * 轴心
   */
  pivot: SerializedVec3;
  /**
   * 本地坐标
   */
  position: SerializedVec3;
  /**
   * 本地的旋转
   */
  quaternion: SerializedQuat;
}

export interface RootNode extends BaseNodeData {
  type: NodeType.Root;
}

export interface GroupNode extends NodeData {
  type: NodeType.Group;
}

export interface SkinPartNode extends NodeData {
  type: NodeType.SkinPart;
  /**
   * 对应体素资源id。
   * 用于在voxels中进行查询。
   */
  voxelId?: string;
}

export type Voxels = Record<string, VoxelData>;

export interface VoxelData {
  id: string;
  /**
   * 体素点数组
   * 经过rle压缩。
   */
  encodedView: number[];
  /**
   * 本地色表，记录了体素对全局色表的索引。
   */
  localPalette: number[];
}
export interface PaletteData {
  items: PaletteItem[];
  /**
   * 颜色分组的记录对象。
   */
  groups: Record<string, PaletteGroup>;
  /**
   * 颜色分组的顺序列表。
   */
  groupList: string[];
}

export type PaletteItem = {
  id: string;
  color: PaletteColor;
  hsv: PaletteHSV;
  material: PaletteMaterial;
};

export type PaletteColor = {
  r: number;
  g: number;
  b: number;
};

export type PaletteHSV = [number, number, number];

export type PaletteMaterial = {
  emissive: number;
};

export type PaletteGroup = {
  id: string;
  name: string;
  colorIndices: number[];
};

export type Meshes = Record<string, number[]>;

export type VoxaModelV1 = {
  bounds: SerializedVec3;
  meshes: Meshes;
};

export type VoxaDataV1 = {
  project: VoxaProjectDataV1;
  model: VoxaModelV1;
};
