import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.env.PORT || 3200);
const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.map': 'application/json',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  let file = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (req.headers.accept?.includes('text/html')) file = path.join(root, 'index.html');
    else { res.writeHead(404); return res.end('not found'); }
  }
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`static game: http://127.0.0.1:${port}`);
});
