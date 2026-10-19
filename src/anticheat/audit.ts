import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import type { GameServerState } from '../game-server-schema';

const operationalReasons = new Set(['inspection-timeout', 'inspection-capacity', 'script-unavailable',
  'script-restart', 'listener-error', 'async-listener', 'player-unavailable', 'connection-changed']);
export function auditIdentity(state: GameServerState, playerId: number) {
  const connection = (state.connectionSet || Object.values(state.connections)).find(value => value.id === playerId);
  const user = connection?.sessionData?.user;
  return { playerId, userId: user?.id || null, name: user?.displayname || null };
}
export function auditRejection(identity: ReturnType<typeof auditIdentity>, kind: string, reason = 'map-rule', detail: object = {}) {
  const safeReason = reason.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 128);
  return { version: 1, time: new Date().toISOString(), ...identity, kind,
    classification: operationalReasons.has(reason) ? 'inspection-failure' : 'suspected-anomaly',
    reason: safeReason, ...detail };
}

/** Local administrator JSONL audit. No client payloads, tokens or IP addresses. */
export class AnticheatAudit {
  private queue: string[] = [];
  private pending?: Promise<void>;
  private directory: string;
  private prefix = `${Date.now()}-${process.pid}-${randomBytes(4).toString('hex')}`;
  private part = 0;
  private size = 0;
  private window = 0;
  private count = 0;
  private dropped = 0;
  constructor(root: string, namespace: string, private report: (message: string) => void,
    private maxBytes = 2 * 1024 * 1024, private maxFiles = 16) {
    this.directory = path.join(root, createHash('sha256').update(namespace).digest('hex').slice(0, 24));
  }
  record(value: object) {
    const window = Math.floor(Date.now() / 1000);
    if (window !== this.window) { this.window = window; this.count = 0; }
    if (++this.count > 20 || this.queue.length >= 128) { this.dropped++; return; }
    let line: string;
    try { line = JSON.stringify(value) + '\n'; }
    catch { this.dropped++; return; }
    if (Buffer.byteLength(line) > 8192) { this.dropped++; return; }
    this.queue.push(line);
    this.start();
  }
  private start() {
    if (this.pending) return;
    this.pending = this.drain().catch(() => {
      this.dropped += this.queue.length; this.queue = [];
      this.report('Anticheat audit write failed; check audit directory permissions and disk space');
    }).finally(() => { this.pending = undefined; if (this.queue.length) this.start(); });
  }
  private async drain() {
    await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
    while (this.queue.length) {
      const line = this.queue[0];
      if (this.size && this.size + Buffer.byteLength(line) > this.maxBytes) { this.part++; this.size = 0; }
      const file = `${this.prefix}-${String(this.part).padStart(6, '0')}.jsonl`;
      await fs.appendFile(path.join(this.directory, file), line, { mode: 0o600 });
      this.queue.shift(); this.size += Buffer.byteLength(line);
      const files = (await fs.readdir(this.directory)).filter(name => /^\d+-\d+-[a-f0-9]{8}-\d{6}\.jsonl$/.test(name)).sort();
      for (const old of files.filter(name => name !== file).slice(0, Math.max(0, files.length - this.maxFiles))) {
        if (old !== file) await fs.unlink(path.join(this.directory, old)).catch(error => { if (error.code !== 'ENOENT') throw error; });
      }
    }
    if (this.dropped) { this.report(`Anticheat audit omitted ${this.dropped} records (rate limit, queue capacity or write failure)`); this.dropped = 0; }
  }
  async flush() { while (this.pending) await this.pending; }
}
