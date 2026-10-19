import { vec3 } from 'gl-matrix';
import {
  PlayerSchema,
  PlayerInputSchema,
  PlayerDisplaySchema,
  Player,
  PlayerFlags,
  PlayerDisplay,
  PlayerDisplayFlags,
  PlayerAttachmentStateSchema,
  PlayerSkinInvisibleSchema,
} from '@box/schema/player/player-schema';
import { PlayerSkinHashSchema } from '@box/schema/player/player-schema';
import {
  RigidBodySchema,
  RigidBodyFlags,
  RigidBody,
} from '@box/schema/physics/physics-schema';
import {
  PlayerRDA,
  PlayerSoundRDA,
  EntitySoundRDA,
} from '@box/schema/project/project-rda';
import { TimestampedClientInputSchema } from '@box/schema/net/net-schema';
import {
  CameraConfigurationSchema,
  CameraFreezedAxis,
  CameraMode,
} from '@box/schema/camera/camera-schema';
import { DamageSchema } from '@box/schema/damage/damage-schema';
import { RespawnEventSchema } from '@box/schema/events/damage-event-schema';

import {
  GameServerState,
  GameConnectionState,
  GameConnectionSchema,
} from '../game-server-schema';
import { createEntityId, destroyEntityId } from '../entity/entity-controller';
import { ServerPlayerSchema, ServerPlayer } from './player-server-schema';
import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_FRICTION,
  PLAYER_RESTITUTION,
  PLAYER_MASS,
} from '@box/schema/player/player-move';
import { zipId, getById, compareId } from '@box/utils/id';
import { createPlayerUserKey } from '@box/utils/local-player-identity';
import { ChatServer } from '../chat/chat-server';
import { synchronizeNetClientInput } from '../net/net-server-controller';
import { copyConfigToDamage } from '../damage/damage-server';
import {
  GamePrivateReplica,
  GamePrivateReplicaSchema,
} from '@box/schema/replica/game-private-replica';
import { GameScriptRunState, scriptRunState } from '../script/script-schema';
import {
  ServerPlayerEntitySoundEffect,
  ServerEntitySoundEffectSchema,
  ServerPlayerSoundEffectSchema,
} from '../sound/server-sound-state';
import crypto from 'crypto';
import { ModelServer } from '../mesh/server-model-controller';
import { getConfigSync } from '../../config/server';
import { PlayerServer } from './player-server';
import { PlayerEventSchema } from '@box/schema/events/player-event-schema';
import { GamepadSchema, PictureAssetSet } from '@box/schema/project/hot-schema';

// create some unique user id
function genUserKey(id: string | number, type = 'userid') {
  if (!id) {
    return '';
  }
  const hash = crypto.createHash('sha256');
  hash.update(`${type}=${id}`);
  return hash.digest('base64').slice(0, 16);
}

export function setPlayerHacking(
  state: GameServerState,
  sessionId: string,
  hacking: boolean,
) {
  const connection = state.connections[sessionId];
  if (!connection || !connection.id) {
    return;
  }
  const playerDisplay = getById(state.replica.players, connection.id);
  if (playerDisplay) {
    playerDisplay.flags =
      (playerDisplay.flags & ~PlayerDisplayFlags.HACKING) |
      (hacking ? PlayerDisplayFlags.HACKING : 0);
  }
}

function copyPlayerConfigToPlayer(
  player: Player,
  playerConfig: typeof PlayerRDA.stateSchema.identity,
  running: boolean,
) {
  player.flags = 0;
  if (playerConfig.noClip) {
    player.flags |= PlayerFlags.SPECTATOR;
  }
  if (running) {
    if (playerConfig.allowFlight) {
      player.flags |= PlayerFlags.ALLOW_FLIGHT;
    }
  } else {
    player.flags |= PlayerFlags.ALLOW_FLIGHT;
  }
  if (playerConfig.allowMove) {
    player.flags |= PlayerFlags.ALLOW_MOVE;
  }
  if (playerConfig.allowAction0) {
    player.flags |= PlayerFlags.ALLOW_ACTION_0;
  }
  if (playerConfig.allowAction1) {
    player.flags |= PlayerFlags.ALLOW_ACTION_1;
  }
  if (playerConfig.allowJump) {
    player.flags |= PlayerFlags.ALLOW_JUMP;
  }
  if (playerConfig.allowDoubleJump) {
    player.flags |= PlayerFlags.ALLOW_DOUBLE_JUMP;
  }
  if (playerConfig.allowCrouch) {
    player.flags |= PlayerFlags.ALLOW_CROUCH;
  }

  player.crouchSpeed = playerConfig.crouchSpeed;
  player.crouchAcceleration = playerConfig.crouchAcceleration;

  player.walkSpeed = playerConfig.walkSpeed;
  player.walkAcceleration = playerConfig.walkAcceleration;

  player.runSpeed = playerConfig.runSpeed;
  player.runAcceleration = playerConfig.runAcceleration;

  player.swimAcceleration = playerConfig.swimAcceleration;
  player.swimSpeed = playerConfig.swimAcceleration;

  player.flySpeed = playerConfig.flySpeed;
  player.flyAcceleration = playerConfig.flyAcceleration;

  player.jumpSpeedFactor = playerConfig.jumpSpeedFactor;
  player.jumpAccelerationFactor = playerConfig.jumpAccelerationFactor;
  player.jumpPower = playerConfig.jumpPower;
  player.doubleJumpPower = playerConfig.doubleJumpPower;

  player.freezedForwardAngle = 0;
  player.inputDirectionState = 0;
}

function copyPlayerConfigToServerPlayer(
  player: ServerPlayer,
  playerConfig: typeof PlayerRDA.stateSchema.identity,
  running: boolean,
) {
  const initPosition = playerConfig.initialPosition;
  vec3.set(player.birthPoint, initPosition.x, initPosition.y, initPosition.z);

  const { lo, hi } = playerConfig.movementBounds;
  vec3.set(player.movementBounds.lo, lo.x, lo.y, lo.z);
  vec3.set(player.movementBounds.hi, hi.x, hi.y, hi.z);
}

function copyPlayerConfigToPlayerDisplay(
  player: PlayerDisplay,
  playerConfig: typeof PlayerRDA.stateSchema.identity,
  defaultSkinId: number,
  running: boolean,
) {
  // update display flags
  player.flags =
    (playerConfig.showName ? PlayerDisplayFlags.SHOW_NAME : 0) |
    (playerConfig.invisible ? PlayerDisplayFlags.INVISIBLE : 0) |
    (playerConfig.showIndicator ? PlayerDisplayFlags.SHOW_INDICATOR : 0) |
    (player.flags & PlayerDisplayFlags.HACKING);

  // copy scale
  player.scale = playerConfig.scale;

  // copy material flags
  vec3.copy(player.color, playerConfig.color);
  player.emissive = playerConfig.emissive;
  player.metalness = playerConfig.metalness;
  player.shininess = playerConfig.shininess;

  // clear attached objects
  PlayerAttachmentStateSchema.assign(
    player.attachments,
    PlayerAttachmentStateSchema.identity,
  );
  // clear skin invisible
  PlayerSkinInvisibleSchema.assign(
    player.skinInvisible,
    PlayerSkinInvisibleSchema.identity,
  );

  // 默认定向创作的皮肤需在运行时赋值，不运行时清空
  Object.keys(player.mapSkin).forEach((partName) => {
    player.mapSkin[partName] = 0;
  });
  if (running) {
    Object.keys(player.mapSkin).forEach((partName) => {
      player.mapSkin[partName] = defaultSkinId;
    });
  }
}

function copyPlayerConfigToPlayerPrivateReplica(
  replica: GamePrivateReplica,
  playerConfig: typeof PlayerRDA.stateSchema.identity,
  lutHash: string,
  running: boolean,
  gamepadConfig: typeof GamepadSchema.identity,
  pictureAssets: PictureAssetSet,
) {
  replica.colorLUT = lutHash;
  replica.enableCursor = false;

  replica.camera = CameraConfigurationSchema.assign(
    replica.camera,
    CameraConfigurationSchema.identity,
  );
  replica.camera.targetId = replica.id;
  const cameraType = playerConfig.cameraType;
  if (running && cameraType === 'fps') {
    replica.camera.mode = CameraMode.FPS;
  } else {
    replica.camera.mode = CameraMode.FOLLOW;
  }

  const getHashByPath = (path: string) => {
    const asset = pictureAssets[path];
    if (!asset) {
      return '';
    }

    return asset.metadataHash;
  };

  replica.gamepad.joystickBackground = getHashByPath(
    gamepadConfig.joystick.background,
  );
  replica.gamepad.joystickController = getHashByPath(
    gamepadConfig.joystick.controller,
  );
  replica.gamepad.flyButton = getHashByPath(gamepadConfig.fly.button);
  replica.gamepad.flyingBackground = getHashByPath(
    gamepadConfig.fly.flyingBackground,
  );
  replica.gamepad.flyingController = getHashByPath(
    gamepadConfig.fly.flyingController,
  );
  Object.keys(replica.gamepad).map((btn) => {
    replica.gamepad[btn] = getHashByPath(gamepadConfig.buttons[btn]);
  });
}

function copyPlayerConfigToPlayerBody(
  body: RigidBody,
  playerConfig: typeof PlayerRDA.stateSchema.identity,
  running: boolean,
) {
  body.flags =
    RigidBodyFlags.PLAYER | RigidBodyFlags.COLLIDES | RigidBodyFlags.GRAVITY;
  body.group = 0;
  body.rx = body.rz = PLAYER_WIDTH * playerConfig.scale;
  body.ry = PLAYER_HEIGHT * playerConfig.scale;
  body.friction = PLAYER_FRICTION;
  body.restitution = PLAYER_RESTITUTION;
  body.mass = PLAYER_MASS;
  body.hsx = body.rx;
  body.hsy = body.ry;
  body.hsz = body.rz;
}

function copyPlayerConfigToPlayerSound(
  sound: typeof ServerEntitySoundEffectSchema.identity,
  playerSound: ServerPlayerEntitySoundEffect,
  config: typeof PlayerRDA.stateSchema.identity,
) {
  EntitySoundRDA.stateSchema.assign(sound, config.sounds);
  PlayerSoundRDA.stateSchema.assign(playerSound, config.playerSounds);
}

export function respawnPlayer(state: GameServerState, id: number) {
  if (!state.replica.running) {
    return;
  }
  const serverPlayer = getById(state.serverPlayers, id);
  const body = getById(state.bodies, id);
  if (body && serverPlayer) {
    body.setPosition(serverPlayer.birthPoint);
    body.vx = body.vy = body.vz = 0;
  }
  const damage = getById(state.replica.damage, id);
  if (damage) {
    damage.hp = damage.maxHp;
  }

  if (scriptRunState(state.script) === GameScriptRunState.RUNNING) {
    const ev = RespawnEventSchema.alloc();
    ev.id = id;
    ev.tick = state.clock.tick;
    state.script.curTickEvent.events.respawnEvents.push(ev);
  }
}

function getGuestDisplayname(id: number) {
  const pad = id < 10 ? '000' : id < 100 ? '00' : id < 1000 ? '0' : '';
  return `explorer${pad}${id}`;
}

export function handleServerPlayerConnections(
  modelServer: ModelServer,
  state: GameServerState,
  playerServer: PlayerServer,
) {
  const joinEvents = state.events.join;
  const playerConfig = state.project.player;
  for (let i = 0; i < joinEvents.length; ++i) {
    const connection = state.connections[joinEvents[i]];
    if (!connection) {
      state.logger.warn(
        `join reached player controller before session data: ${joinEvents[i]}`,
      );
      continue;
    }
    if (connection.id || connection.state === GameConnectionState.CONNECTED) {
      state.logger.warn(
        `ignored duplicate join request from ${connection.sessionId}`,
      );
      continue;
    }

    // grab session data
    const sessionData = connection.sessionData;

    // update connection state
    connection.state = GameConnectionState.CONNECTED;
    connection.joinTime = state.clock.clock;

    // get entity id
    const id = (connection.id = createEntityId(state));

    // create replicated player component
    const playerDisplay = PlayerDisplaySchema.clone(
      PlayerDisplaySchema.identity,
    );
    playerDisplay.id = id;
    playerDisplay.name =
      sessionData.name === 'guest' ? getGuestDisplayname(id) : sessionData.name;
    modelServer.getAvatarSkinId(
      playerDisplay.avatarSkin,
      sessionData.avatarSkin,
    );
    playerDisplay.userId = sessionData.user.id;
    playerDisplay.tag = sessionData.user.tag;
    playerDisplay.avatar_hash = sessionData.user.avatar_hash;
    copyPlayerConfigToPlayerDisplay(
      playerDisplay,
      playerConfig,
      state.modelInfo.defaultSkinId,
      state.replica.running,
    );
    state.replica.players.push(playerDisplay);

    const player = PlayerSchema.clone(PlayerSchema.identity);
    player.id = id;
    copyPlayerConfigToPlayer(player, playerConfig, state.replica.running);
    state.players.push(player);

    // replica
    const secret = GamePrivateReplicaSchema.clone(
      GamePrivateReplicaSchema.identity,
    );
    secret.id = id;
    state.secrets.push(secret);
    const lutPath = playerConfig.colorLUT;
    const lutInfo = state.project.assets[lutPath];
    let lutHash = '';
    if (lutInfo) {
      lutHash = lutInfo.hash;
    }
    copyPlayerConfigToPlayerPrivateReplica(
      secret,
      playerConfig,
      lutHash,
      state.replica.running,
      state.project.gamepad,
      state.project.pictureAssets,
    );

    // create server player component
    const serverPlayer = ServerPlayerSchema.clone(ServerPlayerSchema.identity);
    serverPlayer.id = id;
    serverPlayer.sessionId = connection.sessionId;
    serverPlayer.userId = connection.sessionData.user.id || '';
    serverPlayer.boxId = connection.sessionData.user.username;
    serverPlayer.avatar = connection.sessionData.user.avatar_hash;
    serverPlayer.userKey = connection.sessionData.user.userKey || createPlayerUserKey(
      connection.sessionData.fingerPrint,
      process.env.PERMISSION_TOKEN_SECRET || '',
    ) || (connection.sessionData.user.id
      ? genUserKey(connection.sessionData.user.id)
      : genUserKey(id, 'guestid'));
    serverPlayer.url = connection.sessionData.url;

    copyPlayerConfigToServerPlayer(
      serverPlayer,
      playerConfig,
      state.replica.running,
    );
    state.serverPlayers.push(serverPlayer);

    // create damage component
    const damageConfig = playerConfig.damage;
    if (damageConfig.enabled && state.replica.running) {
      const playerDamage = DamageSchema.alloc();
      playerDamage.id = id;
      copyConfigToDamage(playerDamage, damageConfig);
      state.replica.damage.push(playerDamage);
    }

    // create player input input
    const playerInput = PlayerInputSchema.clone(PlayerInputSchema.identity);
    playerInput.id = id;
    state.playerInputs.push(playerInput);

    // create rigid body component
    const body = RigidBodySchema.alloc();
    body.id = id;
    copyPlayerConfigToPlayerBody(body, playerConfig, state.replica.running);

    // initialize dynamic state
    body.setPosition(serverPlayer.birthPoint);
    body.vx = body.vy = body.vz = 0;
    body.ax = body.ay = body.az = 0;
    body.qx = 0;
    body.qy = 0;
    body.qz = 0;
    body.qw = 1;
    state.bodies.push(body);

    // create sound component
    const sound = ServerEntitySoundEffectSchema.clone(
      ServerEntitySoundEffectSchema.identity,
    );
    const playerSound = ServerPlayerSoundEffectSchema.clone(
      ServerPlayerSoundEffectSchema.identity,
    );
    sound.id = id;
    playerSound.id = id;
    copyPlayerConfigToPlayerSound(sound, playerSound, playerConfig);
    state.sound.entityDirty = true;
    state.sound.entity.push(sound);
    state.sound.playerDirty = true;
    state.sound.player.push(playerSound);

    const input = TimestampedClientInputSchema.clone(
      TimestampedClientInputSchema.identity,
    );
    input.tick = state.clock.tick;
    input.pauseCounter = 0;
    input.input.bodies.length = 0;
    synchronizeNetClientInput(state, connection.sessionId, input, state.logger);

    state.logger.info(
      `created player info for connection ${connection.sessionId}.  entity id = ${id}. player name = ${playerDisplay.name}`,
    );
    const ev = PlayerEventSchema.alloc();
    ev.id = id;
    ev.position = body.getPosition();
    playerServer.playerJoin(ev);
  }

  // handle session id updates
  if (joinEvents.length > 0) {
    state.connectionSet.sort(compareId);
  }
}

export function handleServerPlayerDisconnections(
  state: GameServerState,
  playerServer: PlayerServer,
) {
  const disconnectEvents = state.events.disconnect;
  for (let i = 0; i < disconnectEvents.length; ++i) {
    let connection = state.connections[disconnectEvents[i]];
    if (!connection) {
      const alternativeConnection = state.connectionSet.find(
        (x) => x.sessionId === disconnectEvents[i],
      );
      if (alternativeConnection) {
        connection = alternativeConnection;
      } else {
        state.logger.warn('failed to delete bad disconnect event');
        continue;
      }
    }

    if (connection.id) {
      // push log info
      const player = getById(state.replica.players, connection.id);
      const body = getById(state.bodies, connection.id);
      if (player && body) {
        const ev = PlayerEventSchema.alloc();
        ev.id = player.id;
        ev.position = body.getPosition();
        playerServer.playerLeave(ev);
      }
      // destroy entity
      destroyEntityId(state, connection.id);
      state.logger.info(
        `client ${connection.sessionId} disconnected.  destroyed entity ${connection.id}`,
      );
    }

    // remove from connection set
    delete state.connections[connection.sessionId];
    const idx = state.connectionSet.indexOf(connection);
    if (idx >= 0) {
      state.connectionSet.splice(idx, 1);
    }

    // release connection
    GameConnectionSchema.free(connection);
  }
}

function synchronizePlayers(
  state: GameServerState,
  playerConfig: typeof PlayerRDA.stateSchema.identity,
) {
  const players = state.players;
  for (let i = 0; i < players.length; ++i) {
    copyPlayerConfigToPlayer(players[i], playerConfig, state.replica.running);
  }
  const serverPlayers = state.serverPlayers;
  for (let i = 0; i < serverPlayers.length; ++i) {
    copyPlayerConfigToServerPlayer(
      serverPlayers[i],
      playerConfig,
      state.replica.running,
    );
  }
  const playerDisplay = state.replica.players;
  for (let i = 0; i < playerDisplay.length; ++i) {
    copyPlayerConfigToPlayerDisplay(
      playerDisplay[i],
      playerConfig,
      state.modelInfo.defaultSkinId,
      state.replica.running,
    );
  }
  const bodies = state.bodies;
  for (let i = 0; i < bodies.length; ++i) {
    if (bodies[i].flags & RigidBodyFlags.PLAYER) {
      copyPlayerConfigToPlayerBody(
        bodies[i],
        playerConfig,
        state.replica.running,
      );
    }
  }
  const lutPath = playerConfig.colorLUT;
  const lutInfo = state.project.assets[lutPath];
  let lutHash = '';
  if (lutInfo) {
    lutHash = lutInfo.hash;
  }
  for (let i = 0; i < state.secrets.length; ++i) {
    copyPlayerConfigToPlayerPrivateReplica(
      state.secrets[i],
      playerConfig,
      lutHash,
      state.replica.running,
      state.project.gamepad,
      state.project.pictureAssets,
    );
  }
  if (state.replica.running && playerConfig.damage.enabled) {
    for (let i = 0; i < state.players.length; ++i) {
      const p = state.players[i].id;
      const damage = DamageSchema.alloc();
      damage.id = p;
      copyConfigToDamage(damage, playerConfig.damage);
      state.replica.damage.push(damage);
    }
    state.replica.damage.sort(compareId);
  }
}

export function tickServerPlayers(state: GameServerState) {
  if (state.sync) {
    synchronizePlayers(state, state.project.player);
  }

  zipId(
    (serverPlayer, playerDisplay, body) => {
      // snap out of bounds players
      const moveLo = serverPlayer.movementBounds.lo;
      const moveHi = serverPlayer.movementBounds.hi;
      const { px, py, pz } = body;
      if (
        px < moveLo[0] ||
        moveHi[0] < px ||
        py < moveLo[1] ||
        moveHi[1] < py ||
        pz < moveLo[2] ||
        moveHi[2] < pz
      ) {
        const bp = serverPlayer.birthPoint;
        body.px = Math.max(moveLo[0], Math.min(moveHi[0], bp[0]));
        body.py = Math.max(moveLo[1], Math.min(moveHi[1], bp[1]));
        body.pz = Math.max(moveLo[2], Math.min(moveHi[2], bp[2]));
        body.vx = body.vy = body.vz = 0;
      }

      // update player bounds
      const scale = playerDisplay.scale;
      body.hsx = body.rx = scale * PLAYER_WIDTH;
      body.hsy = body.ry = scale * PLAYER_HEIGHT;
      body.hsz = body.rz = scale * PLAYER_WIDTH;
    },
    state.serverPlayers,
    state.replica.players,
    state.bodies,
  );
}

export function setPlayerAvatarSkin(
  modelServer: ModelServer,
  state: GameServerState,
  id: number,
  avatarSkin: typeof PlayerSkinHashSchema.identity,
) {
  const player = getById(state.replica.players, id);

  if (player) {
    modelServer.getAvatarSkinId(player.avatarSkin, avatarSkin);
  }
}
