import { SUN_TIME, Lightmap, sunColors, Directions } from '@box/utils/lightmap';
import { vec3 } from 'gl-matrix';
import { EnvironmentState, EnvironmentParams } from './environment-schema';
import { EnvironmentSkyType } from '../project/project-rda';

function getSkyColor(
  color: vec3,
  timeOfDay: number,
  direction: number,
  sunColor: vec3,
) {
  const t = timeOfDay * Lightmap.length;
  const ti = Math.floor(t);
  const tf = t - ti;
  vec3.lerp(
    color,
    Lightmap[ti % Lightmap.length][direction],
    Lightmap[(ti + 1) % Lightmap.length][direction],
    tf,
  );
  vec3.lerp(color, color, sunColor, 0.5);
  return color;
}

function copyRGBToVec3(dst: vec3, src: { r: number; g: number; b: number }) {
  dst[0] = src.r;
  dst[1] = src.g;
  dst[2] = src.b;
}

function saturate(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function calcEnvironmentState(
  tick: number,
  skyState: EnvironmentState,
  params: EnvironmentParams,
) {
  const fogInfo = params.fog;
  const skyInfo = params.sky;

  const { fogParams, fogParams2, fogParams3 } = skyState;

  skyState.globalLight = skyInfo.globalLight;
  skyState.gamma = skyInfo.gamma;
  if (!skyState.freezeDrawDistance) {
    skyState.drawDistance = params.drawDistance;
  }

  fogParams[0] = fogInfo.fogStartDistance;
  fogParams[1] = fogInfo.fogHeightOffset;
  fogParams[2] = fogInfo.fogHeightFalloff;
  fogParams[3] = fogInfo.fogDensity;

  fogParams2[0] = 0;
  fogParams2[1] = 1;
  fogParams2[2] = fogInfo.maxFog;
  fogParams2[3] = 0;

  fogParams3[0] = saturate(fogInfo.fogColor.r);
  fogParams3[1] = saturate(fogInfo.fogColor.g);
  fogParams3[2] = saturate(fogInfo.fogColor.b);
  fogParams3[3] = 1;

  if (skyInfo.skyType === EnvironmentSkyType.NATURAL) {
    const timeOfDay = (skyState.timeOfDay =
      (tick * skyInfo.sunFrequency + skyInfo.sunPhase) % 1);

    const angle: number = timeOfDay * 2.0 * Math.PI;
    skyState.sunDirection[0] = Math.cos(angle);
    skyState.sunDirection[1] = Math.sin(angle);
    skyState.sunDirection[2] = 0;

    skyState.sunUp = timeOfDay < SUN_TIME[0] || timeOfDay > SUN_TIME[1];
    if (!skyState.sunUp) {
      vec3.negate(skyState.sunDirection, skyState.sunDirection);
    }

    // HACK: require sun direction.y > horizon level to avoid shadows and lighting breaking
    skyState.sunDirection[1] = Math.max(0.15, skyState.sunDirection[1]);
    skyState.sunDirection[2] += 0.1;
    vec3.normalize(skyState.sunDirection, skyState.sunDirection);

    // Compute sun color
    const sunT = timeOfDay * sunColors.length;
    const sunI = Math.floor(sunT);
    const sunColor = vec3.lerp(
      skyState.sunColor,
      sunColors[sunI % sunColors.length],
      sunColors[(sunI + 1) % sunColors.length],
      sunT - sunI,
    );

    // Ambient light colors
    getSkyColor(skyState.skyLeft, timeOfDay, Directions.FRONT, sunColor);
    getSkyColor(skyState.skyRight, timeOfDay, Directions.BACK, sunColor);
    getSkyColor(skyState.skyTop, timeOfDay, Directions.UP, sunColor);
    getSkyColor(skyState.skyBottom, timeOfDay, Directions.DOWN, sunColor);
    getSkyColor(skyState.skyFront, timeOfDay, Directions.SIDE, sunColor);
    vec3.copy(skyState.skyBack, skyState.skyFront);
  } else {
    const sunDir = skyState.sunDirection;
    const inpDir = skyInfo.sunDirection;
    sunDir[0] = inpDir.x;
    sunDir[1] = inpDir.y;
    sunDir[2] = inpDir.z;
    vec3.normalize(sunDir, sunDir);

    // compute time of day from sun direction
    const timeOfDay = (skyState.timeOfDay =
      (2 + Math.asin(Math.min(1, Math.max(-1, sunDir[1]))) / (2 * Math.PI)) %
      1);
    skyState.sunUp = timeOfDay < SUN_TIME[0] || timeOfDay > SUN_TIME[1];
    if (!skyState.sunUp) {
      vec3.negate(skyState.sunDirection, skyState.sunDirection);
    }

    // User defined color values
    copyRGBToVec3(skyState.skyLeft, skyInfo.skyLeft);
    copyRGBToVec3(skyState.skyRight, skyInfo.skyRight);
    copyRGBToVec3(skyState.skyTop, skyInfo.skyTop);
    copyRGBToVec3(skyState.skyBottom, skyInfo.skyBottom);
    copyRGBToVec3(skyState.skyFront, skyInfo.skyFront);
    copyRGBToVec3(skyState.skyBack, skyInfo.skyBack);
    copyRGBToVec3(skyState.sunColor, skyInfo.sunColor);
  }
}
