import type { Logger } from 'pino';
import { ModerationClient } from '../moderation/moderation-client';
import type { GameServer } from '../index';
const WebSocket = require('ws');
function normalizedSubjectId(value: string) { return value.replace(/-/g, '').toLowerCase(); }

/** Legacy export name retained; transport is now an authenticated, replayable event stream. */
export function startPlayerRevocationPoller(game: GameServer, logger: Logger) {
  const serviceURL = (process.env.BOX_PLAYER_SERVICE_INTERNAL_URL || '').trim().replace(/\/$/, '');
  const secret = process.env.PERMISSION_TOKEN_SECRET || '';
  if (!serviceURL || !secret) return () => {};
  const configuredTtl = Number(process.env.BOX_RUNTIME_IDENTITY_TTL_MS);
  const identityTtlMs = Number.isFinite(configuredTtl) && configuredTtl >= 5000 ? configuredTtl : 5 * 60_000;
  const since = new Date(Date.now() - identityTtlMs - 30_000).toISOString();
  const seen = new Set<string>();
  let cursor = '0'; let disposed = false; let socket: any;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let connectionDeadline: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  const moderation = new ModerationClient();
  let admissionBusy = false; let admissionAgain = false;
  const checkAdmission = async () => {
    if (admissionBusy) { admissionAgain = true; return; }
    admissionBusy = true;
    try {
      do {
        admissionAgain = false;
        const connections = game.state.connectionSet.slice();
        for (let offset = 0; moderation.mapId && process.env.MODE !== 'edit' && offset < connections.length && !disposed; offset += 100) {
          const batch = connections.slice(offset, offset + 100);
          const denied = await moderation.deniedPlayers(batch.map(c => ({ userId: c.sessionData.user.id, ipAddress: c.sessionData.ipAddress, deviceHash: c.sessionData.deviceHash || undefined })));
          // Only the same live connection may consume this asynchronously obtained result.
          for (const index of denied) if (game.state.connectionSet.includes(batch[index])) game.net.kickSession(batch[index].sessionId);
        }
      } while (admissionAgain && !disposed);
    } catch (error) { logger.warn(`Player admission sync failed: ${(error as Error).message}`); socket?.close(); }
    finally { admissionBusy = false; }
  };
  const schedule = () => {
    if (disposed) return;
    retry = setTimeout(() => { void open(); }, Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5))); retry.unref?.();
  };
  const controller = new AbortController();
  const open = async () => {
    if (disposed) return;
    try {
      const response = await fetch(`${serviceURL}/api/realtime/session`, {
        method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'revocations', after: cursor, since }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
      });
      if (!response.ok) throw new Error(`event bootstrap ${response.status}`);
      const grant = await response.json() as { socketPath: string; ticket: string };
      if (disposed) return;
      const url = new URL(grant.socketPath, serviceURL);
      if (url.origin !== new URL(serviceURL).origin) throw new Error('event stream origin mismatch');
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(url.href, { maxPayload: 1024 * 1024 }); socket = ws;
      connectionDeadline = setTimeout(() => ws.terminate(), 10_000); connectionDeadline.unref?.();
      ws.on('open', () => ws.send(JSON.stringify({ type: 'connect', ticket: grant.ticket })));
      ws.on('message', bytes => {
        if (disposed || socket !== ws) return;
        try {
          const data = JSON.parse(String(bytes));
          if (data.type === 'ready') { failures = 0; clearTimeout(connectionDeadline); return; }
          if (data.type === 'resync-required') { ws.close(); return; }
          if (data.type === 'admission-changed') { void checkAdmission(); return; }
          if (data.type !== 'revocations' || !Array.isArray(data.events) || !/^\d+$/.test(String(data.cursor || '')) || !Number.isSafeInteger(Number(data.cursor)) || Number(data.cursor) < Number(cursor)) throw new Error('invalid revocation event');
          for (const event of data.events) {
            if (typeof event.id !== 'string' || !/^\d+$/.test(event.id) || !Number.isFinite(Date.parse(event.createdAt))) throw new Error('invalid revocation replay');
            if (seen.has(event.id)) continue;
            if (typeof event.subjectId !== 'string' || typeof event.reason !== 'string') throw new Error('invalid revocation identity');
            const subjectId = normalizedSubjectId(event.subjectId);
            if (!subjectId) continue;
            seen.add(event.id);
            for (const connection of game.state.connectionSet.slice()) {
              if (normalizedSubjectId(connection.sessionData.fingerPrint || '') !== subjectId) continue;
              logger.info(`Disconnecting revoked local player subject=${subjectId} session=${connection.sessionId} reason=${event.reason}`);
              game.net.kickSession(connection.sessionId);
            }
          }
          cursor = data.cursor;
        } catch (error) { logger.warn(`Player revocation event failed: ${(error as Error).message}`); ws.close(); }
      });
      ws.on('error', () => ws.terminate());
      ws.on('close', () => { if (socket !== ws) return; clearTimeout(connectionDeadline); socket = undefined; schedule(); });
    } catch (error) { if (!disposed) { logger.warn(`Player revocation connection failed: ${(error as Error).message}`); schedule(); } }
  };
  void open();
  return () => { disposed = true; controller.abort(); clearTimeout(retry); clearTimeout(connectionDeadline); socket?.terminate(); };
}
