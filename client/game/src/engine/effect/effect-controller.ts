import { GameClientState } from '../game-client-schema';
import {
  BreakEffectSchema,
  HurtEffectSchema,
  DieEffectSchema,
  RespawnEffectSchema,
  MAX_BREAK_EFFECT,
  HURT_EFFECT_TIME,
  DIE_EFFECT_TIME,
  RESPAWN_EFFECT_TIME,
  BREAK_EFFECT_TIME,
} from './effect-schema';
import { vec2, vec3 } from 'gl-matrix';
import { sampleLightBox } from '../voxel/voxel-controller';
import { LightQueryMask } from '../voxel/light-schema';
import { getById } from '@box/utils/id';
import { vibrateDevice } from './vibrate';
import {
  playSoundEffectLocal,
  playSoundEffectSpatial,
} from '../sound/client-sound-controller';
import { PlayerButtonState } from '@box/schema/player/player-schema';

function unpackTexCoord(coord: vec2, texCode: number) {
  vec2.set(coord, texCode & 0xff, (texCode >> 8) & 0xff);
}

function tickBreakEffects(state: GameClientState) {
  const deltaTick = state.clock.deltaTick;
  const breakEffects = state.effects.break;
  let breakPtr = 0;
  for (let i = 0; i < breakEffects.length; ++i) {
    const x = breakEffects[i];
    x.animTick += deltaTick;
    if (x.animTick < BREAK_EFFECT_TIME) {
      breakEffects[breakPtr++] = x;
    } else {
      BreakEffectSchema.free(x);
    }
  }
  breakEffects.length = breakPtr;

  const blockChanges = state.events.voxel.voxelChange;
  const blockIndex = state.blockIndex;
  const blockFluid = blockIndex.fluid;
  const blockTexture = blockIndex.texture;

  let soundCounter = 1;
  for (let i = 0; i < blockChanges.length; ++i) {
    const c = blockChanges[i];
    if (c.b === 0 && !blockFluid[c.p & 0x0fff]) {
      const effect = BreakEffectSchema.alloc();
      const p = c.p;

      effect.lightId =
        (++state.effects.effectCounter << LightQueryMask.SHIFT) +
        LightQueryMask.BREAK;

      effect.position[0] = c.x;
      effect.position[1] = c.y;
      effect.position[2] = c.z;
      effect.rand[0] = Math.random();
      effect.rand[1] = Math.random();
      effect.animTick = 0;

      const probe = (effect.probe = sampleLightBox(
        state.light,
        effect.lightId,
      ));

      probe.X6 = probe.X4 = probe.X2 = probe.X0 = c.x + 0.01;
      probe.Y5 = probe.Y4 = probe.Y1 = probe.Y0 = c.y + 0.01;
      probe.Z3 = probe.Z2 = probe.Z1 = probe.Z0 = c.z + 0.01;

      probe.X7 = probe.X5 = probe.X3 = probe.X1 = c.x + 0.99;
      probe.Y7 = probe.Y6 = probe.Y3 = probe.Y2 = c.y + 0.99;
      probe.Z7 = probe.Z6 = probe.Z5 = probe.Z4 = c.z + 0.99;

      probe.lox = c.x - 0.5;
      probe.loy = c.y - 3;
      probe.loz = c.z - 0.5;

      probe.hix = c.x + 1.5;
      probe.hiy = c.y + 1;
      probe.hiz = c.z + 1.5;

      unpackTexCoord(effect.texCoordXPos, blockTexture[6 * (p & 0x0fff)]);
      unpackTexCoord(effect.texCoordXNeg, blockTexture[6 * (p & 0x0fff) + 1]);
      unpackTexCoord(effect.texCoordYPos, blockTexture[6 * (p & 0x0fff) + 2]);
      unpackTexCoord(effect.texCoordYNeg, blockTexture[6 * (p & 0x0fff) + 3]);
      unpackTexCoord(effect.texCoordZPos, blockTexture[6 * (p & 0x0fff) + 4]);
      unpackTexCoord(effect.texCoordZNeg, blockTexture[6 * (p & 0x0fff) + 5]);

      breakEffects.push(effect);

      if (soundCounter > 0) {
        playSoundEffectSpatial(
          state,
          state.replica.sound.ambientSound.breakVoxel,
          c.x,
          c.y,
          c.z,
          0.1 * Math.random(),
        );
        soundCounter -= 1;
      }
    } else {
      if (soundCounter > 0) {
        playSoundEffectSpatial(
          state,
          state.replica.sound.ambientSound.placeVoxel,
          c.x,
          c.y,
          c.z,
          0.1 * Math.random(),
        );
        soundCounter -= 1;
      }
    }
  }

  // clear out old break effects
  while (breakEffects.length > MAX_BREAK_EFFECT) {
    const ptr = (Math.random() * breakEffects.length) | 0;
    const x = breakEffects[ptr];
    breakEffects[ptr] = breakEffects[breakEffects.length - 1];
    breakEffects.pop();
    BreakEffectSchema.free(x);
  }
}

function tickHurtEffects(state: GameClientState) {
  const dt = state.clock.deltaTick;
  const effects = state.effects.hurt;

  // translate hurt events into hurt effects
  for (let i = 0; i < state.events.damage.hurt.length; ++i) {
    const d = state.events.damage.hurt[i];
    const b = getById(state.renderBoxes, d.id);
    if (b) {
      const fx = HurtEffectSchema.alloc();
      fx.entityId = d.id;
      fx.position[0] = b.px;
      fx.position[1] = b.py;
      fx.position[2] = b.pz;
      fx.amount = d.damage;
      fx.scaledAmount = d.damage;

      // compute scaled amount of damage for animation fx
      const damage = getById(state.replica.damage, d.id);
      if (damage) {
        fx.scaledAmount /= damage.maxHp;
      } else {
        fx.scaledAmount /= 100;
      }

      // shake a bit if local player takes damage
      vibrateDevice(d.id, state, 200 * fx.scaledAmount);

      fx.tick = 0;
      effects.push(fx);

      // play hit sound
      const sfx = getById(state.replica.sound.entitySound, d.id);
      if (sfx && sfx.hurt.sampleId) {
        playSoundEffectSpatial(
          state,
          sfx.hurt,
          b.anchorX,
          b.anchorY,
          b.anchorZ,
        );
      }
    }
  }

  // update ticks on hurt effects and free old hurt effects
  let ptr = 0;
  for (let i = 0; i < effects.length; ++i) {
    const hurt = effects[i];
    hurt.tick += dt;
    if (hurt.tick > HURT_EFFECT_TIME) {
      HurtEffectSchema.free(hurt);
    } else {
      effects[ptr++] = hurt;
    }
  }
  effects.length = ptr;
}

function tickDieEffects(state: GameClientState) {
  const dt = state.clock.deltaTick;
  const events = state.events.damage.die;
  const effects = state.effects.die;

  // update event list
  for (let i = 0; i < events.length; ++i) {
    const id = events[i];
    const b = getById(state.renderBoxes, id);
    if (b) {
      const fx = DieEffectSchema.alloc();
      fx.tick = 0;
      fx.position[0] = b.px;
      fx.position[1] = b.py;
      fx.position[2] = b.pz;
      effects.push(fx);

      vibrateDevice(id, state, 300);

      // play die sound
      const sfx = getById(state.replica.sound.entitySound, id);
      if (sfx && sfx.die.sampleId) {
        playSoundEffectSpatial(state, sfx.die, b.anchorX, b.anchorY, b.anchorZ);
      }
    }
  }

  // tick events
  let ptr = 0;
  for (let i = 0; i < effects.length; ++i) {
    const fx = effects[i];
    fx.tick += dt;
    if (fx.tick > DIE_EFFECT_TIME) {
      DieEffectSchema.free(fx);
    } else {
      effects[ptr++] = fx;
    }
  }
  effects.length = ptr;
}

function tickRespawnEffects(state: GameClientState) {
  const dt = state.clock.deltaTick;
  const events = state.events.damage.respawn;
  const effects = state.effects.respawn;

  // update event list
  for (let i = 0; i < events.length; ++i) {
    const id = events[i];
    const b = getById(state.renderBoxes, id);
    if (b) {
      const fx = DieEffectSchema.alloc();
      fx.tick = 0;
      fx.position[0] = b.px;
      fx.position[1] = b.py;
      fx.position[2] = b.pz;
      effects.push(fx);

      vibrateDevice(id, state, 100);

      // play respawn sound
      const sfx = getById(state.replica.sound.playerSound, id);
      if (sfx && sfx.spawn.sampleId) {
        playSoundEffectSpatial(
          state,
          sfx.spawn,
          b.anchorX,
          b.anchorY,
          b.anchorZ,
        );
      }
    }
  }

  // tick events
  let ptr = 0;
  for (let i = 0; i < effects.length; ++i) {
    const fx = effects[i];
    fx.tick += dt;
    if (fx.tick > RESPAWN_EFFECT_TIME) {
      RespawnEffectSchema.free(fx);
    } else {
      effects[ptr++] = fx;
    }
  }
  effects.length = ptr;
}

function tickFootStepEffects(state: GameClientState) {
  const footEvents = state.events.animation.footStep;
  for (let i = 0; i < footEvents.length; ++i) {
    const ev = footEvents[i];

    // play sound
    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx && sfx.step.sampleId) {
      playSoundEffectSpatial(
        state,
        sfx.step,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }
}

function tickJumpEffects(state: GameClientState) {
  const jumpEvents = state.events.animation.jump;
  for (let i = 0; i < jumpEvents.length; ++i) {
    const ev = jumpEvents[i];
    vibrateDevice(ev.id, state, 32);

    // todo: make a smoke puff or sthg

    // play sound
    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx && sfx.jump.sampleId) {
      playSoundEffectSpatial(
        state,
        sfx.jump,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }
}

function tickDoubleJumpEffects(state: GameClientState) {
  const doubleJumpEvents = state.events.animation.doubleJump;
  for (let i = 0; i < doubleJumpEvents.length; ++i) {
    const ev = doubleJumpEvents[i];
    vibrateDevice(ev.id, state, 32);

    // todo: make a smoke puff or some special effect

    const sfx = getById(state.replica.sound.playerSound, ev.id);

    if (sfx && sfx.doubleJump.sampleId) {
      playSoundEffectSpatial(
        state,
        sfx.doubleJump,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }
}

function tickLandEffects(state: GameClientState) {
  const landEvents = state.events.animation.land;
  for (let i = 0; i < landEvents.length; ++i) {
    const ev = landEvents[i];
    vibrateDevice(ev.id, state, 64);

    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      playSoundEffectSpatial(
        state,
        sfx.land,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }
}

function tickSwimEffects(state: GameClientState) {
  const swimEvents = state.events.animation.swim;
  for (let i = 0; i < swimEvents.length; ++i) {
    const ev = swimEvents[i];

    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      playSoundEffectSpatial(
        state,
        sfx.swim,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }

  const enterWaterEvents = state.events.animation.enterWater;
  for (let i = 0; i < enterWaterEvents.length; ++i) {
    const ev = enterWaterEvents[i];
    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      playSoundEffectSpatial(
        state,
        sfx.enterWater,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }

  const leaveWaterEvents = state.events.animation.leaveWater;
  for (let i = 0; i < leaveWaterEvents.length; ++i) {
    const ev = leaveWaterEvents[i];

    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      playSoundEffectSpatial(
        state,
        sfx.leaveWater,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }
}

function tickInputEffects(state: GameClientState) {
  const crouchEvents = state.events.animation.crouch;
  for (let i = 0; i < crouchEvents.length; ++i) {
    const ev = crouchEvents[i];
    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      playSoundEffectSpatial(
        state,
        sfx.crouch,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }

  const inputEvents = state.events.playerInput;
  for (let i = 0; i < inputEvents.length; ++i) {
    const ev = inputEvents[i];
    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      if (ev.button === PlayerButtonState.ACTION_0) {
        playSoundEffectSpatial(
          state,
          sfx.action0,
          ev.position[0],
          ev.position[1],
          ev.position[2],
        );
      }
      if (ev.button === PlayerButtonState.ACTION_1) {
        playSoundEffectSpatial(
          state,
          sfx.action1,
          ev.position[0],
          ev.position[1],
          ev.position[2],
        );
      }
    }
  }
}

function tickFlyEffects(state: GameClientState) {
  const startFly = state.events.animation.stopFly;
  for (let i = 0; i < startFly.length; ++i) {
    const ev = startFly[i];
    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      playSoundEffectSpatial(
        state,
        sfx.startFly,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }

  const stopFly = state.events.animation.stopFly;
  for (let i = 0; i < stopFly.length; ++i) {
    const ev = stopFly[i];
    const sfx = getById(state.replica.sound.playerSound, ev.id);
    if (sfx) {
      playSoundEffectSpatial(
        state,
        sfx.endFly,
        ev.position[0],
        ev.position[1],
        ev.position[2],
      );
    }
  }
}

function tickJoinLeaveEvents(state: GameClientState) {
  // handle player connect/disconnect events
  const playerJoinLen = state.events.playerJoin.length;
  for (let i = 0; i < playerJoinLen; i++) {
    playSoundEffectLocal(state, state.replica.sound.ambientSound.playerJoin);
  }
  const playerLeaveLen = state.events.playerLeave.length;
  for (let i = 0; i < playerLeaveLen; i++) {
    playSoundEffectLocal(state, state.replica.sound.ambientSound.playerLeave);
  }
}

export function tickEffects(state: GameClientState) {
  tickBreakEffects(state);
  tickHurtEffects(state);
  tickDieEffects(state);
  tickRespawnEffects(state);
  tickFootStepEffects(state);
  tickJumpEffects(state);
  tickDoubleJumpEffects(state);
  tickLandEffects(state);
  tickSwimEffects(state);
  tickFlyEffects(state);
  tickInputEffects(state);
  tickJoinLeaveEvents(state);
}
