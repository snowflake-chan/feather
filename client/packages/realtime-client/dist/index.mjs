// src/websocket-url.ts
function toWebSocketURL(target, pageURL) {
  const url = new URL(target, pageURL);
  if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol)) {
    throw new Error("WebSocket URL must use http, https, ws or wss");
  }
  const secure = url.protocol === "https:" || url.protocol === "wss:" || pageURL !== void 0 && new URL(pageURL).protocol === "https:";
  url.protocol = secure ? "wss:" : "ws:";
  return url.href;
}

// src/index.ts
function createRealtimeClient(config = {}) {
  const connections = /* @__PURE__ */ new Map();
  const pageURL = () => config.pageURL ? config.pageURL() : window.location.href;
  const requestSession = config.requestSession || (async (options, signal) => {
    const response = await fetch(config.sessionURL || "/api/realtime/session", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: JSON.stringify(options.body),
      signal
    });
    if ([401, 403, 404].includes(response.status)) {
      return false;
    }
    if (!response.ok) {
      throw new Error("\u5B9E\u65F6\u8FDE\u63A5\u4E0D\u53EF\u7528");
    }
    return response.json();
  });
  function subscribeRealtime2(key, options, listener) {
    let connection = connections.get(key);
    if (!connection) {
      const listeners = /* @__PURE__ */ new Set();
      let socket;
      let disposed = false;
      let retry;
      let deadline;
      let failures = 0;
      const controller = new AbortController();
      const emit = (event) => {
        for (const handler of [...listeners]) {
          try {
            handler(event);
          } catch {
          }
        }
      };
      const reopen = () => {
        if (!disposed) {
          retry = setTimeout(
            () => {
              void open();
            },
            Math.min(3e4, 1e3 * 2 ** Math.min(failures++, 5))
          );
        }
      };
      const open = async () => {
        if (disposed) {
          return;
        }
        try {
          const grant = await requestSession(
            options,
            AbortSignal.any([controller.signal, AbortSignal.timeout(1e4)])
          );
          if (!grant) {
            emit({ type: "unauthorized" });
            return;
          }
          if (disposed) {
            return;
          }
          const page = pageURL();
          const url = new URL(grant.socketPath, page);
          if (url.origin !== new URL(page).origin) {
            throw new Error("\u5B9E\u65F6\u8FDE\u63A5\u5FC5\u987B\u540C\u6E90");
          }
          const socketURL = toWebSocketURL(url.href, page);
          const ws = config.createSocket ? config.createSocket(socketURL) : new WebSocket(socketURL);
          socket = ws;
          deadline = setTimeout(() => ws.close(), 1e4);
          ws.onopen = () => {
            if (!disposed && socket === ws) {
              ws.send(JSON.stringify({ type: "connect", ticket: grant.ticket }));
            }
          };
          ws.onmessage = ({ data }) => {
            if (disposed || socket !== ws) {
              return;
            }
            try {
              const event = JSON.parse(String(data));
              if (event.type === "reauthenticate") {
                emit(event);
                ws.close();
                return;
              }
              if (event.type === "ready") {
                failures = 0;
                clearTimeout(deadline);
              }
              emit(event);
            } catch {
              ws.close();
            }
          };
          ws.onerror = () => ws.close();
          ws.onclose = () => {
            if (socket !== ws) {
              return;
            }
            clearTimeout(deadline);
            socket = void 0;
            emit({ type: "disconnected" });
            reopen();
          };
        } catch {
          if (!disposed) {
            emit({ type: "disconnected" });
            reopen();
          }
        }
      };
      connection = {
        listeners,
        stop: () => {
          disposed = true;
          controller.abort();
          clearTimeout(retry);
          clearTimeout(deadline);
          socket?.close();
        }
      };
      connections.set(key, connection);
      void Promise.resolve().then(open);
    }
    const subscription = (event) => listener(event);
    connection.listeners.add(subscription);
    return () => {
      connection.listeners.delete(subscription);
      if (!connection.listeners.size) {
        connection.stop();
        connections.delete(key);
      }
    };
  }
  return { subscribeRealtime: subscribeRealtime2 };
}
var subscribeRealtime = createRealtimeClient().subscribeRealtime;
export {
  createRealtimeClient,
  subscribeRealtime,
  toWebSocketURL
};
