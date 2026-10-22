/**
 * 脚本超时判定。
 *
 * 抽成纯函数的原因：这段逻辑刚刚咬过一次人——用墙上时钟算「多久没收到 postTick」，
 * 会把「脚本还在初始化」也算成卡死，于是每次开大图都在 10s 时杀掉脚本，
 * crash handler 再触发一次完整重同步，形成「杀→同步→再杀」的循环。
 *
 * 判定分两段：
 * - 第一帧之前（`ticking === false`）：不算卡死，只受 init grace 约束。
 *   大工程加载 + 全量同步实测能到 40s 以上，拿 scriptTimeout（10s）去卡必然误杀。
 *   保留 grace 只是为了别让模块顶层的死循环永久占住 worker。
 * - 第一帧之后（`ticking === true`）：两次 postTick 间隔超过 scriptTimeout 才算卡死。
 */

/** 第一帧之前的默认宽限 */
export const SCRIPT_INIT_GRACE_MS = 120_000;

export interface ScriptTimeoutInput {
  /** `settings.scriptTimeout`，ms；<= 0 或非有限值表示不限制 */
  timeoutMs: number;
  /** 是否已经收到过至少一帧 postTick */
  ticking: boolean;
  /** 脚本 start() 的时刻 */
  startedAt: number;
  /** 最后一次收到 postTick 的时刻 */
  lastTickAt: number;
  now: number;
  /** 覆盖第一帧宽限；不传则按 env / 默认值推 */
  initGraceMs?: number;
}

export type ScriptTimeoutVerdict =
  | { kill: false }
  | { kill: true; phase: 'init' | 'tick'; elapsedMs: number };

export function resolveScriptInitGraceMs(timeoutMs: number): number {
  const configured = Number(process.env.SCRIPT_INIT_GRACE_MS);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return Math.max(timeoutMs * 4, SCRIPT_INIT_GRACE_MS);
}

export function evaluateScriptTimeout(input: ScriptTimeoutInput): ScriptTimeoutVerdict {
  const { timeoutMs, ticking, startedAt, lastTickAt, now } = input;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return { kill: false };

  if (!ticking) {
    const grace = input.initGraceMs ?? resolveScriptInitGraceMs(timeoutMs);
    const elapsedMs = now - startedAt;
    if (elapsedMs <= grace) return { kill: false };
    return { kill: true, phase: 'init', elapsedMs };
  }

  const elapsedMs = now - lastTickAt;
  if (elapsedMs <= timeoutMs) return { kill: false };
  return { kill: true, phase: 'tick', elapsedMs };
}
