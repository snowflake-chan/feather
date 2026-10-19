import { MuClient } from '@box/mudb/client'
import type { GameModeration, ModerationOptions, ModerationBan, ModerationBatchResult, ModerationBanRecord, ModerationBanQuery } from '@box/schema/api/js/moderation'
import type { GamePlayer } from '@box/schema/api/js/api'
import { moderationError, normalizeModerationError } from '@box/schema/api/js/moderation-error'
import { PromiseWrapper } from '../utils/script-promise'
import { ModerationProtocol } from './moderation-protocol'
import { scriptModerationError } from './moderation-script-error'

// Hide legacy transport scope from the public script records.
function publicBan<T extends ModerationBan>(ban: T): T {
  const record = { ...ban }
  delete (record as T & { scope?: unknown }).scope
  return record
}

/** Called by the trusted shell before evaluating user code; play has no inspection property. */
export class ModerationScript implements GameModeration {
  private pending = new Map<number, { wrapper: PromiseWrapper<any>; timer: number }>()
  private sequence = 0
  private automaticSequence = 0
  private readonly requestPrefix = `auto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
  private protocol
  constructor(
    client: MuClient,
    private schedule: (event: () => void) => void,
    private playerId: (entity: GamePlayer) => number,
    private timers: { setTimeout: (fn: () => void, ms: number) => number; clearTimeout: (id: number) => void },
  ) {
    this.protocol = client.protocol(ModerationProtocol)
    this.protocol.configure({
      message: {
        reply: (message) => {
          const item = this.pending.get(message.handle)
          if (!item) return
          this.pending.delete(message.handle)
          this.timers.clearTimeout(item.timer)
          try {
            const result = JSON.parse(message.payload)
            if (message.success) item.wrapper.notifyDone(result)
            else item.wrapper.notifyError(normalizeModerationError(result, 503, '地图管理操作失败'))
          } catch {
            item.wrapper.notifyError(moderationError(502, '地图管理响应无效', 'MODERATION_RESPONSE_INVALID'))
          }
        },
      },
    })
  }
  private async request<T>(action: string, player: GamePlayer | undefined, options: object): Promise<T> {
    if (this.pending.size >= 8) throw scriptModerationError(moderationError(429, '地图管理请求过多'))
    let playerId: number
    let payload: string
    try {
      payload = JSON.stringify({ ...options, action })
    } catch (error) {
      throw scriptModerationError(error, 400, '地图管理参数无效')
    }
    try { playerId = ['banPlayer', 'banCurrentIP', 'banCurrentDevice', 'getPlayerStatus'].includes(action) || player !== undefined ? this.playerId(player as GamePlayer) : 0 } catch {
      throw scriptModerationError(moderationError(400, '目标不是当前地图的玩家', 'MODERATION_TARGET_INVALID'))
    }
    if (payload.length > 2048) throw scriptModerationError(moderationError(400, '地图管理参数过长', 'MODERATION_PAYLOAD_TOO_LARGE'))
    const handle = this.sequence++ >>> 0
    const wrapper = new PromiseWrapper<T>(this.schedule, undefined, scriptModerationError)
    const timer = this.timers.setTimeout(() => {
      this.pending.delete(handle)
      wrapper.notifyError(moderationError(504, '地图管理请求超时，操作可能已执行；手动重试须事先指定并复用 requestId'))
    }, 12000)
    this.pending.set(handle, { wrapper, timer })
    try {
      this.protocol.server.message.request({ handle, playerId, payload })
    } catch (error) {
      this.timers.clearTimeout(timer)
      this.pending.delete(handle)
      wrapper.notifyError(normalizeModerationError(error))
    }
    return wrapper.query
  }
  private operationOptions<T extends { requestId?: string }>(options: T): T & { requestId: string } {
    if (!options || typeof options !== 'object' || Array.isArray(options))
      throw scriptModerationError(moderationError(400, '地图管理参数无效', 'MODERATION_OPTIONS_INVALID'))
    return { ...options, requestId: options.requestId === undefined
      ? `${this.requestPrefix}-${this.automaticSequence++}` : options.requestId }
  }
  private async ban(action: string, players: GamePlayer | readonly GamePlayer[], options: ModerationOptions): Promise<ModerationBan | ModerationBatchResult[]> {
    const batchOptions = this.operationOptions(options)
    if (!Array.isArray(players)) return this.request<ModerationBan>(action, players as GamePlayer, { ...batchOptions, scope: 'server' }).then(publicBan)
    // Validate the batch envelope before starting any irreversible operation.
    if (players.length > 100)
      throw scriptModerationError(moderationError(400, '批量最多 100 个玩家', 'MODERATION_BATCH_TOO_LARGE'))
    if (!/^[A-Za-z0-9._-]{1,72}$/.test(batchOptions.requestId))
      throw scriptModerationError(moderationError(400, 'requestId 须为 1–72 个合法字符', 'MODERATION_REQUEST_ID_INVALID'))
    const targets = [...players]
    const results: ModerationBatchResult[] = []
    for (let index = 0; index < targets.length; index++) {
      try {
        const ban = await this.request<ModerationBan>(action, targets[index], { ...batchOptions, requestId: `${batchOptions.requestId}.b${index}`, scope: 'server' })
        results.push({ index, success: true, ban: publicBan(ban) })
      } catch (error) {
        results.push({ index, success: false, error: normalizeModerationError(error) })
      }
    }
    return results
  }
  banPlayer(player: GamePlayer, options: ModerationOptions): Promise<ModerationBan>
  banPlayer(players: readonly GamePlayer[], options: ModerationOptions): Promise<ModerationBatchResult[]>
  banPlayer(players: GamePlayer | readonly GamePlayer[], options: ModerationOptions): Promise<ModerationBan | ModerationBatchResult[]>
  banPlayer(players: GamePlayer | readonly GamePlayer[], options: ModerationOptions) {
    return this.ban('banPlayer', players, options)
  }
  banCurrentIP(player: GamePlayer, options: ModerationOptions): Promise<ModerationBan>
  banCurrentIP(players: readonly GamePlayer[], options: ModerationOptions): Promise<ModerationBatchResult[]>
  banCurrentIP(players: GamePlayer | readonly GamePlayer[], options: ModerationOptions): Promise<ModerationBan | ModerationBatchResult[]>
  banCurrentIP(players: GamePlayer | readonly GamePlayer[], options: ModerationOptions) {
    return this.ban('banCurrentIP', players, options)
  }
  banCurrentDevice(player: GamePlayer, options: ModerationOptions): Promise<ModerationBan>
  banCurrentDevice(players: readonly GamePlayer[], options: ModerationOptions): Promise<ModerationBatchResult[]>
  banCurrentDevice(players: GamePlayer | readonly GamePlayer[], options: ModerationOptions): Promise<ModerationBan | ModerationBatchResult[]>
  banCurrentDevice(players: GamePlayer | readonly GamePlayer[], options: ModerationOptions) {
    return this.ban('banCurrentDevice', players, options)
  }
  async revokeBan(banId: string, options: { reason: string; requestId?: string }) {
    return this.request<{ revoked: boolean; id: string }>('revokeBan', undefined, { ...this.operationOptions(options), banId })
  }
  async listBans(query: ModerationBanQuery = {}) {
    if (!query || typeof query !== 'object' || Array.isArray(query))
      throw scriptModerationError(moderationError(400, '处罚查询条件无效', 'MODERATION_QUERY_INVALID'))
    const { player, ...filters } = query
    const result = await this.request<{ items: ModerationBanRecord[]; total: number; page: number; pageSize: number }>('listBans', player, filters)
    return { ...result, items: result.items.map(publicBan) }
  }
  async getBan(banId: string) {
    const result = await this.request<{ ban: ModerationBanRecord | null }>('getBan', undefined, { banId })
    return result.ban ? publicBan(result.ban) : null
  }
  async getPlayerStatus(player: GamePlayer) {
    const result = await this.request<{ status: string; bans: ModerationBan[] }>('getPlayerStatus', player, {})
    return { ...result, bans: result.bans.map(publicBan) }
  }
}
