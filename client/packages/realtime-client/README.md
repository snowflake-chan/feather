# @box/realtime-client

票据认证、连接共享、退避重连和取消订阅的浏览器模块，不依赖 React 或具体应用。

```ts
import { createRealtimeClient } from '@box/realtime-client';
const realtime = createRealtimeClient({ sessionURL: '/api/realtime/session' });
const stop = realtime.subscribeRealtime('changes', { body: { kind: 'admin-events' } }, console.log);
stop();
```

默认 `subscribeRealtime` 保持原应用行为；每个工厂实例拥有自己的连接集合，同一实例内同 key 共用连接。不同订阅参数应使用不同 key。可注入 `requestSession` 接入应用现有 API 客户端，也可注入页面地址或 socket 创建函数用于测试。

会话握手只在建立/重连时发生，不周期轮询 HTTP。票据在首个 WebSocket 帧发送，不放入 URL；socket 必须与页面同源，HTTPS 页面使用 WSS。调用方处理事件载荷和重新授权，服务端继续校验票据与权限。

仓库中运行 `npm run build -- --to @box/realtime-client`，本目录运行 `npm test`。构建产物提供 ESM、CommonJS 与声明；构建后可 `npm pack`。
