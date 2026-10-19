import { voxelsToMeshes } from '@box/mesher';
import { bytesToCompactModel, CompactModel } from '@box/vb';
import { VoxelView } from '@box/utils/voxel';
import type { ModelDataV2 } from '../schema-v2';
import type { ModelDataV3 } from '../schema-v3';
import { ModelDataV3Schema } from '../schema-v3';

export const migrateV2 = async (data: ModelDataV2): Promise<ModelDataV3> => {
  const v3 = ModelDataV3Schema.clone(ModelDataV3Schema.identity);
  v3.bounds = data.bounds;
  v3.nodes = data.nodes;

  // meshes长度为0就不需要后面的计算
  if (!data.meshes.length) {
    return v3;
  }

  const palette: [number, number, number][] = [];
  const emissivePalette: number[] = [];
  const voxelViews: VoxelView[] = [];
  data.meshes.forEach((mesh, index) =>
    parseMesh({ palette, emissivePalette, voxelViews }, mesh, index),
  );

  // 填充无用色的值
  for (let i = 0; i < palette.length; i++) {
    if (palette[i]) {
      continue;
    }
    palette[i] = [0, 0, 0];
  }

  // 填充无用发光的值
  for (let i = 0; i < emissivePalette.length; i++) {
    if (emissivePalette[i]) {
      continue;
    }
    emissivePalette[i] = 0;
  }

  const { meshes, texture } = await voxelsToMeshes(
    voxelViews,
    palette,
    emissivePalette,
  );

  v3.texture = texture;
  v3.meshes = meshes;

  return v3;
};

function parseMesh(
  out: {
    palette: [number, number, number][];
    emissivePalette: number[];
    voxelViews: VoxelView[];
  },
  mesh: number[],
  meshIndex: number,
) {
  const { palette, emissivePalette, voxelViews } = out;

  const compactModel = bytesToCompactModel(new Uint8Array(mesh));
  if (!compactModel) {
    voxelViews[meshIndex] = getEmptyVoxelView();
    return;
  }

  for (const index in compactModel.material) {
    const { rgb, pbr } = compactModel.material[index];
    const [r, g, b] = rgb;
    palette[index] = [r, g, b];
    emissivePalette[index] = pbr[2];
  }

  const voxelView = compactModelToVoxelView(compactModel);
  voxelViews[meshIndex] = voxelView || getEmptyVoxelView();
}

function compactModelToVoxelView(compactModel: CompactModel) {
  let quadPtr = 0;
  let slicePtr = 0;
  const begin = [0, 0, 0];
  const end = [0, 0, 0];

  // 计算体素最高点坐标，用于还原voxelView的shape
  /**
   * 体素最高点坐标X的值
   */
  let maxX = -Infinity;
  /**
   * 体素最高点坐标Y的值
   */
  let maxY = -Infinity;
  /**
   * 体素最高点坐标Z的值
   */
  let maxZ = -Infinity;

  /**
   * 用于记录遍历循环时候计算出的begin，end以及idx的值
   * 每7个数一组
   * 前三位为 begin[0], begin[1], begin[2]
   * 后三位为 end[0], end[1], end[2]
   * 最后一位为idx
   *
   * 循环结束后在最后通过rects中记录的值还原voxelView
   */
  const rects: number[] = [];

  while (slicePtr < compactModel.sliceInfo.length) {
    const normalCode = compactModel.sliceInfo[slicePtr++];
    const normalCodeCount = compactModel.sliceInfo[slicePtr++];

    for (let j = 0; j < normalCodeCount; j++) {
      const z = compactModel.sliceInfo[slicePtr++];
      const zCount = compactModel.sliceInfo[slicePtr++];

      for (let k = 0; k < zCount; k++, quadPtr++) {
        const x0 = compactModel.data[quadPtr * 6];
        const y0 = compactModel.data[quadPtr * 6 + 1];
        const x1 = compactModel.data[quadPtr * 6 + 2];
        const y1 = compactModel.data[quadPtr * 6 + 3];
        const idx = compactModel.data[quadPtr * 6 + 4];

        let u: number;
        let v: number;
        let d: number;
        if (normalCode === 0 || normalCode === 1) {
          u = 2;
          v = 1;
          d = 0;
        } else if (normalCode === 2 || normalCode === 3) {
          u = 0;
          v = 2;
          d = 1;
        } else if (normalCode === 4 || normalCode === 5) {
          u = 1;
          v = 0;
          d = 2;
        } else {
          return;
        }

        begin[u] = x0;
        begin[v] = y0;
        begin[d] = z - (normalCode & 1);
        end[u] = x1 - 1;
        end[v] = y1 - 1;
        end[d] = z - (normalCode & 1);

        rects.push(...begin, ...end, idx);

        maxX = Math.max(maxX, end[0]);
        maxY = Math.max(maxY, end[1]);
        maxZ = Math.max(maxZ, end[2]);
      }
    }
  }

  const shape: [number, number, number] = [maxX + 1, maxY + 1, maxZ + 1];
  const [nx, ny, nz] = shape;
  const stride: [number, number, number] = [1, nx, nx * ny];
  const voxel = new Uint16Array(nx * ny * nz);

  for (let i = 0; i < rects.length; i += 7) {
    for (let x = rects[i + 0]; x <= rects[i + 3]; x++) {
      for (let y = rects[i + 1]; y <= rects[i + 4]; y++) {
        for (let zz = rects[i + 2]; zz <= rects[i + 5]; zz++) {
          const ptr = x * stride[0] + y * stride[1] + zz * stride[2];
          voxel[ptr] = rects[i + 6];
        }
      }
    }
  }

  return new VoxelView(voxel, shape, stride, 0);
}

function getEmptyVoxelView() {
  return new VoxelView(new Uint16Array(), [0, 0, 0], [0, 0, 0], 0);
}
