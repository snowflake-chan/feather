import { colorToFloat } from 'src/utils/color';
import { EditReplicaClient } from '../replica/replica-client';
import { ClientProjectTransaction } from '../replica/transaction/client-project-transaction';
import {
  AmbientSoundEnum,
  PlayerSoundEnum,
  EntitySoundEnum,
  XYZType,
  BakedShadow,
} from '@box/schema/project/project-rda';
import { ClientStateType } from '../edit-schema';
import { EditActionLabel } from '../replica/replica-client-schema';

export enum SoundType {
  World,
  Player,
  Entity,
}

export class EnvironmentController {
  private _tx: ClientProjectTransaction;

  constructor(
    private _replica: EditReplicaClient,
    private _state: ClientStateType,
  ) {
    this._tx = _replica.projectTransaction();
  }

  public setSunPhase = (sunPhase: number) => {
    if (isNaN(sunPhase)) {
      return;
    }
    this._tx
      .push((action) => action.environment.sky.sunPhase(sunPhase))
      .commit();
  };

  public setFrequency = (sunFreq: number, targetSunPhase?: number) => {
    if (
      isNaN(sunFreq) ||
      (targetSunPhase !== undefined && isNaN(targetSunPhase))
    ) {
      return;
    }
    const tx = this._tx;
    tx.push((action) => action.environment.sky.sunFrequency(sunFreq));
    if (typeof targetSunPhase === 'number') {
      tx.push((action) => action.environment.sky.sunPhase(targetSunPhase));
    }
    tx.commit();
  };

  public setLunarPhase = (lunarPhase: number) => {
    if (isNaN(lunarPhase)) {
      return;
    }
    this._tx
      .push((action) => action.environment.sky.lunarPhase(lunarPhase))
      .commit();
  };

  public setGlobalLight = (globallight: number) => {
    if (isNaN(globallight)) {
      return;
    }
    this._tx
      .push((action) => action.environment.sky.globalLight(globallight))
      .commit();
  };

  public setGamma = (gamma: number) => {
    if (isNaN(gamma)) {
      return;
    }
    this._tx.push((action) => action.environment.sky.gamma(gamma)).commit();
  };

  public setBakedShadow = (bakedShadow: BakedShadow) => {
    this._tx
      .push((action) => action.environment.bakedShadow(bakedShadow))
      .commit(EditActionLabel.PROJECT, false);
  };

  public setDrawDistance = (value: number) => {
    this._tx.push((action) => action.environment.drawDistance(value)).commit();
  };

  public setGravity = (gravity: number, final?: boolean) => {
    if (isNaN(gravity)) {
      return;
    }
    this._tx.head((action) => action.physics.gravity(gravity));
    if (final) {
      this._tx.commit();
    }
  };

  public setVelocityDamping = (VelocityDamping: number, final?: boolean) => {
    if (isNaN(VelocityDamping)) {
      return;
    }
    this._tx.head((action) => action.physics.velocityDamping(VelocityDamping));
    if (final) {
      this._tx.commit();
    }
  };

  public setSnowDensity = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    this._tx.push((action) => action.environment.snow.density(value)).commit();
  };

  public setSnowSpeed = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    this._tx
      .push((action) => action.environment.snow.fallSpeed(value))
      .commit();
  };

  public setSnowTexture = (value: string) => {
    this._tx.push((action) => action.environment.snow.texture(value)).commit();
  };

  public setSnowColor = (color: string, alpha: number) => {
    if (isNaN(alpha)) {
      return;
    }
    const rgb = colorToFloat(color);
    this._tx
      .push((action) =>
        action.environment.snow.color({
          r: rgb[0],
          g: rgb[1],
          b: rgb[2],
          a: alpha,
        }),
      )
      .commit();
  };

  public setSnowSize = (w: number, h: number) => {
    if (isNaN(w) || isNaN(h)) {
      return;
    }
    this._tx.push((action) => action.environment.snow.size({ w, h })).commit();
  };

  public setFogColor = (color: string) => {
    const rgb = colorToFloat(color);
    this._tx
      .push((action) => action.environment.fog.fogColor.r(rgb[0]))
      .push((action) => action.environment.fog.fogColor.g(rgb[1]))
      .push((action) => action.environment.fog.fogColor.b(rgb[2]))
      .commit();
  };
  public setFogFalloff = (falloff: number, final?: boolean) => {
    if (isNaN(falloff)) {
      return;
    }
    this._tx.head((action) => action.environment.fog.fogHeightFalloff(falloff));
    if (final) {
      this._tx.commit();
    }
  };
  public setFogHeight = (fogHeight: number, final?: boolean) => {
    if (isNaN(fogHeight)) {
      return;
    }
    this._tx.head((action) =>
      action.environment.fog.fogHeightOffset(fogHeight),
    );
    if (final) {
      this._tx.commit();
    }
  };
  public setFogMaxVolume = (maxVolume: number, final?: boolean) => {
    if (isNaN(maxVolume)) {
      return;
    }
    this._tx.head((action) => action.environment.fog.maxFog(maxVolume));
    if (final) {
      this._tx.commit();
    }
  };
  public setFogDistance = (fogDistance: number, final?: boolean) => {
    if (isNaN(fogDistance)) {
      return;
    }
    this._tx.head((action) =>
      action.environment.fog.fogStartDistance(fogDistance),
    );
    if (final) {
      this._tx.commit();
    }
  };
  public setFogDensity = (density: number, final?: boolean) => {
    if (isNaN(density)) {
      return;
    }
    this._tx.head((action) => action.environment.fog.fogDensity(density));
    if (final) {
      this._tx.commit();
    }
  };

  public setColorLUT = (colorLUT: string) => {
    this._tx.push((action) => action.player.colorLUT(colorLUT)).commit();
  };

  public setRainSize = (w: number, h: number) => {
    if (isNaN(w) || isNaN(h)) {
      return;
    }
    this._tx.push((action) => action.environment.rain.size({ w, h })).commit();
  };

  public setRainDirection = (x: number, y: number, z: number) => {
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return;
    }
    this._tx
      .push((action) => action.environment.rain.direction({ x, y, z }))
      .commit();
  };

  public setRainSpeed = (v: number) => {
    if (isNaN(v)) {
      return;
    }
    this._tx.push((action) => action.environment.rain.speed(v)).commit();
  };

  public setRainColor = (color: string, alpha: number) => {
    if (isNaN(alpha)) {
      return;
    }
    const rgb = colorToFloat(color);
    this._tx
      .push((action) =>
        action.environment.rain.color({
          r: rgb[0],
          g: rgb[1],
          b: rgb[2],
          a: alpha,
        }),
      )
      .commit();
  };

  public setRainInterference = (interference: number) => {
    if (isNaN(interference)) {
      return;
    }
    this._tx
      .push((action) => action.environment.rain.interference(interference))
      .commit();
  };

  public setRainDensity = (density: number) => {
    if (isNaN(density)) {
      return;
    }
    this._tx
      .push((action) => action.environment.rain.density(density))
      .commit();
  };

  public setSoundSample = (
    soundEnum: AmbientSoundEnum | PlayerSoundEnum | EntitySoundEnum,
    sample: string,
    type: SoundType,
  ) => {
    switch (type) {
      case SoundType.World: {
        this._tx
          .push((action) => action.ambientSound[soundEnum].sample(sample))
          .commit();
        break;
      }
      case SoundType.Player: {
        this._tx
          .push((action) =>
            action.player.playerSounds[soundEnum].sample(sample),
          )
          .commit();
        break;
      }
      case SoundType.Entity: {
        this._tx
          .push((action) => action.player.sounds[soundEnum].sample(sample))
          .commit();
        break;
      }
    }
  };

  public setSoundGain = (
    soundEnum: AmbientSoundEnum | PlayerSoundEnum | EntitySoundEnum,
    num: number,
    type: SoundType,
  ) => {
    switch (type) {
      case SoundType.World: {
        this._tx
          .push((action) => action.ambientSound[soundEnum].gain(num))
          .commit();
        break;
      }
      case SoundType.Player: {
        this._tx
          .push((action) => action.player.playerSounds[soundEnum].gain(num))
          .commit();
        break;
      }
      case SoundType.Entity: {
        this._tx
          .push((action) => action.player.sounds[soundEnum].gain(num))
          .commit();
        break;
      }
    }
  };

  public setSoundGainRange = (
    soundEnum: AmbientSoundEnum | PlayerSoundEnum | EntitySoundEnum,
    num: number,
    type: SoundType,
  ) => {
    switch (type) {
      case SoundType.World: {
        this._tx
          .push((action) => action.ambientSound[soundEnum].gainRange(num))
          .commit();
        break;
      }
      case SoundType.Player: {
        this._tx
          .push((action) =>
            action.player.playerSounds[soundEnum].gainRange(num),
          )
          .commit();
        break;
      }
      case SoundType.Entity: {
        this._tx
          .push((action) => action.player.sounds[soundEnum].gainRange(num))
          .commit();
        break;
      }
    }
  };

  public setSoundPitch = (
    soundEnum: AmbientSoundEnum | PlayerSoundEnum | EntitySoundEnum,
    num: number,
    type: SoundType,
  ) => {
    switch (type) {
      case SoundType.World: {
        this._tx
          .push((action) => action.ambientSound[soundEnum].pitch(num))
          .commit();
        break;
      }
      case SoundType.Player: {
        this._tx
          .push((action) => action.player.playerSounds[soundEnum].pitch(num))
          .commit();
        break;
      }
      case SoundType.Entity: {
        this._tx
          .push((action) => action.player.sounds[soundEnum].pitch(num))
          .commit();
        break;
      }
    }
  };

  public setSoundPitchRange = (
    soundEnum: AmbientSoundEnum | PlayerSoundEnum | EntitySoundEnum,
    num: number,
    type: SoundType,
  ) => {
    switch (type) {
      case SoundType.World: {
        this._tx
          .push((action) => action.ambientSound[soundEnum].pitchRange(num))
          .commit();
        break;
      }
      case SoundType.Player: {
        this._tx
          .push((action) =>
            action.player.playerSounds[soundEnum].pitchRange(num),
          )
          .commit();
        break;
      }
      case SoundType.Entity: {
        this._tx
          .push((action) => action.player.sounds[soundEnum].pitchRange(num))
          .commit();
        break;
      }
    }
  };

  public setSoundRadius = (
    soundEnum: AmbientSoundEnum | PlayerSoundEnum | EntitySoundEnum,
    num: number,
    type: SoundType,
  ) => {
    switch (type) {
      case SoundType.World: {
        this._tx
          .push((action) => action.ambientSound[soundEnum].radius(num))
          .commit();
        break;
      }
      case SoundType.Player: {
        this._tx
          .push((action) => action.player.playerSounds[soundEnum].radius(num))
          .commit();
        break;
      }
      case SoundType.Entity: {
        this._tx
          .push((action) => action.player.sounds[soundEnum].radius(num))
          .commit();
        break;
      }
    }
  };

  public setSpawnPoint = (axis: XYZType) => {
    this._tx.push((action) => action.player.initialPosition(axis)).commit();
  };

  public setMovementBoundLoX = (value: number) => {
    this._tx
      .push((action) => action.player.movementBounds.lo.x(value))
      .commit();
  };

  public setMovementBoundLoY = (value: number) => {
    this._tx
      .push((action) => action.player.movementBounds.lo.y(value))
      .commit();
  };

  public setMovementBoundLoZ = (value: number) => {
    this._tx
      .push((action) => action.player.movementBounds.lo.z(value))
      .commit();
  };

  public setMovementBoundHiX = (value: number) => {
    this._tx
      .push((action) => action.player.movementBounds.hi.x(value))
      .commit();
  };

  public setMovementBoundHiY = (value: number) => {
    this._tx
      .push((action) => action.player.movementBounds.hi.y(value))
      .commit();
  };

  public setMovementBoundHiZ = (value: number) => {
    this._tx
      .push((action) => action.player.movementBounds.hi.z(value))
      .commit();
  };

  public addCollisionFilterGroup = () => {
    this._tx
      .push((action) =>
        action.collisionFilter.unshift({ selectorA: '', selectorB: '' }),
      )
      .commit();
  };

  public removeCollisionFilterGroup = (index: number) => {
    this._tx.push((action) => action.collisionFilter.splice(index, 1)).commit();
  };
  public updateCollisionFilterGroup = (
    index: number,
    value: { selectorA?: string; selectorB?: string },
  ) => {
    if (value.selectorA || value.selectorA === '') {
      this._tx
        .push((action) =>
          action.collisionFilter.update(index).selectorA(value.selectorA!),
        )
        .commit();
    } else if (value.selectorB || value.selectorB === '') {
      this._tx
        .push((action) =>
          action.collisionFilter.update(index).selectorB(value.selectorB!),
        )
        .commit();
    }
  };
}
