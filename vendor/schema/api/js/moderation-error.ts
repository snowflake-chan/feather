import type { ModerationError, ModerationErrorStatus } from './moderation'

/** Stable business codes; independent of the HTTP response status. */
export const moderationErrorCodes = {
  MODERATION_PARAMS_INVALID: 41000,
  MODERATION_OPTIONS_INVALID: 41001,
  MODERATION_TARGET_INVALID: 41002,
  MODERATION_PAYLOAD_TOO_LARGE: 41003,
  MODERATION_BATCH_TOO_LARGE: 41004,
  MODERATION_REQUEST_ID_INVALID: 41005,
  MODERATION_REASON_INVALID: 41006,
  MODERATION_DURATION_INVALID: 41007,
  MODERATION_BAN_ID_INVALID: 41008,
  MODERATION_QUERY_INVALID: 41009,
  MODERATION_ACTION_INVALID: 41010,
  MODERATION_IP_INVALID: 41011,
  MODERATION_DEVICE_UNAVAILABLE: 41012,
  MODERATION_METHOD_NOT_ALLOWED: 41013,
  MODERATION_AUTH_REQUIRED: 41100,
  MODERATION_FORBIDDEN: 41300,
  MODERATION_MAP_MISMATCH: 41301,
  MODERATION_GRANT_INVALID: 41302,
  MODERATION_LEGACY_GRANT_INVALID: 41303,
  MODERATION_QUERY_FORBIDDEN: 41304,
  MODERATION_ACTION_FORBIDDEN: 41305,
  MODERATION_BAN_ACCESS_DENIED: 41306,
  MODERATION_DURATION_LIMIT_EXCEEDED: 41307,
  MODERATION_ADMIN_PROTECTED: 41308,
  MODERATION_DEVICE_PROTECTED: 41309,
  MODERATION_SERVER_BAN_FORBIDDEN: 41310,
  MODERATION_GRANT_REQUIRED: 41311,
  MODERATION_GRANT_EXPIRED: 41312,
  MODERATION_GRANT_REVOKED: 41313,
  MODERATION_PERMANENT_FORBIDDEN: 41314,
  MODERATION_NOT_FOUND: 41400,
  MODERATION_PLAYER_OFFLINE: 41401,
  MODERATION_PLAYER_NOT_FOUND: 41402,
  MODERATION_CONFLICT: 41900,
  MODERATION_REQUEST_ID_CONFLICT: 41901,
  MODERATION_BAN_ALREADY_EXISTS: 41902,
  MODERATION_ACCOUNT_ALREADY_PUNISHED: 41903,
  MODERATION_BAN_CHANGED: 41904,
  MODERATION_RATE_LIMITED: 42900,
  MODERATION_RESPONSE_INVALID: 45002,
  MODERATION_INTERNAL_ERROR: 45000,
  MODERATION_UNAVAILABLE: 45003,
  MODERATION_RUNTIME_DISABLED: 45004,
  MODERATION_RATE_LIMIT_UNAVAILABLE: 45005,
  MODERATION_TIMEOUT: 45006,
} as const

const statuses: Record<number, ModerationErrorStatus> = {
  400: 'MODERATION_PARAMS_INVALID', 401: 'MODERATION_AUTH_REQUIRED',
  403: 'MODERATION_FORBIDDEN', 404: 'MODERATION_NOT_FOUND',
  405: 'MODERATION_METHOD_NOT_ALLOWED', 409: 'MODERATION_CONFLICT',
  429: 'MODERATION_RATE_LIMITED', 502: 'MODERATION_RESPONSE_INVALID',
  503: 'MODERATION_UNAVAILABLE', 504: 'MODERATION_TIMEOUT',
}

export function moderationError(httpStatus: number, msg: string, status?: ModerationErrorStatus): ModerationError {
  const type = status || statuses[httpStatus] || 'MODERATION_INTERNAL_ERROR'
  return { status: type, code: moderationErrorCodes[type], msg }
}

/** Normalize current replies and legacy HTTP-code replies using the same catalog. */
export function normalizeModerationError(error: unknown, code = 503, fallback = '地图管理服务暂时不可用'): ModerationError {
  if (error && typeof error === 'object') {
    const value = error as { status?: unknown; code?: unknown; msg?: unknown; message?: unknown }
    if (typeof value.status === 'string' && Object.prototype.hasOwnProperty.call(moderationErrorCodes, value.status) &&
      typeof value.code === 'number' && Number.isInteger(value.code) && typeof value.msg === 'string') {
      return moderationError(code, value.msg, value.status as ModerationErrorStatus)
    }
    return moderationError(code, typeof value.message === 'string' ? value.message : fallback)
  }
  return moderationError(code, fallback)
}

/** Shared by host and HTTP validation, with no dependency on a particular Zod version. */
export function moderationValidationError(issues: readonly { path: readonly PropertyKey[] }[]): ModerationError {
  const fields: Record<string, [ModerationErrorStatus, string]> = {
    reason: ['MODERATION_REASON_INVALID', '处罚原因须为 1–500 个字符'],
    durationSeconds: ['MODERATION_DURATION_INVALID', 'durationSeconds 必须为数字整数（0–604800）；永久封禁请传数字 0，不要加引号'],
    requestId: ['MODERATION_REQUEST_ID_INVALID', 'requestId 须为合法字符且不能超过长度上限'],
    banId: ['MODERATION_BAN_ID_INVALID', '处罚 ID 无效'],
    action: ['MODERATION_ACTION_INVALID', '地图管理操作无效'],
    userId: ['MODERATION_TARGET_INVALID', '目标玩家无效'],
    ipAddress: ['MODERATION_IP_INVALID', '目标 IP 地址无效'],
    deviceHash: ['MODERATION_DEVICE_UNAVAILABLE', '目标连接没有可信的设备身份'],
    kind: ['MODERATION_QUERY_INVALID', '处罚查询条件无效'],
    status: ['MODERATION_QUERY_INVALID', '处罚查询条件无效'],
    page: ['MODERATION_QUERY_INVALID', '处罚查询页码无效'],
    pageSize: ['MODERATION_QUERY_INVALID', '每页须为 1–50 条'],
  }
  const detail = fields[String(issues[0]?.path[0])]
  return detail ? moderationError(400, detail[1], detail[0]) : moderationError(400, '地图管理参数无效')
}
