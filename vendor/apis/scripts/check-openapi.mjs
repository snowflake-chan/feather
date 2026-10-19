import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = path.resolve(packageRoot, '../..')
const document = JSON.parse(fs.readFileSync(path.join(packageRoot, 'openapi/openapi.json'), 'utf8'))
const routes = document['x-box-source-routes']

assert.equal(document.openapi, '3.1.0')
assert.ok(Array.isArray(routes) && routes.length > 70, 'OpenAPI route inventory is incomplete')

for (const route of routes) {
  assert.ok(fs.existsSync(path.join(repositoryRoot, route.source)), `Missing route source: ${route.source}`)
  const operations = document.paths[route.path]
  assert.ok(operations, `Missing OpenAPI path: ${route.path}`)
  for (const method of route.methods) {
    const operation = operations[method.toLowerCase()]
    assert.ok(operation, `Missing OpenAPI operation: ${method} ${route.path}`)
    assert.ok(operation.summary && !operation.summary.startsWith(`${method} /`),
      `Missing API summary: ${method} ${route.path}`)
    assert.ok(operation.description, `Missing API description: ${method} ${route.path}`)
    for (const parameter of operation.parameters ?? []) {
      assert.ok(parameter.description, `Missing parameter description: ${parameter.name}`)
    }
    if (operation.requestBody) {
      assert.ok(operation.requestBody.description, `Missing request body description: ${method} ${route.path}`)
    }
    const successes = Object.entries(operation.responses || {}).filter(([status]) => /^2\d\d$/.test(status) || ["302", "303", "307", "308"].includes(status))
    assert.ok(successes.length && successes.every(([, response]) => response.description),
      `Missing success description: ${method} ${route.path}`)
    assert.ok(operation.responses?.default?.description, `Missing error description: ${method} ${route.path}`)
  }
}

const operationIds = new Set()
for (const [apiPath, methods] of Object.entries(document.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    assert.ok(!operationIds.has(operation.operationId), `Duplicate operationId: ${operation.operationId}`)
    operationIds.add(operation.operationId)
    assert.ok(operation['x-box-services']?.length, `Missing service owner: ${method} ${apiPath}`)
  }
}

for (const requiredPath of [
  '/api/play-admin/players',
  '/api/play-admin/containers',
  '/api/player-auth/login',
  '/api/creator/v1/projects',
  '/api/local-projects',
  '/api/local/models',
]) {
  assert.ok(document.paths[requiredPath], `Missing core API path: ${requiredPath}`)
}

for (const privatePath of [
  '/api/migration',
  '/api/download',
  '/api/export',
  '/api/model-search',
  '/v1/health',
  '/v1/time',
  '/v1/admin/session',
  '/v1/admin/licenses/issue',
]) {
  assert.equal(document.paths[privatePath], undefined, `Private API must stay independent: ${privatePath}`)
}
assert.equal(document.components.securitySchemes.issuerAdminToken, undefined)
assert.equal(routes.some((route) => ['migrator', 'license-issuer'].includes(route.service)), false)

for (const requiredSchema of [
  'Player',
  'PlayerAdminActor',
  'PermissionGroup',
  'ContainerCatalog',
  'ContainerResourceGroup',
  'PlayMap',
]) {
  assert.ok(document.components.schemas[requiredSchema], `Missing core schema: ${requiredSchema}`)
}

assert.equal(
  document.paths['/api/play-admin/containers'].get.responses[200].content['application/json']
    .schema.$ref,
  '#/components/schemas/ContainerCatalog',
  'Player Admin responses must use generated schemas',
)

console.log(`OpenAPI checks passed: ${routes.length} routes, ${operationIds.size} operations`)
