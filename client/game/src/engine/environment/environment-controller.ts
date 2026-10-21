import { GameClientState } from '../game-client-schema';
import { vec3 } from 'gl-matrix';
import { calcEnvironmentState } from '@box/schema/environment/environment-controller';
import {
  FogRDA,
  RainRDA,
  SkyRDA,
  SnowRDA,
} from '@box/schema/project/project-rda';
import { getById } from '@box/utils/id';

function saturate(x: number) {
  return Math.max(0, Math.min(1, x));
}

function normalize(v: { x: number; y: number; z: number }) {
  const x = v.x || 0;
  const y = v.y || 0;
  const z = v.z || 0;

  const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

  if (Math.abs(r - 1) < 1e-6) {
    v.x = x;
    v.y = y;
    v.z = z;
  } else if (r > 1e-6) {
    v.x = x / r;
    v.y = y / r;
    v.z = z / r;
  } else {
    v.x = v.z = 0;
    v.y = -1;
  }
}

function modulate(lightVec: vec3, r: number, g: number, b: number) {
  lightVec[0] *= r;
  lightVec[1] *= g;
  lightVec[2] *= b;
}

export function tickEnvironment(state: GameClientState) {
  // compute offset for environment params
  let envFog = state.replica.environment.fog;
  let envRain = state.replica.environment.rain;
  let envSnow = state.replica.environment.snow;
  let envSky = state.replica.environment.sky;
  const playerBody = getById(state.bodies, state.secret.id);
  if (playerBody) {
    const lox = playerBody.px - playerBody.rx;
    const loy = playerBody.py - playerBody.ry;
    const loz = playerBody.pz - playerBody.rz;
    const hix = playerBody.px + playerBody.rx;
    const hiy = playerBody.py + playerBody.ry;
    const hiz = playerBody.pz + playerBody.rz;
    for (let i = 0; i < state.secret.environmentZones.length; ++i) {
      const ez = state.secret.environmentZones[i];
      if (
        ez.minX <= hix &&
        lox <= ez.maxX &&
        ez.minY <= hiy &&
        loy <= ez.maxY &&
        ez.minZ <= hiz &&
        loz <= ez.maxZ
      ) {
        if (ez.overrideFog) {
          envFog = ez.fog;
        }
        if (ez.overrideRain) {
          envRain = ez.rain;
        }
        if (ez.overrideSky) {
          envSky = ez.sky;
        }
        if (ez.overrideSnow) {
          envSnow = ez.snow;
        }
      }
    }
  }
  FogRDA.stateSchema.assign(state.environmentParams.fog, envFog);
  RainRDA.stateSchema.assign(state.environmentParams.rain, envRain);
  SnowRDA.stateSchema.assign(state.environmentParams.snow, envSnow);
  SkyRDA.stateSchema.assign(state.environmentParams.sky, envSky);
  state.environmentParams.drawDistance = state.replica.environment.drawDistance;
  {
    const clientFogParams = state.environmentParams.fog;
    clientFogParams.maxFog = saturate(clientFogParams.maxFog);
    clientFogParams.fogDensity = saturate(clientFogParams.fogDensity);
    clientFogParams.fogHeightFalloff = saturate(
      clientFogParams.fogHeightFalloff,
    );
    clientFogParams.fogStartDistance =
      Math.max(0, clientFogParams.fogStartDistance) || 0;
    clientFogParams.fogColor.r = saturate(clientFogParams.fogColor.r);
    clientFogParams.fogColor.g = saturate(clientFogParams.fogColor.g);
    clientFogParams.fogColor.b = saturate(clientFogParams.fogColor.b);

    // update sunPhase/frequency
    const clientSkyParams = state.environmentParams.sky;
    clientSkyParams.sunPhase = (clientSkyParams.sunPhase || 0) % 1;
    clientSkyParams.sunFrequency = Math.min(
      0.1,
      Math.max(clientSkyParams.sunFrequency || 0, 0),
    );
    normalize(clientSkyParams.sunDirection);
  }

  // update state
  const envState = state.environment;
  const envParams = state.environmentParams;
  calcEnvironmentState(state.clock.tick, envState, envParams);

  const { fogParams, fogParams2, fogParams3 } = envState;

  // Update fog
  if (state.camera.underwater) {
    const fluidType = state.blockIndex.fluid[state.camera.eyeVoxel & 0x0fff];
    if (fluidType) {
      const fluidInfo = state.blockIndex.fluidInfo[fluidType];

      const r = (fluidInfo & 0xff) / 0xff;
      const g = (fluidInfo & 0xff00) / 0xff00;
      const b = (fluidInfo & 0xff0000) / 0xff0000;
      const a = (fluidInfo >>> 24) / 0xff;

      modulate(envState.sunColor, r, g, b);
      modulate(envState.skyLeft, r, g, b);
      modulate(envState.skyRight, r, g, b);
      modulate(envState.skyTop, r, g, b);
      modulate(envState.skyBottom, r, g, b);
      modulate(envState.skyFront, r, g, b);
      modulate(envState.skyBack, r, g, b);

      // override user fog controls when in water
      fogParams[0] = 0;
      fogParams[3] = 0.1 * a;
      fogParams2[0] = 0;
      fogParams2[1] = 1;
      fogParams2[2] = 1;
      fogParams2[3] = 0;
      fogParams3[0] = 1;
      fogParams3[1] = 1;
      fogParams3[2] = 1;
      fogParams3[3] = 1;
    }
  }

  fogParams2[0] = state.light.ambient;

  const eye = state.camera.eye;
  const uniformFog = fogParams[3];
  const heightFalloff = Math.max(0.001, fogParams[2]);
  const heightFog = Math.min(
    1,
    1 - Math.exp(-heightFalloff * (eye[1] - fogParams[1])),
  );
  const extinction = Math.max(1 - fogParams2[2], (1 - uniformFog) * heightFog);
  state.camera.eyeFogAmount = 1 - Math.pow(extinction, 32);
}
