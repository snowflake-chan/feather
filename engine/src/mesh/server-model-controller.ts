import { GameServerState } from '../game-server-schema';
import { mat3, vec3 } from 'gl-matrix';
import { RigidBody } from '@box/schema/physics/physics-schema';
import {
  ModelProtocol,
  NetMeshTableEntry,
  NetMeshTableEntrySchema,
  NetSkinPart,
  NetSkinPartSchema,
  NetModel,
  NetSkin,
  NetSkinSchema,
} from '@box/schema/mesh/model-schema';
import { PlayerDisplay, PlayerSkinId } from '@box/schema/player/player-schema';
import { PLAYER_WIDTH, PLAYER_HEIGHT } from '@box/schema/player/player-move';
import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { ServerMeshInfoSchema } from './server-model-schema';
import {
  PlayerSkinHash,
  PlayerSkinHashSchema,
} from '@box/schema/player/player-schema';
import { MotionListSchema } from '@box/schema/project/hot-schema';
import { Vec3Schema } from '@box/schema/utils/math-schema';

const BODY_PARTS = Object.keys(PlayerSkinHashSchema.identity);

const M = mat3.create();
function updateBodyBoundsFromModel(
  body: RigidBody,
  model: NetModel,
  table: NetMeshTableEntry,
) {
  // get bounding axes from quaternion
  const qx = body.qx;
  const qy = body.qy;
  const qz = body.qz;
  const qw = body.qw;

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

  const bx = table.bodyBX;
  const by = table.bodyBY;
  const bz = table.bodyBZ;

  // update bounds
  const sx = model.scaleX;
  const sy = model.scaleY;
  const sz = model.scaleZ;

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

  body.hsx = bx * sx * 0.5;
  body.hsy = by * sy * 0.5;
  body.hsz = bz * sz * 0.5;
}

function updatePlayerModelBounds(body: RigidBody, player: PlayerDisplay) {
  const s = player.scale;
  body.rx = body.rz = Math.max(body.rx, body.rz, s * PLAYER_WIDTH);
  body.ry = Math.max(body.ry, s * PLAYER_HEIGHT);

  body.hsx = body.hsz = Math.max(body.hsx, body.hsz, s * PLAYER_WIDTH);
  body.hsy = Math.max(body.hsy, s * PLAYER_HEIGHT);
}

export function tickServerModels(state: GameServerState) {
  const bodies = state.bodies;
  const models = state.replica.models;
  const playerDisplay = state.replica.players;
  const table = state.modelInfo.clientMeshTable;

  let bodyPtr = 0;
  let playerPtr = 0;
  for (let i = 0; i < models.length; ++i) {
    const model = models[i];
    const id = model.id;
    if (!model.meshId) {
      continue;
    }
    const entry = table[model.meshId];
    if (!entry) {
      continue;
    }
    while (bodyPtr < bodies.length && bodies[bodyPtr].id < id) {
      bodyPtr += 1;
    }
    if (bodyPtr >= bodies.length) {
      break;
    }
    const body = bodies[bodyPtr];
    if (body.id !== id) {
      continue;
    }
    // 更新物理模型，在这里修改物理模型信息，将旋转矩阵放进去，做obb的body
    updateBodyBoundsFromModel(body, model, entry);

    while (
      playerPtr < playerDisplay.length &&
      playerDisplay[playerPtr].id < id
    ) {
      playerPtr += 1;
    }
    if (playerPtr >= playerDisplay.length) {
      continue;
    }
    const player = playerDisplay[playerPtr];
    if (player.id !== id) {
      continue;
    }
    updatePlayerModelBounds(body, player);
  }
}

export async function computeSkinPartPrefetchHashes(state: GameServerState) {
  return state.modelInfo.skinPartTable.map((skin) => skin.hash);
}

export class ModelServer {
  private _protocol: MuServerProtocol<typeof ModelProtocol>;
  private _state: GameServerState;

  constructor(spec: { server: MuServer; state: GameServerState }) {
    this._state = spec.state;
    this._protocol = spec.server.protocol(ModelProtocol);

    this._protocol.configure({
      message: {},
      connect: (client) => {
        // compress skin index whenever a new player connects
        this.compactSkinIndex();
        // clientTable数据中第0个是默认空数据，不发送给客户端
        client.message.appendMeshHashes(
          this._state.modelInfo.clientMeshTable.slice(1),
        );
        client.message.appendSkinHashes(
          this._state.modelInfo.clientSkinTable.slice(1),
        );
        client.message.appendSkinPartHashes(
          this._state.modelInfo.skinPartTable,
        );
      },
    });
  }

  public syncNetMeshSkinTable() {
    const pendingEntries: NetMeshTableEntry[] = [];
    const bakedHashes = this._state.project.meshAssets;

    const netTable = this._state.modelInfo.clientMeshTable;
    const meshIndex = this._state.modelInfo.meshHashIndex;
    const meshFiles = this._state.modelInfo.meshTableFiles;

    // push any new hashes into table
    Object.keys(bakedHashes).forEach((path) => {
      const asset = bakedHashes[path];
      const idx = meshFiles.lastIndexOf(path);
      if (idx > 0 && netTable[idx].hash === asset.hash) {
        return;
      }

      // save mesh file
      meshFiles.push(path);

      const tabEntry = ServerMeshInfoSchema.alloc();
      tabEntry.motionList = MotionListSchema.clone(asset.motionList);
      tabEntry.hash = asset.hash;

      tabEntry.rigidBodyOffset = asset.useCustomBounds
        ? Vec3Schema.clone(asset.customBounds.offset)
        : // 物理框为默认时，它总是与外观框保持一致，那么位置就等于外观框的中心
          Vec3Schema.clone(asset.renderBoxOffset);

      tabEntry.renderBoxOffset = Vec3Schema.clone(asset.renderBoxOffset);
      meshIndex[asset.hash] = tabEntry;

      const netEntry = NetMeshTableEntrySchema.alloc();
      netEntry.hash = asset.meshHash;
      netEntry.hashType = asset.hashType;

      const b = asset.useCustomBounds ? asset.customBounds.size : asset.bounds;
      netEntry.bodyBX = b[0];
      netEntry.bodyBY = b[1];
      netEntry.bodyBZ = b[2];

      netEntry.bodyOffsetX = tabEntry.rigidBodyOffset[0];
      netEntry.bodyOffsetY = tabEntry.rigidBodyOffset[1];
      netEntry.bodyOffsetZ = tabEntry.rigidBodyOffset[2];

      netEntry.meshBX = asset.bounds[0];
      netEntry.meshBY = asset.bounds[1];
      netEntry.meshBZ = asset.bounds[2];

      netEntry.renderBoxOffsetX = tabEntry.renderBoxOffset[0];
      netEntry.renderBoxOffsetY = tabEntry.renderBoxOffset[1];
      netEntry.renderBoxOffsetZ = tabEntry.renderBoxOffset[2];

      netTable.push(netEntry);
      pendingEntries.push(netEntry);
    });

    // finally update the strings table
    if (pendingEntries.length > 0) {
      this._protocol.broadcast.appendMeshHashes(pendingEntries);
    }

    const pendingSkins: NetSkin[] = [];
    const bakedSkinHashes = this._state.project.skinAssets;
    const netSkinTable = this._state.modelInfo.clientSkinTable;
    const skinFiles = this._state.modelInfo.skinTableFiles;

    Object.keys(bakedSkinHashes).forEach((name) => {
      const asset = bakedSkinHashes[name];
      const idx = skinFiles.lastIndexOf(name);
      if (idx > 0 && netSkinTable[idx].hash === asset.hash) {
        return;
      }

      skinFiles.push(name);

      const netEntry = NetSkinSchema.alloc();
      NetSkinSchema.assign(netEntry, asset);
      netSkinTable.push(netEntry);
      pendingSkins.push(netEntry);
    });

    this._state.modelInfo.defaultSkinId = Math.max(
      0,
      skinFiles.lastIndexOf(this._state.project.defaultSkinName),
    );

    if (pendingSkins.length) {
      this._protocol.broadcast.appendSkinHashes(pendingSkins);
    }
  }

  public tick() {
    if (this._state.sync) {
      this.syncNetMeshSkinTable();
    }
  }

  public prefetchHashes() {
    const { clientMeshTable, clientSkinTable } = this._state.modelInfo;
    return [...clientMeshTable.slice(1), ...clientSkinTable.slice(1)].map(
      (info) => info.hash,
    );
  }

  public getAvatarSkinId(
    avatarSkinId: PlayerSkinId,
    avatarSkin: PlayerSkinHash,
  ) {
    const pending: NetSkinPart[] = [];
    const modelInfo = this._state.modelInfo;

    for (let i = 0; i < BODY_PARTS.length; ++i) {
      const part = BODY_PARTS[i];
      const hash = avatarSkin[part];
      if (!hash) {
        avatarSkinId[part] = 0;
        continue;
      }
      let id = modelInfo.invSkinPartIndex[hash];
      if (!id) {
        id = modelInfo.skinPartCounter++;
        modelInfo.invSkinPartIndex[hash] = id;

        const netSkin = NetSkinPartSchema.alloc();
        netSkin.id = id;
        netSkin.hash = hash;
        modelInfo.skinPartTable.push(netSkin);
        pending.push(netSkin);
      }
      avatarSkinId[part] = id;
    }

    if (pending.length > 0) {
      this._protocol.broadcast.appendSkinPartHashes(pending);
    }
  }

  public compactSkinIndex() {
    // mark all active skin references
    const players = this._state.replica.players;
    const activeSkinIds: { [id: number]: boolean } = {};
    for (let i = 0; i < players.length; ++i) {
      const skin = players[i].avatarSkin;
      for (let j = 0; j < BODY_PARTS.length; ++j) {
        const part = BODY_PARTS[j];
        const id = skin[part];
        if (id) {
          activeSkinIds[id] = true;
        }
      }
    }

    // compact skin table
    const index = (this._state.modelInfo.invSkinPartIndex = {});
    const table = this._state.modelInfo.skinPartTable;
    let ptr = 0;
    for (let i = 0; i < table.length; ++i) {
      const entry = table[i];
      if (activeSkinIds[entry.id]) {
        index[entry.hash] = entry.id;
        table[ptr++] = entry;
      } else {
        NetSkinPartSchema.free(entry);
      }
    }
    table.length = ptr;
  }
}
