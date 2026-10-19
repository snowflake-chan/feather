/** Preserve per-player receive order even if script replies arrive out of order. */
export class MessageGate {
  private sequence = 0;
  private queues = new Map<number, number[]>();
  private pending = new Map<number, { playerId: number; allow?: boolean; reason?: string; complete: (allow: boolean, reason?: string) => void; timer: ReturnType<typeof setTimeout> }>();
  constructor(private timeoutMs = 200) {}
  submit(playerId: number, send: (handle: number) => void, complete: (allow: boolean, reason?: string) => void) {
    const queue = this.queues.get(playerId) || [];
    if (queue.length >= 16 || this.pending.size >= 128) { complete(false, "inspection-capacity"); return; }
    const handle = this.sequence++ >>> 0;
    const timer = setTimeout(() => this.decide(handle, playerId, false, "inspection-timeout"), this.timeoutMs);
    timer.unref?.();
    this.pending.set(handle, { playerId, complete, timer });
    queue.push(handle);
    this.queues.set(playerId, queue);
    try { send(handle); } catch { this.decide(handle, playerId, false, "script-unavailable"); }
  }
  decide(handle: number, playerId: number, allow: boolean, reason = "map-rule") {
    const item = this.pending.get(handle);
    if (!item || item.playerId !== playerId || item.allow !== undefined) return;
    item.allow = allow === true; item.reason = reason;
    clearTimeout(item.timer);
    const queue = this.queues.get(playerId)!;
    while (queue.length) {
      const next = this.pending.get(queue[0])!;
      if (next.allow === undefined) break;
      this.pending.delete(queue.shift()!);
      next.complete(next.allow, next.reason);
    }
    if (!queue.length) this.queues.delete(playerId);
  }
  reset() {
    const pending = [...this.pending.values()];
    this.pending.clear();
    this.queues.clear();
    for (const item of pending) { clearTimeout(item.timer); item.complete(false, "script-restart"); }
  }
}
