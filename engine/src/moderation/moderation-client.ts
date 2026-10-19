import { ApiClient, ApiClientError } from '@box/apis'
import { moderationError, normalizeModerationError } from '@box/schema/api/js/moderation-error'
import { moderationAuthorization } from './moderation-credential'

/** Only the trusted runtime host owns this transport; never import into the script bundle. */
export class ModerationClient {
  private api: ApiClient
  readonly mapId = process.env.BOX_WORLD_PERMANENT_MAP_ID || ''
  private configured: boolean
  constructor() {
    const baseUrl = process.env.BOX_PLAYER_SERVICE_INTERNAL_URL || ''
    this.configured = !!(
      baseUrl &&
      process.env.BOX_MODERATION_CREDENTIAL_PATH &&
      this.mapId
    )
    this.api = new ApiClient({
      baseUrl,
      defaultErrorMessage: '地图管理服务暂时不可用',
    })
  }
  async execute(body: Parameters<ApiClient['postApiPlayerInternalScriptModeration']>[0]['body']) {
    if (!this.configured) throw moderationError(503, '此运行环境未启用地图管理服务', 'MODERATION_RUNTIME_DISABLED')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      return await this.api.postApiPlayerInternalScriptModeration({
        body,
        signal: controller.signal,
        headers: { Authorization: moderationAuthorization() },
      })
    } catch (error) {
      if (error instanceof ApiClientError)
        throw normalizeModerationError(error.details, error.response.status, error.message)
      if (controller.signal.aborted) throw moderationError(504, '地图管理请求超时，操作可能已执行；重试请复用 requestId')
      throw moderationError(503, '地图管理服务暂时不可用')
    } finally {
      clearTimeout(timer)
    }
  }
  async admission(userId: string, ipAddress: string, deviceHash?: string): Promise<boolean> {
    if (!this.mapId || process.env.MODE === 'edit') return true
    if (!this.configured) return false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    try {
      const result = await this.api.postApiPlayerInternalMapAdmission({
        body: { mapId: this.mapId, userId, ipAddress, deviceHash: deviceHash || undefined },
        signal: controller.signal,
        headers: { Authorization: moderationAuthorization() },
      })
      return result.allowed === true
    } finally {
      clearTimeout(timer)
    }
  }
  async deniedPlayers(players: Array<{ userId: string; ipAddress: string; deviceHash?: string }>): Promise<number[]> {
    if (!this.configured) return []
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    try {
      const result = await this.api.postApiPlayerInternalMapAdmission({
        body: { mapId: this.mapId, players },
        signal: controller.signal,
        headers: { Authorization: moderationAuthorization() },
      })
      if (
        !Array.isArray(result.denied) ||
        result.denied.some((index) => !Number.isInteger(index) || index < 0 || index >= players.length)
      )
        throw new Error('地图准入响应无效')
      return result.denied
    } finally {
      clearTimeout(timer)
    }
  }
}
