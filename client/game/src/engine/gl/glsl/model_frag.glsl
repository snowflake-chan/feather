precision highp float;

#define PI 3.14159265

varying highp vec3 position;
varying mediump vec3 normal;
varying lowp vec4 ambient;
varying highp vec2 _uv;
varying highp float alpha;

uniform highp vec3 eye;
uniform sampler2D texture;
uniform lowp vec4 colorMod;
uniform lowp vec3 pbrMod;

#pragma glslify: SurfaceProperties = require('./pbr_surface.glsl')
#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#ifdef SAFE
#else
    uniform sampler2D skyEnv;
#endif

#ifdef BAKED_SHADOW
  uniform highp sampler2D bakedShadowTexture;
  uniform highp sampler2D bakedDataTexture;
  uniform float bakedChunkShift;
  uniform float bakedZRatio;
  uniform float chunkDimX;
  uniform float chunkDimY;
  uniform float chunkDimZ;
  #pragma glslify: sampleBakedShadows = require('./sample_baked_shadow.glsl')
#endif

#ifdef SHADOW
#pragma glslify: ShadowData = require('./shadow_data.glsl')
uniform ShadowData shadowData;
uniform highp sampler2D shadowMap;
#pragma glslify: sampleShadows = require('./sample_shadow.glsl')
#endif

#pragma glslify: getShadedColor = require('./pbr.glsl')
#pragma glslify: outputFragment = require('./post_out.glsl')

void main () {
    // 多部件物体部分透明的部分不在不透明的shader里渲染
    if (alpha < 1.0 - 1.0 / 255.0) discard;

    vec4 rgbe = texture2D(texture, _uv) * colorMod;

    // 我们自产的纹理第四位存的是发光，GLTF不是，暂不处理GLTF的发光
    #ifdef IS_GLTF
        rgbe.a = 0.;
    #endif

    vec4 color = vec4(rgbe.rgb, 1);
    
    vec4 pbr = vec4(1. - (1. - 2.56 * vec3(1, 1, rgbe.a)) * (1. - pbrMod), 0.);

    // unpack surface info
    SurfaceProperties surf;
    surf.albedo = color.rgb;
    surf.position = position;
    surf.normal = normalize(normal);
    surf.faceU = surf.faceV = vec3(0.);

    #ifdef SAFE
    #else
        surf.view = normalize(eye - position);
        surf.metalness = pbr.r;
        surf.smoothness = pbr.g;
    #endif

    surf.emissive = pbr.b;
    surf.ao = color.a;
    surf.light00 = surf.light01 = surf.light10 = surf.light11 = ambient;
    surf.shadow = step(0., dot(surf.normal, light.direction));

    #ifdef BAKED_SHADOW
        surf.shadow *= sampleBakedShadows(
            bakedChunkShift,
            bakedZRatio,
            chunkDimX,
            chunkDimY,
            chunkDimZ,
            bakedShadowTexture,
            bakedDataTexture,
            position,
            surf.normal);
    #endif

    #ifdef SHADOW
        surf.shadow *= sampleShadows(
            shadowData,
            shadowMap,
            position,
            surf.normal);
    #else
        surf.shadow *= ambient.a;
    #endif

    // compute shaded color
    PostFrag frag;
    frag.color = vec4(getShadedColor(
        #ifdef SAFE
        #else
            skyEnv,
        #endif
        light, surf), surf.shadow);

    frag.eye = eye;
    frag.position = position;

    gl_FragColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);
}
