import { GameServerState } from '../game-server-schema';
import { destroyEntityId, createEntityId } from '../entity/entity-controller';
import { SeedLinkSchema } from './seed-schema';
import { Seed } from '@box/schema/project/hot-schema';
import {
  RigidBodySchema,
  RigidBodyFlags,
} from '@box/schema/physics/physics-schema';
import {
  NetModelSetSchema,
  NetModelSchema,
} from '@box/schema/mesh/model-schema';
import { DamageSchema } from '@box/schema/damage/damage-schema';
import { copyConfigToDamage } from '../damage/damage-server';
import { MAX_BODIES } from '@box/schema/physics/physics-solve';
import { resolveActiveSeedMeshId } from './active-seed-mesh';

function clearSeeds(state: GameServerState) {
  // have to do this at start of tick
  NetModelSetSchema.assign(state.replica.models, NetModelSetSchema.identity);

  for (let i = 0; i < state.bodies.length; ++i) {
    const b = state.bodies[i];
    if ((b.flags & RigidBodyFlags.PLAYER) === 0) {
      destroyEntityId(state, b.id);
    }
  }
}

function instantiateSeed(state: GameServerState, seedId: string, seed: Seed) {
  // create a new seed
  const id = createEntityId(state);

  // update links and indexes
  const link = SeedLinkSchema.alloc();
  link.id = id;
  link.seedId = seedId;
  state.seed.entityToSeed.push(link);
  state.seed.seedToEntity[seedId] = id;

  // allocate damage component
  const damageConfig = seed.damage;
  if (damageConfig.enabled) {
    const damage = DamageSchema.alloc();
    damage.id = id;
    copyConfigToDamage(damage, damageConfig);
    state.replica.damage.push(damage);
  }

  // create mesh
  const meshId = resolveActiveSeedMeshId(
    state.modelInfo.meshTableFiles,
    state.project.meshAssets,
    seed.mesh,
  );
  if (meshId > 0) {
    const mesh = NetModelSchema.alloc();
    mesh.id = id;
    mesh.meshId = meshId;
    mesh.invisible = false;
    mesh.scaleX = seed.scale[0];
    mesh.scaleY = seed.scale[1];
    mesh.scaleZ = seed.scale[2];
    mesh.red = seed.tint[0];
    mesh.green = seed.tint[1];
    mesh.blue = seed.tint[2];
    mesh.alpha = seed.tint[3];
    mesh.shininess = seed.shininess;
    mesh.emissive = seed.emissive;
    mesh.metalness = seed.metalness;
    mesh.name = seed.name;
    mesh.offsetX = 0;
    mesh.offsetY = 0;
    mesh.offsetZ = 0;
    mesh.motion.defaultMotionId = seed.defaultMotionId;
    mesh.staticShadow = seed.staticShadow;
    state.replica.models.push(mesh);
  }

  // create body
  const body = RigidBodySchema.alloc();
  body.id = id;
  body.group = 4096;
  body.vx = body.vy = body.vz = 0;
  body.ax = body.ay = body.az = 0;
  body.qx = seed.orientation[0];
  body.qy = seed.orientation[1];
  body.qz = seed.orientation[2];
  body.qw = seed.orientation[3];
  body.mass = seed.mass;
  body.friction = seed.friction;
  body.restitution = seed.restitution;

  const sx = seed.scale[0];
  const sy = seed.scale[1];
  const sz = seed.scale[2];

  const qx = seed.orientation[0];
  const qy = seed.orientation[1];
  const qz = seed.orientation[2];
  const qw = seed.orientation[3];

  const x2 = qx + qx;
  const y2 = qy + qy;
  const z2 = qz + qz;

  const xx = qx * x2;
  const yx = qy * x2;
  const yy = qy * y2;
  const zx = qz * x2;
  const zy = qz * y2;
  const zz = qz * z2;
  const wx = qw * x2;
  const wy = qw * y2;
  const wz = qw * z2;

  const m0 = 1 - yy - zz;
  const m1 = yx + wz;
  const m2 = zx - wy;
  const m3 = yx - wz;
  const m4 = 1 - xx - zz;
  const m5 = zy + wx;

  const m6 = zx + wy;
  const m7 = zy - wx;
  const m8 = 1 - xx - yy;

  const table = state.modelInfo.clientMeshTable[meshId];

  /**
   * 未查询到mesh时，使用默认值
   * - rx、ry、rz默认是1，因此bounds默认取2
   */
  let bx = 2;
  let by = 2;
  let bz = 2;

  if (table) {
    bx = table.bodyBX;
    by = table.bodyBY;
    bz = table.bodyBZ;
  }

  let rx = 0;
  let ry = 0;
  let rz = 0;
  for (let i = 0; i < 8; ++i) {
    const x = 0.5 * (i & 1 ? sx : -sx) * bx;
    const y = 0.5 * (i & 2 ? sy : -sy) * by;
    const z = 0.5 * (i & 4 ? sz : -sz) * bz;

    rx = Math.max(rx, Math.abs(x * m0 + y * m3 + z * m6));
    ry = Math.max(ry, Math.abs(x * m1 + y * m4 + z * m7));
    rz = Math.max(rz, Math.abs(x * m2 + y * m5 + z * m8));
  }

  body.rx = rx;
  body.ry = ry;
  body.rz = rz;

  body.setPosition(seed.position);
  if (table) {
    const x = sx * table.bodyOffsetX;
    const y = sy * table.bodyOffsetY;
    const z = sz * table.bodyOffsetZ;
    const ox = x * m0 + y * m3 + z * m6;
    const oy = x * m1 + y * m4 + z * m7;
    const oz = x * m2 + y * m5 + z * m8;

    body.px = body.px + ox;
    body.py = body.py + oy;
    body.pz = body.pz + oz;
  }

  body.flags = 0;
  if (seed.collision) {
    body.flags |= RigidBodyFlags.COLLIDES;
  }
  if (seed.fixed) {
    body.flags |= RigidBodyFlags.FIXED;
  }
  if (seed.gravity) {
    body.flags |= RigidBodyFlags.GRAVITY;
  }
  state.bodies.push(body);
}

function updateSeeds(state: GameServerState) {
  const seeds = state.project.seeds;
  const seedIds = Object.keys(seeds);

  const ENTITY_LIMIT = MAX_BODIES - state.settings.playerLimit;
  const count = Math.min(seedIds.length, ENTITY_LIMIT);
  if (seedIds.length > ENTITY_LIMIT) {
    state.logger.warn(
      'warning!  project has too many entity seeds.  truncating to ' + count,
    );
  }

  for (let i = 0; i < count; ++i) {
    const seedId = seedIds[i];
    instantiateSeed(state, seedId, seeds[seedId]);
  }
}

export function tickSeeds(state: GameServerState) {
  if (state.sync) {
    // clear out all seed entities
    clearSeeds(state);

    // update states if running
    if (state.replica.running) {
      updateSeeds(state);
    }
  }
}
