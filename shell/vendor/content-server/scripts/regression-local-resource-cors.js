const assert = require('node:assert/strict')
const http = require('node:http')
const { createContentRouter } = require('../build/content-host')

const voxaOrigin = 'http://10.240.28.131:3222'
const router = createContentRouter(
  {
    async retrieve() {
      return Buffer.from('resource')
    },
    async store() {
      return 'unused'
    },
  },
  { allowedOrigins: new Set([voxaOrigin]) },
)

const server = http.createServer((req, res) => router(req, res))
server.listen(0, '127.0.0.1', () => {
  const { port } = server.address()
  const request = http.request(
    {
      host: '127.0.0.1',
      port,
      path: '/block/corsprobe',
      headers: { Origin: voxaOrigin },
    },
    (response) => {
      assert.equal(response.statusCode, 200)
      assert.equal(response.headers['access-control-allow-origin'], voxaOrigin)
      assert.equal(response.headers['cross-origin-resource-policy'], 'cross-origin')
      response.resume()
      response.on('end', () => {
        server.close(() => console.log('local runtime resource CORS regression passed'))
      })
    },
  )
  request.on('error', (error) => {
    server.close(() => {
      throw error
    })
  })
  request.end()
})
