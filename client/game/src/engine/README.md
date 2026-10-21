# 浏览器游戏引擎

本目录维护浏览器端场景、渲染、网络、输入、音频与脚本界面；权威状态和服务端脚本位于 `services/game-server`。

| 入口                                | 用途                 |
| ----------------------------------- | -------------------- |
| `game-client.ts`、`interfaces.ts`   | 客户端生命周期与接口 |
| `net/`、`remote-channel/`           | 实时连接和状态同步   |
| `gl/`、`gpu/`、`mesh/`、`voxel/`    | 图形、模型与体素     |
| `input/`、`camera/`、`player/`      | 输入、相机与玩家呈现 |
| `gui/`、`game-ui/`、`script/`       | 脚本 GUI 与游戏界面  |
| `sound/`、`environment/`、`effect/` | 音频、环境与效果     |

从根目录源码栈进入 Creator 预览或 Play 验证。修改同步协议时同时核对服务端；总体关系见[架构](../../../../docs/architecture.md)。
