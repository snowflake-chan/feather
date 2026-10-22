import http from 'http';
import mime from 'mime';
import { ContentServer } from './index';

type Route = (
  pathname: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => Promise<void | undefined | {}>;

interface Router {
  [basePath: string]: Route;
}

function log(...args: any[]) {}

function log_error(...args: any[]) {
  console.error(...args);
}

function error(res: http.ServerResponse, code: number, reason: string) {
  log_error(`${code} error: "${reason}"`);
  let publicReason = reason;
  if (499 < code && code < 600) {
    publicReason = 'Internal Server Error';
  }
  res.writeHead(code, publicReason);
  res.end();
}

function bad_method(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  method: string,
): boolean {
  if (req.method == method) {
    return false;
  }
  error(res, 405, `this route must be called with method: ${method}`);
  return true;
}

export interface ContentRouterOptions {
  deniedHashes?: ReadonlySet<string>;
  allowedOrigins?: ReadonlySet<string>;
  readOnly?: boolean;
}

function requestOriginAllowed(
  origin: string | undefined,
  allowedOrigins: ReadonlySet<string>,
) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

/**
 * 只认精确的 ETag 匹配。
 *
 * 不支持 `*`：此刻我们还没确认这个 hash 是否存在，用 `*` 回 304 等于替一个不存在的
 * 资源背书。伪造 ETag 换到 304 是无害的——客户端本来就声称自己已经有了。
 */
function matchesEtag(header: string | string[] | undefined, etag: string): boolean {
  if (typeof header !== 'string') {
    return false;
  }
  for (const raw of header.split(',')) {
    const value = raw.trim();
    if (value === etag) {
      return true;
    }
    if (value.startsWith('W/') && value.slice(2) === etag) {
      return true;
    }
  }
  return false;
}

export function createContentRouter(
  contentServer: ContentServer,
  options: ContentRouterOptions = {},
) {
  const endpointRegex = /^\/block\/?/;
  // Modern content hashes use URL-safe base64 and therefore legitimately
  // contain `-` and `_`. The old `\w` matcher rejected those resources before
  // the content store could look them up, which also prevented browser cache
  // prefetching from storing them.
  const argRegex = /^\/block\/([^/?]+)\/?/;
  const deniedHashes = options.deniedHashes || new Set<string>();
  const allowedOrigins = options.allowedOrigins || new Set<string>();
  const getArg = (pathname) => {
    const match = argRegex.exec(pathname);
    if (match == null || match == undefined) {
      return null;
    }
    return match[1];
  };

  const router: Router = {
    store: async (pathname, req, res) => {
      log(`in store`);
      if (bad_method(req, res, 'POST')) {
        return;
      }
      return new Promise((resolve, reject) => {
        const buffers: Buffer[] = [];
        req.on('data', (chunk) => {
          if (typeof chunk === 'string') {
            error(res, 500, `got string instead of buffer in store`);
            resolve();
            return;
          }
          buffers.push(chunk);
        });
        req.on('end', async () => {
          const data = Buffer.concat(buffers);
          try {
            const hash = await contentServer.store(data);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.end(hash);
            log(`store success`);
            resolve();
          } catch (e) {
            error(res, 500, e.toString());
            resolve();
          }
        });
      });
    },

    retrieve: async (pathname, req, res) => {
      log('in retrieve');
      if (bad_method(req, res, 'GET')) {
        return;
      }
      const arg = getArg(pathname);
      if (arg == null) {
        error(res, 400, `bad arg: "${pathname}"`);
        return;
      }
      if (deniedHashes.has(arg)) {
        // Do not reveal whether a private server-only blob exists.
        error(res, 404, 'nothing with that hash found');
        return;
      }
      // 内容是 hash 寻址的：同一个 hash 的字节永远不会变，所以可以标 immutable。
      // 之前这里一个缓存头都没有，浏览器每次进图都要把整包重下一遍。
      const etag = `"${arg}"`;
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', etag);
      if (matchesEtag(req.headers['if-none-match'], etag)) {
        // 命中就不用去 content store 取了。
        res.writeHead(304);
        res.end();
        return;
      }
      const buffer = await contentServer.retrieve(arg);
      if (buffer == undefined) {
        // 404 绝不能带 immutable：头是在 retrieve 之前设的，writeHead 会把它们
        // 原样带到错误响应上，于是一次「暂时取不到」会被浏览器按一年缓存，
        // 这个 blob 对这台客户端就永久消失了。
        res.removeHeader('Cache-Control');
        res.removeHeader('ETag');
        return error(res, 404, `nothing with that hash found`);
      }
      log(`retrieve success`);
      // 这里原来有一行 `log(buffer.toString())`。`log` 是空函数，但实参照算：
      // 每个内容请求都会把整个 blob 解码成 UTF-8 字符串再丢掉。2MB 的 blob
      // 就是一次 2MB 拷贝 + 解码 + 几 MB 垃圾。别加回来。
      const type = mime.getType(pathname);
      if (type) {
        res.setHeader('Content-Type', type);
      }
      res.end(buffer);
    },
  };

  return async (req, res) => {
    const origin = req.headers?.origin;
    const originAllowed = requestOriginAllowed(origin, allowedOrigins);
    if (origin && originAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader(
      'Access-Control-Allow-Methods',
      options.readOnly ? 'OPTIONS, GET' : 'OPTIONS, POST, GET',
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Auth');
    // The VOXA iframe persists project-local blobs through the editor runtime.
    // When the owner uses LAN/public addresses those two services legitimately
    // have different origins. CORS above still limits callers to the configured
    // origins; CORP must not reject a request that passed that check.
    res.setHeader(
      'Cross-Origin-Resource-Policy',
      origin && originAllowed ? 'cross-origin' : 'same-origin',
    );
    if (req.method == 'OPTIONS') {
      if (!originAllowed) {
        error(res, 403, 'cross-origin request is not allowed');
        return;
      }
      res.writeHead(200);
      res.end();
      return;
    }
    if (!req.url) {
      return error(res, 400, `no endpoint, empty url`);
    }
    try {
      const pathname = req.url;
      if (!pathname) {
        return error(res, 400, `bad url ${req.url}`);
      }
      if (!endpointRegex.test(pathname)) {
        return error(res, 404, `unrecognized endpoint ${req.url}`);
      }
      const { method } = req;
      let action: string;
      if (method === 'GET') {
        action = 'retrieve';
      } else if (method === 'POST') {
        if (options.readOnly) {
          return error(res, 403, 'content storage is read-only');
        }
        action = 'store';
      } else {
        return error(
          res,
          405,
          `Method ${method} not allowed of url ${req.url}`,
        );
      }
      router[action](pathname, req, res).catch((e) => {
        return error(res, 500, e.toString());
      });
    } catch (e) {
      return error(res, 500, e.toString());
    }
  };
}
