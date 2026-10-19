# 地图服务端脚本入门

地图脚本响应玩家与世界事件，修改服务端实体和体素状态，在隔离环境中执行。接口声明以本目录和 `packages/script-api` 为准，编辑器会提供类型提示。

## 玩家加入与体素

```js
world.onPlayerJoin(({ entity }) => {
    entity.onVoxelContact(({ x, y, z }) => {
        world.voxels.setVoxel(x, y, z, 0);
    });
});
```

示例会移除玩家接触的体素。只在独立测试地图运行，不能将浏览器 DOM 或任意 Node.js 模块当作脚本环境能力。

## 事件与取消

```js
let count = 0;
const subscription = world.onTick(() => {
    count += 1;
    if (count > 10) {
        subscription.cancel();
    }
});
```

事件处理器返回可取消订阅。玩家加入/离开、碰撞、按键和 tick 使用各自事件通道。

| 入口                                         | 用途                     |
| -------------------------------------------- | ------------------------ |
| `world`                                      | 世界状态、实体查找和创建 |
| `world.voxels`                               | 地形与体素操作           |
| `world.createEntity()`、`entity.destroy()`   | 创建与销毁实体           |
| `world.onPlayerJoin` / `world.onPlayerLeave` | 玩家生命周期             |

运行时按 tick 协调客户端输入、脚本更新、物理与状态同步。具体调度和权限以服务端实现为准，不依赖固定毫秒数编写逻辑。首次创建、预览和发布见[首个作品教程](../../../../docs/first-project.md)。
