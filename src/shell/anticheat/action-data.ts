import { NetInputEventBits } from '@box/schema/net/net-schema';
import type { GameAnticheatAction, GameClientMessageEvent, MovementPosition } from '@box/schema/api/js/anticheat';

function vector(value: unknown): MovementPosition | undefined {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(Number.isFinite)) return undefined;
  return Object.freeze({ x: value[0], y: value[1], z: value[2] });
}

/** Preserve each claimed action; do not silently collapse the stacked events used by cheats. */
export function actionData(event: GameClientMessageEvent): readonly GameAnticheatAction[] | undefined {
  if (event.protocol !== 'game-net' || event.message !== 'input') return undefined;
  const data: any = event.data;
  if (!data || !Array.isArray(data.events)) { event.context.reject(); return undefined; }
  const actions: GameAnticheatAction[] = [];
  for (const input of data.events) {
    if (!input || !Number.isFinite(input.tick) ||
      !Number.isInteger(input.buttonState) || input.buttonState < 0 || input.buttonState > 255 ||
      !Number.isInteger(input.prevButtonState) || input.prevButtonState < 0 || input.prevButtonState > 255) {
      event.context.reject(); return undefined;
    }
    const changed = input.buttonState ^ input.prevButtonState;
    if (!(changed & (NetInputEventBits.ACTION0 | NetInputEventBits.ACTION1))) continue;
    const position = vector(input.position), origin = vector(input.rayOrigin),
      direction = vector(input.rayDirection), normal = vector(input.rayHitNormal);
    const voxel = [input.rayHitVoxelX, input.rayHitVoxelY, input.rayHitVoxelZ];
    if (!position || !origin || !direction || !normal || !voxel.every(Number.isInteger) ||
      !Number.isFinite(input.rayTime) || !Number.isSafeInteger(input.rayHitEntity) || input.rayHitEntity < 0) {
      event.context.reject(); return undefined;
    }
    const ray = Object.freeze({ origin, direction, normal, voxel: vector(voxel)!, distance: input.rayTime });
    for (const [button, flag] of [['action0', NetInputEventBits.ACTION0], ['action1', NetInputEventBits.ACTION1]] as const) {
      if (changed & flag) actions.push(Object.freeze({ tick: input.tick, button,
        pressed: !!(input.buttonState & flag), position, targetId: input.rayHitEntity, target: undefined, ray }));
    }
  }
  return Object.freeze(actions);
}
