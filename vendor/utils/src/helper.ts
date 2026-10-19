import { VoxelView, allocVoxels, BoxBoundary } from './voxel';
import { vec2, vec3 } from 'gl-matrix';

type GetMaterial = number | ((i: number, j: number, k: number) => number);

type OnCondition = (i: number, j: number, k: number) => boolean;

/**
 * 立方体的数据
 */
export interface TempGeometry {
  lo: vec3;
  hi: vec3;
  /**
   * 所有面的顶点的坐标，一共24个，有重复
   */
  positions: vec3[];
  /**
   * 构成所有面的三角形顶点坐标
   */
  elements: vec3[];
  /**
   * 所有面的法向量
   */
  normals: vec3[];
}

export enum WorkAction {
  bakeAoData,
  // generateTerrainData,
  syncVoxel,
  updateVoxel,
  sendPoints,
  clearData,
  changeSize,
}

export enum Actions {
  Attach,
  Erase,
  Paint,
  Select,
  Translate,
  ColorSelect,
  PickColor,
  HollowOut,
  FillSameColorSpace,
  Extrude,
}

export enum EditingMode {
  line,
  center,
  box,
  voxel,
  face,
  rect,
}

export enum colorSelectOptions {
  volume,
  face,
  all,
}

export enum CenterModeOption {
  square,
  circle,
}

export enum FaceModeColorOption {
  voxelColor,
  currentColor,
}

export enum FaceModeSelectOption {
  geometry,
  colorGeometry,
}

/**
 * 取两点在范围内生成立方体
 * @param a
 * @param b
 * @param isVoxle 是否在计算体素，由于每个点都被扩充为体素，end都需要+1
 * @param outerNormal 严重怀疑这里写反了，true时反而拿到的是朝内的法向量
 * @param range
 * @deprecated
 * @returns
 */
export function generateCuboid(
  a: vec3,
  b: vec3,
  isVoxle: boolean,
  outerNormal: boolean,
  range?: vec3 | boolean,
): TempGeometry {
  const { start, end } = boundary(
    a,
    b,
    [-Infinity, -Infinity, -Infinity],
    [Infinity, Infinity, Infinity],
  );
  /**
   * 立方体的6个面的顶点，6*4=24个，有重合
   */
  const positions: vec3[] = [];
  /**
   * 构成立方体的三角形，用于渲染
   */
  const elements: vec3[] = [];
  /**
   * 6个面的法向量，用来确定顶点顺序
   */
  const normals: vec3[] = [];
  const nSign = outerNormal ? -1 : 1;
  if (isVoxle) {
    for (let i = 0; i < 3; i++) {
      if (range) {
        end[i] = Math.min(end[i] + 1, range[i]);
      } else {
        end[i] = end[i] + 1;
      }
    }
  }

  positions.push([start[0], start[1], start[2]]);
  positions.push([start[0], start[1], end[2]]);
  positions.push([end[0], start[1], end[2]]);
  positions.push([end[0], start[1], start[2]]);

  positions.push([start[0], end[1], start[2]]);
  positions.push([end[0], end[1], start[2]]);
  positions.push([end[0], end[1], end[2]]);
  positions.push([start[0], end[1], end[2]]);

  positions.push([end[0], start[1], start[2]]);
  positions.push([end[0], start[1], end[2]]);
  positions.push([end[0], end[1], end[2]]);
  positions.push([end[0], end[1], start[2]]);

  positions.push([start[0], start[1], start[2]]);
  positions.push([start[0], end[1], start[2]]);
  positions.push([start[0], end[1], end[2]]);
  positions.push([start[0], start[1], end[2]]);

  positions.push([start[0], start[1], start[2]]);
  positions.push([end[0], start[1], start[2]]);
  positions.push([end[0], end[1], start[2]]);
  positions.push([start[0], end[1], start[2]]);

  positions.push([start[0], start[1], end[2]]);
  positions.push([start[0], end[1], end[2]]);
  positions.push([end[0], end[1], end[2]]);
  positions.push([end[0], start[1], end[2]]);

  for (let i = 0; i < 4; i++) {
    normals.push([0, 1 * nSign, 0]);
  }
  for (let i = 0; i < 4; i++) {
    normals.push([0, -1 * nSign, 0]);
  }
  for (let i = 0; i < 4; i++) {
    normals.push([-1 * nSign, 0, 0]);
  }
  for (let i = 0; i < 4; i++) {
    normals.push([1 * nSign, 0, 0]);
  }
  for (let i = 0; i < 4; i++) {
    normals.push([0, 0, 1 * nSign]);
  }
  for (let i = 0; i < 4; i++) {
    normals.push([0, 0, -1 * nSign]);
  }

  const surfaceIndex = [0, 4, 8, 12, 16, 20];
  for (let i = 0; i < surfaceIndex.length; i++) {
    if (nSign == -1) {
      elements.push([
        surfaceIndex[i] + 2,
        surfaceIndex[i] + 1,
        surfaceIndex[i],
      ]);
      elements.push([
        surfaceIndex[i],
        surfaceIndex[i] + 3,
        surfaceIndex[i] + 2,
      ]);
    } else {
      elements.push([
        surfaceIndex[i],
        surfaceIndex[i] + 1,
        surfaceIndex[i] + 2,
      ]);
      elements.push([
        surfaceIndex[i] + 2,
        surfaceIndex[i] + 3,
        surfaceIndex[i],
      ]);
    }
  }
  return {
    lo: [start[0], start[1], start[2]],
    hi: [end[0], end[1], end[2]],
    positions,
    elements,
    normals,
  };
}

/**
 * 取两点，在限制大小内，生成立方体
 * @param a
 * @param b
 * @param minima
 * @param maxima
 * @returns 返回立方体的对角顶点坐标
 */
export function boundary(
  a: vec3,
  b: vec3,
  minima: vec3,
  maxima: vec3,
): BoxBoundary {
  const start = vec3.create();
  const end = vec3.create();

  vec3.max(start, vec3.min(start, a, b), minima);
  vec3.min(end, vec3.max(end, a, b), maxima);

  return {
    start,
    end,
  };
}

export function surfaceScale(normal: vec3, surface: vec3[], scale: number) {
  const min = Math.min;
  const offset = [surface[0][0], surface[0][1], surface[0][2]];
  for (let i = 1; i < surface.length; i++) {
    offset[0] = min(offset[0], surface[i][0]);
    offset[1] = min(offset[1], surface[i][1]);
    offset[2] = min(offset[2], surface[i][2]);
  }
  const out: vec3[] = [];
  for (let i = 0; i < surface.length; i++) {
    const pos: vec3 = [0, 0, 0];
    if (normal[0] == 0) {
      pos[0] = (surface[i][0] - offset[0]) * scale - scale / 2;
    } else if (normal[0] != 0) {
      pos[0] = surface[0][0];
    }

    if (normal[1] == 0) {
      pos[1] = (surface[i][1] - offset[1]) * scale - scale / 2;
    } else if (normal[1] != 0) {
      pos[1] = surface[0][1];
    }

    if (normal[2] == 0) {
      pos[2] = (surface[i][2] - offset[2]) * scale - scale / 2;
    } else if (normal[2] != 0) {
      pos[2] = surface[0][2];
    }

    out.push(pos);
  }
  return out;
}

// function v2h(value: string) {
//   value = parseInt(value).toString(16);
//   return value.length < 2 ? '0' + value : value;
// }

// function rgb2hex(rgb: string[]) {
//   // return v2h( rgb[ 0 ] * 255 ) + v2h( rgb[ 1 ] * 255 ) + v2h( rgb[ 2 ] * 255 );
//   return v2h(rgb[0]) + v2h(rgb[1]) + v2h(rgb[2]);
// }

export function hex2rgb(hex: string): number[] {
  if (hex[0] == '#') {
    hex = hex.substr(1);
  }

  return [
    parseInt(hex.substr(0, 2), 16),
    parseInt(hex.substr(2, 2), 16),
    parseInt(hex.substr(4, 2), 16),
  ];
}

export function absMod(n: number, mod: number) {
  if (n < 0) {
    n = Math.ceil(Math.abs(n / mod)) * mod + n;
  } else {
    n %= mod;
  }
  return n;
}

/**
 * 对模型指定区域内的体素进行遍历，并应用指定操作
 * @param voxel 要遍历的模型
 * @param start 遍历起点
 * @param end 遍历终点
 * @param operation 应用在所遍历的每个体素上的操作
 */
export function traverseVoxels(
  voxel: VoxelView,
  start: vec3 | vec3,
  end: vec3 | vec3,
  operation: (
    i: number,
    j: number,
    k: number,
    data: number,
    ptr: number,
  ) => void,
) {
  const {
    data,
    // shape: [nx, ny, nz],
    stride: [sx, sy, sz],
    offset,
  } = voxel;

  const l = end[0] - start[0] + 1;
  const h = end[1] - start[1] + 1;
  // const w = end[2] - start[2] + 1;

  const stepi = sx;
  const stepj = sy - sx * l;
  const stepk = sz - sy * h;
  let ptr = sx * start[0] + sy * start[1] + sz * start[2] + offset;
  for (let k = start[2]; k <= end[2]; ++k) {
    for (let j = start[1]; j <= end[1]; ++j) {
      for (let i = start[0]; i <= end[0]; ++i) {
        operation(i, j, k, data[ptr], ptr);
        ptr += stepi;
      }
      ptr += stepj;
    }
    ptr += stepk;
  }
}

/**
 * 判断某个坐标是否在指定范围内
 * @param position 坐标
 * @param minimum 最小值
 * @param maximum 最大值
 * @returns boolean
 */
export function inRange(position: vec3, minimum: vec3, maximum: vec3) {
  const [x, y, z] = position;
  const [minX, minY, minZ] = minimum;
  const [maxX, maxY, maxZ] = maximum;

  return (
    x >= minX && y >= minY && z >= minZ && x <= maxX && y <= maxY && z <= maxZ
  );
}

export function adjacentVoxels(
  src: VoxelView,
  out: VoxelView,
  currentPos: vec3,
  value: number,
  currentMaterial: number,
  axis: vec3,
  start: vec3,
  end: vec3,
  normal?: vec3,
) {
  const queue: vec3[] = [];
  queue.push(currentPos);
  const maximum: vec3 = [src.shape[0] - 1, src.shape[1] - 1, src.shape[2] - 1];
  while (queue.length) {
    const [x, y, z] = queue.pop()!;
    if (!inRange([x, y, z], [0, 0, 0], maximum)) {
      continue;
    }
    // 如果是被挡住的 voxel，不属于被选中的范围
    if (
      normal &&
      inRange([x + normal[0], y + normal[1], z + normal[2]], [0, 0, 0], maximum)
    ) {
      if (src.getVoxel(x + normal[0], y + normal[1], z + normal[2]) !== 0) {
        continue;
      }
    }
    // 如果 value 为 -1, 则不关心颜色是否一样，只关心是否在一个连续的平面上
    if (value === -1) {
      const index = out.index(x, y, z);
      if (out.data[index] != 0) {
        continue;
      }
      if (src.data[index] !== 0) {
        out.data[index] = src.data[index];
      } else {
        continue;
      }
    } else if (value === 0) {
      if (out.getVoxel(x, y, z) === currentMaterial) {
        continue;
      }
      if (src.getVoxel(x, y, z) === 0) {
        out.setVoxel(x, y, z, currentMaterial);
        src.setVoxel(x, y, z, currentMaterial);
      } else {
        continue;
      }
    } else {
      if (out.getVoxel(x, y, z) === value) {
        continue;
      }
      if (src.getVoxel(x, y, z) === value) {
        out.setVoxel(x, y, z, value);
      } else {
        continue;
      }
    }
    vec3.min(start, start, [x, y, z]);
    vec3.max(end, end, [x, y, z]);
    if (axis[0] != 0) {
      (queue as any).push([x + 1, y, z]);
      (queue as any).push([x - 1, y, z]);
    }
    if (axis[1] != 0) {
      (queue as any).push([x, y + 1, z]);
      (queue as any).push([x, y - 1, z]);
    }
    if (axis[2] != 0) {
      (queue as any).push([x, y, z + 1]);
      (queue as any).push([x, y, z - 1]);
    }
  }
}

export function drawVoxelSphere(
  voxels: VoxelView,
  center: vec3 | vec3,
  radius: number,
) {
  for (let i = 0; i < radius; i++) {
    for (let j = 0; j < radius; j++) {
      for (let k = 0; k < radius; k++) {
        if (i * i + j * j + k * k < radius * radius) {
          voxels.setVoxel(center[0] + i, center[1] + j, center[2] + k, 1);
          voxels.setVoxel(center[0] - i, center[1] + j, center[2] + k, 1);
          voxels.setVoxel(center[0] + i, center[1] - j, center[2] + k, 1);
          voxels.setVoxel(center[0] + i, center[1] + j, center[2] - k, 1);

          voxels.setVoxel(center[0] - i, center[1] - j, center[2] + k, 1);
          voxels.setVoxel(center[0] - i, center[1] - j, center[2] - k, 1);
          voxels.setVoxel(center[0] + i, center[1] - j, center[2] - k, 1);
          voxels.setVoxel(center[0] - i, center[1] + j, center[2] - k, 1);
        }
      }
    }
  }
}

export function drawVoxelCircle(
  voxels: VoxelView,
  color: number,
  center: vec3 | vec3,
  radius: number,
  N_axis: string | vec3 | vec3,
  visitor: (x: number, y: number, z: number) => void,
) {
  let a = 0;
  let b = radius;
  let p = 5 / 4 - radius;
  if (typeof N_axis !== 'string') {
    if (N_axis[0] != 0) {
      N_axis = 'x';
    } else if (N_axis[1] != 0) {
      N_axis = 'y';
    } else if (N_axis[2] != 0) {
      N_axis = 'z';
    }
  }
  while (a <= b) {
    if (p < 0) {
      p = p + 2 * a + 3;
      a++;
    } else {
      p = p + 2 * (a - b) + 5;
      b--;
      a++;
    }
    if (N_axis === 'z') {
      for (let i = center[0] - a; i <= center[0] + a; i++) {
        visitor(i, center[1] + b, center[2]);
        visitor(i, center[1] - b, center[2]);
      }
      for (let i = center[0] - b; i <= center[0] + b; i++) {
        visitor(i, center[1] + a, center[2]);
        visitor(i, center[1] - a, center[2]);
      }
      for (let i = center[0] - radius; i <= center[0] + radius; i++) {
        if (i != center[0]) {
          visitor(i, center[1], center[2]);
        }
      }
    } else if (N_axis === 'y') {
      for (let i = center[2] - a; i <= center[2] + a; i++) {
        visitor(center[0] + b, center[1], i);
        visitor(center[0] - b, center[1], i);
      }
      for (let i = center[2] - b; i <= center[2] + b; i++) {
        visitor(center[0] + a, center[1], i);
        visitor(center[0] - a, center[1], i);
      }
      for (let i = center[2] - radius; i <= center[2] + radius; i++) {
        if (i != center[2]) {
          visitor(center[0], center[1], i);
        }
      }
    } else if (N_axis === 'x') {
      for (let i = center[2] - a; i <= center[2] + a; i++) {
        visitor(center[0], center[1] + b, i);
        visitor(center[0], center[1] - b, i);
      }
      for (let i = center[2] - b; i <= center[2] + b; i++) {
        visitor(center[0], center[1] + a, i);
        visitor(center[0], center[1] - a, i);
      }
      for (let i = center[2] - radius; i <= center[2] + radius; i++) {
        if (i != center[2]) {
          visitor(center[0], center[1], i);
        }
      }
    }
  }
}

export function drawVoxelSquare(
  voxels: VoxelView,
  color: number,
  center: vec3 | vec3,
  halfEdgeLen: number,
  N_axis: string | vec3 | vec3,
  force = false,
) {
  if (typeof N_axis !== 'string') {
    if (N_axis[0] != 0) {
      N_axis = 'x';
    } else if (N_axis[1] != 0) {
      N_axis = 'y';
    } else if (N_axis[2] != 0) {
      N_axis = 'z';
    }
  }
  if (N_axis === 'z') {
    for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
      for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
        if (i != center[0] || j != center[1]) {
          const idx = voxels.index(i, j, center[2]);
          if (idx > -1) {
            voxels.data[idx] = force ? color : voxels.data[idx] || color;
          }
        }
      }
    }
  } else if (N_axis === 'y') {
    for (let i = center[0] - halfEdgeLen; i <= center[0] + halfEdgeLen; i++) {
      for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
        if (i != center[0] || k != center[2]) {
          const idx = voxels.index(i, center[1], k);
          if (idx > -1) {
            voxels.data[idx] = force ? color : voxels.data[idx] || color;
          }
        }
      }
    }
  } else if (N_axis === 'x') {
    for (let j = center[1] - halfEdgeLen; j <= center[1] + halfEdgeLen; j++) {
      for (let k = center[2] - halfEdgeLen; k <= center[2] + halfEdgeLen; k++) {
        if (j != center[1] || k != center[2]) {
          const idx = voxels.index(center[0], j, k);
          if (idx > -1) {
            voxels.data[idx] = force ? color : voxels.data[idx] || color;
          }
        }
      }
    }
  }
}

export function calcRadius(N_axis: vec3, center: vec3, pos: vec3) {
  if (N_axis[0] != 0) {
    const _dy = pos[1] - center[1];
    const _dz = pos[2] - center[2];
    return Math.round(Math.pow(_dy * _dy + _dz * _dz, 0.5));
  } else if (N_axis[1] != 0) {
    const _dx = pos[0] - center[0];
    const _dz = pos[2] - center[2];
    return Math.round(Math.pow(_dx * _dx + _dz * _dz, 0.5));
  } else if (N_axis[2] != 0) {
    const _dx = pos[0] - center[0];
    const _dy = pos[1] - center[1];
    return Math.round(Math.pow(_dx * _dx + _dy * _dy, 0.5));
  }
  return 0;
}

export function calcHalfEdgeLen(N_axis: vec3, center: vec3, pos: vec3) {
  if (N_axis[0] != 0) {
    const _dy = Math.abs(pos[1] - center[1]);
    const _dz = Math.abs(pos[2] - center[2]);
    return Math.max(_dy, _dz);
  } else if (N_axis[1] != 0) {
    const _dx = Math.abs(pos[0] - center[0]);
    const _dz = Math.abs(pos[2] - center[2]);
    return Math.max(_dx, _dz);
  } else if (N_axis[2] != 0) {
    const _dx = Math.abs(pos[0] - center[0]);
    const _dy = Math.abs(pos[1] - center[1]);
    return Math.max(_dx, _dy);
  }
  return 0;
}

export function drawVoxelLine(
  startP: vec3 | vec3,
  endP: vec3 | vec3,
  visitor: (x: number, y: number, z: number) => void,
) {
  const minX = Math.min(startP[0], endP[0]);
  const minY = Math.min(startP[1], endP[1]);
  const minZ = Math.min(startP[2], endP[2]);
  const maxX = Math.max(startP[0], endP[0]);
  const maxY = Math.max(startP[1], endP[1]);
  const maxZ = Math.max(startP[2], endP[2]);

  let dx = +(endP[0] - startP[0]);
  let dy = +(endP[1] - startP[1]);
  let dz = +(endP[2] - startP[2]);

  const s = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

  dx = dx / s;
  dy = dy / s;
  dz = dz / s;

  const txDelta = Math.abs(1 / dx);
  const tyDelta = Math.abs(1 / dy);
  const tzDelta = Math.abs(1 / dz);

  let txMax = txDelta < Infinity ? Math.abs(dx) + 1 : Infinity;
  let tyMax = tyDelta < Infinity ? Math.abs(dy) + 1 : Infinity;
  let tzMax = tzDelta < Infinity ? Math.abs(dz) + 1 : Infinity;

  const stepx = dx < 0 ? -1 : dx > 0 ? 1 : 0;
  const stepy = dy < 0 ? -1 : dy > 0 ? 1 : 0;
  const stepz = dz < 0 ? -1 : dz > 0 ? 1 : 0;
  let [x, y, z] = startP;

  while (true) {
    visitor(x, y, z);
    if (x == endP[0] && y == endP[1] && z == endP[2]) {
      return;
    }
    if (txMax < tyMax) {
      if (txMax < tzMax) {
        x = x + stepx;
        if (x < minX || x > maxX) {
          return;
        }
        txMax = txMax + txDelta;
      } else {
        z = z + stepz;
        if (z < minZ || z > maxZ) {
          return;
        }
        tzMax = tzMax + tzDelta;
      }
    } else {
      if (tyMax < tzMax) {
        y = y + stepy;
        if (y < minY || y > maxY) {
          return;
        }
        tyMax = tyMax + tyDelta;
      } else {
        z = z + stepz;
        if (z < minZ || z > maxZ) {
          return;
        }
        tzMax = tzMax + tzDelta;
      }
    }
  }
}

export function cloneArray(x: number[][]) {
  const result: number[][] = new Array(x.length);
  for (let i = 0; i < x.length; ++i) {
    result[i] = x[i].slice();
  }
  return result;
}

// let max = Math.max;
// let min = Math.min;
/**
 * 加上添加空间[bs, be], 并去除与清除空间[as, ae]可能的交集,
 * @param as 要被清除的空间start顶点
 * @param ae 要被清除的空间end顶点
 * @param bs 要添加的空间start顶点
 * @param be 要添加的空间end顶点
 * @returns { eliminate, addition }
 */
function getSubSpace(
  as: vec3,
  ae: vec3,
  bs: vec3,
  be: vec3,
): { eliminate: [vec3, vec3][]; addition: [vec3, vec3][] } {
  const max = Math.max;
  const min = Math.min;
  const intersectS = [max(as[0], bs[0]), max(as[1], bs[1]), max(as[2], bs[2])];
  const intersectE = [min(ae[0], be[0]), min(ae[1], be[1]), min(ae[2], be[2])];
  if (
    !(
      intersectS[0] < intersectE[0] &&
      intersectS[1] < intersectE[1] &&
      intersectS[2] < intersectE[2]
    )
  ) {
    return { eliminate: [[as, ae]], addition: [[bs, be]] };
  }
  const eliminateSpace: [vec3, vec3][] = [];
  [
    [as, [intersectE[0], ae[1], intersectS[2]]],
    [
      [intersectE[0] + 1, as[1], as[2]],
      [ae[0], ae[1], intersectE[2]],
    ],
    [
      [as[0], as[1], intersectS[2]],
      [intersectS[0] - 1, ae[1], ae[2]],
    ],
    [[intersectS[0], as[1], intersectE[2]], ae],
    [
      [intersectS[0], as[1], intersectS[2]],
      [intersectE[0], intersectS[1] - 1, intersectE[2]],
    ],
    [
      [intersectS[0], intersectE[1] + 1, intersectS[2]],
      [intersectE[0], ae[1], intersectE[2]],
    ],
  ].forEach((points) => {
    for (let i = 0; i < points[0].length; i++) {
      if (points[1][i] - points[0][i] < 0) {
        return;
      }
    }
    eliminateSpace.push(points as [vec3, vec3]);
  });

  const additionSpace: [vec3, vec3][] = [];
  [
    [bs, [intersectE[0], be[1], intersectS[2]]],
    [
      [intersectE[0] + 1, bs[1], bs[2]],
      [be[0], be[1], intersectE[2]],
    ],
    [
      [bs[0], bs[1], intersectS[2]],
      [intersectS[0] - 1, be[1], be[2]],
    ],
    [[intersectS[0], bs[1], intersectE[2]], be],
    [
      [intersectS[0], bs[1], intersectS[2]],
      [intersectE[0], intersectS[1] - 1, intersectE[2]],
    ],
    [
      [intersectS[0], intersectE[1] + 1, intersectS[2]],
      [intersectE[0], be[1], intersectE[2]],
    ],
  ].forEach((points) => {
    for (let i = 0; i < points[0].length; i++) {
      if (points[1][i] - points[0][i] < 0) {
        return;
      }
    }
    additionSpace.push(points as [vec3, vec3]);
  });
  return { eliminate: eliminateSpace, addition: additionSpace };
}

/**
 * 在模型内创建新的立方体，先清除后添加
 * @param voxel
 * @param prevStart
 * @param prevEnd
 * @param start
 * @param end
 * @param eliminateMaterial 如果传入了当前立方体/cb函数，则以此材质/cb返回值进行填充
 * @param newMaterial
 * @param condition
 * @returns
 */
export function newBundle(
  voxel: VoxelView,
  prevStart: vec3,
  prevEnd: vec3,
  start: vec3,
  end: vec3,
  eliminateMaterial: GetMaterial,
  newMaterial: GetMaterial,
  condition?: OnCondition,
): VoxelView {
  /**
   * 计算可用的边界
   */
  const currBound = boundary(start, end, [0, 0, 0], voxel.getDimension());
  const [minX, minY, minZ] = currBound.start;
  const [maxX, maxY, maxZ] = currBound.end;

  if (prevStart && prevStart.length == 3) {
    const prevBound = boundary(
      prevStart,
      prevEnd,
      [0, 0, 0],
      voxel.getDimension(),
    );
    const [preMinX, preMinY, preMinZ] = prevBound.start;
    const [preMaxX, preMaxY, preMaxZ] = prevBound.end;
    const rst = getSubSpace(
      [preMinX, preMinY, preMinZ],
      [preMaxX, preMaxY, preMaxZ],
      [minX, minY, minZ],
      [maxX, maxY, maxZ],
    );
    rst.eliminate.forEach((pos) => {
      fillSpace(voxel, pos[0], pos[1], eliminateMaterial);
    });
    rst.addition.forEach((pos) => {
      fillSpace(voxel, pos[0], pos[1], newMaterial, condition);
    });
  } else {
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        for (let k = minZ; k <= maxZ; k++) {
          if (typeof newMaterial == 'function') {
            voxel.setVoxel(i, j, k, newMaterial(i, j, k));
          } else {
            voxel.setVoxel(i, j, k, newMaterial);
          }
        }
      }
    }
  }
  return voxel;
}

/**
 * 遍历体素，更新满足条件的体素点的材质id，
 * @param voxel 体素视图
 * @param start 起点坐标
 * @param end 终点坐标
 * @param material 素材Id或者获取素材Id的函数
 * @param condition 执行更新素材的条件函数。如果不传入，则默认所有素材都更新
 */
export function fillSpace(
  voxel: VoxelView,
  start: vec3,
  end: vec3,
  material: GetMaterial,
  condition?: OnCondition,
) {
  const getTextureId =
    typeof material === 'function' ? material : () => material;

  const onCondition = typeof condition === 'function' ? condition : () => true;

  traverseVoxels(voxel, start, end, (i, j, k) => {
    if (!onCondition(i, j, k)) {
      return;
    }

    voxel.setVoxel(i, j, k, getTextureId(i, j, k));
  });
}

export function allocEmptyVoxels(x: number, y: number, z: number) {
  const voxels = allocVoxels(x, y, z);
  for (let i = 0; i < voxels.data.length; i++) {
    voxels.data[i] = 0;
  }
  return voxels;
}

export function getElementPos(e: HTMLElement) {
  let x = 0;
  let y = 0;
  while (e != null) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement;
  }
  return {
    x,
    y,
  };
}

/**
 * 将b模型内指定范围内的数据复制到a模型中，共有5种模式
 * 1: a中空数据用b数据覆盖;
 * 2: a中所有数据用b所有数据覆盖;
 * 3: a中所有数据用b非空数据覆盖;
 * 4: a中所有数据用b非空数据覆盖, 覆盖后b中非空数据清零;
 * 5: a中空数据用b数据覆盖, 覆盖后b中对应数据清零;
 * @param a mutable 目的地模型
 * @param b immutable 合并源模型
 * @param start 指定范围的起点
 * @param end 指定范围的终点
 * @param type 合并模式
 * @returns
 */
export function mergeVoxel(
  a: VoxelView,
  b: VoxelView,
  start: vec3,
  end: vec3,
  type = 1,
): Function {
  const bound = boundary(
    start,
    end,
    [0, 0, 0],
    <vec3>a.shape.map((v) => v - 1),
  );
  const [minX, minY, minZ] = bound.start;
  const [maxX, maxY, maxZ] = bound.end;

  for (let i = minX; i <= maxX; i++) {
    for (let j = minY; j <= maxY; j++) {
      for (let k = minZ; k <= maxZ; k++) {
        if (type === 1) {
          if (a.getVoxel(i, j, k) == 0) {
            a.setVoxel(i, j, k, b.getVoxel(i, j, k));
          }
        } else if (type === 2) {
          a.setVoxel(i, j, k, b.getVoxel(i, j, k));
        } else if (type === 3) {
          if (b.getVoxel(i, j, k) != 0) {
            a.setVoxel(i, j, k, b.getVoxel(i, j, k));
          }
        } else if (type === 4) {
          if (b.getVoxel(i, j, k) != 0) {
            a.setVoxel(i, j, k, b.getVoxel(i, j, k));
            b.setVoxel(i, j, k, 0);
          }
        } else if (type === 5) {
          if (a.getVoxel(i, j, k) == 0) {
            a.setVoxel(i, j, k, b.getVoxel(i, j, k));
            b.setVoxel(i, j, k, 0);
          }
        }
      }
    }
  }
  return function (c: VoxelView, s: vec3, e: vec3, t = 1) {
    return mergeVoxel(a, c, s, e, t);
  };
}

/**
 * vector <q-p> is the normal vector
 * @param p Point p is on the surface
 * @param q Point q is end point of normal
 */
export function surfaceByNormalAndPoint(p: vec3, q: vec3) {
  const tris: vec3[] = [];
  const A = q[0] - p[0];
  const B = q[1] - p[1];
  const C = q[2] - p[2];

  const Cx = p[0];
  const Cy = p[1];
  const Cz = p[2];

  const maxDN = Math.max(Math.abs(A), Math.abs(B), Math.abs(C));
  let vertices: vec2[];
  const v = 2000;
  if (maxDN === Math.abs(A)) {
    if (A > 0) {
      vertices = [
        [v, v],
        [-v, v],
        [-v, -v],
        [v, -v],
      ];
    } else {
      vertices = [
        [v, v],
        [v, -v],
        [-v, -v],
        [-v, v],
      ];
    }
    for (let i = 0; i < vertices.length; i++) {
      const y = vertices[i][0];
      const z = vertices[i][1];
      const x = Cx - (B * (y - Cy) + C * (z - Cz)) / A;
      tris.push([x, y, z]);
    }
  } else if (maxDN === Math.abs(B)) {
    if (B > 0) {
      vertices = [
        [v, v],
        [v, -v],
        [-v, -v],
        [-v, v],
      ];
    } else {
      vertices = [
        [v, v],
        [-v, v],
        [-v, -v],
        [v, -v],
      ];
    }
    for (let i = 0; i < vertices.length; i++) {
      const x = vertices[i][0];
      const z = vertices[i][1];
      const y = Cy - (A * (x - Cx) + C * (z - Cz)) / B;
      tris.push([x, y, z]);
    }
  } else {
    if (C > 0) {
      vertices = [
        [v, v],
        [-v, v],
        [-v, -v],
        [v, -v],
      ];
    } else if (C < 0) {
      vertices = [
        [v, v],
        [v, -v],
        [-v, -v],
        [-v, v],
      ];
    } else {
      throw new Error('C should not be zero');
    }
    for (let i = 0; i < vertices.length; i++) {
      const x = vertices[i][0];
      const y = vertices[i][1];
      const z = Cz - (A * (x - Cx) + B * (y - Cy)) / C;
      tris.push([x, y, z]);
    }
  }
  return tris;
}
