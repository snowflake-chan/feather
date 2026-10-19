import { MuClient } from '@box/mudb/client';
import { GameEventHandlerToken } from '@box/schema/api/js/api';
import type { GamePlayer, GameEntity, GameEventChannel } from '@box/schema/api/js/api';
import type { GameAnticheat, GameMovementEvent, GameClientMessageEvent, GameAnticheatActionEvent, GameAnticheatInputEvent, GameAnticheatKeyboardEvent, GameAnticheatInteractEvent, GameAnticheatCustomEvent, GameAnticheatUIEvent } from '@box/schema/api/js/anticheat';
import { AnticheatProtocol } from './anticheat-protocol';
import type { MovementSample } from './movement-inspector';
import { inputEvent, keyboardEvent, interactionData, customData, uiData } from './message-categories';
import { MessageSubscription } from './message-subscriptions';
import { actionData } from './action-data';
import { TrackerFactory } from './player-tracker';
import type { GameAnticheatTrackerOptions } from '@box/schema/api/js/anticheat';

export class AnticheatScript implements GameAnticheat {
  private listeners = new Set<(event: GameMovementEvent) => void>();
  private messageListeners = new Map<(event: GameClientMessageEvent) => void, number>();
  private sentMessageMask = 0;
  private playerIds = new WeakMap<GameClientMessageEvent, number>();
  private protocol;
  private trackers: TrackerFactory;
  constructor(client: MuClient, player: (id: number) => GamePlayer | undefined, log: (error: unknown) => void,
    private entity: (id: number) => GameEntity | undefined = () => undefined, clock: () => number = () => 0) {
    this.trackers = new TrackerFactory(clock);
    this.protocol = client.protocol(AnticheatProtocol);
    this.protocol.configure({ message: {
      clientMessage: (message) => {
        const decision = new ListenerDecision(log);
        try {
          const sample = JSON.parse(message.payload);
          const target = player(message.playerId);
          if (!target || !this.messageListeners.size) decision.reject('player-unavailable');
          else {
            const event: GameClientMessageEvent = Object.freeze({
              player: target, protocol: sample.protocol, message: sample.message,
              data: freezeData(sample.data), unreliable: sample.unreliable,
              context: Object.freeze({ source: 'client-message' as const,
                serverTick: sample.serverTick, mode: sample.mode,
                reject: decision.reject,
              }),
            });
            this.playerIds.set(event, message.playerId);
            for (const listener of [...this.messageListeners.keys()]) {
              if (!this.messageListeners.has(listener)) continue;
              decision.run(() => listener(event), 'onMessage');
            }
          }
        } catch (error) { decision.fail(error); }
        finally {
          this.protocol.server.message.messageDecision({ handle: message.handle, playerId: message.playerId, ...decision.finish() });
        }
      },
      movement: (message) => {
        const decision = new ListenerDecision(log);
        try {
          const sample: MovementSample = JSON.parse(message.payload);
          const target = player(message.playerId);
          if (!target || sample.playerId !== message.playerId || !this.listeners.size) decision.reject('player-unavailable');
          else {
            const event: GameMovementEvent = Object.freeze({
              player: target,
              from: Object.freeze({ ...sample.from }),
              to: Object.freeze({ ...sample.to }),
              elapsedMs: sample.elapsedMs,
              velocity: Object.freeze({ from: Object.freeze({ ...sample.velocity.from }), to: Object.freeze({ ...sample.velocity.to }) }),
              context: Object.freeze({
                source: 'client-correction' as const,
                inputTick: sample.inputTick, serverTick: sample.serverTick, mode: sample.mode,
                reject: decision.reject,
              }),
            });
            for (const listener of [...this.listeners]) {
              decision.run(() => listener(event), 'onMovement');
            }
          }
        } catch (error) { decision.fail(error); }
        finally {
          this.protocol.server.message.decision({ handle: message.handle, playerId: message.playerId, ...decision.finish() });
        }
      },
    } });
  }
  readonly onMovement = (handler: (event: GameMovementEvent) => void) => {
    if (typeof handler !== 'function') throw new Error('移动监听器必须是函数');
    // A distinct wrapper gives each subscription its own cancellation token.
    const listener = (event: GameMovementEvent) => handler(event);
    const enable = () => {
      const previous = this.listeners.size;
      this.listeners.add(listener);
      if (!previous) this.protocol.server.message.listen(true);
    };
    enable();
    return new GameEventHandlerToken(() => {
      this.listeners.delete(listener);
      if (!this.listeners.size) this.protocol.server.message.listen(false);
    }, enable, () => this.listeners.has(listener));
  };
  /** Internal initialization messages, sent before/after evaluating the entry module. */
  initialize() {
    this.trackers.reset();
    this.listeners.clear(); this.messageListeners.clear();
    this.sentMessageMask = 0;
    this.protocol.server.message.listen(false);
    this.protocol.server.message.listenMessages(0);
  }
  finishInitialization() { this.protocol.server.message.initialized(undefined); }
  readonly createTracker = (options?: GameAnticheatTrackerOptions) => this.trackers.create(options);
  readonly onMessage = (handler: (event: GameClientMessageEvent) => void) => this.subscribeMessage(handler, MessageSubscription.All);
  private notifyMessageMask() {
    let mask = 0;
    for (const value of this.messageListeners.values()) mask |= value;
    if (mask & MessageSubscription.All) mask = MessageSubscription.All;
    if (mask !== this.sentMessageMask) {
      this.sentMessageMask = mask;
      this.protocol.server.message.listenMessages(mask);
    }
  }
  private subscribeMessage(handler: (event: GameClientMessageEvent) => void, mask: number) {
    if (typeof handler !== 'function') throw new Error('消息监听器必须是函数');
    const listener = (event: GameClientMessageEvent) => handler(event);
    const enable = () => {
      this.messageListeners.set(listener, mask);
      this.notifyMessageMask();
    };
    enable();
    return new GameEventHandlerToken(() => {
      this.messageListeners.delete(listener);
      this.notifyMessageMask();
    }, enable, () => this.messageListeners.has(listener));
  }
  private category<T>(handler: (event: T) => void, convert: (event: GameClientMessageEvent) => T | undefined, mask: number) {
    if (typeof handler !== 'function') throw new Error('监听器必须是函数');
    return this.subscribeMessage((event) => {
      const value = convert(event);
      if (value) return handler(value);
    }, mask);
  }
  readonly onInput: GameEventChannel<GameAnticheatInputEvent> = (handler) => this.category(handler, inputEvent, MessageSubscription.Input);
  readonly onAction: GameEventChannel<GameAnticheatActionEvent> = (handler) => this.category(handler, (event) => {
    const actions = actionData(event);
    if (!actions?.length) return undefined;
    // Actor comes exclusively from the private host message, not candidate target/position fields.
    const position = this.entity(this.playerIds.get(event)!)?.position;
    if (!position) { event.context.reject("player-unavailable"); return undefined; }
    const resolved = Object.freeze(actions.map(action => Object.freeze({
      ...action, target: action.targetId ? this.entity(action.targetId) : undefined,
    })));
    return Object.freeze({ player: event.player, actions: resolved,
      serverPosition: Object.freeze({ x: position.x, y: position.y, z: position.z }), context: event.context });
  }, MessageSubscription.Action);
  readonly onKeyboard: GameEventChannel<GameAnticheatKeyboardEvent> = (handler) => this.category(handler, keyboardEvent, MessageSubscription.Keyboard);
  readonly onInteract: GameEventChannel<GameAnticheatInteractEvent> = (handler) => this.category(handler, (event) => {
    const data = interactionData(event);
    return data ? Object.freeze({ player: event.player, tick: data.tick, target: this.entity(data.id), context: event.context }) : undefined;
  }, MessageSubscription.Interact);
  readonly onCustomEvent: GameEventChannel<GameAnticheatCustomEvent> = (handler) => this.category(handler, (event) => {
    const data = customData(event);
    return data ? Object.freeze({ player: event.player, tick: data.tick, data: freezeData(data.data), context: event.context }) : undefined;
  }, MessageSubscription.Custom);
  readonly onUIEvent: GameEventChannel<GameAnticheatUIEvent> = (handler) => this.category(handler, (event) => {
    const data = uiData(event);
    return data ? Object.freeze({ player: event.player, name: data.name, data: freezeData(data.data), context: event.context }) : undefined;
  }, MessageSubscription.UI);
}

/** One decision per packet: late callbacks cannot modify a finished or subsequent request. */
class ListenerDecision {
  private active = true;
  private allow = true;
  private reason = 'map-rule';
  constructor(private log: (error: unknown) => void) {}

  readonly reject = (reason?: string) => {
    if (!this.active) return;
    this.allow = false;
    this.reason = typeof reason === 'string' && reason ? reason.slice(0, 128) : 'map-rule';
  };

  run(listener: () => unknown, channel: 'onMessage' | 'onMovement') {
    const log = this.log;
    try {
      const result: any = listener();
      if (result && typeof result.then === 'function') {
        this.reject('async-listener');
        Promise.resolve(result).catch(log);
        log(new Error(`world.anticheat.${channel} 必须同步处理，不能 await`));
      }
    } catch (error) { this.fail(error); }
  }

  fail(error: unknown) {
    const log = this.log;
    this.reject('listener-error');
    log(error);
  }

  finish() {
    this.active = false;
    return { allow: this.allow, reason: this.allow ? '' : this.reason };
  }
}

function freezeData(value: any): any {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeData);
    Object.freeze(value);
  }
  return value;
}
