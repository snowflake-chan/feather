# 脚本 GUI 客户端

`gui-client.ts` 管理脚本界面，`gui-protocol.ts` / `gui-schema.ts` 定义传输与状态，`element.ts`、`event.ts` 和 `components/` 实现节点与事件。

新增元素或事件时同步协议、客户端与服务端实现；在 Creator 预览和 Play 中检查实际交互。引擎入口见[上级说明](../README.md)。
