// 最小验证脚本：不依赖任何外部服务
// 1s 后抛异常，把 tick 数和实体数带出来
let ticks = 0;
world.onTick(() => {
  ticks++;
});

setTimeout(() => {
  const entities = world.querySelectorAll('*').length;
  throw new Error(`[validation] 1s ticks=${ticks} entities=${entities}`);
}, 1000);
