import { createRequire } from 'node:module'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const swaggerRoot = path.dirname(require.resolve('swagger-ui-dist/package.json'))

const assets = new Map([
  ['/swagger-ui.css', ['swagger-ui.css', 'text/css; charset=utf-8']],
  ['/swagger-ui-bundle.js', ['swagger-ui-bundle.js', 'application/javascript; charset=utf-8']],
  [
    '/swagger-ui-standalone-preset.js',
    ['swagger-ui-standalone-preset.js', 'application/javascript; charset=utf-8'],
  ],
])

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BOX3 Local Engine API</title>
    <link rel="stylesheet" href="/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow-y: scroll; }
      *, *::before, *::after { box-sizing: inherit; }
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/swagger-ui-bundle.js"></script>
    <script src="/swagger-ui-standalone-preset.js"></script>
    <script src="/initializer.js"></script>
  </body>
</html>`

const initializer = `window.addEventListener('load', function () {
  window.ui = SwaggerUIBundle({
    url: '/openapi.json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    displayRequestDuration: true,
    filter: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout',
    supportedSubmitMethods: []
  });
});`

function send(res, status, type, body) {
  res.statusCode = status
  res.setHeader('Content-Type', type)
  res.end(body)
}

export function createDocsServer(options = {}) {
  const openapiPath = options.openapiPath || path.join(packageRoot, 'openapi/openapi.json')

  return http.createServer((req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
    )
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD')
      return send(res, 405, 'text/plain; charset=utf-8', 'Method Not Allowed')
    }

    const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname
    if (pathname === '/' || pathname === '/index.html') {
      return send(res, 200, 'text/html; charset=utf-8', req.method === 'HEAD' ? '' : html)
    }
    if (pathname === '/initializer.js') {
      return send(
        res,
        200,
        'application/javascript; charset=utf-8',
        req.method === 'HEAD' ? '' : initializer,
      )
    }
    if (pathname === '/openapi.json') {
      if (!fs.existsSync(openapiPath)) {
        return send(
          res,
          503,
          'application/json; charset=utf-8',
          JSON.stringify({ message: 'OpenAPI 文档尚未生成，请执行 npm run api:generate' }),
        )
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      if (req.method === 'HEAD') return res.end()
      return fs.createReadStream(openapiPath).pipe(res)
    }

    const asset = assets.get(pathname)
    if (asset) {
      res.statusCode = 200
      res.setHeader('Content-Type', asset[1])
      if (req.method === 'HEAD') return res.end()
      return fs.createReadStream(path.join(swaggerRoot, asset[0])).pipe(res)
    }
    return send(res, 404, 'text/plain; charset=utf-8', 'Not Found')
  })
}

function commandLineValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  const host = commandLineValue('--host') || process.env.BOX_API_DOCS_HOST || '127.0.0.1'
  const port = Number(commandLineValue('--port') || process.env.BOX_API_DOCS_PORT || 3210)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid API docs port: ${port}`)
  }
  const server = createDocsServer()
  server.listen(port, host, () => {
    console.log(`BOX3 Local Engine API docs: http://${host}:${port}/`)
    console.log('Press Ctrl-C to stop the read-only documentation server.')
  })
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(() => process.exit(0)))
  }
}
