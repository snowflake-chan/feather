/** Browser callers pass the page URL so HTTPS pages never open insecure sockets. */
export function toWebSocketURL(target: string, pageURL?: string): string {
  const url = new URL(target, pageURL);
  if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) {
    throw new Error('WebSocket URL must use http, https, ws or wss');
  }
  const secure = url.protocol === 'https:' || url.protocol === 'wss:' ||
    (pageURL !== undefined && new URL(pageURL).protocol === 'https:');
  url.protocol = secure ? 'wss:' : 'ws:';
  return url.href;
}
