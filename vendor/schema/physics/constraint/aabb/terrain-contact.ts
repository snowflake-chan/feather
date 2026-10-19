import { VoxelCollisionBox } from '../../../utils/rbush-schema';
import { ContactRecord, VoxelContactSchema } from '../../physics-schema';
import {
  RX,
  RY,
  RZ,
  ArrayType,
  INV_MASS,
  INV_DT,
  ACTIVE_BODIES,
  ACTIVE_CONTACTS,
  MASS,
  BLOCK_RESTITUTION,
  BLOCK_FRICTION,
  BLOCK_VELOCITY,
} from '../../prepare-bodies';
import {
  combineRestitution,
  combineFriction,
  FRICTION_CUTOFF,
} from '../../def';

export class TerrainContactSet {
  public outA: number[] = [0];
  public outMu: number[] = [];
  public outBias: number[] = [0.1];
  public outLambda: number[] = [0.1];
  public outFriction: number[] = [0.1];
  /**
   * 当同一个刚体碰撞到不同地形的时候
   * xxxBoxOffset记录了同个刚体对应outBoxes中哪些地形
   * const boxStart = outBoxOffset[2 * i];
   * const boxEnd = outBoxOffset[2 * i + 1];
   * 从 outBoxes[boxStart] 到 outBoxes[boxEnd]
   */
  public outBoxOffset: number[] = [0];
  public outBoxes: VoxelCollisionBox[] = [];

  // velocity for conveyor belts
  public outVel: number[] = [0, 0];

  public inA: number[] = [0];
  public inMu: number[] = [];
  public inBias: number[] = [0.1];
  public inLambda: number[] = [0.1];
  public inFriction: number[] = [0.1];
  public inBoxOffset: number[] = [0];
  public inBoxes: VoxelCollisionBox[] = [];

  public clear() {
    this.outA.length =
      this.outMu.length =
      this.outBias.length =
      this.outLambda.length =
      this.outFriction.length =
      this.outBoxOffset.length =
      this.outBoxes.length =
      this.outVel.length =
      this.inA.length =
      this.inMu.length =
      this.inBias.length =
      this.inLambda.length =
      this.inFriction.length =
      this.inBoxOffset.length =
      this.inBoxes.length =
        0;
  }

  // special case:  apply motor forces
  public pushMotor(
    ai: number,
    terrainBox: VoxelCollisionBox,
    depth: number,
    v: ArrayType,
  ) {
    const block = terrainBox.block;
    const blockCode = block & 0xfff;
    const restitution = combineRestitution(
      ACTIVE_BODIES[ai].restitution,
      BLOCK_RESTITUTION[blockCode],
    );
    const mu = combineFriction(
      ACTIVE_BODIES[ai].friction,
      BLOCK_FRICTION[blockCode],
    );
    const bounce = BLOCK_VELOCITY[3 * blockCode + 1];
    const { outA, outBias, outBoxes, outBoxOffset, outLambda, outMu } = this;
    const n = outA.length - 1;
    const bias = INV_DT * depth - restitution * v[ai] + bounce;
    if (n >= 0 && outA[n] === ai && outMu[n] === mu && outBias[n] === bias) {
      outBoxOffset[2 * n + 1] += 1;
    } else {
      outA.push(ai);
      outMu.push(mu);
      outBias.push(bias);
      outLambda.push(0);
      const l = outBoxes.length;
      outBoxOffset.push(l, l + 1);

      // compute velocity
      const du = BLOCK_VELOCITY[3 * blockCode];
      const dv = BLOCK_VELOCITY[3 * blockCode + 2];
      let vu = du;
      let vv = dv;
      switch (block >>> 14) {
        case 0:
          break;
        case 1:
          vu = dv;
          vv = -du;
          break;
        case 2:
          vu = -du;
          vv = -dv;
          break;
        case 3:
          vu = -dv;
          vv = du;
          break;
      }

      this.outVel.push(vu, vv);
    }
    outBoxes.push(terrainBox);
  }

  public push(
    flip: boolean,
    ai: number,
    terrainBox: VoxelCollisionBox,
    depth: number,
    v: ArrayType,
  ) {
    const block = terrainBox.block & 0xfff;
    const restitution = combineRestitution(
      ACTIVE_BODIES[ai].restitution,
      BLOCK_RESTITUTION[block],
    );
    const mu = combineFriction(
      ACTIVE_BODIES[ai].friction,
      BLOCK_FRICTION[block],
    );
    const bounce = BLOCK_VELOCITY[3 * block + 1];
    if (!flip) {
      const { outA, outBias, outBoxes, outBoxOffset, outLambda, outMu } = this;
      const n = outA.length - 1;
      const bias = INV_DT * depth - restitution * v[ai] + bounce;
      if (n >= 0 && outA[n] === ai && outMu[n] === mu && outBias[n] === bias) {
        outBoxOffset[2 * n + 1] += 1;
      } else {
        outA.push(ai);
        outMu.push(mu);
        outBias.push(bias);
        outLambda.push(0);
        const l = outBoxes.length;
        outBoxOffset.push(l, l + 1);
      }
      outBoxes.push(terrainBox);
    } else {
      const { inA, inBias, inBoxes, inBoxOffset, inLambda, inMu } = this;
      const n = inA.length - 1;
      const bias = INV_DT * depth + restitution * v[ai] + bounce;
      if (n >= 0 && inA[n] === ai && inMu[n] === mu && inBias[n] === bias) {
        inBoxOffset[2 * n + 1] += 1;
      } else {
        inA.push(ai);
        inMu.push(mu);
        inBias.push(bias);
        inLambda.push(0);
        const l = inBoxes.length;
        inBoxOffset.push(l, l + 1);
      }
      inBoxes.push(terrainBox);
    }
  }

  public applyFrictionMotor(du: ArrayType, dv: ArrayType) {
    const {
      outA,
      outMu,
      outLambda,
      outFriction,
      outVel,
      inA,
      inMu,
      inLambda,
      inFriction,
    } = this;
    outFriction.length = 2 * outA.length;
    for (let i = 0; i < outA.length; ++i) {
      const ai = outA[i];
      const vu = du[ai] - outVel[2 * i];
      const vv = dv[ai] - outVel[2 * i + 1];
      const mi = MASS[ai];
      const mv = INV_MASS[ai];
      const vmag = Math.max(
        FRICTION_CUTOFF,
        Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)),
      );
      const s = Math.min((outMu[i] * outLambda[i]) / vmag, mi);
      const fu = (outFriction[2 * i] = -vu * s);
      const fv = (outFriction[2 * i + 1] = -vv * s);
      du[ai] += mv * fu;
      dv[ai] += mv * fv;
    }
    inFriction.length = 2 * inA.length;
    for (let i = 0; i < inA.length; ++i) {
      const ai = inA[i];
      const vu = du[ai];
      const vv = dv[ai];
      const mi = MASS[ai];
      const mv = INV_MASS[ai];
      const vmag = Math.max(
        FRICTION_CUTOFF,
        Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)),
      );
      const s = Math.min((inMu[i] * inLambda[i]) / vmag, mi);
      const fu = (inFriction[2 * i] = -vu * s);
      const fv = (inFriction[2 * i + 1] = -vv * s);
      du[ai] += mv * fu;
      dv[ai] += mv * fv;
    }
  }

  public applyFriction(du: ArrayType, dv: ArrayType) {
    const {
      outA,
      outMu,
      outLambda,
      outFriction,
      inA,
      inMu,
      inLambda,
      inFriction,
    } = this;
    outFriction.length = 2 * outA.length;
    for (let i = 0; i < outA.length; ++i) {
      const ai = outA[i];
      const vu = du[ai];
      const vv = dv[ai];
      const mi = MASS[ai];
      const mv = INV_MASS[ai];
      const vmag = Math.max(
        FRICTION_CUTOFF,
        Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)),
      );
      const s = Math.min((outMu[i] * outLambda[i]) / vmag, mi);
      const fu = (outFriction[2 * i] = -vu * s);
      const fv = (outFriction[2 * i + 1] = -vv * s);
      du[ai] += mv * fu;
      dv[ai] += mv * fv;
    }
    inFriction.length = 2 * inA.length;
    for (let i = 0; i < inA.length; ++i) {
      const ai = inA[i];
      const vu = du[ai];
      const vv = dv[ai];
      const mi = MASS[ai];
      const mv = INV_MASS[ai];
      const vmag = Math.max(
        FRICTION_CUTOFF,
        Math.sqrt(Math.pow(vu, 2) + Math.pow(vv, 2)),
      );
      const s = Math.min((inMu[i] * inLambda[i]) / vmag, mi);
      const fu = (inFriction[2 * i] = -vu * s);
      const fv = (inFriction[2 * i + 1] = -vv * s);
      du[ai] += mv * fu;
      dv[ai] += mv * fv;
    }
  }

  public updateIndex(d: number) {
    const {
      outA,
      outBoxes,
      outBoxOffset,
      outLambda,
      outFriction,
      inA,
      inBoxes,
      inBoxOffset,
      inLambda,
      inFriction,
    } = this;
    for (let i = 0; i < outLambda.length; ++i) {
      const ai = outA[i];
      const record = ACTIVE_CONTACTS[ai];
      if (!record) {
        continue;
      }
      const { px, py, pz } = ACTIVE_BODIES[ai];
      const rx = RX[ai];
      const ry = RY[ai];
      const rz = RZ[ai];
      const axis = d + 1;

      // copy contacts
      const f0 = record.voxel.length;
      const boxStart = outBoxOffset[2 * i];
      const boxEnd = outBoxOffset[2 * i + 1];
      for (let j = boxStart; j < boxEnd; ++j) {
        addVoxelContactList(record, outBoxes[j], px, py, pz, rx, ry, rz, axis);
      }

      // update force accumulator
      if (f0 < record.voxel.length) {
        const fu = INV_DT * outFriction[2 * i];
        const fv = INV_DT * outFriction[2 * i + 1];
        const lambda = INV_DT * outLambda[i];

        const voxelContact = record.voxel[f0];
        if (d === 0) {
          voxelContact.fx = lambda;
          voxelContact.fy = fu;
          voxelContact.fz = fv;
        } else if (d === 1) {
          voxelContact.fx = fv;
          voxelContact.fy = lambda;
          voxelContact.fz = fu;
        } else {
          voxelContact.fx = fu;
          voxelContact.fy = fv;
          voxelContact.fz = lambda;
        }
      }
    }
    for (let i = 0; i < inLambda.length; ++i) {
      const ai = inA[i];
      const record = ACTIVE_CONTACTS[ai];
      if (!record) {
        continue;
      }
      const { px, py, pz } = ACTIVE_BODIES[ai];
      const rx = RX[ai];
      const ry = RY[ai];
      const rz = RZ[ai];
      const axis = -(d + 1);

      // copy contacts
      const f0 = record.voxel.length;
      const boxStart = inBoxOffset[2 * i];
      const boxEnd = inBoxOffset[2 * i + 1];
      for (let j = boxStart; j < boxEnd; ++j) {
        addVoxelContactList(record, inBoxes[j], px, py, pz, rx, ry, rz, axis);
      }

      // update force accumulator
      if (f0 < record.voxel.length) {
        const fu = INV_DT * inFriction[2 * i];
        const fv = INV_DT * inFriction[2 * i + 1];
        const lambda = -INV_DT * inLambda[i];

        const voxelContact = record.voxel[f0];
        if (d === 0) {
          voxelContact.fx = lambda;
          voxelContact.fy = fu;
          voxelContact.fz = fv;
        } else if (d === 1) {
          voxelContact.fx = fv;
          voxelContact.fy = lambda;
          voxelContact.fz = fu;
        } else {
          voxelContact.fx = fu;
          voxelContact.fy = fv;
          voxelContact.fz = lambda;
        }
      }
    }
  }
}

function addVoxelContactList(
  record: ContactRecord,
  terrainBox: VoxelCollisionBox,
  px: number,
  py: number,
  pz: number,
  rx: number,
  ry: number,
  rz: number,
  axis: number,
) {
  const x0 = Math.max(terrainBox.minX, Math.floor(px - rx - 1e-2));
  const y0 = Math.max(terrainBox.minY, Math.floor(py - ry - 1e-2));
  const z0 = Math.max(terrainBox.minZ, Math.floor(pz - rz - 1e-2));
  const x1 = Math.min(terrainBox.maxX, Math.ceil(px + rx + 1e-2));
  const y1 = Math.min(terrainBox.maxY, Math.ceil(py + ry + 1e-2));
  const z1 = Math.min(terrainBox.maxZ, Math.ceil(pz + rz + 1e-2));
  for (let z = z0; z < z1; ++z) {
    for (let y = y0; y < y1; ++y) {
      for (let x = x0; x < x1; ++x) {
        const entry = VoxelContactSchema.alloc();
        entry.x = x;
        entry.y = y;
        entry.z = z;
        entry.axis = axis;
        entry.fx = entry.fy = entry.fz = 0;
        entry.b = terrainBox.block;
        record.voxel.push(entry);
      }
    }
  }
}

export const TERRAIN_X_CONTACTS = new TerrainContactSet();
export const TERRAIN_Y_CONTACTS = new TerrainContactSet();
export const TERRAIN_Z_CONTACTS = new TerrainContactSet();

export function clearTerrainContacts() {
  TERRAIN_X_CONTACTS.clear();
  TERRAIN_Y_CONTACTS.clear();
  TERRAIN_Z_CONTACTS.clear();
}
