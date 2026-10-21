precision highp float;

#pragma glslify: config = require('./blocks.glsl')
#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

uniform highp vec3 eye;
uniform lowp sampler2D colorAtlasTexture;

varying highp vec4 worldPos;
varying mediump vec3 normal;
varying mediump vec2 texCoordBase;

uniform float opacity;
uniform mediump float atlasRadius;

highp vec2 tileOffset (
    const highp vec3 pos,
    const highp vec3 faceU,
    const highp vec3 faceV) {
    return fract(vec2(
        dot(pos, faceU),
        dot(pos, faceV)));
}

highp vec2 getTexCoord (
    const highp vec2 base,
    const highp vec2 tile) {
    highp vec2 uvOffset = (0.5 / atlasRadius) + ((BLOCK_COLOR_SIZE - 1.) / atlasRadius) * tile;
    return uvOffset + base;
}

void main() {
    vec3 U = vec3(normal.y + normal.z, 0., -normal.x);
    vec3 V = vec3(0., -abs(normal.x + normal.z), abs(normal.y));
    float rotateInfo = worldPos.a;
    float h0 = step(rotateInfo, .5);
    float h1 = step(rotateInfo, 1.5);
    float h2 = step(rotateInfo, 2.5);
    float A = h0 - h2 + h1;
    float B = h1 - h0 - 1. + h2;
    vec3 faceU = A * U + B * V;
    vec3 faceV = A * V - B * U;

    highp vec2 fTexCoord = tileOffset(fract(worldPos.xyz), faceU, faceV);
    highp vec2 texCoord = getTexCoord(texCoordBase, fTexCoord);
    vec4 blockColor = texture2D(colorAtlasTexture, texCoord);
    PostFrag frag;
    frag.color = vec4(pow(blockColor.rgb, vec3(1.5)) / post.exposure, 0.);
    frag.eye = eye;
    frag.position = worldPos.xyz;
    vec3 col = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag).rgb;
    gl_FragColor = vec4(col, opacity * blockColor.a);
}