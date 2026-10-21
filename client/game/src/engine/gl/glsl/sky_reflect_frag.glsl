precision mediump float;
varying highp vec2 uv;

uniform lowp sampler2D nightSampler;
uniform lowp samplerCube cloudSamplerCube;
uniform lowp float timeOfDay, lunarPhase, now;

#pragma glslify: paraboloidToNormal = require('./paraboloid_to_normal.glsl')
#pragma glslify: sampleAtmosphere = require('./atmosphere.glsl')

void main () {
    mediump vec2 newUV = vec2(fract(uv.x)*2.0 - 1., uv.y);
    mediump vec3 N = paraboloidToNormal(newUV);
    N.y *= sign(uv.x);
    gl_FragColor = vec4(
        sampleAtmosphere(
            normalize(N), 
            timeOfDay,
            now,
            nightSampler,
            cloudSamplerCube), 1.0);
}
