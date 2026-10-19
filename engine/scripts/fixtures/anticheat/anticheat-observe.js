// 仅服务端。按需启用事件，默认不拒绝操作、不处罚，也不刷日志。
const enabledEvents = new Set(['onMovement', 'onAction']);
const printLogs = false;

function observe(name, summarize) {
    if (!enabledEvents.has(name)) {
        return;
    }
    const tracker = world.anticheat.createTracker({ historySize: 16 });
    world.anticheat[name]((event) => {
        const record = tracker.record(event.player, summarize(event));
        if (printLogs) {
            console.log(`[anticheat:${name}]`, record);
        }
        // 可在这里查 tracker.getHistory(event.player)，再编写本图自己的规则。
    });
}

observe('onMovement', (event) => ({
    from: event.from,
    to: event.to,
    velocity: event.velocity,
    elapsedMs: event.elapsedMs,
}));

observe('onAction', (event) => ({
    serverPosition: event.serverPosition,
    // 完整 actions 是候选数据，包含按下、松开、目标和射线；这里只存计数。
    pressed: event.actions.filter((action) => action.pressed).length,
}));

observe('onInput', (event) => ({ buttons: event.buttons }));
observe('onKeyboard', (event) => ({ pressed: event.pressed, released: event.released }));
observe('onInteract', (event) => ({ target: event.target ? event.target.id : null }));

observe('onCustomEvent', (event) => ({
    // 实际内容在 event.data 中，按自己协议验证权限和字段。
    kind: typeof event.data,
}));

observe('onUIEvent', (event) => ({ name: event.name }));
observe('onMessage', (event) => ({ protocol: event.protocol, message: event.message }));

// onMessage 是进阶接口，不建议只为普通移动检查就启用全消息监听。
// 需要拒绝时，必须在当前同步回调内 event.context.reject()。
