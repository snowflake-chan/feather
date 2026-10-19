import { greedyComputeMesh } from '@box/ao-mesher';
import { CompactModel, compactModelToVbBytes } from '@box/vb';
import { MuReadStream } from '@box/mudb/stream';
import { fillArray } from '@box/utils/fill';
import { alloc, free } from '@box/utils/pool';
import { decompress } from '@box/utils/rle-compress';
import { allocVoxels, type VoxelView } from '@box/utils/voxel';
import { vec3 } from 'gl-matrix';
import { nanoid } from 'nanoid';
import ndarray from 'ndarray';
import { NodeType } from './const';
import type {
  CompactModelRGB,
  Nodes,
  PaletteColor,
  PaletteData,
  PaletteHSV,
  PaletteItem,
  PaletteMaterial,
  RootNode,
  SerializedVec3,
  VbFileData,
  VoxaDataV1,
  VoxaModelV1,
  VoxaProjectDataV1,
  Voxels,
} from './interfaces';

/**
 * 解析.vb/.vd文件为Voxa的v1版的工程和模型数据
 * @param vbFile .vb/.vd文件
 */
export function parseVbFile(vbFile: VbFileData): VoxaDataV1 {
  const { HEXCOLORS, PBRATTRBS, CURRENTCOLORINDEX, ENCODEVOXELS } = vbFile;

  const voxelView = restoreVoxels(ENCODEVOXELS);

  const { rawMesh: rawMesh, bounds, textureIds } = bakeMesh(voxelView);

  const skinPartNodeId = nanoid();

  const model = getVoxaModel({
    skinPartNodeId,
    rawMesh,
    bounds,
    hexColorTables: HEXCOLORS,
    pbrTables: PBRATTRBS,
    currentColorIdx: CURRENTCOLORINDEX,
  });

  const project = getVoxaProject({
    voxelView,
    hexColors: HEXCOLORS[CURRENTCOLORINDEX],
    encodedVoxels: ENCODEVOXELS,
    textureIds,
  });

  return { model, project };
}

function restoreVoxels(encodedVoxels: number[]): VoxelView {
  const readStream = new MuReadStream(new Uint8Array(encodedVoxels));

  const sx = readStream.readInt32();
  const sy = readStream.readInt32();
  const sz = readStream.readInt32();

  const voxels = allocVoxels(sx, sy, sz);

  decompress(readStream, voxels);

  return voxels;
}

const VOXELS_WARP_OFFSET = 3;
/**
 * 烘焙网格数据。
 * 并根据体素点计算Bounds。
 * 查找出正在使用的颜色索引。
 */
function bakeMesh(voxels: VoxelView): {
  rawMesh: Uint8Array;
  bounds: SerializedVec3;
  textureIds: Set<number>;
} {
  const [sx, sy, sz] = voxels.shape;

  const nx = sx + VOXELS_WARP_OFFSET;
  const ny = sy + VOXELS_WARP_OFFSET;
  const nz = sz + VOXELS_WARP_OFFSET;

  const buffer = alloc(2 * nx * ny * nz);

  const voxelsWarp = ndarray(new Uint16Array(buffer), [nx, ny, nz]);
  voxelsWarp.data.fill(0);

  let isEmptyVoxels = true;

  // 记录体素的最大最小坐标，用于生成bounds
  const start: vec3 = [Infinity, Infinity, Infinity];
  const end: vec3 = [-Infinity, -Infinity, -Infinity];

  // 记录体素实际用到的颜色
  const textureIds: Set<number> = new Set();

  for (let i = 0; i < sx; i++) {
    for (let j = 0; j < sy; j++) {
      for (let k = 0; k < sz; k++) {
        const textureId = voxels.getVoxel(i, j, k);

        if (textureId === 0) {
          continue;
        }

        isEmptyVoxels = false;

        // 如果体素坐标上有值，则根据 AOMesher 的格式处理数据
        voxelsWarp.set(i + 1, j + 1, k + 1, textureId | (1 << 15));

        vec3.min(start, start, [i, j, k]);
        vec3.max(end, end, [i, j, k]);

        textureIds.add(textureId);
      }
    }
  }

  let rawMesh: Uint8Array;

  const bounds: SerializedVec3 = [0, 0, 0];

  if (isEmptyVoxels) {
    rawMesh = new Uint8Array(0);
  } else {
    rawMesh = greedyComputeMesh(voxelsWarp);
    vec3.sub(bounds, end, start);
  }

  // always free data
  free(voxelsWarp.data.buffer);

  return {
    rawMesh,
    bounds,
    textureIds,
  };
}

/**
 * 根据当前色表tab，生成RGB数组
 * @param hexColors 所有的色表
 * @param currentColorIdx 当前使用的tab序号
 */
function getCompactModelRGB(
  hexColors: VbFileData['HEXCOLORS'],
  currentColorIdx: number,
): CompactModelRGB[] {
  return hexColors[currentColorIdx].map((item) => {
    if (!item) {
      return {
        r: 0,
        g: 0,
        b: 0,
      };
    }
    const [r, g, b] = hexToRgb(item);

    return { r, g, b };
  });
}

/**
 * 根据当前材质表tab，生成材质的数组。
 * @param currentColorIdx 当前使用的tab序号
 * @param pbr 所有的材质表
 */
function getMSEList(
  currentColorIdx: number,
  pbr?: VbFileData['PBRATTRBS'],
): SerializedVec3[] | undefined {
  if (!pbr || !pbr[currentColorIdx]) {
    return;
  }

  return pbr[currentColorIdx].map((item) => {
    const [m, s, e] = item;

    return [m, s, e];
  });
}

/**
 * 解析hex字符串，生成[0, 255]的[r, g, b]值。
 */
function hexToRgb(hexStr: string): SerializedVec3 {
  const rgb: SerializedVec3 = [0, 0, 0];
  if (hexStr.length === 7 && hexStr[0] == '#') {
    rgb[0] = parseInt(hexStr.slice(1, 3), 16);
    rgb[1] = parseInt(hexStr.slice(3, 5), 16);
    rgb[2] = parseInt(hexStr.slice(5, 7), 16);
  } else if (hexStr.length === 6) {
    rgb[0] = parseInt(hexStr.slice(0, 2), 16);
    rgb[1] = parseInt(hexStr.slice(2, 4), 16);
    rgb[2] = parseInt(hexStr.slice(4, 6), 16);
  }
  return rgb;
}

/**
 * 结合网格、色表、材质表生成CompactModel
 * @param rgbList
 * @param rawMesh
 * @param mseList
 */
function rawMeshToCompactModel(
  rgbList: CompactModelRGB[],
  rawMesh: Uint8Array,
  mseList?: SerializedVec3[],
): CompactModel {
  const vertexCount = rawMesh.length / 8;
  const surfaceCount = vertexCount / 6;
  const data = new Uint8Array(alloc(surfaceCount * 6));
  fillArray(data, 0);
  let ptr = 0;
  const min = Math.min;
  const max = Math.max;
  const material: any = {};
  const normal_slice_table: any = [{}, {}, {}, {}, {}, {}];

  for (let k = 0; k < 6; k++) {
    for (let i = 0; i < surfaceCount; i++) {
      const normal_code = rawMesh[i * 48 + 5];
      if (normal_code === k) {
        let x_min = Infinity;
        let y_min = Infinity;
        let z_min = Infinity;
        let x_max = 0;
        let y_max = 0;
        let z_max = 0;
        for (let j = 0, m = 0; j < 6; j++, m += 8) {
          x_min = min(rawMesh[i * 48 + m], x_min);
          y_min = min(rawMesh[i * 48 + m + 1], y_min);
          z_min = min(rawMesh[i * 48 + m + 2], z_min);
          x_max = max(rawMesh[i * 48 + m], x_max);
          y_max = max(rawMesh[i * 48 + m + 1], y_max);
          z_max = max(rawMesh[i * 48 + m + 2], z_max);
        }
        let lo_x;
        let lo_y;
        let hi_x;
        let hi_y;
        let z;
        if (normal_code === 0 || normal_code === 1) {
          lo_x = z_min;
          lo_y = y_min;
          hi_x = z_max;
          hi_y = y_max;
          z = x_min;
        } else if (normal_code === 2 || normal_code === 3) {
          lo_x = x_min;
          lo_y = z_min;
          hi_x = x_max;
          hi_y = z_max;
          z = y_min;
        } else if (normal_code === 4 || normal_code === 5) {
          lo_x = y_min;
          lo_y = x_min;
          hi_x = y_max;
          hi_y = x_max;
          z = z_min;
        }

        if (normal_slice_table[normal_code][z] === undefined) {
          normal_slice_table[normal_code][z] = 1;
        } else {
          normal_slice_table[normal_code][z]++;
        }
        const packedAO = rawMesh[i * 48 + 6];
        const material_id = rawMesh[i * 48 + 7];
        data[ptr++] = lo_x;
        data[ptr++] = lo_y;
        data[ptr++] = hi_x;
        data[ptr++] = hi_y;
        data[ptr++] = material_id;
        data[ptr++] = packedAO;
        material[material_id] = {
          rgb: [
            rgbList[material_id].r,
            rgbList[material_id].g,
            rgbList[material_id].b,
          ],
          pbr: mseList
            ? [
                mseList[material_id][0],
                mseList[material_id][1],
                mseList[material_id][2],
              ]
            : [0, 10, 0],
        };
      }
    }
  }
  let slice_ptr = 0;
  const sliceInfo: number[] = [];
  for (let i = 0; i < 6; i++) {
    let z = Object.keys(normal_slice_table[i]).map((v) => Number(v));
    z = z.sort((a, b) => a - b);
    sliceInfo[slice_ptr++] = i;
    sliceInfo[slice_ptr++] = z.length;
    for (let j = 0; j < z.length; j++) {
      sliceInfo[slice_ptr++] = z[j];
      sliceInfo[slice_ptr++] = normal_slice_table[i][z[j]];
    }
  }

  return { data, sliceInfo, material, surfaceCount };
}

/**
 * 生成Voxa的v1版本模型数据
 */
function getVoxaModel(params: {
  skinPartNodeId: string;
  rawMesh: Uint8Array;
  bounds: SerializedVec3;
  hexColorTables: VbFileData['HEXCOLORS'];
  pbrTables: VbFileData['PBRATTRBS'];
  currentColorIdx: number;
}): VoxaModelV1 {
  const {
    rawMesh,
    bounds,
    hexColorTables,
    pbrTables,
    currentColorIdx,
    skinPartNodeId,
  } = params;

  const palette = getCompactModelRGB(hexColorTables, currentColorIdx);

  const mse = getMSEList(currentColorIdx, pbrTables);

  const compactModel = rawMeshToCompactModel(palette, rawMesh, mse);

  const mesh = Array.from(compactModelToVbBytes(compactModel));

  free(compactModel.data.buffer);

  return {
    bounds,
    meshes: {
      [skinPartNodeId]: mesh,
    },
  };
}

/**
 * 生成Voxa的v1版本的工程数据
 */
function getVoxaProject(params: {
  voxelView: VoxelView;
  textureIds: Set<number>;
  encodedVoxels: number[];
  hexColors: string[];
}): VoxaProjectDataV1 {
  const { textureIds, encodedVoxels, hexColors, voxelView } = params;

  const version = 1;

  const { palette, textureIdRecord } = getVoxaPalette({
    hexColors,
    textureIds,
  });

  const voxelId = nanoid();

  const voxels = getVoxels({
    voxelId,
    textureIds,
    encodedVoxels,
    textureIdRecord,
  });

  const nodes = getNodes({
    voxelId,
    voxelShape: voxelView.shape,
  });

  return {
    version,
    voxels,
    nodes,
    palette,
  };
}

const DEFAULT_PALETTE_GROUP_ID = 'default';

const DEFAULT_PALETTE_GROUP_NAME = 'Color';

/**
 * 本地色表与体素材质索引的差值。
 */
const LOCAL_IDX_OFFSET = 1;

/**
 * 根据.vb的色表，以及体素中实际使用的颜色索引，生成新色表。
 * 自动清理掉未被引用的颜色。
 */
function getVoxaPalette(params: {
  hexColors: string[];
  textureIds: Set<number>;
}): {
  /**
   * 新的色表结构
   */
  palette: PaletteData;
  /**
   * 旧的textureId对应新的textureId索引。
   */
  textureIdRecord: Record<number, number>;
} {
  const { textureIds, hexColors } = params;

  const items: PaletteItem[] = [];
  const itemIndices: number[] = [];

  // 在这个环节提前算出后续localPalette要使用的数据。
  const textureIdRecord: Record<number, number> = {};

  textureIds.forEach((id) => {
    const globalIdx = items.length;

    /**
     * 当前的方案：
     * 1. 直接在旧色表的基础上，过滤掉未被体素使用的颜色，作为新的本地色表。
     * 2. 全局色表仅保留有效的颜色。
     *
     * 比如旧的色表是：
     * [a, b, c, d, e]
     * 体素里实际使用的是[a, c, e]，也就是[0, 2, 4]。
     *
     * 那么新的全局色表会变成
     * [a, c, e]
     * 转换成序号就是
     * [0, 1, 2]
     *
     * localPalette会变成如下的引用关系
     * [引用a, empty, 引用c, empty, 引用e...]（长度为255，没有引用的就是empty）
     * 转换成序号就是
     * [0, -1, 1, -1, 2...]（长度为255，没有引用的就是empty，-1）
     *
     * 这样的好处是，不用再次遍历voxelView更新里面的textureId。
     *
     * 因此这里可以通过globalIdx直接算出后续localPalette要使用的序号
     */
    textureIdRecord[id] = globalIdx + LOCAL_IDX_OFFSET;

    const paletteId = nanoid();

    let color: PaletteColor = { r: 0, g: 0, b: 0 };

    const hex = hexColors[id];
    if (hex) {
      const [r, g, b] = hexToRgb(hex);

      color = { r, g, b };
    }

    const { r, g, b } = color;

    const hsv: PaletteHSV = RGBToHsv(r, g, b);

    const material: PaletteMaterial = {
      emissive: 0,
    };

    items.push({
      id: paletteId,
      color,
      hsv,
      material,
    });

    itemIndices.push(globalIdx);
  });

  const groups = {
    [DEFAULT_PALETTE_GROUP_ID]: {
      id: DEFAULT_PALETTE_GROUP_ID,
      name: DEFAULT_PALETTE_GROUP_NAME,
      colorIndices: itemIndices,
    },
  };

  const palette: PaletteData = {
    items,
    groups,
    groupList: [DEFAULT_PALETTE_GROUP_ID],
  };

  return {
    palette,
    textureIdRecord,
  };
}

const LOCAL_PALETTE_LENGTH = 255;
const EMPTY_VALUE = -1;

/**
 * 生成Voxa的体素资源
 */
function getVoxels(params: {
  voxelId: string;
  textureIds: Set<number>;
  encodedVoxels: number[];
  /**
   * 前向生成色表时，得到的新旧本地色表索引值。
   */
  textureIdRecord: Record<number, number>;
}): Voxels {
  const { textureIds, encodedVoxels, textureIdRecord, voxelId } = params;

  const voxels: Voxels = {};

  const localPalette: number[] = [];

  for (let i = 0; i < LOCAL_PALETTE_LENGTH; i++) {
    if (!textureIds.has(i + 1)) {
      localPalette.push(EMPTY_VALUE);

      continue;
    }

    localPalette.push(textureIdRecord[i + 1] - 1);
  }

  voxels[voxelId] = {
    id: voxelId,
    encodedView: encodedVoxels,
    localPalette,
  };

  return voxels;
}

const ROOT_NODE_ID = 'ROOT';
const ROOT_NODE_NAME = 'Root';

function getNodes(params: { voxelId: string; voxelShape: vec3 }): Nodes {
  const { voxelId, voxelShape } = params;

  const skinPartNodeId = nanoid();

  const rootNode: RootNode = {
    id: ROOT_NODE_ID,
    name: ROOT_NODE_NAME,
    type: NodeType.Root,
    childrenIds: [skinPartNodeId],
  };

  const pivotVec3 = vec3.create();
  vec3.scale(pivotVec3, voxelShape, -0.5);
  const [px, py, pz] = pivotVec3;

  const nodes: Nodes = {
    [ROOT_NODE_ID]: rootNode,
    [skinPartNodeId]: {
      id: skinPartNodeId,
      name: `name${skinPartNodeId}`,
      type: NodeType.SkinPart,
      parentId: ROOT_NODE_ID,
      pivot: [px, py, pz],
      position: [0, -py, 0],
      quaternion: [0, 0, 0, 1],
      voxelId,
    },
  };

  return nodes;
}

function RGBToHsv(r: number, g: number, b: number): [number, number, number] {
  r = r / 255;
  g = g / 255;
  b = b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = 0;
  let s: number;
  const v = max;

  const d = max - min;

  s = max == 0 ? 0 : d / max;
  if (max == min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

export type { VbFileData, VoxaProjectDataV1, VoxaDataV1, VoxaModelV1 };
