"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcEnvironmentState = calcEnvironmentState;
const lightmap_1 = require("@box/utils/lightmap");
const gl_matrix_1 = require("gl-matrix");
const project_rda_1 = require("../project/project-rda");
function getSkyColor(color, timeOfDay, direction, sunColor) {
    const t = timeOfDay * lightmap_1.Lightmap.length;
    const ti = Math.floor(t);
    const tf = t - ti;
    gl_matrix_1.vec3.lerp(color, lightmap_1.Lightmap[ti % lightmap_1.Lightmap.length][direction], lightmap_1.Lightmap[(ti + 1) % lightmap_1.Lightmap.length][direction], tf);
    gl_matrix_1.vec3.lerp(color, color, sunColor, 0.5);
    return color;
}
function copyRGBToVec3(dst, src) {
    dst[0] = src.r;
    dst[1] = src.g;
    dst[2] = src.b;
}
function saturate(x) {
    return Math.max(0, Math.min(1, x));
}
function calcEnvironmentState(tick, skyState, params) {
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
    if (skyInfo.skyType === project_rda_1.EnvironmentSkyType.NATURAL) {
        const timeOfDay = (skyState.timeOfDay =
            (tick * skyInfo.sunFrequency + skyInfo.sunPhase) % 1);
        const angle = timeOfDay * 2.0 * Math.PI;
        skyState.sunDirection[0] = Math.cos(angle);
        skyState.sunDirection[1] = Math.sin(angle);
        skyState.sunDirection[2] = 0;
        skyState.sunUp = timeOfDay < lightmap_1.SUN_TIME[0] || timeOfDay > lightmap_1.SUN_TIME[1];
        if (!skyState.sunUp) {
            gl_matrix_1.vec3.negate(skyState.sunDirection, skyState.sunDirection);
        }
        // HACK: require sun direction.y > horizon level to avoid shadows and lighting breaking
        skyState.sunDirection[1] = Math.max(0.15, skyState.sunDirection[1]);
        skyState.sunDirection[2] += 0.1;
        gl_matrix_1.vec3.normalize(skyState.sunDirection, skyState.sunDirection);
        // Compute sun color
        const sunT = timeOfDay * lightmap_1.sunColors.length;
        const sunI = Math.floor(sunT);
        const sunColor = gl_matrix_1.vec3.lerp(skyState.sunColor, lightmap_1.sunColors[sunI % lightmap_1.sunColors.length], lightmap_1.sunColors[(sunI + 1) % lightmap_1.sunColors.length], sunT - sunI);
        // Ambient light colors
        getSkyColor(skyState.skyLeft, timeOfDay, lightmap_1.Directions.FRONT, sunColor);
        getSkyColor(skyState.skyRight, timeOfDay, lightmap_1.Directions.BACK, sunColor);
        getSkyColor(skyState.skyTop, timeOfDay, lightmap_1.Directions.UP, sunColor);
        getSkyColor(skyState.skyBottom, timeOfDay, lightmap_1.Directions.DOWN, sunColor);
        getSkyColor(skyState.skyFront, timeOfDay, lightmap_1.Directions.SIDE, sunColor);
        gl_matrix_1.vec3.copy(skyState.skyBack, skyState.skyFront);
    }
    else {
        const sunDir = skyState.sunDirection;
        const inpDir = skyInfo.sunDirection;
        sunDir[0] = inpDir.x;
        sunDir[1] = inpDir.y;
        sunDir[2] = inpDir.z;
        gl_matrix_1.vec3.normalize(sunDir, sunDir);
        // compute time of day from sun direction
        const timeOfDay = (skyState.timeOfDay =
            (2 + Math.asin(Math.min(1, Math.max(-1, sunDir[1]))) / (2 * Math.PI)) %
                1);
        skyState.sunUp = timeOfDay < lightmap_1.SUN_TIME[0] || timeOfDay > lightmap_1.SUN_TIME[1];
        if (!skyState.sunUp) {
            gl_matrix_1.vec3.negate(skyState.sunDirection, skyState.sunDirection);
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
//# sourceMappingURL=environment-controller.js.map