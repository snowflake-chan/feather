import { ApiClient } from '@box/apis'
import { moderationAuthorization } from './moderation-credential'

/** Only public map instances report versions; an old private room must not replace the latest published version. */
export class ModerationMetadataReporter {
  private pending = false
  private lastSnapshot = ''
  private api: ApiClient
  private enabled: boolean
  private mapId = process.env.BOX_WORLD_PERMANENT_MAP_ID || ''
  private mode = process.env.MODE === 'edit' ? ('edit' as const) : ('play' as const)
  constructor(private snapshot: () => { name: string }) {
    const baseUrl = process.env.BOX_PLAYER_SERVICE_INTERNAL_URL || ''
    const serverId = process.env.SERVER_ID || ''
    this.enabled = !!(
      baseUrl &&
      process.env.BOX_MODERATION_CREDENTIAL_PATH &&
      this.mapId &&
      (!serverId || serverId === this.mapId)
    )
    this.api = new ApiClient({
      baseUrl,
      defaultErrorMessage: '地图版本登记失败',
    })
    if (this.enabled) {
      const timer = setInterval(() => void this.refresh(), 30000)
      timer.unref()
    }
  }
  async refresh() {
    if (!this.enabled || this.pending) return
    this.pending = true
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    try {
      const value = this.snapshot()
      const body = {
          mapId: this.mapId,
          groupId: process.env.BOX_GROUP_STORAGE_NAMESPACE || this.mapId,
          mode: this.mode,
          name: (process.env.BOX_SERVER_NAME || value.name).slice(0, 64) || this.mapId,
          projectId: this.mapId,
          publicId: process.env.BOX_WORLD_PUBLIC_ID || process.env.CONTENT_ID || this.mapId,
          description: (process.env.BOX_WORLD_DESCRIPTION || '').slice(0, 2000),
          version: (process.env.BOX_WORLD_VERSION || '').slice(0, 64),
      }
      const signature = JSON.stringify(body)
      if (signature === this.lastSnapshot) return
      await this.api.postApiPlayerInternalScriptMetadata({
        body,
        signal: controller.signal,
        headers: { Authorization: moderationAuthorization() },
      })
      this.lastSnapshot = signature
    } catch {
      /* Reporting failure never grants authority; the owner sees unavailable metadata. */
    } finally {
      clearTimeout(timer)
      this.pending = false
    }
  }
}
