import type { MovementSample } from './movement-inspector';

/** Bounded pre-application decisions: no asynchronous listener can grow a backlog. */
export class MovementGate {
  private sequence = 0;
  private pending = new Map<number, { playerId: number; complete: (allow: boolean, reason?: string) => void; timer: ReturnType<typeof setTimeout> }>();
  private players = new Set<number>();
  constructor(private send: (handle: number, sample: MovementSample) => void, private timeoutMs = 200) {}
  submit(sample: MovementSample, complete: (allow: boolean, reason?: string) => void) {
    if (this.pending.size >= 64 || this.players.has(sample.playerId)) {
      complete(false, "inspection-capacity");
      return;
    }
    const handle = this.sequence++ >>> 0;
    const timer = setTimeout(() => this.decide(handle, sample.playerId, false, "inspection-timeout"), this.timeoutMs);
    timer.unref?.();
    this.pending.set(handle, { playerId: sample.playerId, complete, timer });
    this.players.add(sample.playerId);
    try { this.send(handle, sample); }
    catch { this.decide(handle, sample.playerId, false, "script-unavailable"); }
  }
  decide(handle: number, playerId: number, allow: boolean, reason = "map-rule") {
    const item = this.pending.get(handle);
    if (!item || item.playerId !== playerId) return;
    this.pending.delete(handle);
    this.players.delete(playerId);
    clearTimeout(item.timer);
    item.complete(allow === true, reason);
  }
  reset() {
    for (const [handle, item] of this.pending) this.decide(handle, item.playerId, false, "script-restart");
  }
}
