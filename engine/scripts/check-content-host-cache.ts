import assert from 'node:assert/strict';
import http from 'node:http';

import { createContentRouter } from '@box/content-server/content-host';
import type { ContentServer } from '@box/content-server/index';

const HASH = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
const DENIED = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o';
const BLOB = Buffer.from('hello-content-blob', 'utf8');

let retrieves = 0;

const base = {
  async init() {},
  async store() {
    return HASH;
  },
  async retrieve(hash: string) {
    retrieves += 1;
    const value = hash.split('.')[0];
    if (value === HASH) return BLOB;
    return undefined;
  },
} as ContentServer;

function request(
  port: number,
  path: string,
  options: { method?: string; headers?: Record<string, string> } = {},
) {
  return new Promise<{
    status: number;
    headers: http.IncomingHttpHeaders;
    body: Buffer;
  }>((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path,
        method: options.method ?? 'GET',
        headers: options.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          }),
        );
      },
    );
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const router = createContentRouter(base, {
    readOnly: true,
    deniedHashes: new Set([DENIED]),
  });
  const server = http.createServer((req, res) => void router(req, res));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as any).port;

  try {
    // 1) 正常取内容：200 + 字节一致 + 缓存头齐全
    const first = await request(port, `/block/${HASH}`);
    assert.equal(first.status, 200);
    assert.deepEqual(first.body, BLOB, 'served bytes must match the blob exactly');
    assert.match(
      String(first.headers['cache-control']),
      /immutable/,
      'hash-addressed content must be immutable',
    );
    assert.match(String(first.headers['cache-control']), /max-age=31536000/);
    assert.equal(first.headers.etag, `"${HASH}"`);
    assert.equal(retrieves, 1);

    // 2) 带 If-None-Match 重验证：304，且**不再回 content store 取**
    const revalidated = await request(port, `/block/${HASH}`, {
      headers: { 'if-none-match': `"${HASH}"` },
    });
    assert.equal(revalidated.status, 304);
    assert.equal(revalidated.body.length, 0, '304 must not carry a body');
    assert.equal(retrieves, 1, '304 must short-circuit before retrieve()');
    assert.match(String(revalidated.headers['cache-control']), /immutable/);

    // 3) 弱 ETag 也认
    const weak = await request(port, `/block/${HASH}`, {
      headers: { 'if-none-match': `W/"${HASH}"` },
    });
    assert.equal(weak.status, 304);

    // 4) 多个 ETag 里命中一个
    const listed = await request(port, `/block/${HASH}`, {
      headers: { 'if-none-match': `"nope", "${HASH}"` },
    });
    assert.equal(listed.status, 304);

    // 5) ETag 不匹配要正常回 200
    const stale = await request(port, `/block/${HASH}`, {
      headers: { 'if-none-match': '"stale"' },
    });
    assert.equal(stale.status, 200);
    assert.deepEqual(stale.body, BLOB);

    // 6) 不存在的 hash → 404，且**不能带 immutable 缓存头**
    //    否则一次暂时缺失会被浏览器按一年缓存，这个 blob 就永久消失了。
    const missing = await request(port, '/block/QmNotARealHashAtAll000000000000000000000000');
    assert.equal(missing.status, 404);
    assert.equal(missing.headers['cache-control'], undefined, '404 must not be cacheable');
    assert.equal(missing.headers.etag, undefined, '404 must not carry an ETag');

    // 7) 私密 blob 不暴露存在性 → 404
    const denied = await request(port, `/block/${DENIED}`);
    assert.equal(denied.status, 404);
    assert.equal(denied.headers['cache-control'], undefined);

    // 8) readOnly 下 POST 被拒
    const post = await request(port, `/block/${HASH}`, { method: 'POST' });
    assert.equal(post.status, 403);

    // 9) 带扩展名的路径仍然能定出 Content-Type
    const withExt = await request(port, `/block/${HASH}.png`);
    assert.equal(withExt.status, 200);
    assert.equal(withExt.headers['content-type'], 'image/png');

    console.log('content host: 9 组断言通过');
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
