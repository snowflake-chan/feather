#define PI 3.1415926535

#pragma glslify: ambientSky = require('./ambient_sky.glsl')
#pragma glslify: getScatterColor = require('./atmosphere_scatter.glsl')

mediump vec3 sampleAtmosphere(  
                        const highp vec3 r,
                        lowp float timeOfDay,
                        const float now,
                        const lowp sampler2D nightSampler,
                        const lowp samplerCube cloudSamplerCube) {
    mediump float angle = timeOfDay * 2.0 * PI;
    mediump vec3 sunDir = normalize(vec3(cos(angle), sin(angle), 0));
    mediump vec3 scatteringColor = getScatterColor(r, timeOfDay);

    return ambientSky(
        r,
        sunDir,
        scatteringColor,
        timeOfDay,
        now,
        nightSampler,
        cloudSamplerCube);
}

#pragma glslify:export(sampleAtmosphere)