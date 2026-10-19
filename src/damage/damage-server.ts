import { GameServerState } from '../game-server-schema';
import { getById } from '@box/utils/id';
import {
  PlayerDisplayFlags,
  PlayerFlags,
} from '@box/schema/player/player-schema';
import { DamageConfigRDA } from '@box/schema/project/project-rda';
import { Damage, DamageSetSchema } from '@box/schema/damage/damage-schema';

export function copyConfigToDamage(
  damage: Damage,
  config: typeof DamageConfigRDA.stateSchema.identity,
) {
  damage.hp = config.hp;
  damage.maxHp = config.maxHp;
  damage.showHealthBar = config.showHealth;
}

export function clearDamageComponent(state: GameServerState) {
  state.replica.damage = DamageSetSchema.assign(
    state.replica.damage,
    DamageSetSchema.identity,
  );
}

export function tickServerDamage(state: GameServerState) {
  // update player display based on damage
  const damage = state.replica.damage;
  for (let i = 0; i < damage.length; ++i) {
    const d = damage[i];
    if (d.hp <= 0) {
      const playerInfo = getById(state.players, d.id);
      if (playerInfo) {
        playerInfo.flags &= ~PlayerFlags.ALLOW_MOVE;
        const playerDisplay = getById(state.replica.players, d.id);
        if (playerDisplay) {
          playerDisplay.flags |= PlayerDisplayFlags.DEAD;
        }
      }
    } else if (d.hp >= 0) {
      const playerInfo = getById(state.players, d.id);
      if (playerInfo) {
        playerInfo.flags |= PlayerFlags.ALLOW_MOVE;
        const playerDisplay = getById(state.replica.players, d.id);
        if (playerDisplay) {
          playerDisplay.flags &= ~PlayerDisplayFlags.DEAD;
        }
      }
    }
  }
}
