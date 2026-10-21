# @feather/client

Static game body extracted from the official client. No Next page, no portal.

All game-body source and local `@box/*` packages are vendored here. No
other workspace is required.

```bash
cd client
pnpm install
pnpm build
node serve.mjs
```

`dist/config.json` points at the map engine:

```json
{
  "locale": "zh-CN",
  "staticGame": true,
  "headless": false,
  "remoteGameServerURL": "http://127.0.0.1:3002",
  "ARENA_URL": "http://127.0.0.1:3002"
}
```

The engine serves `/api/session`, `/block`, `/avatar` and the WebSocket.
