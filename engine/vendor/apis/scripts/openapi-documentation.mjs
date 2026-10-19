const exactSummaries = {
  'get /api/player-login/start': '发起独立公网地址的玩家登录',
  'get /api/player-login/callback': '交换一次性登录码并设置本站会话',
  'post /api/player-auth/transfer': '为已登录玩家签发短时单次登录码',
  'post /api/player-internal/login-transfer': '兑换目标服务和浏览器绑定的登录码',
  'get /api/health-check': '检查当前服务健康状态',
  'get /api/creator/v1/health': '检查 Creator CLI 服务状态',
  'post /api/player-auth/login': '登录玩家账号',
  'post /api/player-auth/register': '注册玩家账号',
  'post /api/player-auth/logout': '退出玩家账号',
  'get /api/player-auth/session': '读取当前玩家会话',
  'post /api/auth/login': '登录玩家账号',
  'post /api/auth/logout': '退出玩家账号',
  'post /api/auth/register': '注册玩家账号',
  'get /api/auth/session': '读取当前玩家会话',
  'patch /api/auth/profile': '修改当前玩家昵称',
  'patch /api/player-auth/profile': '修改当前玩家昵称',
  'post /api/auth/password': '修改当前玩家密码并撤销会话',
  'post /api/player-auth/password': '修改当前玩家密码并撤销会话',
  'post /api/play-admin/login': '登录玩家管理后台',
  'post /api/play-admin/logout': '退出玩家管理后台',
  'get /api/play-admin/status': '读取玩家管理概览',
  'get /api/play-admin/players': '查询玩家列表',
  'post /api/play-admin/players': '创建玩家账号',
  'get /api/play-admin/containers': '查询地图容器与配置',
  'post /api/play-admin/containers': '启动或重启地图容器',
  'get /api/play-admin/container-resource-groups': '查询容器资源组',
  'post /api/play-admin/container-resource-groups': '创建容器资源组',
  'post /api/commands/{name}': '执行服务器管理命令',
  'get /api/operations/{id}': '查询服务器操作进度',
  'get /api/backups/{archive}/download': '下载服务器备份文件',
  'post /api/backups/upload': '上传服务器备份文件',
  'get /api/diagnostics/{archive}/download': '下载服务器诊断文件',
  'get /api/health': '检查服务器管理服务状态',
  'post /api/runtime/ensure': '创建或复用运行时容器',
  'delete /api/runtime/{container_id}': '销毁运行时容器',
  'get /api/runtime/{container_id}/stats': '读取运行时容器资源数据',
  'post /__local_runtime/start': '启动地图运行时',
  'post /__local_runtime/destroy': '销毁地图运行时',
  'get /__local_runtime/status': '读取地图运行时状态',
  'post /__room/{roomId}/__local_runtime/destroy': '销毁指定房间运行时',
  'post /createSession': '创建地图运行时会话',
  'post /api/createSession': '创建本地游戏会话',
  'post /block': '保存运行时资源块',
  'get /block/{hash}': '读取运行时资源块',
  'post /block/{hash}': '按哈希保存运行时资源块',
  'get /internal/creator-preview-runtime': '读取 Creator 预览运行时状态',
  'get /internal/creator-preview-runtime/events': '订阅 Creator 预览运行时事件',
  'post /internal/save-local-project': '保存 Creator 本地工程',
  'post /api/creator-logout': '退出创作者账号',
  'post /api/creator/v1/projects/{projectId}/runtime': '启动或重启工程运行时',
  'post /api/creator/v1/projects/{projectId}/scene/actions/{requestId}': '提交场景操作结果',
  'post /api/creator/v1/projects/{projectId}/scene/session': '创建场景调试会话',
  'post /api/local-projects/{id}/maps': '添加工程地图',
  'post /api/local-projects/{id}/runtime': '启动或重启工程运行时',
  'post /api/local-projects/{id}/snapshots': '创建工程快照',
  'post /api/local-projects/import': '导入 Creator 工程',
  'post /api/local/models/import': '导入 VOXA 模型',
  'post /api/creator-models/import': '导入 Creator 模型',
  'post /api/play-admin/maintenance': '执行玩家数据维护',
  'post /api/play-admin/owner-session': '验证服主管理令牌',
  'post /api/play-admin/players/{subjectId}': '执行玩家管理操作',
  'post /api/play-admin/players/batch': '执行玩家批量操作',
  'post /api/play-admin/self-password': '修改当前管理员密码',
  'post /api/play-admin/verify': '验证玩家管理凭据',
  'post /api/play-logout': '退出游玩端账号',
  'post /api/play-presence': '上报玩家在线状态',
  'delete /api/play-presence': '移除玩家在线状态',
  'post /api/player-internal/runtime-identity': '签发运行时玩家身份',
  'post /api/player-internal/script-moderation': '执行已授权地图脚本的管理操作（仅可信运行时）',
  'post /api/player-internal/script-metadata': '登记公开地图实例的脚本版本（仅可信运行时）',
  'post /api/player-internal/map-admission': '检查地图账号与 IP 封禁（仅可信运行时）',
  'get /api/play-admin/script-moderation': '查看地图脚本授权与地图封禁（仅服主）',
  'post /api/play-admin/script-moderation': '维护地图脚本授权与地图封禁（仅服主）',
  'post /api/project-models': '导入工程模型资源',
  'post /api/project-scripts': '保存工程脚本资源',
  'post /api/project-skins': '保存工程皮肤',
  'post /api/system/backups': '创建系统工程备份',
  'get /api/system/backups/{projectId}/{name}': '下载系统工程备份',
}

const resourcePatterns = [
  [/\/scene\/actions\//, '场景操作结果'],
  [/\/scene\/action$/, '待处理场景操作'],
  [/\/scene\/capture$/, '场景截图'],
  [/\/scene\/session$/, '场景调试会话'],
  [/\/scripts\//, '工程脚本文件'],
  [/\/scripts$/, '工程脚本清单'],
  [/\/storage\//, '工程存储空间'],
  [/\/runtime\/events$/, '运行时事件流'],
  [/\/runtime$/, '工程运行时'],
  [/\/resources$/, '工程资源索引'],
  [/\/snapshots$/, '历史快照'],
  [/\/asset-distribution$/, '资源分发配置'],
  [/\/maps$/, '工程地图'],
  [/\/package$/, '工程发布包'],
  [/\/publish$/, '工程发布任务'],
  [/\/import$/, '导入任务'],
  [/\/export$/, '导出文件'],
  [/\/blobs?\//, '二进制资源'],
  [/\/blob$/, '二进制资源'],
  [/\/default-skin$/, '默认角色皮肤'],
  [/\/project-skin-previews$/, '工程皮肤预览'],
  [/\/project-skins$/, '工程皮肤'],
  [/\/project-models$/, '工程模型资源'],
  [/\/project-scripts$/, '工程脚本资源'],
  [/\/creator-models/, 'Creator 模型'],
  [/\/local\/models/, 'VOXA 模型'],
  [/\/local-projects/, 'Creator 工程'],
  [/\/container-resource-groups/, '容器资源组'],
  [/\/containers/, '地图容器'],
  [/\/permission-groups/, '管理员权限组'],
  [/\/identity-bans/, '安全封禁记录'],
  [/\/players\/overview$/, '玩家统计概览'],
  [/\/players\/export$/, '玩家导出文件'],
  [/\/players\/batch$/, '玩家批量操作'],
  [/\/players/, '玩家账号'],
  [/\/admins/, '管理员账号'],
  [/\/activity$/, '安全活动记录'],
  [/\/maintenance$/, '维护任务'],
  [/\/owner-session$/, '服主会话'],
  [/\/self-password$/, '当前管理员密码'],
  [/\/library\/import$/, '游玩地图库导入任务'],
  [/\/library/, '游玩地图库内容'],
  [/\/import-resource$/, '地图导入资源'],
  [/\/import$/, '地图导入任务'],
  [/\/worlds\/status$/, '地图运行状态'],
  [/\/worlds/, '游玩地图'],
  [/\/verify$/, '管理身份验证'],
  [/\/play-library$/, '可游玩地图库'],
  [/\/play-presence$/, '玩家在线状态'],
  [/\/play-profile$/, '玩家资料'],
  [/\/play-worlds$/, '可游玩地图'],
  [/\/creator-permissions$/, '创作权限'],
  [/\/creator-profile$/, '创作者资料'],
  [/\/creator-logout$/, '创作者会话'],
  [/\/player-internal\/revocations$/, '玩家撤销事件'],
  [/\/player-internal\/runtime-identity$/, '运行时玩家身份'],
  [/\/player-internal\/map-library$/, '内部地图库'],
  [/\/player-internal\/profile$/, '内部玩家资料'],
  [/\/player-internal\/logout$/, '内部玩家会话'],
  [/\/system\/backups/, '系统工程备份'],
  [/\/system\/status$/, '系统运行状态'],
  [/\/config\//, '公开配置'],
  [/\/docs\//, 'Swagger 静态资源'],
  [/\/openapi$/, 'OpenAPI 契约'],
  [/\/getMapInfo$/, '地图信息'],
  [/\/server-info$/, '游戏服务器信息'],
  [/\/session$/, '当前会话'],
  [/\/projects/, 'Creator 工程'],
  [/\/auth\/login$/, '玩家登录'],
  [/\/auth\/logout$/, '玩家会话'],
  [/\/auth\/register$/, '玩家账号'],
  [/\/auth\/session$/, '玩家会话'],
  [/\/login-required$/, '玩家登录要求'],
]

const tagDescriptions = {
  '地图运行时': '该接口由地图运行时提供，用于管理房间、脚本、模型、皮肤或运行状态。',
  '登录门户': '该接口由玩家登录门户提供，用于完成玩家注册、登录和会话管理。',
  '服务器管理': '该接口由 Linux Server Manager 提供，用于维护服务、备份和运行时容器。',
  '引擎公共接口': '该接口提供本地引擎的公共状态、配置或开发文档能力。',
  '创作端': '该接口用于维护当前创作者的会话、资料和创作权限。',
  'Creator 模型': '该接口用于管理 Creator 可使用的模型资源。',
  'Creator CLI': '该接口供 APC CLI 调用，用于本地工程开发、资源同步和场景调试。',
  'Creator 工程': '该接口用于管理本地 Creator 工程、地图、快照和发布流程。',
  VOXA: '该接口用于管理 VOXA 模型工程、资源块和默认角色皮肤。',
  '玩家管理': '该接口供服主和获授权管理员使用，用于管理玩家、地图、安全策略和容器配置。',
  '游玩端': '该接口用于读取游玩内容并维护当前玩家的游玩会话。',
  '玩家认证': '该接口用于玩家账号注册、登录、退出和会话检查。',
  '玩家内部接口': '该接口仅供受信任的本地服务调用，不应直接暴露给普通客户端。',
  '系统管理': '该接口用于读取系统状态并管理 Creator 工程备份。',
}

const parameterDescriptions = {
  after: '从该游标之后继续读取数据。',
  archive: '备份或诊断归档的文件名。',
  asset: 'Swagger UI 静态资源名称。',
  autoSave: '是否在操作完成后自动保存工程。',
  container_id: '运行时容器 ID。',
  creativeMode: '创作模式筛选条件。',
  entry: '脚本入口文件名。',
  hash: '内容寻址资源的哈希值。',
  id: '目标资源 ID。',
  identity: '需要查询或封禁的身份标识。',
  key: '目标配置或资源键。',
  kind: '资源类型筛选条件。',
  limit: '本次最多返回的记录数。',
  mapId: '地图 ID。',
  maps: '地图 ID 列表筛选条件。',
  mode: '运行或查询模式。',
  modelName: '模型名称筛选条件。',
  modelType: '模型类型筛选条件。',
  name: '目标命令或资源名称。',
  online: '是否仅查询当前在线记录。',
  page: '分页页码，从 1 开始。',
  pageSize: '每页返回的记录数。',
  permanentMapId: '地图的永久 ID。',
  projectId: 'Creator 工程 ID。',
  projectKey: 'Creator 工程访问键。',
  requestId: '场景操作请求 ID。',
  resourceId: '工程资源 ID。',
  reviewId: '审核记录 ID。',
  roomId: '地图房间 ID。',
  scope: '存储或资源作用域。',
  search: '名称或标识的搜索关键词。',
  section: '地图库内容分区。',
  side: '脚本运行侧，例如 server 或 client。',
  since: '只返回该时间之后产生的数据。',
  slug: '公开配置项名称。',
  source: '数据来源筛选条件。',
  space: '工程存储空间名称。',
  subjectId: '玩家主体 ID。',
  targetMainProjectId: '目标主地图工程 ID。',
  view: '返回数据的视图模式。',
}

function resourceName(apiPath) {
  return resourcePatterns.find(([pattern]) => pattern.test(apiPath))?.[1] ?? '接口数据'
}

function inferredSummary(method, apiPath) {
  const resource = resourceName(apiPath)
  const withResource = (verb) => `${verb}${/^[A-Za-z]/.test(resource) ? ' ' : ''}${resource}`
  if (apiPath.endsWith('/export') || apiPath.includes('/download')) return withResource('下载')
  if (apiPath.endsWith('/import')) {
    if (method === 'get') return withResource('读取') + '状态'
    if (method === 'delete') return withResource('取消或清理')
    return withResource('执行')
  }
  if (apiPath.endsWith('/login')) return withResource('登录')
  if (apiPath.endsWith('/logout')) return withResource('退出')
  if (apiPath.endsWith('/register')) return withResource('注册')
  if (apiPath.endsWith('/status') || apiPath.endsWith('/health')) return withResource('读取')
  if (apiPath.endsWith('/publish') || apiPath.endsWith('/package')) return withResource('生成')
  if (method === 'get') return withResource('查询')
  if (method === 'post') return apiPath.includes('{') ? withResource('执行') + '操作' : withResource('创建')
  if (method === 'put' || method === 'patch') return withResource('更新')
  if (method === 'delete') return withResource('删除')
  return withResource('操作')
}

function authenticationDescription(security) {
  const scheme = Object.keys(security?.[0] ?? {})[0]
  return {
    adminSession: '需要有效的玩家管理会话及对应查看或编辑权限。',
    creatorToken: '需要有效的 Creator CLI Bearer Token。',
    internalBearer: '需要本地服务之间约定的内部 Bearer Token。',
    managerToken: '需要 Linux Web 管理令牌。',
  }[scheme] ?? '该接口不要求额外的 OpenAPI 鉴权信息。'
}

function effectDescription(method) {
  if (method === 'get') return '该操作只读取数据，不修改服务状态。'
  if (method === 'delete') return '该操作会删除资源或停止对应运行实例，请先确认目标标识。'
  if (method === 'put' || method === 'patch') return '该操作会更新现有配置或资源。'
  return '该操作可能创建资源、更新状态或触发后台任务。'
}

export function operationDocumentation(method, apiPath, tag, security) {
  const key = `${method} ${apiPath}`
  const summary = exactSummaries[key] ?? inferredSummary(method, apiPath)
  return {
    summary,
    description: `此操作用于“${summary}”。${tagDescriptions[tag] ?? '该接口属于 BOX3 Local Engine。'} ${effectDescription(method)} ${authenticationDescription(security)}`,
  }
}

export function describeParameter(parameter) {
  return parameterDescriptions[parameter.name] ?? `接口参数：${parameter.name}。`
}

export function completeOperationDocumentation(paths) {
  for (const methods of Object.values(paths)) {
    for (const operation of Object.values(methods)) {
      if (operation.requestBody && !operation.requestBody.description) {
        operation.requestBody.description = `执行“${operation.summary}”所需的请求数据。具体字段以请求模型为准。`
      }
      const success = operation.responses?.[200]
      if (success) success.description = `操作成功，返回“${operation.summary}”的处理结果。`
      const failure = operation.responses?.default
      if (failure) failure.description = '请求失败，返回可供界面展示或日志排查的错误信息。'
    }
  }
}
