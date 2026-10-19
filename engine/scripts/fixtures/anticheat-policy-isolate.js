// 自动化 isolated-vm 回归测试专用。
// 只用于专用测试地图；保留地图重力，不覆盖现有玩法。不开启处罚或持久化存储。
(() => {
  const FIXTURE = 'box-ac-policy-v1';
  const players = new Map();
  const duplicateTracker = world.anticheat.createTracker({ historySize: 128 });
  function state(player) {
    let value = players.get(player);
    if (!value) {
      value = { entity: null, stats: { movements: 0, movementRejected: 0, actions: 0,
        actionRejected: 0, duplicateRejected: 0, appliedPresses: 0 } };
      players.set(player, value);
    }
    return value;
  }
  world.onPlayerJoin(({ entity }) => { state(entity.player).entity = entity; });
  const policy = installMapAnticheat(world, {
    observeOnly: false, spawnGraceTicks: 48, historySize: 128,
    // 测试阈值：覆盖参考样本，不是正式跑跳物理模型。
    movement: { limits: () => ({ positionError: 1, horizontalSpeed: 0.6, riseSpeed: 1, fallSpeed: 20,
      horizontalVelocityError: 0.6, verticalVelocityError: 0.2 }) },
    action: { originRadius: 2, maxPresses: 1, cooldownTicks: { action0: 6, action1: 6 },
      validate: (event, action, entity) => {
        if (!entity) return 'not-ready';
        return validateAnticheatRay(world, action, {
          origin: event.serverPosition, maxDistance: 6, ignoreSelector: '#' + entity.id,
        });
      } },
    onDecision({ player, kind, reason, rejected }) {
      const stats = state(player).stats;
      if (kind === 'movement') { stats.movements++; if (rejected) stats.movementRejected++; }
      else { stats.actions++; if (rejected) stats.actionRejected++; }
      if (reason) console.log('[AC-POLICY] ' + JSON.stringify({ kind, reason, rejected }));
    },
  });
  world.onPlayerLeave(({ entity }) => { players.delete(entity.player); duplicateTracker.clear(entity.player); });
  world.anticheat.onMessage(event => {
    if (event.protocol !== 'game-net' || event.message !== 'input') return;
    const bodies = event.data && event.data.input && event.data.input.bodies;
    if (!Array.isArray(bodies) || new Set(bodies.map(body => body.id)).size === bodies.length) return;
    state(event.player).stats.duplicateRejected++;
    duplicateTracker.record(event.player, { kind: 'duplicate', rejected: true, count: bodies.length });
    duplicateTracker.addScore(event.player, 1); event.context.reject();
  });
  world.onPress(event => {
    if (event.button === 'action0') state(event.entity.player).stats.appliedPresses++;
  });
  remoteChannel.onServerEvent(({ entity, args }) => {
    if (!args || args.kind !== 'ac-manual-report' || typeof args.nonce !== 'string' || args.nonce.length > 48) return;
    const value = players.get(entity.player);
    if (!value || !value.entity) return;
    const trackers = [policy.movementTracker, policy.actionTracker, duplicateTracker];
    remoteChannel.sendClientEvent(entity, {
      kind: 'ac-manual-report', fixture: FIXTURE, nonce: args.nonce,
      ready: !policy.movementTracker.isExempt(entity.player), serverTick: policy.actionTracker.serverTick,
      minActionGapTicks: 6,
      lastActionTick: policy.actionTracker.getHistory(entity.player).filter(e => e.data.reason === null).at(-1)?.serverTick ?? -100,
      stats: { ...value.stats }, score: trackers.reduce((sum, tracker) => sum + tracker.getScore(entity.player), 0),
      position: { x: entity.position.x, y: entity.position.y, z: entity.position.z },
      history: trackers.flatMap(tracker => tracker.getHistory(entity.player)).sort((a, b) => a.serverTick - b.serverTick).slice(-128),
    });
  });
  console.log('[AC-POLICY] 增强测试规则启动；保留地图重力、无处罚、仅内存记录。');
})();
