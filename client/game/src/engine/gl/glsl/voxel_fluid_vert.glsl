precision highp float;

attribute highp vec4 s0, s1;

uniform highp vec3 chunkId;
uniform highp mat4 viewProj;

varying highp vec3 position;
varying mediump vec4 fog;
varying lowp vec4 faceNormalAmbient;

#pragma glslify:LightProperties = require('./pbr_light.glsl')
uniform LightProperties light;

void main () {
    // compute fog color
    lowp float ambientOcclusion = floor(s0.w / 8.) / 32.;
    mediump vec4 fogColor = s1 / 255.;    
    fog = vec4(fogColor.rgb * light.color * ambientOcclusion, fogColor.a);

    // compute face normal
    lowp float faceCode = fract(s0.w / 8.);
    lowp float h0 = step(faceCode, 0.5 / 8.);
    lowp float h1 = step(faceCode, 1.5 / 8.);
    lowp float h2 = step(faceCode, 2.5 / 8.);
    lowp float h3 = step(faceCode, 3.5 / 8.);
    lowp float h4 = step(faceCode, 4.5 / 8.);

    // pack normal + ambient occlusion
    faceNormalAmbient = vec4(
        h1 - 2. * h0,
        h3 - 2. * h2 + h1,
        1. - 2. * h4 + h3,
        ambientOcclusion);

    // output position
    highp vec3 p = s0.xyz + 32. * chunkId;
    position = p;
    gl_Position = viewProj * vec4(p, 1);
}