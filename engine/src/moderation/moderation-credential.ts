import fs from 'node:fs'

/** This file and its contents stay in the trusted host, outside the map sandbox. */
export function moderationAuthorization(): string {
  const file = process.env.BOX_MODERATION_CREDENTIAL_PATH
  if (!file) throw new Error('地图管理凭证未配置，请更新启动器配置并重启服务')
  const token = fs.readFileSync(file, 'utf8').trim()
  if (!token || token.length > 2048) throw new Error('地图管理凭证无效')
  return `Moderation ${token}`
}
