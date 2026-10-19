import { GameServerState } from '../game-server-schema';
import { calcEnvironmentState } from '@box/schema/environment/environment-controller';
import { EnvironmentParamSchema } from '@box/schema/environment/environment-schema';

function saturate(x: number) {
  return Math.min(1, Math.max(0, x)) || 0;
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

export function tickEnvironmentServer(state: GameServerState) {
  if (state.sync) {
    EnvironmentParamSchema.assign(
      state.replica.environment,
      state.project.environment,
    );

    // update snow texture
    const snowTexture = state.project.environment.snow.texture;
    const snowHashInfo = state.project.assets[snowTexture];
    if (snowHashInfo) {
      state.replica.environment.snow.texture = snowHashInfo.hash;
    } else {
      state.replica.environment.snow.texture = '';
    }
  }

  const params = state.replica.environment;

  const fogParams = params.fog;
  fogParams.maxFog = saturate(fogParams.maxFog);
  fogParams.fogDensity = saturate(fogParams.fogDensity);
  fogParams.fogHeightFalloff = saturate(fogParams.fogHeightFalloff);
  fogParams.fogStartDistance = Math.max(0, fogParams.fogStartDistance) || 0;
  fogParams.fogColor.r = saturate(fogParams.fogColor.r);
  fogParams.fogColor.g = saturate(fogParams.fogColor.g);
  fogParams.fogColor.b = saturate(fogParams.fogColor.b);

  // update sunPhase/frequency
  const skyParams = params.sky;
  skyParams.sunPhase = (skyParams.sunPhase || 0) % 1;
  skyParams.sunFrequency = Math.max(skyParams.sunFrequency || 0, 0);
  normalize(skyParams.sunDirection);

  calcEnvironmentState(
    state.clock.tick,
    state.environmentSky,
    state.replica.environment,
  );
}
