import { toWebSocketURL } from '../../../../../../shared/websocket-url';
type CaptureAction = { id: string; type: 'capture'; view: 'full' | '3d' | '2d' };

/** One bootstrap per connection; commands and results travel over WebSocket. */
export function connectCreatorScene(projectId: string, capture: (action: CaptureAction) => Promise<string>) {
  let disposed = false;
  let socket: WebSocket | undefined;
  let sessionId = '';
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let connectionTimer: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  const controller = new AbortController();
  const sessionPath = `/api/creator/v1/projects/${encodeURIComponent(projectId)}/scene/session`;
  const closeSession = () => {
    const id = sessionId;
    sessionId = '';
    if (id) void fetch(sessionPath, {
      method: 'DELETE', headers: { 'X-Box-Creator-Scene-Session': id }, keepalive: true,
    }).catch(() => undefined);
  };
  const retry = () => {
    if (disposed) return;
    const delay = Math.min(30_000, 1_000 * 2 ** Math.min(failures++, 5));
    retryTimer = setTimeout(() => { void open(); }, delay);
  };
  const open = async () => {
    try {
      const response = await fetch(sessionPath, { method: 'POST', signal: controller.signal });
      if (response.status === 401 || response.status === 403 || response.status === 404) return;
      if (!response.ok) throw new Error('无法初始化 CLI 场景控制');
      const session = await response.json() as { sessionId: string; socketToken: string; socketPath: string };
      sessionId = session.sessionId;
      if (disposed) { closeSession(); return; }
      const url = new URL(session.socketPath, window.location.href);
      if (url.origin !== window.location.origin) throw new Error('场景控制地址必须同源');
      const ws = new WebSocket(toWebSocketURL(url.href, window.location.href));
      socket = ws;
      connectionTimer = setTimeout(() => ws.close(), 10_000);
      ws.onopen = () => ws.send(JSON.stringify({
        type: 'connect', projectId, sessionId: session.sessionId, socketToken: session.socketToken,
      }));
      ws.onmessage = async event => {
        if (disposed || socket !== ws) return;
        let action: CaptureAction;
        try {
          const message = JSON.parse(String(event.data));
          if (message.type === 'ready') {
            clearTimeout(connectionTimer);
            failures = 0;
            return;
          }
          if (message.type !== 'capture' || typeof message.id !== 'string' || !['full', '3d', '2d'].includes(message.view)) return;
          action = message;
        } catch { ws.close(); return; }
        try {
          const contentBase64 = await capture(action);
          if (!disposed && socket === ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'capture-result', id: action.id, contentBase64 }));
          }
        } catch {
          if (!disposed && socket === ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'capture-error', id: action.id }));
          }
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        clearTimeout(connectionTimer);
        socket = undefined;
        closeSession();
        retry();
      };
    } catch {
      closeSession();
      retry();
    }
  };
  void open();
  return () => {
    disposed = true;
    controller.abort();
    clearTimeout(retryTimer);
    clearTimeout(connectionTimer);
    socket?.close();
    closeSession();
  };
}
