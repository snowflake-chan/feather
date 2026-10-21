import { mat3 } from 'gl-matrix';
import { GameClientState } from '../game-client-schema';
import {
  RenderBoxSet,
  RenderBox,
  RenderBoxSchema,
} from '@box/schema/render-box/schema';

const MAT3 = mat3.create();

export function tickRenderBox(state: GameClientState) {
  const bodies = state.bodies;

  const meshTable = state.modelInfo.meshHashes;
  const models = state.replica.models;
  const players = state.replica.players;

  const boxes: RenderBoxSet = [];

  // pointers
  let boxPtr = 0;
  let playerPtr = 0;
  let modelPtr = 0;

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    const id = body.id;

    let box: RenderBox;
    // walk box pointer
    while (
      boxPtr < state.renderBoxes.length &&
      state.renderBoxes[boxPtr].id < id
    ) {
      RenderBoxSchema.free(state.renderBoxes[boxPtr]);
      boxPtr++;
    }

    if (
      boxPtr >= state.renderBoxes.length ||
      state.renderBoxes[boxPtr].id !== id
    ) {
      box = RenderBoxSchema.clone(RenderBoxSchema.identity);
      box.id = id;
    } else {
      box = state.renderBoxes[boxPtr];
      boxPtr++;
    }

    boxes[i] = box;

    box.qx = body.qx;
    box.qy = body.qy;
    box.qz = body.qz;
    box.qw = body.qw;

    // walk player pointer
    if (playerPtr < players.length && players[playerPtr].id === id) {
      playerPtr++;

      box.px = body.px;
      box.py = body.py;
      box.pz = body.pz;

      box.anchorX = body.px;
      box.anchorY = body.py;
      box.anchorZ = body.pz;

      box.rx = body.rx;
      box.ry = body.ry;
      box.rz = body.rz;
      continue;
    }

    // walk model pointer
    while (modelPtr < models.length && models[modelPtr].id < id) {
      modelPtr++;
    }
    if (modelPtr >= models.length) {
      continue;
    }
    const model = models[modelPtr];
    if (model.id !== id) {
      continue;
    }

    const h = meshTable[model.meshId];
    if (!h) {
      box.px = body.px;
      box.py = body.py;
      box.pz = body.pz;

      box.anchorX = body.px;
      box.anchorY = body.py;
      box.anchorZ = body.pz;
      continue;
    }

    const sx = model.scaleX;
    const sy = model.scaleY;
    const sz = model.scaleZ;

    mat3fromQuat(MAT3, body.qx, body.qy, body.qz, body.qw);

    let anchorX = -h.bodyOffsetX;
    let anchorY = -h.bodyOffsetY;
    let anchorZ = -h.bodyOffsetZ;

    let x = sx * anchorX;
    let y = sy * anchorY;
    let z = sz * anchorZ;

    // 计算出世界坐标下物理框与锚点的距离
    anchorX = x * MAT3[0] + y * MAT3[3] + z * MAT3[6];
    anchorY = x * MAT3[1] + y * MAT3[4] + z * MAT3[7];
    anchorZ = x * MAT3[2] + y * MAT3[5] + z * MAT3[8];

    // 反推得到“锚点”的绝对坐标
    anchorX += body.px;
    anchorY += body.py;
    anchorZ += body.pz;

    box.anchorX = anchorX;
    box.anchorY = anchorY;
    box.anchorZ = anchorZ;

    // 计算“外观框中心”与“锚点”的偏移
    x = sx * h.renderBoxOffsetX;
    y = sy * h.renderBoxOffsetY;
    z = sz * h.renderBoxOffsetZ;

    // 计算偏移的绝对值
    box.px = x * MAT3[0] + y * MAT3[3] + z * MAT3[6];
    box.py = x * MAT3[1] + y * MAT3[4] + z * MAT3[7];
    box.pz = x * MAT3[2] + y * MAT3[5] + z * MAT3[8];

    // 偏移加上锚点位置，等于外观框中心的
    box.px += anchorX;
    box.py += anchorY;
    box.pz += anchorZ;

    const bx = h.meshBX;
    const by = h.meshBY;
    const bz = h.meshBZ;

    let rx = 0;
    let ry = 0;
    let rz = 0;

    for (let j = 0; j < 8; ++j) {
      const x = 0.5 * (j & 1 ? sx : -sx) * bx;
      const y = 0.5 * (j & 2 ? sy : -sy) * by;
      const z = 0.5 * (j & 4 ? sz : -sz) * bz;

      rx = Math.max(rx, Math.abs(x * MAT3[0] + y * MAT3[3] + z * MAT3[6]));
      ry = Math.max(ry, Math.abs(x * MAT3[1] + y * MAT3[4] + z * MAT3[7]));
      rz = Math.max(rz, Math.abs(x * MAT3[2] + y * MAT3[5] + z * MAT3[8]));
    }

    box.rx = rx;
    box.ry = ry;
    box.rz = rz;
  }

  while (boxPtr < state.renderBoxes.length) {
    RenderBoxSchema.free(state.renderBoxes[boxPtr++]);
  }
  state.renderBoxes = boxes;
}

function mat3fromQuat(out: mat3, x: number, y: number, z: number, w: number) {
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;

  const xx = x * x2;
  const yx = y * x2;
  const yy = y * y2;
  const zx = z * x2;
  const zy = z * y2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;

  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = yx - wz;
  out[4] = 1 - xx - zz;
  out[5] = zy + wx;
  out[6] = zx + wy;
  out[7] = zy - wx;
  out[8] = 1 - xx - yy;

  return out;
}
