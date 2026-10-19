import assert from 'node:assert/strict'
import test from 'node:test'

import { createDocsServer } from '../scripts/serve-docs.mjs'

test('serves standalone read-only Swagger documentation', async (context) => {
  const server = createDocsServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => new Promise((resolve) => server.close(resolve)))

  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const origin = `http://127.0.0.1:${address.port}`

  const page = await fetch(`${origin}/`)
  assert.equal(page.status, 200)
  assert.match(page.headers.get('content-security-policy') || '', /connect-src 'self'/)

  const openapi = await fetch(`${origin}/openapi.json`)
  assert.equal(openapi.status, 200)
  const document = await openapi.json()
  assert.equal(document.openapi, '3.1.0')

  const initializer = await fetch(`${origin}/initializer.js`)
  assert.equal(initializer.status, 200)
  assert.match(await initializer.text(), /supportedSubmitMethods: \[\]/)

  const write = await fetch(`${origin}/openapi.json`, { method: 'POST' })
  assert.equal(write.status, 405)
})
