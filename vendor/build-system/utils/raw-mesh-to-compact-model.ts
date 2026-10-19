import { alloc } from '@box/utils/pool';
import { fillArray } from '@box/utils/fill';
import { CompactModel } from '@box/schema/mesh/modelMeshSchema';

export interface PaletteEntry {
  r: number;
  g: number;
  b: number;
}

export function rawMeshToCompactModel(
  rawMesh: Uint8Array,
  palette: PaletteEntry[],
  MSE?: number[][],
) {
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
            palette[material_id].r,
            palette[material_id].g,
            palette[material_id].b,
          ],
          pbr: MSE
            ? [MSE[material_id][0], MSE[material_id][1], MSE[material_id][2]]
            : [0, 10, 0],
        };
      }
    }
  }
  let slice_ptr = 0;
  const slice_info: number[] = [];
  for (let i = 0; i < 6; i++) {
    let z = Object.keys(normal_slice_table[i]).map((v) => Number(v));
    z = z.sort((a, b) => a - b);
    slice_info[slice_ptr++] = i;
    slice_info[slice_ptr++] = z.length;
    for (let j = 0; j < z.length; j++) {
      slice_info[slice_ptr++] = z[j];
      slice_info[slice_ptr++] = normal_slice_table[i][z[j]];
    }
  }

  return new CompactModel(data, slice_info, material, surfaceCount);
}
