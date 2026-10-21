import { vec3 } from 'gl-matrix';
import { UI3DVoxelEvent } from 'src/engine/ui3d/ui3d-schema';

export function getSquareVoxelList(
  hit: UI3DVoxelEvent,
  size: number,
  isAdd: boolean,
): vec3[] {
  const { voxelPosition, hitNormal, worldPosition } = hit;
  const voxelList: vec3[] = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const position = vec3.create();
      if (hitNormal[0]) {
        position[0] = isAdd
          ? voxelPosition[0] + hitNormal[0]
          : voxelPosition[0];
        position[1] = Math.round(worldPosition[1] - size / 2 + i);
        position[2] = Math.round(worldPosition[2] - size / 2 + j);
      } else if (hitNormal[1]) {
        position[0] = Math.round(worldPosition[0] - size / 2 + i);
        position[1] = isAdd
          ? voxelPosition[1] + hitNormal[1]
          : voxelPosition[1];
        position[2] = Math.round(worldPosition[2] - size / 2 + j);
      } else if (hitNormal[2]) {
        position[0] = Math.round(worldPosition[0] - size / 2 + j);
        position[1] = Math.round(worldPosition[1] - size / 2 + i);
        position[2] = isAdd
          ? voxelPosition[2] + hitNormal[2]
          : voxelPosition[2];
      }

      voxelList.push(position);
    }
  }
  return voxelList;
}

export function getColumnVoxelList(
  hit: UI3DVoxelEvent,
  lenght: number,
): vec3[] {
  const { voxelPosition, hitNormal, worldPosition } = hit;
  const voxelList: vec3[] = [];
  for (let i = 1; i <= lenght; i++) {
    const position = vec3.create();
    if (hitNormal[0] !== 0) {
      position[0] = voxelPosition[0] + hitNormal[0] * i;
      position[1] = voxelPosition[1];
      position[2] = voxelPosition[2];
    } else if (hitNormal[1] !== 0) {
      position[0] = voxelPosition[0];
      position[1] = voxelPosition[1] + hitNormal[1] * i;
      position[2] = voxelPosition[2];
    } else if (hitNormal[2] !== 0) {
      position[0] = voxelPosition[0];
      position[1] = voxelPosition[1];
      position[2] = voxelPosition[2] + hitNormal[2] * i;
    }

    voxelList.push(position);
  }
  return voxelList;
}

export function getColumnVoxelCenter(
  hit: UI3DVoxelEvent,
  length: number,
): vec3 {
  return vec3.fromValues(
    hit.voxelPosition[0] +
      hit.hitNormal[0] * (length / 2) +
      hit.hitNormal[0] * 0.5,
    hit.voxelPosition[1] +
      hit.hitNormal[1] * (length / 2) +
      hit.hitNormal[1] * 0.5,
    hit.voxelPosition[2] +
      hit.hitNormal[2] * (length / 2) +
      hit.hitNormal[2] * 0.5,
  );
}
/**
 *
 * @param hit 点击事件
 * @param size 画笔大小
 * @param out 输出的矢量坐标
 * @returns
 */
export function getSquareVoxelCenter(
  hit: UI3DVoxelEvent,
  size: number,
  out?: vec3,
): vec3 {
  if (size % 2) {
    if (out !== undefined) {
      out[0] = hit.voxelPosition[0];
      out[1] = hit.voxelPosition[1];
      out[2] = hit.voxelPosition[2];
      return out;
    } else {
      return vec3.fromValues(
        hit.voxelPosition[0],
        hit.voxelPosition[1],
        hit.voxelPosition[2],
      );
    }
  }
  let x = hit.voxelPosition[0];
  let y = hit.voxelPosition[1];
  let z = hit.voxelPosition[2];

  if (hit.hitNormal[0]) {
    y += hit.worldPosition[1] % 1 > 0.5 ? 0.5 : -0.5;
    z += hit.worldPosition[2] % 1 > 0.5 ? 0.5 : -0.5;
  } else if (hit.hitNormal[1]) {
    x += hit.worldPosition[0] % 1 > 0.5 ? 0.5 : -0.5;
    z += hit.worldPosition[2] % 1 > 0.5 ? 0.5 : -0.5;
  } else if (hit.hitNormal[2]) {
    x += hit.worldPosition[0] % 1 > 0.5 ? 0.5 : -0.5;
    y += hit.worldPosition[1] % 1 > 0.5 ? 0.5 : -0.5;
  }

  if (out !== undefined) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  } else {
    return vec3.fromValues(x, y, z);
  }
}
