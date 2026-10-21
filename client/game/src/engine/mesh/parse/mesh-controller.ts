import type { vec3 } from 'gl-matrix';
import { MeshTextureSchema } from '@box/mesher/schema';
import { unpackMeshData } from '@box/mesher';
import { migrateModel, ModelMetaData, modelV7 } from '@box/voxa-project';
import {
  NodesInfoSchema,
  AnimationsSchema,
  NodeInfoSchema,
} from './mesh-schema';
import { GameClientState } from '../../game-client-schema';
import {
  Vec3Schema,
  QuatSchema,
  Mat3Schema,
} from '@box/schema/utils/math-schema';
import { parseModelAnimation } from './model-animation';

type ModelData = typeof modelV7.ModelDataV7Schema.identity;
type ModelNodes = Pick<ModelData, 'nodes'>['nodes'];
type ModelTexture = Pick<ModelData, 'texture'>['texture'];
type ModelMeshes = Pick<ModelData, 'meshes'>['meshes'];

export type NodeInfo = typeof NodeInfoSchema.identity;
export type NodesInfo = typeof NodesInfoSchema.identity;

/**
 * 生成渲染所需要的数据
 */
export interface Meshes {
  /**
   * 最高点和最低点数据
   * 从voxa导出的模型中心点的偏移都会在nodesInfo的信息中做处理
   * voxa导出的模型文件最低点为0，最高点为bounds
   * 皮肤是单部件，需要输入单个部件体素坐标的最低点与最高点
   */

  /**
   * 最低点x
   */
  lox: number;
  /**
   * 最低点y
   */
  loy: number;
  /**
   * 最低点z
   */
  loz: number;
  /**
   * 最高点x
   */
  hix: number;
  /**
   * 最高点y
   */
  hiy: number;
  /**
   * 最高点z
   */
  hiz: number;
  /**
   * 贴图数据
   */
  texture: typeof MeshTextureSchema.identity;
  /**
   * 顶点数据
   * - 自产的体素模型为Uint8Array
   * - 通用模型文件（GLTF）为Float32Array
   */
  meshData: Uint8Array | Float32Array;
  /**
   * uv数据
   */
  uvData: Uint8Array | Uint16Array;
  /**
   * 法向量数据
   * - 通用模型文件（GLTF）自带该数据
   */
  normalData?: Float32Array;
  /**
   * 顶点数量
   */
  count: number;
  /**
   * 当部件为多部件时，每个顶点对应的多部件索引值
   * 选填，默认为单部件
   */
  idxData?: Uint8Array | Uint16Array;
  /**
   * 当部件为多部件时，每个部件索引值对应的信息，包含偏移信息和透明度信息
   * 选填，默认为单部件
   */
  nodesInfo?: typeof NodesInfoSchema.identity;

  /**
   * 当部件为多部件且有动画时，需要获取其动画信息
   * 选填，默认为无动画
   */
  animations?: typeof AnimationsSchema.identity;

  /**
   * 静态模型是否为透明模型。
   * 多部件时，只要有一个部件透明度不为1，即视为透明模型
   * 选填，默认为否
   */
  staticIsTransparent?: boolean;
  /**
   * 外观框中心相对锚点的距离
   */
  renderBoxOffset: [number, number, number];
}

export function parseModelNodes(
  nodes: ModelNodes,
  texture: ModelTexture,
  meshes: ModelMeshes,
): Pick<
  Meshes,
  | 'texture'
  | 'meshData'
  | 'uvData'
  | 'count'
  | 'idxData'
  | 'nodesInfo'
  | 'staticIsTransparent'
> {
  const nodesInfo: typeof NodesInfoSchema.identity = [];

  let staticIsTransparent = false;

  // 数组索引值为node的索引值
  // 数组元素为node对应的mesh索引值
  const nodeMeshIdx: number[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (nodesInfo[i]) {
      nodesInfo[i].alpha = node.alpha;
      nodesInfo[i].translate = Vec3Schema.clone(node.translation);
      nodesInfo[i].rotation = QuatSchema.clone(node.rotation);
      nodesInfo[i].scale = Vec3Schema.clone(node.scale);
      nodesInfo[i].parentScaleMat3 = Mat3Schema.clone(node.parentScaleMat3);
    } else {
      nodesInfo[i] = {
        parent: -1,
        translate: Vec3Schema.clone(node.translation),
        rotation: QuatSchema.clone(node.rotation),
        scale: Vec3Schema.clone(node.scale),
        parentScaleMat3: Mat3Schema.clone(node.parentScaleMat3),
        alpha: node.alpha,
      };
    }

    // 只要有一个部件透明度不为1，就需要整体在透明的渲染队列里渲染
    if (node.alpha !== 1 && !staticIsTransparent) {
      staticIsTransparent = true;
    }

    if (node.children) {
      node.children.forEach((childId) => {
        const newNodeInfo = NodeInfoSchema.alloc();
        newNodeInfo.parent = i;
        nodesInfo[childId] = newNodeInfo;
      });
    }

    nodeMeshIdx.push(node.mesh);
  }

  let meshData = new Uint8Array();

  const IdxDataType = nodes.length > 255 ? Uint16Array : Uint8Array;
  let idxData = new IdxDataType();

  const UvDataType = getUvDataType(texture);
  let uvData = new UvDataType();

  let count: number = 0;

  nodeMeshIdx.forEach((meshIdx, nodeIdx) => {
    if (meshIdx < 0) {
      return;
    }
    const unpackData = unpackMeshData(meshes[meshIdx], Uint8Array, UvDataType);

    const newIndexData = new IdxDataType(unpackData.meshData.length / 4);
    newIndexData.fill(nodeIdx);

    count += unpackData.count;

    meshData = addBuffer(
      meshData.buffer,
      unpackData.meshData.buffer,
      Uint8Array,
    );

    idxData = addBuffer(idxData.buffer, newIndexData.buffer, IdxDataType);

    uvData = addBuffer(uvData.buffer, unpackData.uvData.buffer, UvDataType);
  });
  return {
    texture,
    meshData,
    uvData,
    count,
    idxData,
    nodesInfo,
    staticIsTransparent,
  };
}

export function getUvDataType(texture: typeof MeshTextureSchema.identity) {
  const { width } = texture;
  const height = texture.data.length / width;
  return Math.max(width, height) > 255 ? Uint16Array : Uint8Array;
}

export function addBuffer<
  R extends Uint16Array | Uint8Array | Float32Array,
  T extends new (...param: any[]) => R,
>(originBuffer: ArrayBufferLike, newBuffer: ArrayBufferLike, TypeArray: T): R {
  const originData = new TypeArray(originBuffer);
  const newData = new TypeArray(newBuffer);
  const newArray = new TypeArray(originData.length + newData.length);
  newArray.set(originData);
  newArray.set(newData, originData.length);
  return newArray;
}

export async function retrieveModelData(
  state: GameClientState,
  modelHash: string,
  metaData: ModelMetaData,
): Promise<Meshes | undefined> {
  try {
    const value = await state.content.retrieveFromS3(metaData.dataHash);
    if (!value) {
      state.logger.error(
        `error retrieving model data from meta dataHash ${metaData.dataHash}.`,
      );
      return;
    }
    const bytes = new Uint8Array(value);
    const data = await migrateModel(bytes);
    if (!data) {
      state.logger.error(`migrate model error ${metaData.dataHash}`);
      return;
    }
    // meshes长度为0表示没有体素，不需要渲染
    if (!data.meshes.length) {
      return;
    }

    // 解析多部件数据
    const { meshData, uvData, count, idxData, nodesInfo, staticIsTransparent } =
      parseModelNodes(data.nodes, data.texture, data.meshes);

    // 解析动画数据
    const animations = data.animations.map((animation, idx) => {
      return parseModelAnimation(
        animation,
        data.nodes,
        metaData.motionList ? metaData.motionList[idx] : undefined,
      );
    });

    state.modelCache.modelSize[modelHash] = bytes.byteLength;

    const renderBoxOffset: vec3 = [0, 0, 0];

    if (metaData.renderBoxOffset) {
      Vec3Schema.assign(renderBoxOffset, metaData.renderBoxOffset);
    }

    return {
      lox: 0,
      loy: 0,
      loz: 0,
      hix: metaData.bounds[0],
      hiy: metaData.bounds[1],
      hiz: metaData.bounds[2],
      texture: data.texture,
      meshData,
      uvData,
      count,
      idxData,
      nodesInfo,
      animations,
      staticIsTransparent,
      renderBoxOffset,
    };
  } catch (err) {
    state.logger.error(
      `error request model data from meta dataHash ${metaData.dataHash}, ${err}`,
    );
    return;
  }
}
