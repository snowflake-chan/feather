import { NetInputEventBits } from '@box/schema/net/net-schema';
import type { GameClientMessageEvent } from '@box/schema/api/js/anticheat';

function record(value: unknown): any {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}
/** Classification is based on engine protocol tables, never a client-declared category. */
export function inputEvent(event: GameClientMessageEvent) {
  if (event.protocol !== 'game-net' || event.message !== 'input') return undefined;
  const data = record(event.data);
  const input = record(data?.input);
  if (!input) { event.context.reject(); return undefined; }
  const flags = input.inputState;
  if (!Number.isInteger(flags) || flags < 0 || flags > 65535 || !Number.isFinite(data.tick)) {
    event.context.reject(); return undefined;
  }
  return Object.freeze({ player: event.player, tick: data.tick, context: event.context,
    buttons: Object.freeze({ jump: !!(flags & NetInputEventBits.JUMP), walk: !!(flags & NetInputEventBits.WALK),
      crouch: !!(flags & NetInputEventBits.CROUCH), run: !!(flags & NetInputEventBits.RUN), fly: !!(flags & NetInputEventBits.FLY),
      doubleJump: !!(flags & NetInputEventBits.DOUBLE_JUMP), action0: !!(flags & NetInputEventBits.ACTION0), action1: !!(flags & NetInputEventBits.ACTION1),
    }),
  });
}
export function keyboardEvent(event: GameClientMessageEvent) {
  if (event.protocol !== 'game-net' || event.message !== 'sendKeyBoardEvent') return undefined;
  const data = record(event.data);
  if (!data || !Array.isArray(data.keyDownState) || !Array.isArray(data.prevKeyDownState)) {
    event.context.reject(); return undefined;
  }
  if (!Number.isFinite(data.tick) || [...data.keyDownState, ...data.prevKeyDownState].some((key) => !Number.isInteger(key) || key < 0 || key > 255)) {
    event.context.reject(); return undefined;
  }
  return Object.freeze({ player: event.player, tick: data.tick, context: event.context,
    pressed: Object.freeze(data.keyDownState.filter((key: number) => !data.prevKeyDownState.includes(key))),
    released: Object.freeze(data.prevKeyDownState.filter((key: number) => !data.keyDownState.includes(key))),
  });
}
export function interactionData(event: GameClientMessageEvent) {
  if (event.protocol !== 'entity-interact' || event.message !== 'interact') return undefined;
  const data = record(event.data);
  if (!data || !Number.isInteger(data.id) || data.id < 0 || !Number.isFinite(data.tick)) {
    event.context.reject(); return undefined;
  }
  return data;
}
export function customData(event: GameClientMessageEvent): { tick: number; data: any } | undefined {
  if (event.protocol !== 'remote-channel' || event.message !== 'sendServerEvent') return undefined;
  const data = record(event.data);
  if (!data || typeof data.args !== 'string' || !Number.isFinite(data.tick)) { event.context.reject(); return undefined; }
  try { return { tick: data.tick, data: JSON.parse(data.args) }; }
  catch { event.context.reject(); return undefined; }
}
export function uiData(event: GameClientMessageEvent): { name: string; data: any } | undefined {
  if (event.protocol !== 'gui' || event.message !== 'sendMessage') return undefined;
  const data = record(event.data);
  if (!data || typeof data.name !== 'string' || typeof data.payload !== 'string') {
    event.context.reject(); return undefined;
  }
  try { return { name: data.name, data: JSON.parse(data.payload) }; }
  catch { event.context.reject(); return undefined; }
}
