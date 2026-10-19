import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { localEngineSchemas } from './openapi-schemas.mjs'
import { applyOperationContracts } from './openapi-operation-contracts.mjs'
import {
  completeOperationDocumentation,
  describeParameter,
  operationDocumentation,
} from './openapi-documentation.mjs'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = path.resolve(packageRoot, '../..')
const routeSources = [
  {
    root: path.join(repositoryRoot, 'apps/game/pages/api'),
    prefix: '/api',
    service: 'engine-web',
  },
  {
    root: path.join(repositoryRoot, 'apps/voxa/pages/api'),
    prefix: '/api',
    service: 'voxa',
  },
]
const manualRoutes = [
  // Next optional catch-all also serves the collection path without an id.
  [
    'engine-web',
    '/api/play-admin/library/{section}',
    ['GET', 'POST', 'PATCH', 'DELETE'],
    'apps/game/pages/api/play-admin/library/[section]/[[...id]].ts',
  ],
  // Runtime HTTP interface mounted behind Creator/Play runtime proxies.
  ['game-runtime', '/createSession', ['POST'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/block', ['POST'], 'services/game-server/src/entry.ts'],
  ['game-runtime', '/block/{hash}', ['GET', 'POST'], 'services/game-server/src/entry.ts'],
  ['game-runtime', '/api/project-models', ['GET', 'POST'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/api/project-scripts', ['POST'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/api/project-skins', ['GET', 'POST'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/api/project-skin-previews', ['GET'], 'services/game-server/src/entry.ts'],
  ['game-runtime', '/api/server-info', ['GET'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/api/session', ['GET'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/internal/creator-preview-runtime', ['GET'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/internal/creator-preview-runtime/events', ['GET'], 'services/game-server/src/createServer.ts'],
  ['game-runtime', '/internal/save-local-project', ['POST'], 'services/game-server/src/createServer.ts'],
  // Runtime lifecycle interface. Callers set baseUrl to the selected map runtime.
  ['game-runtime', '/__local_runtime/status', ['GET'], 'apps/local-engine/src/launcher.js'],
  ['game-runtime', '/__local_runtime/start', ['POST'], 'apps/local-engine/src/launcher.js'],
  ['game-runtime', '/__local_runtime/destroy', ['POST'], 'apps/local-engine/src/launcher.js'],
  ['game-runtime', '/__room/{roomId}/__local_runtime/destroy', ['POST'], 'apps/local-engine/src/launcher.js'],
  // Linux server manager interface.
  ['server-manager', '/api/health', ['GET'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/runtime/ensure', ['POST'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/runtime/{container_id}', ['DELETE'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/runtime/{container_id}/stats', ['GET'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/backups/upload', ['POST'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/backups/{archive}/download', ['GET'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/diagnostics/{archive}/download', ['GET'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/commands/{name}', ['POST'], 'apps/server-manager-rust/src/main.rs'],
  ['server-manager', '/api/operations/{id}', ['GET'], 'apps/server-manager-rust/src/main.rs'],
  // Public player login portal proxy.
  ['auth-portal', '/api/health-check', ['GET'], 'apps/player-auth-portal/server/portal.ts'],
  ['auth-portal', '/api/auth/login', ['POST'], 'apps/player-auth-portal/server/auth.ts'],
  ['auth-portal', '/api/auth/register', ['POST'], 'apps/player-auth-portal/server/auth.ts'],
  ['auth-portal', '/api/auth/session', ['GET'], 'apps/player-auth-portal/server/auth.ts'],
  ['auth-portal', '/api/auth/logout', ['POST'], 'apps/player-auth-portal/server/auth.ts'],
  ['auth-portal', '/api/auth/profile', ['PATCH'], 'apps/player-auth-portal/server/auth.ts'],
  ['auth-portal', '/api/auth/password', ['POST'], 'apps/player-auth-portal/server/auth.ts'],
]
const outputFile = path.join(packageRoot, 'openapi/openapi.json')

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const METHOD_OVERRIDES = new Map([
  ['/api/creator/v1/health', ['GET']],
  ['/api/creator-profile', ['PATCH']],
  ['/api/play-admin/library/{section}/{id}', ['GET', 'POST', 'PATCH', 'DELETE']],
  ['/api/play-admin/library/import', ['GET', 'POST', 'DELETE']],
  ['/api/play-admin/players/{subjectId}', ['GET', 'POST', 'PATCH', 'DELETE']],
  ['/api/play-profile', ['PATCH']],
  ['/api/player-auth/login-required', ['GET']],
  ['/api/player-auth/profile', ['PATCH']],
  ['/api/player-auth/password', ['POST']],
])
const QUERY_PARAMETER_OVERRIDES = new Map([
  // These handlers delegate validation/proxying, so req.query.field scanning misses their inputs.
  ['/api/play-admin/players', ['search', 'page', 'pageSize', 'identity', 'online', 'sort']],
  ['/api/play-admin/players/export', ['search', 'identity', 'online', 'sort', 'role']],
  ['/api/play-admin/activity', ['page', 'pageSize', 'kind', 'search']],
  ['/api/play-admin/library/import', ['mode', 'reviewId', 'resourceId']],
  ['/api/creator-models', ['modelType', 'mapId', 'creativeMode', 'modelName']],
])

function routeFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    return entry.isDirectory() ? routeFiles(absolute) : [absolute]
  })
}

function routePath(file, root, prefix) {
  const relative = path.relative(root, file).replaceAll(path.sep, '/')
  const segments = relative.replace(/\.tsx?$/, '').split('/')
  if (segments.at(-1) === 'index') segments.pop()
  return `${prefix}/${segments
    .map((segment) => segment
      .replace(/^\[\[\.\.\.(.+)\]\]$/, '{$1}')
      .replace(/^\[\.\.\.(.+)\]$/, '{$1}')
      .replace(/^\[(.+)\]$/, '{$1}'))
    .join('/')}`
}

function routeMethods(source, apiPath) {
  if (METHOD_OVERRIDES.has(apiPath)) return METHOD_OVERRIDES.get(apiPath)
  const methods = new Set()
  const patterns = [
    /req\.method\s*(?:===|!==)\s*['"](GET|POST|PUT|PATCH|DELETE)['"]/g,
    /case\s+['"](GET|POST|PUT|PATCH|DELETE)['"]/g,
  ]
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) methods.add(match[1])
  }
  for (const match of source.matchAll(/methods\s*:\s*\[([^\]]+)\]/g)) {
    for (const method of match[1].matchAll(/['"](GET|POST|PUT|PATCH|DELETE)['"]/g)) {
      methods.add(method[1])
    }
  }
  for (const match of source.matchAll(/\[([^\]]+)\]\.includes\(req\.method/g)) {
    for (const method of match[1].matchAll(/['"](GET|POST|PUT|PATCH|DELETE)['"]/g)) {
      methods.add(method[1])
    }
  }
  return methods.size ? HTTP_METHODS.filter((method) => methods.has(method)) : ['GET']
}

function tagFor(apiPath) {
  if (apiPath.startsWith('/api/play-admin/')) return '玩家管理'
  if (apiPath.startsWith('/api/player-auth/')) return '玩家认证'
  if (apiPath.startsWith('/api/player-internal/')) return '玩家内部接口'
  if (apiPath.startsWith('/api/creator/v1/')) return 'Creator CLI'
  if (apiPath.startsWith('/api/creator-models')) return 'Creator 模型'
  if (apiPath.startsWith('/api/local-projects')) return 'Creator 工程'
  if (apiPath.startsWith('/api/system/')) return '系统管理'
  if (apiPath.startsWith('/api/local/')) return 'VOXA'
  if (apiPath.startsWith('/api/play-')) return '游玩端'
  if (apiPath.startsWith('/api/creator-')) return '创作端'
  return '引擎公共接口'
}

function tagForService(service, apiPath) {
  if (service === 'server-manager') return '服务器管理'
  if (service === 'game-runtime') return '地图运行时'
  if (service === 'auth-portal') return '登录门户'
  return tagFor(apiPath)
}

function deploymentModes(apiPath, service = 'engine-web') {
  if (service === 'server-manager') return ['server-manager']
  if (service === 'game-runtime') return ['game-runtime']
  if (service === 'auth-portal') return ['auth-portal']
  if (apiPath.startsWith('/api/player-login/')) return ['creator', 'play']
  if (apiPath.startsWith('/api/play-admin/') || apiPath.startsWith('/api/player-')) {
    return ['player-service']
  }
  if (
    apiPath.startsWith('/api/creator/') ||
    apiPath.startsWith('/api/creator-') ||
    apiPath.startsWith('/api/local-projects') ||
    apiPath.startsWith('/api/system/')
  ) return ['creator']
  if (apiPath.startsWith('/api/local/')) return ['voxa']
  if (apiPath.startsWith('/api/play-')) return ['play']
  return ['creator', 'play', 'player-service']
}

function securityFor(apiPath, service) {
  if (service === 'server-manager') return [{ managerToken: [] }]
  if (service === 'game-runtime' && apiPath.startsWith('/internal/')) {
    return [{ internalBearer: [] }]
  }
  if (['/api/player-auth/profile', '/api/player-auth/password', '/api/player-auth/transfer'].includes(apiPath)) return [{ playerAuthKey: [], playerSession: [] }]
  if (['/api/auth/profile', '/api/auth/password'].includes(apiPath)) return [{ playerSession: [] }]
  if (apiPath.startsWith('/api/player-auth/') && apiPath !== '/api/player-auth/login-required') return [{ playerAuthKey: [] }]
  if (apiPath === '/api/play-admin/login' || apiPath === '/api/player-auth/login-required') return []
  if (apiPath.startsWith('/api/play-admin/')) return [{ adminSession: [] }]
  if (['/api/player-internal/script-moderation','/api/player-internal/script-metadata','/api/player-internal/map-admission'].includes(apiPath)) return [{moderationRuntime:[]}]
  if (apiPath.startsWith('/api/player-internal/')) return [{ internalBearer: [] }]
  if (apiPath.startsWith('/api/creator/v1/')) return [{ creatorToken: [] }]
  return []
}

function operationId(method, apiPath) {
  const words = apiPath
    .replace(/[{}]/g, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
  return method.toLowerCase() + words.map((word) => word[0].toUpperCase() + word.slice(1)).join('')
}

function parametersFor(apiPath) {
  return [...apiPath.matchAll(/\{([^}]+)\}/g)].map((match) => ({
    name: match[1],
    in: 'path',
    required: true,
    description: describeParameter({ name: match[1] }),
    schema: { type: 'string' },
  }))
}

function queryParametersFor(source, apiPath) {
  const pathNames = new Set([...apiPath.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]))
  const names = new Set()
  for (const match of source.matchAll(/req\.query\.([A-Za-z_$][\w$]*)/g)) {
    if (!pathNames.has(match[1])) names.add(match[1])
  }
  return [...names].sort().map((name) => ({
    name,
    in: 'query',
    required: false,
    description: describeParameter({ name }),
    schema: { type: 'string' },
  }))
}

function genericOperation(method, apiPath, service = 'engine-web') {
  const lowerMethod = method.toLowerCase()
  const tag = tagForService(service, apiPath)
  const security = securityFor(apiPath, service)
  const documentation = operationDocumentation(lowerMethod, apiPath, tag, security)
  const operation = {
    operationId: operationId(method, apiPath),
    ...documentation,
    tags: [tag],
    security,
    'x-box-deployment-modes': deploymentModes(apiPath, service),
    parameters: parametersFor(apiPath),
    responses: {
      200: {
        description: '请求成功',
        content: {
          'application/json': {
            schema: { type: 'object', additionalProperties: true },
          },
        },
      },
      default: {
        description: '请求失败',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
        },
      },
    },
  }
  if (['post', 'put', 'patch', 'delete'].includes(lowerMethod)) {
    operation.requestBody = {
      required: false,
      content: {
        'application/json': {
          schema: { type: 'object', additionalProperties: true },
        },
      },
    }
  }
  return operation
}

const paths = {}
const sourceRoutes = []
for (const routeSource of routeSources) {
  for (const file of routeFiles(routeSource.root).filter((entry) => /\.tsx?$/.test(entry))) {
    const apiPath = routePath(file, routeSource.root, routeSource.prefix)
    const source = fs.readFileSync(file, 'utf8')
    const methods = routeMethods(source, apiPath)
    const queryParameters = queryParametersFor(source, apiPath)
    const queryNames = new Set(queryParameters.map((parameter) => parameter.name))
    for (const name of QUERY_PARAMETER_OVERRIDES.get(apiPath) || []) {
      if (queryNames.has(name)) continue
      queryParameters.push({
        name,
        in: 'query',
        required: false,
        description: describeParameter({ name }),
        schema: { type: 'string' },
      })
    }
    paths[apiPath] ??= {}
    for (const method of methods) {
      const key = method.toLowerCase()
      if (!paths[apiPath][key]) {
        paths[apiPath][key] = genericOperation(method, apiPath, routeSource.service)
      }
      paths[apiPath][key].parameters.push(...queryParameters)
      const services = paths[apiPath][key]['x-box-services'] ?? []
      paths[apiPath][key]['x-box-services'] = [...new Set([...services, routeSource.service])]
    }
    sourceRoutes.push({
      path: apiPath,
      methods,
      service: routeSource.service,
      source: path.relative(repositoryRoot, file).replaceAll(path.sep, '/'),
    })
  }
}

for (const [service, apiPath, methods, source] of manualRoutes) {
  paths[apiPath] ??= {}
  for (const method of methods) {
    const key = method.toLowerCase()
    if (!paths[apiPath][key]) paths[apiPath][key] = genericOperation(method, apiPath, service)
    const services = paths[apiPath][key]['x-box-services'] ?? []
    paths[apiPath][key]['x-box-services'] = [...new Set([...services, service])]
  }
  sourceRoutes.push({ path: apiPath, methods, service, source })
}

applyOperationContracts(paths)
completeOperationDocumentation(paths)

const document = {
  openapi: '3.1.0',
  info: {
    title: 'BOX3 Local Engine API',
    version: '0.2.0',
    description: 'Creator、Play、Player Service 与玩家管理共用的本地引擎 HTTP 接口。',
  },
  servers: [
    { url: '/', description: '当前服务' },
    { url: 'http://127.0.0.1:3002', description: 'Creator' },
    { url: 'http://127.0.0.1:3121', description: 'Play' },
    { url: 'http://127.0.0.1:3124', description: 'Player Service' },
    { url: 'http://127.0.0.1:3001', description: 'VOXA' },
    { url: 'http://127.0.0.1:3130', description: 'Linux Server Manager' },
    { url: 'http://127.0.0.1:3125', description: 'Player Auth Portal' },
  ],
  tags: [...new Set(Object.values(paths).flatMap((entry) =>
    Object.values(entry).flatMap((operation) => operation.tags),
  ))].map((name) => ({ name })),
  paths: Object.fromEntries(Object.entries(paths).sort(([left], [right]) => left.localeCompare(right))),
  components: {
    securitySchemes: {
      playerAuthKey: { type: 'apiKey', in: 'header', name: 'x-box-player-auth-key', description: '仅供登录门户服务端使用，不得发送给浏览器。' },
      playerSession: { type: 'apiKey', in: 'cookie', name: 'box_local_player_session', description: '使用登录后取得的会话及设备 Cookie，浏览器请求需携带 credentials。' },
      adminSession: { type: 'apiKey', in: 'cookie', name: 'box_local_admin_session' },
      creatorToken: { type: 'http', scheme: 'bearer', bearerFormat: 'CLI Token' },
      internalBearer: { type: 'http', scheme: 'bearer' },
      moderationRuntime: {type:'apiKey',in:'header',name:'Authorization',description:'Moderation <短期地图实例凭证>；由可信启动器维护，不接受浏览器 Cookie 或玩家身份 Bearer'},
      managerToken: { type: 'http', scheme: 'bearer' },
    },
    schemas: localEngineSchemas,
  },
  'x-box-source-routes': sourceRoutes,
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
const serialized = `${JSON.stringify(document, null, 2)}\n`
if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputFile) || fs.readFileSync(outputFile, 'utf8') !== serialized) {
    throw new Error('openapi/openapi.json is stale; run npm run generate')
  }
  console.log(`Generated OpenAPI artifacts are current: ${sourceRoutes.length} routes`)
} else {
  fs.writeFileSync(outputFile, serialized)
  console.log(`Generated OpenAPI ${document.info.version}: ${sourceRoutes.length} routes, ${Object.values(paths).reduce((count, item) => count + Object.keys(item).length, 0)} operations`)
}
