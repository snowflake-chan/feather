"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_RUN_TAP_TIME = exports.PLAYER_FLIGHT_TAP_TIME = exports.PLAYER_RESTITUTION = exports.PLAYER_FRICTION = exports.PLAYER_MASS = exports.PLAYER_HEIGHT = exports.PLAYER_WIDTH = void 0;
exports.calcPlayerLookDirection = calcPlayerLookDirection;
exports.applyPlayerInputForces = applyPlayerInputForces;
exports.updatePlayerPhysics = updatePlayerPhysics;
const gl_matrix_1 = require("gl-matrix");
const physics_schema_1 = require("../physics/physics-schema");
const player_schema_1 = require("./player-schema");
const id_1 = require("@box/utils/id");
const body_rbush_1 = require("../physics/body-rbush");
const voxel_collision_1 = require("../voxel/voxel-collision");
exports.PLAYER_WIDTH = 0.45;
exports.PLAYER_HEIGHT = 1.1;
exports.PLAYER_MASS = 1.75;
exports.PLAYER_FRICTION = 0.1;
exports.PLAYER_RESTITUTION = 0;
exports.PLAYER_FLIGHT_TAP_TIME = 200;
exports.PLAYER_RUN_TAP_TIME = 200;
const forwardAxis = gl_matrix_1.vec3.create();
const rightAxis = gl_matrix_1.vec3.create();
const upAxis = gl_matrix_1.vec3.fromValues(0, 1, 0);
const ACCEL = gl_matrix_1.vec3.create();
let INV_DAMPING = 1;
let GRAVITY_BOOST = 0;
let GRAVITY_FLOAT = 0;
let ACCEL_SCALE = 0.1;
// apply force to body
function applyForce(body, axis, maxSpeed, accel) {
    const { vx, vy, vz } = body;
    const ax = axis[0];
    const ay = axis[1];
    const az = axis[2];
    const v = ax * vx + ay * vy + az * vz;
    if (accel < 0) {
        gl_matrix_1.vec3.scaleAndAdd(ACCEL, ACCEL, axis, accel + Math.max(0, -maxSpeed - v));
    }
    else {
        gl_matrix_1.vec3.scaleAndAdd(ACCEL, ACCEL, axis, accel + Math.min(0, maxSpeed - v));
    }
}
// clears all forces along axis, using accel as an acceleration weight
function clearForce(body, axis, accel) {
    const { vx, vy, vz } = body;
    const ax = axis[0];
    const ay = axis[1];
    const az = axis[2];
    const v = ax * vx + ay * vy + az * vz;
    gl_matrix_1.vec3.scaleAndAdd(ACCEL, ACCEL, axis, -accel * v);
}
function applyJump(velocity, power) {
    // is this really the right way to do this?  seems like it can cancel out potentially huge negative forces....
    velocity[1] = power;
}
function calcPlayerLookDirection(v, angle) {
    const pitch = (2 * Math.PI * angle) / 256;
    v[0] = -Math.cos(pitch);
    v[1] = 0;
    v[2] = -Math.sin(pitch);
}
/**
 * 根据用户输入和api数据矫正，计算用户物理状态
 * 包括朝向，速度，物理模型状态
 * @param input
 * @param player
 * @param body
 * @returns
 */
function applyPlayerInputForce(input, player, body) {
    const { state, angle } = input;
    let flyState = (0, player_schema_1.playerFlyState)(state);
    const walkState = (0, player_schema_1.playerWalkState)(state);
    let jumpState = (0, player_schema_1.playerJumpState)(state);
    let buttonState = (0, player_schema_1.playerButtonState)(state);
    // early out if animated
    // 动画不做力的计算
    if (body.flags & physics_schema_1.RigidBodyFlags.ANIMATED) {
        input.state = (0, player_schema_1.playerStateBits)(player_schema_1.PlayerFlyState.FLYING, player_schema_1.PlayerWalkState.WALK, player_schema_1.PlayerJumpState.FALL, buttonState & ~player_schema_1.PlayerButtonState.CROUCH);
        return;
    }
    // clear force accumulator
    gl_matrix_1.vec3.set(ACCEL, 0, 0, 0);
    // apply frame correction for moving platforms
    const { platformX, platformY, platformZ } = player;
    body.vx -= platformX;
    body.vy -= platformY;
    body.vz -= platformZ;
    // allow flight overrides player flight control
    if (!(player.flags & player_schema_1.PlayerFlags.ALLOW_FLIGHT)) {
        flyState = player_schema_1.PlayerFlyState.NOT_FLYING;
    }
    // compute local frame
    calcPlayerLookDirection(forwardAxis, angle);
    // apply constraints based on movement
    // 根据攀爬撞墙方向重新调整人物朝向
    if (player.physGround &&
        jumpState === player_schema_1.PlayerJumpState.GROUND &&
        buttonState & player_schema_1.PlayerButtonState.CROUCH &&
        buttonState & player_schema_1.PlayerButtonState.WALK) {
        if ((forwardAxis[0] < 0 &&
            player.occupancy & player_schema_1.PlayerOccupancyFlags.EDGE_X_NEG) ||
            (forwardAxis[0] > 0 && player.occupancy & player_schema_1.PlayerOccupancyFlags.EDGE_X_POS)) {
            forwardAxis[0] = 0;
        }
        if ((forwardAxis[2] < 0 &&
            player.occupancy & player_schema_1.PlayerOccupancyFlags.EDGE_Z_NEG) ||
            (forwardAxis[2] > 0 && player.occupancy & player_schema_1.PlayerOccupancyFlags.EDGE_Z_POS)) {
            forwardAxis[2] = 0;
        }
        if (forwardAxis[0] === 0 && forwardAxis[2] === 0) {
            forwardAxis[0] = 1;
            buttonState &= ~player_schema_1.PlayerButtonState.WALK;
        }
        gl_matrix_1.vec3.normalize(forwardAxis, forwardAxis);
    }
    rightAxis[0] = -forwardAxis[2];
    rightAxis[1] = 0;
    rightAxis[2] = forwardAxis[0];
    // update rigid body flags
    // 根据人物输入状态调整物理模型状态
    if (player.flags & player_schema_1.PlayerFlags.SPECTATOR) {
        body.flags =
            (body.flags & ~(physics_schema_1.RigidBodyFlags.GRAVITY | physics_schema_1.RigidBodyFlags.COLLIDES)) |
                physics_schema_1.RigidBodyFlags.PLAYER;
        flyState = player_schema_1.PlayerFlyState.FLYING;
    }
    else if (flyState === player_schema_1.PlayerFlyState.FLYING) {
        body.flags =
            (body.flags & ~physics_schema_1.RigidBodyFlags.GRAVITY) |
                physics_schema_1.RigidBodyFlags.COLLIDES |
                physics_schema_1.RigidBodyFlags.PLAYER;
    }
    else {
        body.flags =
            body.flags |
                physics_schema_1.RigidBodyFlags.COLLIDES |
                physics_schema_1.RigidBodyFlags.PLAYER |
                physics_schema_1.RigidBodyFlags.GRAVITY;
    }
    // convert user inputs to forces
    let speed = 0;
    let accel = 0;
    // jump parameters
    const allowJump = !!(player.flags & player_schema_1.PlayerFlags.ALLOW_JUMP);
    const allowDoubleJump = allowJump && !!(player.flags & player_schema_1.PlayerFlags.ALLOW_DOUBLE_JUMP);
    // compute movement speed based on player input
    switch (walkState) {
        case player_schema_1.PlayerWalkState.CROUCH:
            if (flyState & player_schema_1.PlayerFlyState.FLYING) {
                speed = player.walkSpeed;
                accel = player.walkAcceleration;
            }
            else {
                speed = player.crouchSpeed;
                accel = player.crouchAcceleration;
            }
            break;
        case player_schema_1.PlayerWalkState.WALK:
            speed = player.walkSpeed;
            accel = player.walkAcceleration;
            break;
        case player_schema_1.PlayerWalkState.RUN:
            speed = player.runSpeed;
            accel = player.runAcceleration;
            break;
    }
    if (flyState === player_schema_1.PlayerFlyState.NOT_FLYING) {
        if (player.physFluid > 1 / 16) {
            jumpState = player_schema_1.PlayerJumpState.SWIM;
            speed = player.swimSpeed;
            accel = player.swimAcceleration;
            if (buttonState & player_schema_1.PlayerButtonState.JUMP) {
                if (allowJump && (player.physGround || player.physFluid < 0.5)) {
                    body.vy = 0.5 * player.jumpPower;
                }
                else {
                    applyForce(body, upAxis, speed, accel);
                }
            }
            if (buttonState & player_schema_1.PlayerButtonState.CROUCH) {
                applyForce(body, upAxis, speed, -accel);
            }
        }
        else if (player.physGround) {
            jumpState = player_schema_1.PlayerJumpState.GROUND;
            if (buttonState & player_schema_1.PlayerButtonState.JUMP) {
                if (allowJump && walkState !== player_schema_1.PlayerWalkState.CROUCH) {
                    body.vy = player.jumpPower;
                }
                else {
                    // TODO: Jump while crouching, could do a roll or something
                }
            }
        }
        else {
            switch (jumpState) {
                case player_schema_1.PlayerJumpState.FALL:
                    if (allowDoubleJump && buttonState & player_schema_1.PlayerButtonState.JUMP) {
                        body.vy = player.doubleJumpPower;
                        jumpState = player_schema_1.PlayerJumpState.DOUBLE_JUMP;
                    }
                    break;
                case player_schema_1.PlayerJumpState.DOUBLE_JUMP:
                    // double jump burned.  just fall
                    break;
                default:
                    jumpState = player_schema_1.PlayerJumpState.JUMP;
                    if (!(buttonState & player_schema_1.PlayerButtonState.JUMP)) {
                        jumpState = player_schema_1.PlayerJumpState.FALL;
                    }
                    break;
            }
            // scale speed based on jump factor
            speed *= player.jumpSpeedFactor;
            accel *= player.jumpAccelerationFactor;
        }
    }
    else {
        // not physical mode
        jumpState = player_schema_1.PlayerJumpState.JUMP;
        speed *= player.flySpeed;
        accel *= player.flyAcceleration;
        if (buttonState & player_schema_1.PlayerButtonState.JUMP) {
            applyForce(body, upAxis, speed, accel);
        }
        else if (buttonState & player_schema_1.PlayerButtonState.CROUCH) {
            applyForce(body, upAxis, speed, -accel);
        }
        else {
            clearForce(body, upAxis, accel);
        }
    }
    // 走路的时候加速，不走的时候会按照当前速度减速
    if (buttonState & player_schema_1.PlayerButtonState.WALK) {
        applyForce(body, forwardAxis, speed, accel);
    }
    else {
        if (buttonState & player_schema_1.PlayerButtonState.CROUCH) {
            clearForce(body, forwardAxis, 1);
        }
        else {
            clearForce(body, forwardAxis, accel);
        }
    }
    if (buttonState & player_schema_1.PlayerButtonState.CROUCH) {
        clearForce(body, rightAxis, 1);
    }
    else {
        clearForce(body, rightAxis, accel);
    }
    input.state = (0, player_schema_1.playerStateBits)(flyState, walkState, jumpState, buttonState);
    body.vx += ACCEL[0] * ACCEL_SCALE + INV_DAMPING * platformX;
    body.vy += ACCEL[1] * ACCEL_SCALE + INV_DAMPING * platformY;
    body.vz += ACCEL[2] * ACCEL_SCALE + INV_DAMPING * platformZ;
}
// apply all player input forces
function applyPlayerInputForces(bodies, players, inputs, dt, velocityDamping, gravity) {
    if (isNaN(velocityDamping) || velocityDamping < 1e-6) {
        ACCEL_SCALE = dt;
        INV_DAMPING = 1;
    }
    else {
        const s = Math.exp(-dt * velocityDamping);
        ACCEL_SCALE = (1 - s) / velocityDamping;
        INV_DAMPING = 1 / s;
    }
    if (isNaN(gravity) || gravity > -1e-6) {
        GRAVITY_BOOST = 0;
        GRAVITY_FLOAT = 0;
    }
    else {
        GRAVITY_BOOST = 1 / dt;
        GRAVITY_FLOAT = -gravity;
    }
    (0, id_1.zipId)(applyPlayerInputForce, inputs, players, bodies);
}
function testCollide(voxelCollision, bodyCollision, id, minX, minY, minZ, maxX, maxY, maxZ) {
    return ((0, voxel_collision_1.testCollideSolid)(voxelCollision, minX, minY, minZ, maxX, maxY, maxZ) ||
        (0, body_rbush_1.testBodyRBush)(bodyCollision, minX, minY, minZ, maxX, maxY, maxZ, id));
}
function computeEdgeStepFlags(voxelCollision, bodyCollision, id, stepHeight, sx, sy, sz, rx, rz, lox, loy, loz, hix, hiy, hiz) {
    if (!testCollide(voxelCollision, bodyCollision, id, lox + sx + rx, loy - 0.5, loz + sz + rz, hix - sx + rx, loy, hiz - sz + rz)) {
        return player_schema_1.PlayerOccupancyFlags.EDGE_BIT;
        // } else if (
        //     !testCollide(voxelCollision, bodyCollision, id,
        //         lox + 2 * rx, loy + stepHeight, loz + 2 * rz,
        //         hix + 2 * rx, hiy + stepHeight, hiz + 2 * rz) &&
        //     testCollide(voxelCollision, bodyCollision, id,
        //         lox + sx + 2 * rx, loy + sy,         loz + sz + 2 * rz,
        //         hix - sx + 2 * rx, loy + stepHeight, hiz - sz + 2 * rz)) {
        //     return PlayerOccupancyFlags.STEP_BIT;
    }
    return 0;
}
function updatePlayerPhysics(blockIndex, players, playerInputs, contacts, bodies, voxelCollision, bodyCollision) {
    let bodyPtr = 0;
    const bodyEnd = bodies.length - 1;
    for (let i = 0; i < players.length; ++i) {
        const player = players[i];
        player.platformX = player.platformY = player.platformZ = 0;
        player.physFluid = 0;
        player.physGround = false;
        const record = (0, id_1.getById)(contacts, player.id);
        if (!record) {
            continue;
        }
        // unpack record
        const { voxel, body, fluidVolumeFraction } = record;
        // check if player is in a fluid
        let volumeFraction = 0;
        for (let j = 0; j < fluidVolumeFraction.length; ++j) {
            volumeFraction += fluidVolumeFraction[j];
        }
        player.physFluid = volumeFraction;
        // handle ground contact with terrain
        player.physGround = false;
        player.platformX = 0;
        player.platformZ = 0;
        let maxLambda = 0;
        for (let j = 0; j < voxel.length; ++j) {
            if (voxel[j].axis === 2) {
                player.physGround = true;
                const l = Math.abs(voxel[j].fy);
                maxLambda += l;
                const block = voxel[j].b;
                const blockCode = block & 0xfff;
                const du = l * blockIndex.velocity[3 * blockCode];
                const dv = l * blockIndex.velocity[3 * blockCode + 2];
                let vz = du;
                let vx = dv;
                switch (block >>> 14) {
                    case 0:
                        break;
                    case 1:
                        vz = dv;
                        vx = -du;
                        break;
                    case 2:
                        vz = -du;
                        vx = -dv;
                        break;
                    case 3:
                        vz = -dv;
                        vx = du;
                        break;
                }
                player.platformX += vx;
                player.platformZ += vz;
            }
        }
        if (maxLambda > 0) {
            player.platformX /= maxLambda;
            player.platformZ /= maxLambda;
        }
        // handle contact with moving bodies
        for (let j = 0; j < body.length; ++j) {
            const bContact = body[j];
            if (!!bContact.ny && bContact.fy > maxLambda) {
                player.physGround = true;
                maxLambda = bContact.fy;
                const other = (0, id_1.getById)(bodies, bContact.otherId);
                if (other) {
                    player.platformX = other.vx;
                    player.platformY = other.vy;
                    player.platformZ = other.vz;
                }
            }
        }
        let occupancyFlags = 0;
        if (player.physGround) {
            // compute special movement options for each player
            const id = player.id;
            const input = playerInputs[i];
            // if player is crouching check for walk off ledge
            if ((input.state & player_schema_1.PlayerWalkState.MASK) === player_schema_1.PlayerWalkState.CROUCH) {
                const b = (0, id_1.indexEqRange)(bodies, id, bodyPtr, bodyEnd);
                if (b >= 0) {
                    const playerBody = bodies[b];
                    bodyPtr = b;
                    const stepHeight = player.stepHeight;
                    const { px, py, pz, rx, ry, rz } = playerBody;
                    const lox = px - rx;
                    const loy = py - ry;
                    const loz = pz - rz;
                    const hix = px + rx;
                    const hiy = py + ry;
                    const hiz = pz + rz;
                    const sx = 0.25 * rx;
                    const sy = Math.min(0.25 * ry, stepHeight);
                    const sz = 0.25 * rz;
                    occupancyFlags =
                        (computeEdgeStepFlags(voxelCollision, bodyCollision, id, stepHeight, sx, sy, sz, -rx, 0, lox, loy, loz, hix, hiy, hiz) <<
                            player_schema_1.PlayerOccupancyFlags.X_NEG_SHIFT) |
                            (computeEdgeStepFlags(voxelCollision, bodyCollision, id, stepHeight, sx, sy, sz, rx, 0, lox, loy, loz, hix, hiy, hiz) <<
                                player_schema_1.PlayerOccupancyFlags.X_POS_SHIFT) |
                            (computeEdgeStepFlags(voxelCollision, bodyCollision, id, stepHeight, sx, sy, sz, 0, -rz, lox, loy, loz, hix, hiy, hiz) <<
                                player_schema_1.PlayerOccupancyFlags.Z_NEG_SHIFT) |
                            (computeEdgeStepFlags(voxelCollision, bodyCollision, id, stepHeight, sx, sy, sz, 0, rz, lox, loy, loz, hix, hiy, hiz) <<
                                player_schema_1.PlayerOccupancyFlags.Z_POS_SHIFT);
                }
            }
        }
        player.occupancy = occupancyFlags;
    }
}
//# sourceMappingURL=player-move.js.map