import type { MuRemoteClient } from '@box/mudb/server';

/** Server-issued wire handles bind GUI replies to one player and one script request. */
export class GUIReplyRouter {
  private sequence = 0;
  private pending = new Map<number, {
    player: MuRemoteClient<any>; script: MuRemoteClient<any>; handle: number;
    valid: () => boolean; timer: ReturnType<typeof setTimeout>;
  }>();
  reserve(player: MuRemoteClient<any>, script: MuRemoteClient<any>, handle: number, valid: () => boolean): number {
    if (this.pending.size >= 1024 || [...this.pending.values()].filter((item) => item.player === player).length >= 128) {
      throw new Error('GUI requests exceed the pending limit');
    }
    let wire = this.sequence++ >>> 0;
    while (this.pending.has(wire)) wire = this.sequence++ >>> 0;
    const timer = setTimeout(() => this.cancel(wire, 'GUI request timed out'), 10000);
    timer.unref?.();
    this.pending.set(wire, { player, script, handle, valid, timer });
    return wire;
  }
  reply(player: MuRemoteClient<any>, wire: number, success: boolean, text: string) {
    const item = this.pending.get(wire);
    if (!item || item.player !== player) return;
    this.pending.delete(wire); clearTimeout(item.timer);
    if (!item.valid()) return;
    if (success) item.script.message.return({ handle: item.handle, value: text });
    else item.script.message.throw({ handle: item.handle, message: text });
  }
  cancel(wire: number, reason?: string) {
    const item = this.pending.get(wire);
    if (!item) return;
    this.pending.delete(wire); clearTimeout(item.timer);
    if (reason && item.valid()) item.script.message.throw({ handle: item.handle, message: reason });
  }
  reset() { for (const wire of [...this.pending.keys()]) this.cancel(wire, 'GUI reset'); }
}
