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
      const buffer = await contentServer.retrieve(arg);
      if (buffer == undefined) {
        return error(res, 404, `nothing with that hash found`);
      }
      log(`retrieve success`);
      log(buffer.toString());
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
