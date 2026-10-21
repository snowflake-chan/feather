import type { ApiClient } from '@box/apis';

/** ContentHost POST /block returns a plain content hash, including for JSON blobs. */
export async function uploadLocalResource(api: ApiClient, file: Blob): Promise<string> {
  const result = await api.postBlockRaw({
    body: file as never,
    bodySerializer: (body) => body as unknown as BodyInit,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    parseAs: 'text',
  });
  if (!result.response.ok) throw new Error('本地资源保存失败');
  // Generated route types do not describe this legacy plain-text response.
  const data: unknown = result.data;
  const hash = typeof data === 'string' ? data.trim() : '';
  if (!/^[A-Za-z0-9_-]+$/.test(hash)) throw new Error('本地资源服务返回了无效的文件标识');
  return hash;
}

/** randomUUID requires a secure context; getRandomValues also works on LAN HTTP. */
function resourceUUID(): string {
  const crypto = globalThis.crypto;
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
  if (typeof crypto?.getRandomValues !== 'function') {
    throw new Error('当前浏览器无法生成资源标识，请使用支持安全随机数的浏览器');
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function localResourceIds(num?: number): string[] {
  const count = Math.max(0, Math.min(1000, Number(num) || 0));
  return Array.from({ length: count }, () => `local-${resourceUUID()}`);
}
