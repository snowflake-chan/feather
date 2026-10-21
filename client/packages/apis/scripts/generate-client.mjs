import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const documentFile = path.join(packageRoot, 'openapi/openapi.json')
const outputFile = path.join(packageRoot, 'src/generated/client.ts')
const document = JSON.parse(fs.readFileSync(documentFile, 'utf8'))

const methods = []
for (const [apiPath, operations] of Object.entries(document.paths)) {
  for (const [method, operation] of Object.entries(operations)) {
    const operationId = operation.operationId
    if (!operationId || !/^[A-Za-z_$][\w$]*$/.test(operationId)) {
      throw new Error(`Invalid operationId for ${method.toUpperCase()} ${apiPath}`)
    }
    methods.push({ apiPath, method: method.toUpperCase(), operationId })
  }
}

methods.sort((left, right) => left.operationId.localeCompare(right.operationId))

const source = `/**
 * Generated from openapi/openapi.json. Do not edit by hand.
 *
 * Every Local Engine HTTP operation is exposed as a named method so callers
 * never need to duplicate a route or HTTP verb.
 */
import createClient, {
  type Client,
  type ClientOptions,
  type FetchResponse,
  type PathBasedClient,
  wrapAsPathBasedClient,
} from 'openapi-fetch';

import type { paths } from './openapi';

export const apiOperations = ${JSON.stringify(
  Object.fromEntries(
    methods.map(({ apiPath, method, operationId }) => [operationId, { path: apiPath, method }]),
  ),
  null,
  2,
)} as const;

export interface ApiClientOptions extends ClientOptions {
  csrfCookie?: string;
  csrfHeader?: string;
  defaultErrorMessage?: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly response: Response,
    readonly details: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiClient {
  readonly raw: Client<paths>;
  private readonly paths: PathBasedClient<paths>;
  private readonly defaultErrorMessage: string;

  constructor(options: ApiClientOptions = {}) {
    const {
      csrfCookie,
      csrfHeader = 'X-CSRF-Token',
      defaultErrorMessage = '请求失败，请稍后重试',
      ...clientOptions
    } = options;
    this.defaultErrorMessage = defaultErrorMessage;
    this.raw = createClient<paths>({ credentials: 'same-origin', ...clientOptions });
    if (csrfCookie) {
      this.raw.use({
        onRequest({ request }) {
          if (typeof document === 'undefined' || /^(GET|HEAD|OPTIONS)$/i.test(request.method)) {
            return request;
          }
          const prefix = \`\${csrfCookie}=\`;
          const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix));
          if (entry) {
            request.headers.set(csrfHeader, decodeURIComponent(entry.slice(prefix.length)));
          }
          return request;
        },
      });
    }
    this.paths = wrapAsPathBasedClient(this.raw);
  }

  private async unwrap<T>(
    pending: Promise<{ data?: T; error?: unknown; response: Response }>,
  ): Promise<T> {
    const result = await pending;
    if (result.error !== undefined || !result.response.ok) {
      const details = result.error;
      const message =
        typeof details === 'string' && details.trim()
          ? details
          : details && typeof details === 'object' && 'message' in details &&
        typeof details.message === 'string'
          ? details.message
          : details && typeof details === 'object' && 'msg' in details &&
        typeof details.msg === 'string'
          ? details.msg
          : this.defaultErrorMessage;
      throw new ApiClientError(message, result.response, details);
    }
    return result.data as T;
  }

${methods
  .map(
    ({ apiPath, method, operationId }) => {
      if (method === 'GET' && ['/api/play-admin/library/import', '/api/play-admin/players/export'].includes(apiPath)) {
        const parameters = `Parameters<PathBasedClient<paths>[${JSON.stringify(apiPath)}]["GET"]>`
        const response = `FetchResponse<paths[${JSON.stringify(apiPath)}]["get"], Init[0], \`\${string}/\${string}\`>`
        return `  ${operationId}Raw<const Init extends ${parameters}>(...init: Init): Promise<${response}> {
    // Preserve parseAs when callers download text or binary resources.
    return this.paths[${JSON.stringify(apiPath)}].GET(...(init as ${parameters})) as Promise<${response}>;
  }

  ${operationId}<const Init extends ${parameters}>(...init: Init): Promise<NonNullable<${response}["data"]>> {
    return this.unwrap(this.${operationId}Raw(...init)) as Promise<NonNullable<${response}["data"]>>;
  }
`
      }
      return `  ${operationId}Raw(
    ...init: Parameters<PathBasedClient<paths>[${JSON.stringify(apiPath)}][${JSON.stringify(method)}]>
  ) {
    return this.paths[${JSON.stringify(apiPath)}].${method}(...init);
  }

  ${operationId}(
    ...init: Parameters<PathBasedClient<paths>[${JSON.stringify(apiPath)}][${JSON.stringify(method)}]>
  ) {
    return this.unwrap(this.${operationId}Raw(...init));
  }
`
    },
  )
  .join('\n')}
}

export const createApiClient = (options: ApiClientOptions = {}) => new ApiClient(options);
`

if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputFile) || fs.readFileSync(outputFile, 'utf8') !== source) {
    throw new Error('src/generated/client.ts is stale; run npm run generate')
  }
  console.log(`Generated API client is current: ${methods.length} methods`)
} else {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, source)
  console.log(`Generated API client: ${methods.length} methods`)
}
