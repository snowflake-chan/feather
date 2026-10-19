import type { GamePlayer } from '@box/schema/api/js/api';
import type { ClientMessageData, GameAnticheatExemption, GameAnticheatHistoryEntry, GameAnticheatTracker, GameAnticheatTrackerOptions } from '@box/schema/api/js/anticheat';
import { trackerSnapshot } from './tracker-snapshot';

/** Optional map-owned history. No network transport, moderation authority or automatic decisions. */
export class PlayerTracker implements GameAnticheatTracker {
  private records = new WeakMap<GamePlayer, GameAnticheatHistoryEntry[]>();
  private scores = new WeakMap<GamePlayer, { value: number; tick: number }>();
  private exemptions = new WeakMap<GamePlayer, GameAnticheatExemption>();
  private lastTick = 0;
  private readonly historySize: number;
  private readonly decayPerTick: number;
  constructor(options: GameAnticheatTrackerOptions, private clock: () => number) {
    const size = options.historySize ?? 32;
    if (!Number.isInteger(size) || size < 1 || size > 256) throw new Error('historySize 必须是 1～256 的整数');
    this.historySize = size;
    const decay = options.decayPerTick ?? 0;
    if (!Number.isFinite(decay) || decay < 0) throw new Error('decayPerTick 必须是非负有限数值');
    this.decayPerTick = decay;
  }
  get serverTick() {
    const tick = this.clock();
    if (!Number.isSafeInteger(tick) || tick < 0) throw new Error('反作弊服务端时钟不可用');
    // A stalled/rewound script snapshot must not reverse decay or extend exemptions.
    this.lastTick = Math.max(this.lastTick, tick);
    return this.lastTick;
  }
  record(player: GamePlayer, data: ClientMessageData): GameAnticheatHistoryEntry {
    const entry = Object.freeze({ serverTick: this.serverTick, data: trackerSnapshot(data) });
    const history = this.records.get(player) ?? [];
    history.push(entry);
    if (history.length > this.historySize) history.shift();
    this.records.set(player, history);
    return entry;
  }
  getHistory(player: GamePlayer) { return Object.freeze([...(this.records.get(player) ?? [])]); }
  getScore(player: GamePlayer) {
    const score = this.scores.get(player);
    if (!score) return 0;
    const now = this.serverTick;
    score.value = Math.max(0, score.value - (now - score.tick) * this.decayPerTick);
    score.tick = now;
    return score.value;
  }
  addScore(player: GamePlayer, amount: number) {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('异常分数必须是非负有限数值');
    const value = this.getScore(player) + amount;
    if (!Number.isFinite(value)) throw new Error('异常分数超出有效范围');
    this.scores.set(player, { value, tick: this.serverTick });
    return value;
  }
  resetScore(player: GamePlayer) { this.scores.delete(player); }
  exempt(player: GamePlayer, options: Readonly<{ ticks: number; reason?: string }>) {
    if (!Number.isSafeInteger(options?.ticks) || options.ticks < 1) throw new Error('豁免 ticks 必须是正整数');
    const reason = options.reason ?? '';
    if (typeof reason !== 'string' || reason.length > 256) throw new Error('豁免 reason 必须是不超过 256 个字符的字符串');
    const untilTick = this.serverTick + options.ticks;
    if (!Number.isSafeInteger(untilTick)) throw new Error('豁免时间超出有效范围');
    this.exemptions.set(player, Object.freeze({ untilTick, reason }));
  }
  getExemption(player: GamePlayer) {
    const exemption = this.exemptions.get(player);
    if (exemption && this.serverTick >= exemption.untilTick) {
      this.exemptions.delete(player); return undefined;
    }
    return exemption;
  }
  isExempt(player: GamePlayer) { return this.getExemption(player) !== undefined; }
  clearExemption(player: GamePlayer) { this.exemptions.delete(player); }
  clear(player?: GamePlayer) {
    if (player) { this.records.delete(player); this.scores.delete(player); this.exemptions.delete(player); }
    else { this.records = new WeakMap(); this.scores = new WeakMap(); this.exemptions = new WeakMap(); }
  }
}

/** One bounded collection per script; helpers are reset along with entry-module listeners. */
export class TrackerFactory {
  private trackers = new Set<PlayerTracker>();
  constructor(private clock: () => number) {}
  create(options: GameAnticheatTrackerOptions = {}) {
    if (this.trackers.size >= 64) throw new Error('每个脚本最多创建 64 个反作弊记录器');
    const tracker = new PlayerTracker(options, this.clock);
    this.trackers.add(tracker);
    return tracker;
  }
  reset() {
    for (const tracker of this.trackers) tracker.clear();
    this.trackers.clear();
  }
}
