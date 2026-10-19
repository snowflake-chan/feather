import type { MuServer, MuIncomingMessage } from '@box/mudb/server';
import { GameConnectionState, GameServerState } from '../game-server-schema';
import { auditRejection } from './audit';
import { MessageGate } from './message-gate';

const secretField = /password|authorization|cookie|secret|token|sessionid|ipaddress|devicehash|privatekey/i;
function publicData(data: any, depth = 0): any {
  if (depth > 16) throw new Error('Message nesting too deep');
  if (data instanceof Uint8Array) return { binary: true, byteLength: data.byteLength };
  // Engine physics vectors are numeric typed arrays, not arbitrary binary messages.
  // Preserve their numeric sequence for classified listeners and JSON snapshots.
  if (ArrayBuffer.isView(data) && !(data instanceof DataView)) return Array.from(data as any);
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => publicData(item, depth + 1));
  return Object.fromEntries(Object.entries(data).map(([key, value]) => {
    if (secretField.test(key)) return [key, '[redacted]'];
    // GUI/remoteChannel carry JSON inside strings; redact nested credential fields too.
    if ((key === 'args' || key === 'payload') && typeof value === 'string') {
      let parsed: unknown;
      try { parsed = JSON.parse(value); }
      catch { return [key, value]; }
      return [key, JSON.stringify(publicData(parsed, depth + 1))];
    }
    return [key, publicData(value, depth + 1)];
  }));
}

export class MessageInspector {
  private gate = new MessageGate();
  constructor(private server: MuServer, private state: GameServerState, private audit: (record: object) => void = () => {}) {}
  listen(send?: (handle: number, playerId: number, payload: string) => void,
    observes: (event: MuIncomingMessage) => boolean = () => true) {
    this.gate.reset();
    this.server.messageGuard = send ? (event, complete) => {
      if (!observes(event)) { complete(true); return; }
      this.inspect(event, send, complete);
    } : undefined;
  }
  decide(handle: number, playerId: number, allow: boolean, reason?: string) { this.gate.decide(handle, playerId, allow, reason); }
  private inspect(event: MuIncomingMessage, send: (handle: number, playerId: number, payload: string) => void, complete: (allow: boolean) => void) {
    const connection = this.state.connections[event.sessionId];
    // Only connection maintenance may run without an authenticated, joined player.
    // Do not turn "cannot construct a GamePlayer" into a business-message bypass.
    if (!connection || !connection.id || connection.state !== GameConnectionState.CONNECTED) {
      complete(event.protocol === 'game-net' && ['join', 'synchronize', 'acknowledge', 'pause', 'unpause'].includes(event.message));
      return;
    }
    const playerId = connection.id;
    const principal = connection.sessionData?.user?.id;
    const identity = { playerId, userId: principal || null, name: connection.sessionData?.user?.displayname || null };
    const finish = (allow: boolean, reason?: string) => {
      if (!allow) this.audit(auditRejection(identity, 'message', reason, {
        protocol: event.protocol, message: event.message, serverTick: this.state.clock.tick,
      }));
      complete(allow);
    };
    let payload: string;
    try {
      payload = JSON.stringify({
        protocol: event.protocol, message: event.message, data: publicData(event.data) ?? null, unreliable: event.unreliable,
        serverTick: this.state.clock.tick, mode: process.env.MODE === 'edit' ? 'edit' : 'play',
      });
      if (payload.length > 16384) throw new Error('Message inspection payload too large');
    } catch { finish(false, 'invalid-inspection-payload'); return; }
    this.gate.submit(playerId, (handle) => send(handle, playerId, payload), (allow, reason) => {
      const current = this.state.connections[event.sessionId];
      const valid = !!current && current === connection && current.id === playerId &&
        current.sessionData?.user?.id === principal && current.state === GameConnectionState.CONNECTED;
      finish(allow && valid, valid ? reason : 'connection-changed');
    });
  }
}
