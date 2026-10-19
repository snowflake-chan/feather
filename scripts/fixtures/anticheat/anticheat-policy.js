// 合并到服务端脚本后调用 installMapAnticheat(world, options)。不会自动安装或处罚。
// 所有阈值由地图提供，速度使用引擎物理单位；elapsedMs 不是物理模拟时长。
function installMapAnticheat(world, options) {
    const finite = (value, name) => {
        if (!Number.isFinite(value) || value < 0) {
            throw new Error(name + ' 必须是非负有限数');
        }
        return value;
    };
    const integer = (value, name) => {
        finite(value, name);
        if (!Number.isSafeInteger(value)) {
            throw new Error(name + ' 必须是整数');
        }
        return value;
    };
    const movement = options.movement;
    const action = options.action;
    if (!movement && !action) {
        throw new Error('至少启用一类规则');
    }
    if (movement && typeof movement.limits !== 'function') {
        throw new Error('movement.limits 必須由服务端提供');
    }
    if (action) {
        finite(action.originRadius, 'originRadius');
        integer(action.maxPresses, 'maxPresses');
        for (const button of ['action0', 'action1']) {
            integer(action.cooldownTicks[button], button + ' cooldownTicks');
        }
        if (typeof action.validate !== 'function') {
            throw new Error('action.validate 必须复核本图操作');
        }
    }
    const spawnTicks = integer(options.spawnGraceTicks ?? 0, 'spawnGraceTicks');
    const observing = options.observeOnly !== false;
    const entities = new Map(),
        clocks = new WeakMap();
    const movementTracker = world.anticheat.createTracker({
        historySize: options.historySize ?? 64,
    });
    const actionTracker = world.anticheat.createTracker({ historySize: options.historySize ?? 64 });
    const tokens = [];
    const magnitude = (v) => Math.hypot(v.x, v.y, v.z);
    const difference = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
    function record(tracker, event, kind, reason, evidence) {
        tracker.record(event.player, {
            kind,
            reason,
            rejected: !!reason && !observing,
            ...evidence,
        });
        if (reason) {
            tracker.addScore(event.player, 1);
            if (!observing) {
                event.context.reject(reason);
            }
        }
        if (options.onDecision) {
            options.onDecision({
                player: event.player,
                kind,
                reason,
                rejected: !!reason && !observing,
            });
        }
    }
    function register(entity) {
        entities.set(entity.player, entity);
        if (spawnTicks) {
            movementTracker.exempt(entity.player, { ticks: spawnTicks, reason: '初始同步' });
        }
    }
    // 支持在已运行地图中安装；只接受调用方提供的服务端实体。
    for (const entity of options.entities ?? []) {
        register(entity);
    }
    tokens.push(world.onPlayerJoin(({ entity }) => register(entity)));
    tokens.push(
        world.onPlayerLeave(({ entity }) => {
            entities.delete(entity.player);
            clocks.delete(entity.player);
            movementTracker.clear(entity.player);
            actionTracker.clear(entity.player);
        }),
    );
    if (movement) {
        tokens.push(
            world.anticheat.onMovement((event) => {
                const entity = entities.get(event.player);
                // Join 回调前不套用地图物理规则；引擎的身份/归属检查仍生效。
                if (!entity || movementTracker.isExempt(event.player)) {
                    return;
                }
                const limits = movement.limits(entity, event);
                if (!limits || typeof limits.then === 'function') {
                    throw new Error('移动配置必须同步返回阈值');
                }
                for (const key of [
                    'positionError',
                    'horizontalSpeed',
                    'riseSpeed',
                    'fallSpeed',
                    'horizontalVelocityError',
                    'verticalVelocityError',
                ]) {
                    finite(limits[key], key);
                }
                const positionError = magnitude(difference(event.to, event.from));
                const velocityError = difference(event.velocity.to, event.velocity.from);
                const horizontalSpeed = Math.hypot(event.velocity.to.x, event.velocity.to.z);
                // 不用前一份已接受候选自动抬高上限，避免每包小幅增速不断扩大许可。
                // 合法击退/载具的上限或短暂豁免由服务端玩法提供。
                const reason =
                    positionError > limits.positionError
                        ? 'position-error'
                        : horizontalSpeed > limits.horizontalSpeed
                          ? 'horizontal-speed'
                          : event.velocity.to.y > limits.riseSpeed ||
                              event.velocity.to.y < -limits.fallSpeed
                            ? 'vertical-speed'
                            : Math.hypot(velocityError.x, velocityError.z) >
                                limits.horizontalVelocityError
                              ? 'horizontal-velocity-error'
                              : Math.abs(velocityError.y) > limits.verticalVelocityError
                                ? 'vertical-velocity-error'
                                : null;
                record(movementTracker, event, 'movement', reason, {
                    positionError,
                    from: event.from,
                    to: event.to,
                    velocity: event.velocity,
                });
            }),
        );
    }
    if (action) {
        tokens.push(
            world.anticheat.onAction((event) => {
                const pressed = event.actions.filter((item) => item.pressed);
                if (!pressed.length) {
                    return;
                } // 松开不消耗冷却，也不要求命中。
                const tick = actionTracker.serverTick; // 不采用客户端 tick 或历史容量作为频率计数。
                const previous = clocks.get(event.player) ?? {};
                const next = { ...previous };
                let reason = pressed.length > action.maxPresses ? 'stacked-actions' : null;
                for (const item of pressed) {
                    if (reason) {
                        break;
                    }
                    if (
                        magnitude(difference(item.ray.origin, event.serverPosition)) >
                        action.originRadius
                    ) {
                        reason = 'ray-origin';
                    } else if (
                        next[item.button] !== undefined &&
                        tick - next[item.button] < action.cooldownTicks[item.button]
                    ) {
                        reason = 'action-cooldown';
                    } else {
                        const verdict = action.validate(event, item, entities.get(event.player));
                        if (verdict !== null && typeof verdict !== 'string') {
                            throw new Error('action.validate 必须同步返回 null 或拒绝原因');
                        }
                        reason = verdict || null;
                    }
                    next[item.button] = tick;
                }
                // 整包通过才更新冷却；被拒绝包不污染下一次正常攻击。
                if (!reason) {
                    clocks.set(event.player, next);
                }
                record(actionTracker, event, 'action', reason, { presses: pressed.length });
            }),
        );
    }
    return {
        movementTracker,
        actionTracker,
        exemptMovement(player, ticks, reason) {
            movementTracker.exempt(player, { ticks, reason });
        },
        dispose() {
            for (const token of tokens) {
                token.cancel();
            }
            entities.clear();
            movementTracker.clear();
            actionTracker.clear();
        },
    };
}

// 按当前服务端世界复核命中。武器范围/相机起点由服务端玩法传入。
// 它不做历史回放补偿；高延迟地图应提供自己的 action.validate。
function validateAnticheatRay(world, action, spec) {
    if (!Number.isFinite(spec.maxDistance) || spec.maxDistance <= 0) {
        throw new Error('maxDistance 必须为正有限数');
    }
    if (!spec.origin || ![spec.origin.x, spec.origin.y, spec.origin.z].every(Number.isFinite)) {
        throw new Error('需要服务端射线起点');
    }
    const length = Math.hypot(
        action.ray.direction.x,
        action.ray.direction.y,
        action.ray.direction.z,
    );
    if (!Number.isFinite(length) || length < 0.000001) {
        return 'ray-direction';
    }
    if (action.targetId && !action.target) {
        return 'unknown-target';
    }
    const direction = new GameVector3(
        action.ray.direction.x / length,
        action.ray.direction.y / length,
        action.ray.direction.z / length,
    );
    const hit = world.raycast(
        new GameVector3(spec.origin.x, spec.origin.y, spec.origin.z),
        direction,
        {
            maxDistance: spec.maxDistance,
            ignoreSelector: spec.ignoreSelector ?? '',
            ignoreFluid: true,
            ignoreVoxel: false,
            ignoreEntities: false,
        },
    );
    if (action.targetId) {
        if (!hit.hit || hit.distance > spec.maxDistance || hit.hitEntity !== action.target) {
            return 'target-range-or-occlusion';
        }
    } else if (action.ray.distance >= 0) {
        if (
            !hit.hit ||
            hit.distance > spec.maxDistance ||
            !hit.hitVoxel ||
            hit.hitEntity ||
            hit.voxelIndex.x !== action.ray.voxel.x ||
            hit.voxelIndex.y !== action.ray.voxel.y ||
            hit.voxelIndex.z !== action.ray.voxel.z
        ) {
            return 'voxel-hit-mismatch';
        }
    }
    return null;
}
