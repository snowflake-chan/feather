import { performance } from 'node:perf_hooks';
import { getById } from '@box/utils/id';
import { NetPositionCorrectionSetSchema } from '@box/schema/net/net-schema';
import type { NetClientInput } from '@box/schema/net/net-schema';
import { RigidBodyFlags } from '@box/schema/physics/physics-schema';
import { GameConnectionState, GameServerState } from '../game-server-schema';
import { getServerNetInput } from '../net/net-server-tick';
import { inspectMovement } from './movement-inspector';

const receivedAt = new WeakMap<object, number>();

/** One unambiguous own-character correction; duplicate IDs are never averaged or approved. */
export function permittedCorrections<T extends { id: number; px: number; py: number; pz: number; vx: number; vy: number; vz: number }>(
  bodies: T[], ownerId: number,
): T[] {
  let candidate: T | undefined;
  for (let i = 0; i < Math.min(bodies.length, 128); i++) {
    const body = bodies[i];
    if (body.id !== ownerId) continue;
    // Count before numeric validation: a malformed duplicate must not hide behind filtering.
    if (candidate) return [];
    candidate = body;
  }
  return candidate && [candidate.px, candidate.py, candidate.pz, candidate.vx, candidate.vy, candidate.vz].every(Number.isFinite)
    ? [candidate] : [];
}

/** Returns true when corrections are held; control input is still merged immediately. */
export function queueMovementCorrection(
  state: GameServerState, sessionId: string, tick: number, pauseCounter: number, input: NetClientInput,
): boolean {
  const connection = state.connections[sessionId];
  if (!connection || connection.state !== GameConnectionState.CONNECTED) return false;
  const playerId = connection.id;
  const principal = connection.sessionData.user.id;
  // Do not rely on callers having sanitized the packet. The exact same rule governs
  // ordinary input, direct queue calls, inspection and later application.
  const candidate = permittedCorrections(input.bodies, playerId)[0];
  const body = getById(state.bodies, connection.id);
  if (!candidate || !body || body.flags & (RigidBodyFlags.LOCKED | RigidBodyFlags.FIXED | RigidBodyFlags.ANIMATED)) return false;
  const now = performance.now();
  const previous = receivedAt.get(connection);
  receivedAt.set(connection, now);
  // MuDB reuses message objects after the handler. Retain an owned clone only.
  const retained = NetPositionCorrectionSetSchema.clone([candidate]);
  const handled = inspectMovement(state, {
    playerId: connection.id,
    from: { x: body.px, y: body.py, z: body.pz },
    to: { x: candidate.px, y: candidate.py, z: candidate.pz },
    velocity: { from: { x: body.vx, y: body.vy, z: body.vz }, to: { x: candidate.vx, y: candidate.vy, z: candidate.vz } },
    elapsedMs: previous === undefined ? 0 : Math.max(0, now - previous),
    inputTick: tick, serverTick: state.clock.tick,
    mode: process.env.MODE === 'edit' ? 'edit' : 'play',
  }, (allow) => {
    try {
      const current = state.connections[sessionId];
      const currentBody = getById(state.bodies, connection.id);
      if (!allow || !current || current !== connection || current.id !== playerId || current.sessionData.user.id !== principal || current.state !== GameConnectionState.CONNECTED ||
        current.net.inputPauseCounter !== pauseCounter || !currentBody ||
        currentBody.flags & (RigidBodyFlags.LOCKED | RigidBodyFlags.FIXED | RigidBodyFlags.ANIMATED)) return;
      // Expired rewind ticks are dropped, never applied to a different tick/player.
      const destination = getServerNetInput(state, tick);
      const entry = destination && getById(destination.clients, connection.id);
      if (!entry) return;
      NetPositionCorrectionSetSchema.assign(entry.input.bodies, permittedCorrections(retained, playerId));
      state.net.lastInputTick = Math.min(state.net.lastInputTick, tick);
    } finally { NetPositionCorrectionSetSchema.free(retained); }
  });
  if (!handled) NetPositionCorrectionSetSchema.free(retained);
  return handled;
}
