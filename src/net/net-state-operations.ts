import { MuWriteStream } from '@box/mudb/stream';
import { NetMessageType } from '@box/schema/net/net-schema';
import { SERVER_SECRET_PACKET_SIZE } from './net-server-state';
import { Logger } from '@box/utils/logger';
import { getById } from '@box/utils/id';
import {
  TimestampedClientInput,
  NetStateSchema,
  NetState,
  NetPositionCorrectionSchema,
  ClientScriptSrcSchema,
} from '@box/schema/net/net-schema';
import { PlayerSkinHashSchema, PlayerFlags } from '@box/schema/player/player-schema';
import { NetPublicSchema, NetSecretSchema } from '@box/schema/net/net-schema';
import { GameServerState, GameConnectionState } from '../game-server-schema';
import { getServerNetInput } from './net-server-tick';
import { mergeNetInput } from '@box/schema/net/net-tick';
import { GameReplicaSchema } from '@box/schema/replica/game-replica';
import { getPlayerEnvironmentZones } from '../zone/zone-server';
import { GamePrivateReplicaSchema } from '@box/schema/replica/game-private-replica';
import { permittedCorrections, queueMovementCorrection } from '../anticheat/net-movement';

/** 网络状态投影、输入合并和编码；不注册协议或管理连接生命周期。
 * 私有快照必须按连接发送，不能复用公开快照的广播路径。
 */
export function computeClientScriptModules(state: GameServerState) {
  const modules = ClientScriptSrcSchema.alloc();
  ClientScriptSrcSchema.assign(modules, state.scriptSrc.clientSrc);
  return modules;
}

/** Encode and update each peer snapshot separately; sendRaw must target that same peer. */
export function synchronizeClientSecrets(
  state: GameServerState,
  clients: Record<string, { sendRaw: (data: Uint8Array) => void }>,
) {
  // loop over all clients
  const clientIds = Object.keys(clients);
  const stream = new MuWriteStream(SERVER_SECRET_PACKET_SIZE);
  for (let i = 0; i < clientIds.length; ++i) {
    const sessionId = clientIds[i];

    // if client isn't connected yet then don't send them secrets
    const connection = state.connections[sessionId];
    if (!connection) {
      continue;
    }

    // compute secret data for client
    const currentSecret = computeNetSecret(state, sessionId);
    const prevSecret = connection.net.lastSentSecret;

    // check if the secret for this client changed
    if (!NetSecretSchema.equal(currentSecret, prevSecret)) {
      // serialize secret and send to client
      stream.offset = 0;
      stream.writeVarint(NetMessageType.SECRET);
      NetSecretSchema.diff(prevSecret, currentSecret, stream);
      clients[sessionId].sendRaw(stream.bytes());

      // update previous secret state
      NetSecretSchema.assign(connection.net.lastSentSecret, currentSecret);
    }

    // clean up
    NetSecretSchema.free(currentSecret);
  }

  // clean up stream
  stream.destroy();
}

/** 每个 tick 的公开快照；连接身份与玩家私有数据不在这里组装。 */
export function computeNetPublic(state: GameServerState, netState: NetState) {
  const result = NetPublicSchema.alloc();

  // copy clock info
  result.tick = state.clock.tick - 1;
  result.frameSkip = state.clock.frameSkip;

  // copy state snapshot stuff
  NetStateSchema.assign(result.state, netState);

  // copy replicated state
  GameReplicaSchema.assign(result.replica, state.replica);

  // clear replica animation state
  // clearKeyframeReplica(state, result.replica, result.tick);
  return result;
}

// -----------------------------------------------------------------------
// Secret info, computed for each client
//  This is computed each tick for each client.  Sends only changes when
//  necessary.  Private info like entity id, player hp, etc. goes here
// -----------------------------------------------------------------------
export function computeNetSecret(state: GameServerState, sessionId: string) {
  const result = NetSecretSchema.clone(NetSecretSchema.identity);

  const connection = state.connections[sessionId];
  if (connection) {
    result.id = connection.id;

    // send user id to client
    result.userId = connection.sessionData.user.id;
    result.userAvatar = connection.sessionData.user.avatar_hash;
    result.userName = connection.sessionData.name;
    result.avatarSkin = PlayerSkinHashSchema.assign(
      result.avatarSkin,
      connection.sessionData.avatarSkin,
    );

    // update secret replica state
    const secret = getById(state.secrets, result.id);
    if (secret) {
      result.replica = GamePrivateReplicaSchema.assign(result.replica, secret);
    }

    // set login state
    result.loginState = connection.loginState;

    // set pause state for connection
    result.netPaused = connection.net.statePaused;

    // compute environment zones for this player
    getPlayerEnvironmentZones(state, result.environmentZones, result.id);
  }

  return result;
}

// -----------------------------------------------------------------------
// Records an input from a client
//  This is called whenever we get a new input.  Should just record input.
//  Don't do any weird processing here
// -----------------------------------------------------------------------
function playerCanMove(state: GameServerState, id: number) {
  const player = getById(state.players, id);
  if (player) {
    return !!(player.flags & PlayerFlags.ALLOW_MOVE);
  }
  return true;
}

// 同步客户端的用户输入
export function synchronizeNetClientInput(
  state: GameServerState,
  sessionId: string,
  input: TimestampedClientInput,
  logger: Logger,
) {
  const { connections, net } = state;

  const connection = connections[sessionId];

  if (!connection || !connection.id || connection.state !== GameConnectionState.CONNECTED) {
    logger.warn(`input from bad connection, ${sessionId}, discarding`);
    return true;
  }

  // check if input paused or old input tick
  if (
    input.pauseCounter !== connection.net.inputPauseCounter ||
    input.tick < connection.net.lastInput
  ) {
    return true;
  }

  // hack: fast forward old ticks to state's oldest tick
  input.tick = Math.max(input.tick, state.net.oldestTick);

  // check for valid input
  const inputState = getServerNetInput(state, input.tick);
  if (!inputState) {
    logger.warn(
      `bad tick from client ${sessionId}, tick = ${input.tick}.  current server tick range: ${
        net.oldestTick
      } to ${net.oldestTick + net.states.length}`,
    );
    return false;
  }

  // combine input into net state
  const usePositionCorrection = playerCanMove(state, connection.id);
  // 以客户端用户输入发上来为准
  const safeInput = {
    ...input.input,
    bodies: permittedCorrections(input.input.bodies, connection.id),
  };
  // Controls are immediate; only optional position/velocity corrections wait for script approval.
  mergeNetInput(inputState, connection.id, safeInput, false);
  const held =
    usePositionCorrection &&
    queueMovementCorrection(state, sessionId, input.tick, input.pauseCounter, safeInput);
  if (usePositionCorrection && !held) mergeNetInput(inputState, connection.id, safeInput, true);
  net.lastInputTick = Math.min(net.lastInputTick, input.tick);

  // update input tick
  connection.net.lastInput = input.tick;

  return true;
}

export function overrideClientPositionCorrections(state: GameServerState, sessionId: string) {
  const connection = state.connections[sessionId];
  if (!connection) {
    return;
  }

  // update input pause counter
  connection.net.inputPauseCounter++;

  // clear all body corrections form client
  const inputs = state.net.inputs;
  for (let i = 0; i < inputs.length; ++i) {
    const netInput = state.net.inputs[i];
    const clientInput = getById(netInput.clients, connection.id);
    if (!clientInput) {
      continue;
    }
    const bodyCorrections = clientInput.input.bodies;
    for (let j = 0; j < bodyCorrections.length; ++j) {
      NetPositionCorrectionSchema.free(bodyCorrections[j]);
    }
    bodyCorrections.length = 0;
  }
  state.net.lastInputTick = state.net.oldestTick;
}
