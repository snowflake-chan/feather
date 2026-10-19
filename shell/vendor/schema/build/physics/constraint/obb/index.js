"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBBContact = void 0;
const voxel_collision_1 = require("../../../voxel/voxel-collision");
const def_1 = require("./def");
const collision_filter_1 = require("../../collision-filter");
const prepare_bodies_1 = require("../../prepare-bodies");
const def_2 = require("../../def");
const obb_collide_1 = require("./obb-collide");
const contact_1 = require("./contact");
const physics_schema_1 = require("../../physics-schema");
const contact_controller_1 = require("../../contact-controller");
const MANIFOLD = new obb_collide_1.ContactManifold();
const ACTIVE_CONTACTS_SET = new contact_1.ContactSet('active');
const FIXED_CONTACTS_SET = new contact_1.ContactSet('fixed');
const TERRAIN_CONTACTS_SET = new contact_1.ContactSet('terrain');
const TMPA_R = (0, def_1.ALLOC)(9);
const TMPB_R = (0, def_1.ALLOC)(9);
const TMPA_IIN = (0, def_1.ALLOC)(9);
const TMPB_IIN = (0, def_1.ALLOC)(9);
class OBBContact {
    constructor() {
        this.contactTerrains = [];
        this.contactTerrainsAxis = [];
    }
    clearContacts() {
        TERRAIN_CONTACTS_SET.clear();
        FIXED_CONTACTS_SET.clear();
        ACTIVE_CONTACTS_SET.clear();
        this.contactTerrains.length = this.contactTerrainsAxis.length = 0;
    }
    sortContacts() { }
    addBodiesContactRecord(contactSet) {
        const { contacts, type } = contactSet;
        for (let i = 0; i < contacts.length; i++) {
            const c = contacts[i];
            const { ai, bi } = c;
            const aRecord = prepare_bodies_1.ACTIVE_CONTACTS[ai];
            const bRecord = type === 'active' ? prepare_bodies_1.ACTIVE_CONTACTS[bi] : prepare_bodies_1.FIXED_CONTACTS[bi];
            if (!aRecord && !bRecord) {
                continue;
            }
            const aId = prepare_bodies_1.ACTIVE_BODIES[ai].id;
            const bId = type === 'active' ? prepare_bodies_1.ACTIVE_BODIES[bi].id : prepare_bodies_1.FIXED_BODIES[bi].id;
            if (aRecord) {
                (0, contact_controller_1.addBodyContactRecord)(aRecord, bId, -c.nx, -c.ny, -c.nz, c.fx, c.fy, c.fz);
            }
            if (bRecord) {
                (0, contact_controller_1.addBodyContactRecord)(bRecord, aId, c.nx, c.ny, c.nz, -c.fx, -c.fy, -c.fz);
            }
        }
    }
    addVoxelContactList(record, terrainBox, px, py, pz, rx, ry, rz, hsx, hsy, hsz, xAxis, yAxis, zAxis, axis) {
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
                    const posDiff = [px - x - 0.5, py - y - 0.5, pz - z - 0.5];
                    // 查看地形三个面为分离轴的投影是否分离
                    // 如果有分离的场景则没有碰撞到这个地形
                    let len = Math.abs(posDiff[0]);
                    let ra = 0.5;
                    let rb = Math.abs(xAxis[0]) * hsx +
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
                    len = Math.abs(xAxis[0] * posDiff[0] +
                        xAxis[1] * posDiff[1] +
                        xAxis[2] * posDiff[2]);
                    ra = hsx;
                    rb =
                        0.5 *
                            (Math.abs(xAxis[0]) + Math.abs(xAxis[1]) + Math.abs(xAxis[2]));
                    if (len - ra - rb > 0) {
                        continue;
                    }
                    len = Math.abs(yAxis[0] * posDiff[0] +
                        yAxis[1] * posDiff[1] +
                        yAxis[2] * posDiff[2]);
                    ra = hsy;
                    rb =
                        0.5 *
                            (Math.abs(yAxis[0]) + Math.abs(yAxis[1]) + Math.abs(yAxis[2]));
                    if (len - ra - rb > 0) {
                        continue;
                    }
                    len = Math.abs(zAxis[0] * posDiff[0] +
                        zAxis[1] * posDiff[1] +
                        zAxis[2] * posDiff[2]);
                    ra = hsz;
                    rb =
                        0.5 *
                            (Math.abs(zAxis[0]) + Math.abs(zAxis[1]) + Math.abs(zAxis[2]));
                    if (len - ra - rb > 0) {
                        continue;
                    }
                    // 经过6个分离轴的检查确认此地形碰撞到了这个active刚体
                    const entry = physics_schema_1.VoxelContactSchema.alloc();
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
    updateContactIndex() {
        this.addBodiesContactRecord(ACTIVE_CONTACTS_SET);
        this.addBodiesContactRecord(FIXED_CONTACTS_SET);
        const { contacts } = TERRAIN_CONTACTS_SET;
        const { contactTerrains, contactTerrainsAxis } = this;
        for (let i = 0; i < contacts.length; ++i) {
            const c = contacts[i];
            const { ai } = c;
            const record = prepare_bodies_1.ACTIVE_CONTACTS[ai];
            if (!record) {
                continue;
            }
            const { px, py, pz } = prepare_bodies_1.ACTIVE_BODIES[ai];
            const hsx = prepare_bodies_1.HSX[ai];
            const hsy = prepare_bodies_1.HSY[ai];
            const hsz = prepare_bodies_1.HSZ[ai];
            const rx = prepare_bodies_1.RX[ai];
            const ry = prepare_bodies_1.RY[ai];
            const rz = prepare_bodies_1.RZ[ai];
            (0, def_1.calcRotation)(TMPA_R, prepare_bodies_1.QX[ai], prepare_bodies_1.QY[ai], prepare_bodies_1.QZ[ai], prepare_bodies_1.QW[ai]);
            // copy contacts
            const f0 = record.voxel.length;
            this.addVoxelContactList(record, contactTerrains[i], px, py, pz, rx, ry, rz, hsx, hsy, hsz, [TMPA_R[0], TMPA_R[1], TMPA_R[2]], [TMPA_R[3], TMPA_R[4], TMPA_R[5]], [TMPA_R[6], TMPA_R[7], TMPA_R[8]], contactTerrainsAxis[i]);
            // update force accumulator
            if (f0 < record.voxel.length) {
                const voxelContact = record.voxel[f0];
                voxelContact.fx = c.fx;
                voxelContact.fy = c.fy;
                voxelContact.fz = c.fz;
            }
        }
    }
    propagateLocks() {
        ACTIVE_CONTACTS_SET.propagateLocks();
    }
    processActiveContact(ai, bi, filter) {
        // 碰撞组过滤
        if (!(0, collision_filter_1.testCollisionFilter)(filter, prepare_bodies_1.ACTIVE_GROUP[ai], prepare_bodies_1.ACTIVE_GROUP[bi])) {
            return;
        }
        (0, def_1.calcRotation)(TMPA_R, prepare_bodies_1.QX[ai], prepare_bodies_1.QY[ai], prepare_bodies_1.QZ[ai], prepare_bodies_1.QW[ai]);
        (0, def_1.calcRotation)(TMPB_R, prepare_bodies_1.QX[bi], prepare_bodies_1.QY[bi], prepare_bodies_1.QZ[bi], prepare_bodies_1.QW[bi]);
        MANIFOLD.numPoints = 0;
        (0, obb_collide_1.OBBOBBintersect)(prepare_bodies_1.X0[ai], prepare_bodies_1.Y0[ai], prepare_bodies_1.Z0[ai], prepare_bodies_1.HSX[ai], prepare_bodies_1.HSY[ai], prepare_bodies_1.HSZ[ai], TMPA_R[0], TMPA_R[1], TMPA_R[2], TMPA_R[3], TMPA_R[4], TMPA_R[5], TMPA_R[6], TMPA_R[7], TMPA_R[8], prepare_bodies_1.X0[bi], prepare_bodies_1.Y0[bi], prepare_bodies_1.Z0[bi], prepare_bodies_1.HSX[bi], prepare_bodies_1.HSY[bi], prepare_bodies_1.HSZ[bi], TMPB_R[0], TMPB_R[1], TMPB_R[2], TMPB_R[3], TMPB_R[4], TMPB_R[5], TMPB_R[6], TMPB_R[7], TMPB_R[8], MANIFOLD);
        if (!MANIFOLD.numPoints) {
            return;
        }
        const bodyA = prepare_bodies_1.ACTIVE_BODIES[ai];
        if (bodyA.flags & physics_schema_1.RigidBodyFlags.PLAYER) {
            TMPA_IIN.fill(0);
        }
        else {
            (0, def_1.getInverseInertia)(TMPA_IIN, ai, TMPA_R);
        }
        const bodyB = prepare_bodies_1.ACTIVE_BODIES[bi];
        if (bodyB.flags & physics_schema_1.RigidBodyFlags.PLAYER) {
            TMPB_IIN.fill(0);
        }
        else {
            (0, def_1.getInverseInertia)(TMPB_IIN, bi, TMPB_R);
        }
        ACTIVE_CONTACTS_SET.push(ai, prepare_bodies_1.X0[ai], prepare_bodies_1.Y0[ai], prepare_bodies_1.Z0[ai], prepare_bodies_1.CR[ai], bodyA.friction, prepare_bodies_1.DX[ai], prepare_bodies_1.DY[ai], prepare_bodies_1.DZ[ai], prepare_bodies_1.AX[ai], prepare_bodies_1.AY[ai], prepare_bodies_1.AZ[ai], prepare_bodies_1.INV_MASS[ai], TMPA_IIN[0], TMPA_IIN[1], TMPA_IIN[2], TMPA_IIN[3], TMPA_IIN[4], TMPA_IIN[5], TMPA_IIN[6], TMPA_IIN[7], TMPA_IIN[8], bi, prepare_bodies_1.X0[bi], prepare_bodies_1.Y0[bi], prepare_bodies_1.Z0[bi], prepare_bodies_1.CR[bi], bodyB.friction, prepare_bodies_1.DX[bi], prepare_bodies_1.DY[bi], prepare_bodies_1.DZ[bi], prepare_bodies_1.AX[bi], prepare_bodies_1.AY[bi], prepare_bodies_1.AZ[bi], prepare_bodies_1.INV_MASS[bi], TMPB_IIN[0], TMPB_IIN[1], TMPB_IIN[2], TMPB_IIN[3], TMPB_IIN[4], TMPB_IIN[5], TMPB_IIN[6], TMPB_IIN[7], TMPB_IIN[8], MANIFOLD);
    }
    processFixedContact(ai, fi, filter) {
        if (!(0, collision_filter_1.testCollisionFilter)(filter, prepare_bodies_1.ACTIVE_GROUP[ai], prepare_bodies_1.FIX_GROUP[fi])) {
            return;
        }
        (0, def_1.calcRotation)(TMPA_R, prepare_bodies_1.QX[ai], prepare_bodies_1.QY[ai], prepare_bodies_1.QZ[ai], prepare_bodies_1.QW[ai]);
        (0, def_1.calcRotation)(TMPB_R, prepare_bodies_1.FIX_QX[fi], prepare_bodies_1.FIX_QY[fi], prepare_bodies_1.FIX_QZ[fi], prepare_bodies_1.FIX_QW[fi]);
        MANIFOLD.numPoints = 0;
        (0, obb_collide_1.OBBOBBintersect)(prepare_bodies_1.X0[ai], prepare_bodies_1.Y0[ai], prepare_bodies_1.Z0[ai], prepare_bodies_1.HSX[ai], prepare_bodies_1.HSY[ai], prepare_bodies_1.HSZ[ai], TMPA_R[0], TMPA_R[1], TMPA_R[2], TMPA_R[3], TMPA_R[4], TMPA_R[5], TMPA_R[6], TMPA_R[7], TMPA_R[8], prepare_bodies_1.FIX_X0[fi], prepare_bodies_1.FIX_Y0[fi], prepare_bodies_1.FIX_Z0[fi], prepare_bodies_1.FIX_HSX[fi], prepare_bodies_1.FIX_HSY[fi], prepare_bodies_1.FIX_HSZ[fi], TMPB_R[0], TMPB_R[1], TMPB_R[2], TMPB_R[3], TMPB_R[4], TMPB_R[5], TMPB_R[6], TMPB_R[7], TMPB_R[8], MANIFOLD);
        if (!MANIFOLD.numPoints) {
            return;
        }
        const bodyA = prepare_bodies_1.ACTIVE_BODIES[ai];
        if (bodyA.flags & physics_schema_1.RigidBodyFlags.PLAYER) {
            TMPA_IIN.fill(0);
        }
        else {
            (0, def_1.getInverseInertia)(TMPA_IIN, ai, TMPA_R);
        }
        FIXED_CONTACTS_SET.push(ai, prepare_bodies_1.X0[ai], prepare_bodies_1.Y0[ai], prepare_bodies_1.Z0[ai], prepare_bodies_1.CR[ai], bodyA.friction, prepare_bodies_1.DX[ai], prepare_bodies_1.DY[ai], prepare_bodies_1.DZ[ai], prepare_bodies_1.AX[ai], prepare_bodies_1.AY[ai], prepare_bodies_1.AZ[ai], prepare_bodies_1.INV_MASS[ai], TMPA_IIN[0], TMPA_IIN[1], TMPA_IIN[2], TMPA_IIN[3], TMPA_IIN[4], TMPA_IIN[5], TMPA_IIN[6], TMPA_IIN[7], TMPA_IIN[8], fi, prepare_bodies_1.FIX_X0[fi], prepare_bodies_1.FIX_Y0[fi], prepare_bodies_1.FIX_Z0[fi], prepare_bodies_1.FIX_CR[fi], prepare_bodies_1.FIXED_BODIES[fi].friction, prepare_bodies_1.FIX_DX[fi], prepare_bodies_1.FIX_DY[fi], prepare_bodies_1.FIX_DZ[fi], prepare_bodies_1.FIX_AX[fi], prepare_bodies_1.FIX_AY[fi], prepare_bodies_1.FIX_AZ[fi], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, MANIFOLD);
    }
    findTerrainContacts(geom) {
        for (let i = 0; i < prepare_bodies_1.ACTIVE_BOXES.length; ++i) {
            const box = prepare_bodies_1.ACTIVE_BOXES[i];
            prepare_bodies_1.TERRAIN_HITS.length = 0;
            (0, voxel_collision_1.collideSolid)(prepare_bodies_1.TERRAIN_HITS, geom, box.minX - def_2.VOXEL_EPSILON, box.minY - def_2.VOXEL_EPSILON, box.minZ - def_2.VOXEL_EPSILON, box.maxX + def_2.VOXEL_EPSILON, box.maxY + def_2.VOXEL_EPSILON, box.maxZ + def_2.VOXEL_EPSILON);
            if (prepare_bodies_1.TERRAIN_HITS.length === 0) {
                continue;
            }
            for (let j = 0; j < prepare_bodies_1.TERRAIN_HITS.length; ++j) {
                // 构造地形shape
                const hit = prepare_bodies_1.TERRAIN_HITS[j];
                const block = hit.block;
                const blockCode = block & 0xfff;
                (0, def_1.calcRotation)(TMPA_R, prepare_bodies_1.QX[i], prepare_bodies_1.QY[i], prepare_bodies_1.QZ[i], prepare_bodies_1.QW[i]);
                MANIFOLD.numPoints = 0;
                (0, obb_collide_1.OBBOBBintersect)(prepare_bodies_1.X0[i], prepare_bodies_1.Y0[i], prepare_bodies_1.Z0[i], prepare_bodies_1.HSX[i], prepare_bodies_1.HSY[i], prepare_bodies_1.HSZ[i], TMPA_R[0], TMPA_R[1], TMPA_R[2], TMPA_R[3], TMPA_R[4], TMPA_R[5], TMPA_R[6], TMPA_R[7], TMPA_R[8], (hit.maxX + hit.minX) / 2, (hit.maxY + hit.minY) / 2, (hit.maxZ + hit.minZ) / 2, (hit.maxX - hit.minX) / 2, (hit.maxY - hit.minY) / 2, (hit.maxZ - hit.minZ) / 2, 1, 0, 0, 0, 1, 0, 0, 0, 1, MANIFOLD, true, hit.faces);
                if (!MANIFOLD.numPoints) {
                    continue;
                }
                let axis = 0;
                switch (MANIFOLD.separatingAxisIndex) {
                    case 3:
                        if (MANIFOLD.right) {
                            axis = -1;
                        }
                        else {
                            axis = 1;
                        }
                        break;
                    case 4:
                        if (MANIFOLD.right) {
                            axis = -2;
                        }
                        else {
                            axis = 2;
                        }
                        break;
                    case 5:
                        if (MANIFOLD.right) {
                            axis = -3;
                        }
                        else {
                            axis = 3;
                        }
                        break;
                }
                if (axis === 0 || hit.faces === 0) {
                    continue;
                }
                this.contactTerrains.push(hit);
                this.contactTerrainsAxis.push(axis);
                const bodyA = prepare_bodies_1.ACTIVE_BODIES[i];
                if (bodyA.flags & physics_schema_1.RigidBodyFlags.PLAYER) {
                    TMPA_IIN.fill(0);
                }
                else {
                    (0, def_1.getInverseInertia)(TMPA_IIN, i, TMPA_R);
                }
                TERRAIN_CONTACTS_SET.push(i, prepare_bodies_1.X0[i], prepare_bodies_1.Y0[i], prepare_bodies_1.Z0[i], prepare_bodies_1.CR[i], bodyA.friction, prepare_bodies_1.DX[i], prepare_bodies_1.DY[i], prepare_bodies_1.DZ[i], prepare_bodies_1.AX[i], prepare_bodies_1.AY[i], prepare_bodies_1.AZ[i], prepare_bodies_1.INV_MASS[i], TMPA_IIN[0], TMPA_IIN[1], TMPA_IIN[2], TMPA_IIN[3], TMPA_IIN[4], TMPA_IIN[5], TMPA_IIN[6], TMPA_IIN[7], TMPA_IIN[8], block, (hit.maxX + hit.minX) / 2, (hit.maxY + hit.minY) / 2, (hit.maxZ + hit.minZ) / 2, prepare_bodies_1.BLOCK_RESTITUTION[blockCode], prepare_bodies_1.BLOCK_FRICTION[blockCode], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, MANIFOLD, axis === 2);
            }
        }
    }
    presolveCollisions() {
        TERRAIN_CONTACTS_SET.solve(def_2.ACTIVE_ITER_COUNT);
        FIXED_CONTACTS_SET.solve(def_2.ACTIVE_ITER_COUNT);
        ACTIVE_CONTACTS_SET.solve(def_2.ACTIVE_ITER_COUNT);
    }
    solveCollisions() {
        ACTIVE_CONTACTS_SET.solve(def_2.ACTIVE_ITER_COUNT);
        TERRAIN_CONTACTS_SET.solve(def_2.ACTIVE_ITER_COUNT);
        FIXED_CONTACTS_SET.solve(def_2.ACTIVE_ITER_COUNT);
    }
}
exports.OBBContact = OBBContact;
