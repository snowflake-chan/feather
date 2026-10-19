import type { VoxelCollision } from '../../../voxel/voxel-collision-schema';
import { VoxelCollisionBox } from '../../../utils/rbush-schema';

import { ContactConstraint } from '../interface';
import { collideSolid } from '../../../voxel/voxel-collision';
import { ALLOC, Vec3, calcRotation, getInverseInertia } from './def';

import { testCollisionFilter } from '../../collision-filter';
import {
  ACTIVE_GROUP,
  FIX_GROUP,
  TERRAIN_HITS,
  ACTIVE_BOXES,
  BLOCK_RESTITUTION,
  BLOCK_FRICTION,
  ACTIVE_CONTACTS,
  ACTIVE_BODIES,
  FIXED_CONTACTS,
  FIXED_BODIES,
  QX,
  QY,
  QZ,
  QW,
  HSX,
  HSY,
  HSZ,
  RX,
  RY,
  RZ,
  X0,
  Y0,
  Z0,
  FIX_QX,
  FIX_QY,
  FIX_QZ,
  FIX_QW,
  FIX_X0,
  FIX_Y0,
  FIX_Z0,
  FIX_HSX,
  FIX_HSY,
  FIX_HSZ,
  CR,
  DX,
  DY,
  DZ,
  INV_MASS,
  AX,
  AY,
  AZ,
  FIX_CR,
  FIX_DX,
  FIX_DY,
  FIX_DZ,
  FIX_AX,
  FIX_AY,
  FIX_AZ,
} from '../../prepare-bodies';
import { VOXEL_EPSILON, ACTIVE_ITER_COUNT } from '../../def';
import { ContactManifold, OBBOBBintersect } from './obb-collide';
import { ContactSet } from './contact';
import {
  ContactRecord,
  RigidBodyFlags,
  VoxelContactSchema,
} from '../../physics-schema';
import { addBodyContactRecord } from '../../contact-controller';

const MANIFOLD = new ContactManifold();
const ACTIVE_CONTACTS_SET = new ContactSet('active');
const FIXED_CONTACTS_SET = new ContactSet('fixed');
const TERRAIN_CONTACTS_SET = new ContactSet('terrain');
const TMPA_R = ALLOC(9);
const TMPB_R = ALLOC(9);
const TMPA_IIN = ALLOC(9);
const TMPB_IIN = ALLOC(9);

export class OBBContact implements ContactConstraint {
  private contactTerrains: VoxelCollisionBox[] = [];
  private contactTerrainsAxis: number[] = [];

  public clearContacts(): void {
    TERRAIN_CONTACTS_SET.clear();
    FIXED_CONTACTS_SET.clear();
    ACTIVE_CONTACTS_SET.clear();
    this.contactTerrains.length = this.contactTerrainsAxis.length = 0;
  }
  public sortContacts(): void {}

  private addBodiesContactRecord(contactSet: ContactSet) {
    const { contacts, type } = contactSet;
    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i];
      const { ai, bi } = c;
      const aRecord = ACTIVE_CONTACTS[ai];
      const bRecord =
        type === 'active' ? ACTIVE_CONTACTS[bi] : FIXED_CONTACTS[bi];
      if (!aRecord && !bRecord) {
        continue;
      }
      const aId = ACTIVE_BODIES[ai].id;
      const bId =
        type === 'active' ? ACTIVE_BODIES[bi].id : FIXED_BODIES[bi].id;
      if (aRecord) {
        addBodyContactRecord(
          aRecord,
          bId,
          -c.nx,
          -c.ny,
          -c.nz,
          c.fx,
          c.fy,
          c.fz,
        );
      }
      if (bRecord) {
        addBodyContactRecord(
          bRecord,
          aId,
          c.nx,
          c.ny,
          c.nz,
          -c.fx,
          -c.fy,
          -c.fz,
        );
      }
    }
  }

  private addVoxelContactList(
    record: ContactRecord,
    terrainBox: VoxelCollisionBox,
    px: number,
    py: number,
    pz: number,
    rx: number,
    ry: number,
    rz: number,
    hsx: number,
    hsy: number,
    hsz: number,
    xAxis: Vec3,
    yAxis: Vec3,
    zAxis: Vec3,
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
          // active刚体位置与地形中心位置差
          // 地形是边长为1,1,1的立方体，半径尺寸为0.5
          const posDiff: Vec3 = [px - x - 0.5, py - y - 0.5, pz - z - 0.5];

          // 查看地形三个面为分离轴的投影是否分离
          // 如果有分离的场景则没有碰撞到这个地形
          let len = Math.abs(posDiff[0]);
          let ra = 0.5;
          let rb =
            Math.abs(xAxis[0]) * hsx +
            Math.abs(yAxis[0]) * hsy +
            Math.abs(zAxis[0]) * hsz;
          if (len - ra - rb > 0) {
            continue;
          }

          len = Math.abs(posDiff[1]);
          rb =
            Math.abs(xAxis[1]) * hsx +
            Math.abs(yAxis[1]) * hsy +
            Math.abs(zAxis[1]) * hsz;
          if (len - ra - rb > 0) {
            continue;
          }

          len = Math.abs(posDiff[2]);
          rb =
            Math.abs(xAxis[2]) * hsx +
            Math.abs(yAxis[2]) * hsy +
            Math.abs(zAxis[2]) * hsz;
          if (len - ra - rb > 0) {
            continue;
          }

          // 查看active刚体三个面为分离轴的投影是否分离
          // 如果有分离的场景则没有碰撞到这个地形
          len = Math.abs(
            xAxis[0] * posDiff[0] +
              xAxis[1] * posDiff[1] +
              xAxis[2] * posDiff[2],
          );
          ra = hsx;
          rb =
            0.5 *
            (Math.abs(xAxis[0]) + Math.abs(xAxis[1]) + Math.abs(xAxis[2]));
          if (len - ra - rb > 0) {
            continue;
          }

          len = Math.abs(
            yAxis[0] * posDiff[0] +
              yAxis[1] * posDiff[1] +
              yAxis[2] * posDiff[2],
          );
          ra = hsy;
          rb =
            0.5 *
            (Math.abs(yAxis[0]) + Math.abs(yAxis[1]) + Math.abs(yAxis[2]));
          if (len - ra - rb > 0) {
            continue;
          }

          len = Math.abs(
            zAxis[0] * posDiff[0] +
              zAxis[1] * posDiff[1] +
              zAxis[2] * posDiff[2],
          );
          ra = hsz;
          rb =
            0.5 *
            (Math.abs(zAxis[0]) + Math.abs(zAxis[1]) + Math.abs(zAxis[2]));
          if (len - ra - rb > 0) {
            continue;
          }

          // 经过6个分离轴的检查确认此地形碰撞到了这个active刚体
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

  public updateContactIndex(): void {
    this.addBodiesContactRecord(ACTIVE_CONTACTS_SET);
    this.addBodiesContactRecord(FIXED_CONTACTS_SET);

    const { contacts } = TERRAIN_CONTACTS_SET;
    const { contactTerrains, contactTerrainsAxis } = this;
    for (let i = 0; i < contacts.length; ++i) {
      const c = contacts[i];
      const { ai } = c;
      const record = ACTIVE_CONTACTS[ai];
      if (!record) {
        continue;
      }
      const { px, py, pz } = ACTIVE_BODIES[ai];
      const hsx = HSX[ai];
      const hsy = HSY[ai];
      const hsz = HSZ[ai];
      const rx = RX[ai];
      const ry = RY[ai];
      const rz = RZ[ai];
      calcRotation(TMPA_R, QX[ai], QY[ai], QZ[ai], QW[ai]);

      // copy contacts
      const f0 = record.voxel.length;
      this.addVoxelContactList(
        record,
        contactTerrains[i],
        px,
        py,
        pz,
        rx,
        ry,
        rz,
        hsx,
        hsy,
        hsz,
        [TMPA_R[0], TMPA_R[1], TMPA_R[2]],
        [TMPA_R[3], TMPA_R[4], TMPA_R[5]],
        [TMPA_R[6], TMPA_R[7], TMPA_R[8]],
        contactTerrainsAxis[i],
      );

      // update force accumulator
      if (f0 < record.voxel.length) {
        const voxelContact = record.voxel[f0];
        voxelContact.fx = c.fx;
        voxelContact.fy = c.fy;
        voxelContact.fz = c.fz;
      }
    }
  }
  public propagateLocks(): void {
    ACTIVE_CONTACTS_SET.propagateLocks();
  }

  public processActiveContact(
    ai: number,
    bi: number,
    filter: number[][],
  ): void {
    // 碰撞组过滤
    if (!testCollisionFilter(filter, ACTIVE_GROUP[ai], ACTIVE_GROUP[bi])) {
      return;
    }

    calcRotation(TMPA_R, QX[ai], QY[ai], QZ[ai], QW[ai]);
    calcRotation(TMPB_R, QX[bi], QY[bi], QZ[bi], QW[bi]);

    MANIFOLD.numPoints = 0;
    OBBOBBintersect(
      X0[ai],
      Y0[ai],
      Z0[ai],
      HSX[ai],
      HSY[ai],
      HSZ[ai],
      TMPA_R[0],
      TMPA_R[1],
      TMPA_R[2],
      TMPA_R[3],
      TMPA_R[4],
      TMPA_R[5],
      TMPA_R[6],
      TMPA_R[7],
      TMPA_R[8],
      X0[bi],
      Y0[bi],
      Z0[bi],
      HSX[bi],
      HSY[bi],
      HSZ[bi],
      TMPB_R[0],
      TMPB_R[1],
      TMPB_R[2],
      TMPB_R[3],
      TMPB_R[4],
      TMPB_R[5],
      TMPB_R[6],
      TMPB_R[7],
      TMPB_R[8],
      MANIFOLD,
    );
    if (!MANIFOLD.numPoints) {
      return;
    }

    const bodyA = ACTIVE_BODIES[ai];
    if (bodyA.flags & RigidBodyFlags.PLAYER) {
      TMPA_IIN.fill(0);
    } else {
      getInverseInertia(TMPA_IIN, ai, TMPA_R);
    }

    const bodyB = ACTIVE_BODIES[bi];
    if (bodyB.flags & RigidBodyFlags.PLAYER) {
      TMPB_IIN.fill(0);
    } else {
      getInverseInertia(TMPB_IIN, bi, TMPB_R);
    }

    ACTIVE_CONTACTS_SET.push(
      ai,
      X0[ai],
      Y0[ai],
      Z0[ai],
      CR[ai],
      bodyA.friction,
      DX[ai],
      DY[ai],
      DZ[ai],
      AX[ai],
      AY[ai],
      AZ[ai],
      INV_MASS[ai],
      TMPA_IIN[0],
      TMPA_IIN[1],
      TMPA_IIN[2],
      TMPA_IIN[3],
      TMPA_IIN[4],
      TMPA_IIN[5],
      TMPA_IIN[6],
      TMPA_IIN[7],
      TMPA_IIN[8],
      bi,
      X0[bi],
      Y0[bi],
      Z0[bi],
      CR[bi],
      bodyB.friction,
      DX[bi],
      DY[bi],
      DZ[bi],
      AX[bi],
      AY[bi],
      AZ[bi],
      INV_MASS[bi],
      TMPB_IIN[0],
      TMPB_IIN[1],
      TMPB_IIN[2],
      TMPB_IIN[3],
      TMPB_IIN[4],
      TMPB_IIN[5],
      TMPB_IIN[6],
      TMPB_IIN[7],
      TMPB_IIN[8],
      MANIFOLD,
    );
  }
  public processFixedContact(ai: number, fi: number, filter: number[][]): void {
    if (!testCollisionFilter(filter, ACTIVE_GROUP[ai], FIX_GROUP[fi])) {
      return;
    }
    calcRotation(TMPA_R, QX[ai], QY[ai], QZ[ai], QW[ai]);
    calcRotation(TMPB_R, FIX_QX[fi], FIX_QY[fi], FIX_QZ[fi], FIX_QW[fi]);
    MANIFOLD.numPoints = 0;
    OBBOBBintersect(
      X0[ai],
      Y0[ai],
      Z0[ai],
      HSX[ai],
      HSY[ai],
      HSZ[ai],
      TMPA_R[0],
      TMPA_R[1],
      TMPA_R[2],
      TMPA_R[3],
      TMPA_R[4],
      TMPA_R[5],
      TMPA_R[6],
      TMPA_R[7],
      TMPA_R[8],
      FIX_X0[fi],
      FIX_Y0[fi],
      FIX_Z0[fi],
      FIX_HSX[fi],
      FIX_HSY[fi],
      FIX_HSZ[fi],
      TMPB_R[0],
      TMPB_R[1],
      TMPB_R[2],
      TMPB_R[3],
      TMPB_R[4],
      TMPB_R[5],
      TMPB_R[6],
      TMPB_R[7],
      TMPB_R[8],
      MANIFOLD,
    );
    if (!MANIFOLD.numPoints) {
      return;
    }

    const bodyA = ACTIVE_BODIES[ai];
    if (bodyA.flags & RigidBodyFlags.PLAYER) {
      TMPA_IIN.fill(0);
    } else {
      getInverseInertia(TMPA_IIN, ai, TMPA_R);
    }

    FIXED_CONTACTS_SET.push(
      ai,
      X0[ai],
      Y0[ai],
      Z0[ai],
      CR[ai],
      bodyA.friction,
      DX[ai],
      DY[ai],
      DZ[ai],
      AX[ai],
      AY[ai],
      AZ[ai],
      INV_MASS[ai],
      TMPA_IIN[0],
      TMPA_IIN[1],
      TMPA_IIN[2],
      TMPA_IIN[3],
      TMPA_IIN[4],
      TMPA_IIN[5],
      TMPA_IIN[6],
      TMPA_IIN[7],
      TMPA_IIN[8],
      fi,
      FIX_X0[fi],
      FIX_Y0[fi],
      FIX_Z0[fi],
      FIX_CR[fi],
      FIXED_BODIES[fi].friction,
      FIX_DX[fi],
      FIX_DY[fi],
      FIX_DZ[fi],
      FIX_AX[fi],
      FIX_AY[fi],
      FIX_AZ[fi],
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      MANIFOLD,
    );
  }
  public findTerrainContacts(geom: VoxelCollision): void {
    for (let i = 0; i < ACTIVE_BOXES.length; ++i) {
      const box = ACTIVE_BOXES[i];
      TERRAIN_HITS.length = 0;
      collideSolid(
        TERRAIN_HITS,
        geom,
        box.minX - VOXEL_EPSILON,
        box.minY - VOXEL_EPSILON,
        box.minZ - VOXEL_EPSILON,
        box.maxX + VOXEL_EPSILON,
        box.maxY + VOXEL_EPSILON,
        box.maxZ + VOXEL_EPSILON,
      );
      if (TERRAIN_HITS.length === 0) {
        continue;
      }
      for (let j = 0; j < TERRAIN_HITS.length; ++j) {
        // 构造地形shape
        const hit = TERRAIN_HITS[j];
        const block = hit.block;

        const blockCode = block & 0xfff;
        calcRotation(TMPA_R, QX[i], QY[i], QZ[i], QW[i]);

        MANIFOLD.numPoints = 0;
        OBBOBBintersect(
          X0[i],
          Y0[i],
          Z0[i],
          HSX[i],
          HSY[i],
          HSZ[i],
          TMPA_R[0],
          TMPA_R[1],
          TMPA_R[2],
          TMPA_R[3],
          TMPA_R[4],
          TMPA_R[5],
          TMPA_R[6],
          TMPA_R[7],
          TMPA_R[8],
          (hit.maxX + hit.minX) / 2,
          (hit.maxY + hit.minY) / 2,
          (hit.maxZ + hit.minZ) / 2,
          (hit.maxX - hit.minX) / 2,
          (hit.maxY - hit.minY) / 2,
          (hit.maxZ - hit.minZ) / 2,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          MANIFOLD,
          true,
          hit.faces,
        );
        if (!MANIFOLD.numPoints) {
          continue;
        }

        let axis = 0;
        switch (MANIFOLD.separatingAxisIndex) {
          case 3:
            if (MANIFOLD.right) {
              axis = -1;
            } else {
              axis = 1;
            }
            break;
          case 4:
            if (MANIFOLD.right) {
              axis = -2;
            } else {
              axis = 2;
            }
            break;
          case 5:
            if (MANIFOLD.right) {
              axis = -3;
            } else {
              axis = 3;
            }
            break;
        }
        if (axis === 0 || hit.faces === 0) {
          continue;
        }
        this.contactTerrains.push(hit);
        this.contactTerrainsAxis.push(axis);

        const bodyA = ACTIVE_BODIES[i];
        if (bodyA.flags & RigidBodyFlags.PLAYER) {
          TMPA_IIN.fill(0);
        } else {
          getInverseInertia(TMPA_IIN, i, TMPA_R);
        }

        TERRAIN_CONTACTS_SET.push(
          i,
          X0[i],
          Y0[i],
          Z0[i],
          CR[i],
          bodyA.friction,
          DX[i],
          DY[i],
          DZ[i],
          AX[i],
          AY[i],
          AZ[i],
          INV_MASS[i],
          TMPA_IIN[0],
          TMPA_IIN[1],
          TMPA_IIN[2],
          TMPA_IIN[3],
          TMPA_IIN[4],
          TMPA_IIN[5],
          TMPA_IIN[6],
          TMPA_IIN[7],
          TMPA_IIN[8],
          block,
          (hit.maxX + hit.minX) / 2,
          (hit.maxY + hit.minY) / 2,
          (hit.maxZ + hit.minZ) / 2,
          BLOCK_RESTITUTION[blockCode],
          BLOCK_FRICTION[blockCode],
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          MANIFOLD,
          axis === 2,
        );
      }
    }
  }

  public presolveCollisions(): void {
    TERRAIN_CONTACTS_SET.solve(ACTIVE_ITER_COUNT);
    FIXED_CONTACTS_SET.solve(ACTIVE_ITER_COUNT);
    ACTIVE_CONTACTS_SET.solve(ACTIVE_ITER_COUNT);
  }
  public solveCollisions(): void {
    ACTIVE_CONTACTS_SET.solve(ACTIVE_ITER_COUNT);
    TERRAIN_CONTACTS_SET.solve(ACTIVE_ITER_COUNT);
    FIXED_CONTACTS_SET.solve(ACTIVE_ITER_COUNT);
  }
}
