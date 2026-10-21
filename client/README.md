# @feather/client

Static game body extracted from the official client. No Next page, no portal.

Source is built from the official game checkout (default:
`../box3-local-engine/apps/game`). Set `BOX_GAME_ROOT` to override it.

```bash
cd client
node build.mjs
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
