import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { ApiClient } from '../dist/index.es.mjs'

const document = JSON.parse(readFileSync(new URL('../openapi/openapi.json', import.meta.url), 'utf8'))

test('self-service schemas expose only nickname and explicit current/new passwords with session security', () => {
  for (const prefix of ['/api/auth', '/api/player-auth']) {
    const profile = document.paths[`${prefix}/profile`].patch
    const nickname = profile.requestBody.content['application/json'].schema
    assert.deepEqual(Object.keys(nickname.properties), ['displayName'])
    assert.equal(nickname.additionalProperties, false)
    const password = document.paths[`${prefix}/password`].post
    const fields = password.requestBody.content['application/json'].schema
    assert.deepEqual(fields.required, ['currentPassword', 'newPassword'])
    assert.equal(fields.additionalProperties, false)
    assert.equal(fields.properties.newPassword.minLength, 10)
    assert.equal(fields.properties.newPassword.writeOnly, true)
    assert.ok(password.responses[429].headers['Retry-After'])
    assert.ok(profile.security[0].playerSession)
    if (prefix.endsWith('player-auth')) assert.ok(profile.security[0].playerAuthKey)
  }
  assert.equal(document.components.schemas.PlayerSelfProfile.properties.avatar, undefined)
  assert.equal(document.components.schemas.PlayerSelfProfile.properties.avatarSkinId, undefined)
})

test('generated client sends credentialed nickname/password requests using the published portal contract', async () => {
  const calls = []
  const client = new ApiClient({
    baseUrl: 'https://auth.example.test', credentials: 'include',
    fetch: async request => {
      calls.push({ method: request.method, url: request.url, credentials: request.credentials, body: await request.json() })
      return new Response(JSON.stringify(request.method === 'PATCH'
        ? { player: { subjectId: 'self', userId: '42', username: 'tester', displayName: '新昵称' } }
        : { changed: true, reloginRequired: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    },
  })
  const profile = await client.patchApiAuthProfile({ body: { displayName: '新昵称' } })
  const password = await client.postApiAuthPassword({ body: { currentPassword: 'old-password-123', newPassword: 'new-password-456' } })
  assert.equal(profile.player.displayName, '新昵称')
  assert.equal(password.reloginRequired, true)
  assert.deepEqual(calls.map(call => [call.method, call.url, call.credentials]), [
    ['PATCH', 'https://auth.example.test/api/auth/profile', 'include'],
    ['POST', 'https://auth.example.test/api/auth/password', 'include'],
  ])
  assert.deepEqual(calls[0].body, { displayName: '新昵称' })
  assert.deepEqual(calls[1].body, { currentPassword: 'old-password-123', newPassword: 'new-password-456' })
})
