/**
 * Stable protocol surface shared by CLI clients and Creator HTTP adapters.
 * This module deliberately contains no HTTP, credential or storage code:
 * those are adapters owned by the calling application.
 */
export const CREATOR_API_VERSION = 'v1' as const;
export const CREATOR_API_PREFIX = `/api/creator/${CREATOR_API_VERSION}` as const;

export const CREATOR_SCRIPT_SIDES = ['client', 'server'] as const;
export type CreatorScriptSide = typeof CREATOR_SCRIPT_SIDES[number];
export const CREATOR_SCRIPT_MAX_BYTES = 20 * 1024 * 1024;

export type CreatorProjectScriptWrite = Readonly<{
  projectId: string;
  side: CreatorScriptSide;
  entry: string;
  content: string;
}>;

export type CreatorProjectScriptWriteResult = Readonly<{
  entry: string;
  side: CreatorScriptSide;
  revision: string;
  hash: string;
  shared: boolean;
  skipped?: boolean;
}>;

export type CreatorProjectScriptReadResult = Readonly<{
  entry: string;
  side: CreatorScriptSide;
  hash: string;
  shared: boolean;
  content: string;
}>;

export interface CreatorProjectScriptStore {
  updateProjectScript(
    projectId: string,
    side: CreatorScriptSide,
    entry: string,
    content: string,
  ): CreatorProjectScriptWriteResult;
  readProjectScript(projectId: string, side: CreatorScriptSide, entry: string): CreatorProjectScriptReadResult;
}

type ProtocolError = Error & { code: string; status: number };

function protocolError(code: string, message: string, status = 422): ProtocolError {
  return Object.assign(new Error(message), { code, status });
}

function recordOf(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export function creatorApiPath(...segments: readonly (string | number)[]) {
  return [CREATOR_API_PREFIX, ...segments.map((segment) => encodeURIComponent(String(segment)))].join('/');
}

export function creatorProjectScriptPath(projectId: string, side: CreatorScriptSide, entry: string) {
  const input = parseCreatorProjectScriptWrite({ projectId, side, entry, content: '' });
  return creatorApiPath('projects', input.projectId, 'scripts', input.side, input.entry);
}

export function parseCreatorProjectScriptWrite(value: unknown): CreatorProjectScriptWrite {
  const input = recordOf(value);
  const projectId = typeof input.projectId === 'string' ? input.projectId.trim() : '';
  const side = typeof input.side === 'string' ? input.side : '';
  const entry = typeof input.entry === 'string' ? input.entry : '';
  const content = input.content;
  if (!projectId) throw protocolError('PROJECT_ID_REQUIRED', 'projectId 必须是非空字符串');
  if (!CREATOR_SCRIPT_SIDES.includes(side as CreatorScriptSide)) {
    throw protocolError('SCRIPT_SIDE_INVALID', 'side 必须是 client 或 server');
  }
  if (!/^[A-Za-z0-9._-]{1,160}$/.test(entry) || entry.includes('..')) {
    throw protocolError('SCRIPT_ENTRY_INVALID', 'entry 必须是有效的脚本文件名');
  }
  if (typeof content !== 'string') {
    throw protocolError('SCRIPT_CONTENT_REQUIRED', 'content 必须是字符串');
  }
  if (Buffer.byteLength(content, 'utf8') > CREATOR_SCRIPT_MAX_BYTES) {
    throw protocolError('SCRIPT_CONTENT_TOO_LARGE', '脚本内容不能超过 20 MiB');
  }
  return { projectId, side: side as CreatorScriptSide, entry, content };
}

export function parseCreatorProjectScriptReference(value: unknown) {
  const input = recordOf(value);
  return parseCreatorProjectScriptWrite({ ...input, content: '' });
}

export function writeCreatorProjectScript(
  store: CreatorProjectScriptStore,
  input: CreatorProjectScriptWrite,
): CreatorProjectScriptWriteResult {
  if (!store || typeof store.updateProjectScript !== 'function') {
    throw new TypeError('CreatorProjectScriptStore 必须提供 updateProjectScript');
  }
  return store.updateProjectScript(input.projectId, input.side, input.entry, input.content);
}

export function readCreatorProjectScript(store: CreatorProjectScriptStore, input: Omit<CreatorProjectScriptWrite, 'content'>) {
  if (!store || typeof store.readProjectScript !== 'function') throw new TypeError('CreatorProjectScriptStore 必须提供 readProjectScript');
  return store.readProjectScript(input.projectId, input.side, input.entry);
}
