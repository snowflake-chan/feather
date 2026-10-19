// 只合并到服务端脚本。默认只观察，没有内置检测或处罚。
// 请保留原来的玩法代码，不要用本例覆盖它。
const anticheatSettings = {
    observeOnly: true,
    historySize: 32,
    decayPerTick: 0,
};

// 每个实例独立维护一条规则的历史、分数和豁免标记。
// evaluate(event, history) 返回 null，或 { reason: string, points: number, reject: boolean }。
// evaluate 必须同步执行，不能等待请求或 world.moderation 调用。
class MapAnticheatRule {
    constructor(name, evaluate) {
        this.name = name;
        this.evaluate = evaluate;
        this.tracker = world.anticheat.createTracker({
            historySize: anticheatSettings.historySize,
            decayPerTick: anticheatSettings.decayPerTick,
        });
    }

    inspect(event, evidence) {
        if (this.tracker.isExempt(event.player)) {
            return;
        }
        const history = this.tracker.getHistory(event.player);
        const outcome = this.evaluate(event, history);
        if (outcome && typeof outcome.then === 'function') {
            throw new Error('反作弊检查必须同步执行');
        }
        this.tracker.record(event.player, evidence);
        if (!outcome) {
            return;
        }
        if (typeof outcome.reason !== 'string' || typeof outcome.reject !== 'boolean') {
            throw new Error('请返回 { reason, points, reject } 或 null');
        }
        const score = this.tracker.addScore(event.player, outcome.points);
        console.log(`[anticheat:${this.name}]`, outcome.reason, {
            score,
            tick: this.tracker.serverTick,
        });
        if (!anticheatSettings.observeOnly && outcome.reject) {
            event.context.reject();
        }
    }
}

const movementRule = new MapAnticheatRule('movement', (event, history) => {
    // 在这里写自己的规则，可使用 from/to、elapsedMs、velocity 和服务端历史。
    // 记得考虑本图的冲刺、击退、载具和传送，不套用固定速度限制。
    // 返回 null 表示正常；一次异常也不代表应该封号。
    return null;
});

const actionRule = new MapAnticheatRule('action', (event, history) => {
    // actions 包含逐次按下/松开，不只是连续按键状态。
    // 根据 serverPosition 和本图相机设置校验候选射线起点。
    // 如果玩法依赖射线命中，要在服务端重新检查命中和遮挡。
    // 也要考虑跨消息的历史：外挂可以把攻击拆成多条消息。
    return null;
});

world.anticheat.onMovement((event) => {
    movementRule.inspect(event, {
        from: event.from,
        to: event.to,
        elapsedMs: event.elapsedMs,
        velocity: event.velocity,
    });
});

world.anticheat.onAction((event) => {
    actionRule.inspect(event, {
        serverPosition: event.serverPosition,
        pressed: event.actions.filter((action) => action.pressed).length,
        // 不要记录整个 player、entity 或 context 对象。
    });
});

// 只从经过验证的服务端技能/载具逻辑调用。
// 不要直接相信客户端发来的“给我豁免”，先校验权限和玩法条件。
function exemptMovementForSkill(player, ticks, reason) {
    movementRule.tracker.exempt(player, { ticks, reason });
}

// 本例不自动封号、踢人、伤害，也不设置固定距离、速度或冷却。
// 如需处罚，单独使用 world.moderation，仍须通过它原有的授权检查。
