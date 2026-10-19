import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { ApiClient, ApiClientError } from '../dist/index.es.mjs'

const document = JSON.parse(readFileSync(new URL('../openapi/openapi.json', import.meta.url), 'utf8'))

test('delegated admin routes retain their actual query parameters in the contract', () => {
  for (const [path, names] of [
    ['/api/play-admin/players', ['search', 'page', 'pageSize', 'identity', 'online', 'sort']],
    ['/api/play-admin/players/export', ['search', 'identity', 'online', 'sort', 'role']],
    ['/api/play-admin/activity', ['page', 'pageSize', 'kind', 'search']],
    ['/api/play-admin/library/import', ['mode', 'reviewId', 'resourceId']],
  ]) {
    const query = document.paths[path].get.parameters.filter(parameter => parameter.in === 'query')
    for (const name of names) assert.ok(query.some(parameter => parameter.name === name), `${path}: ${name}`)
  }
})

test('named admin download methods preserve text/blob parsing and reject failed responses', async () => {
  const client = new ApiClient({
    baseUrl: 'https://admin.example.test',
    fetch: async request => {
      const url = new URL(request.url)
      assert.equal(url.searchParams.get('reviewId'), 'review-1')
      assert.equal(url.searchParams.get('resourceId'), 'resource-1')
      return new Response('script-content', { headers: { 'Content-Type': 'text/plain' } })
    },
  })
  const params = { query: { mode: 'resource', reviewId: 'review-1', resourceId: 'resource-1' } }
  assert.equal(await client.getApiPlayAdminLibraryImport({ params, parseAs: 'text' }), 'script-content')
  const blob = await client.getApiPlayAdminLibraryImport({ params, parseAs: 'blob' })
  assert.ok(blob instanceof Blob)
  assert.equal(await blob.text(), 'script-content')
  const csv = new ApiClient({
    baseUrl: 'https://admin.example.test',
    fetch: async request => {
      assert.equal(new URL(request.url).searchParams.get('search'), 'test-player')
      return new Response('name\ntest-player', { headers: { 'Content-Type': 'text/csv' } })
    },
  })
  const result = await csv.getApiPlayAdminPlayersExportRaw({ params: { query: { search: 'test-player' } }, parseAs: 'blob' })
  assert.equal(await result.data.text(), 'name\ntest-player')
  const failed = new ApiClient({ baseUrl: 'https://admin.example.test', fetch: async () => new Response('denied', { status: 403 }) })
  await assert.rejects(failed.getApiPlayAdminLibraryImport({ params, parseAs: 'text' }), ApiClientError)
})
