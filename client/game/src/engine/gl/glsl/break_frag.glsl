precision highp float;

#define PI 3.14159265

#pragma glslify: config = require('./blocks.glsl')

#pragma glslify: SurfaceProperties = require('./pbr_surface.glsl')
#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')
#pragma glslify: PostData = require('./post_data.glsl')

uniform PostData post;
uniform LightProperties light;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

uniform mediump sampler2D skyEnv;

#ifdef SHADOW
#pragma glslify: ShadowData = require('./shadow_data.glsl')
uniform ShadowData shadowData;
uniform highp sampler2D shadowMap;
#pragma glslify: sampleShadows = require('./sample_shadow.glsl')
#endif

uniform highp vec3 eye;
uniform lowp sampler2D colorAtlasTexture, materialAtlasTexture;

#ifdef SAFE
#else
    uniform lowp sampler2D bumpAtlasTexture;
#endif

varying highp vec3 worldPos;
varying mediump vec3 normal, tangentU, tangentV;
varying highp vec2 texCoord;
varying lowp vec4 ambientLight;

#pragma glslify: outputFragment = require('./post_out.glsl')
#pragma glslify: getShadedColor = require('./pbr.glsl')

void main(){
    #ifdef SAFE
        lowp vec4 blockColor = texture2D(colorAtlasTexture, texCoord);
        lowp vec4 blockMaterial = texture2D(materialAtlasTexture, texCoord);
    #else
        #ifdef MIPMAP
            mediump vec2 dPdx = dFdx(texCoord);
            mediump vec2 dPdy = dFdy(texCoord);
            mediump float Pmax = max(dot(dPdx, dPdx), dot(dPdy, dPdy));
            mediump float lod = 0.5 * log2(Pmax);
            mediump float colorLod = min(lod + BLOCK_COLOR_SHIFT, BLOCK_COLOR_SHIFT);
            mediump float bumpLod = min(lod + BLOCK_BUMP_SHIFT, BLOCK_BUMP_SHIFT);

            lowp vec4 blockColor = texture2DLodEXT(colorAtlasTexture, texCoord, colorLod);
            lowp vec4 blockMaterial = texture2DLodEXT(materialAtlasTexture, texCoord, colorLod);
            lowp vec4 blockBump = texture2DLodEXT(bumpAtlasTexture, texCoord, bumpLod);
        #else
            lowp vec4 blockColor = texture2D(colorAtlasTexture, texCoord);
            lowp vec4 blockMaterial = texture2D(materialAtlasTexture, texCoord);
            lowp vec4 blockBump = texture2D(bumpAtlasTexture, texCoord);
        #endif
    #endif

    // unpack surface info
    SurfaceProperties surf;
    surf.position = worldPos;
    surf.albedo = blockColor.rgb;
    #ifdef SAFE
        surf.normal = normal;
        surf.ao = ambientLight.a;
    #else
        mediump vec2 dh = blockBump.gb - 0.5;
        surf.normal = normalize(
            0.5 * normal +
            dh.x * tangentU +
            dh.y * tangentV);
        surf.view = normalize(eye - worldPos);
        surf.metalness = blockMaterial.r;
        surf.smoothness = blockMaterial.g;
        surf.ao = ambientLight.a * blockBump.a;
    #endif

    surf.emissive = blockMaterial.b;
    surf.faceU = tangentU;
    surf.faceV = tangentV;
    surf.light00 = surf.light01 = surf.light10 = surf.light11 = ambientLight;

    // compute shadow values
    surf.shadow = step(0., dot(surf.normal, light.direction));
    #ifdef SHADOW
        surf.shadow *= sampleShadows(
            shadowData,
            shadowMap,
            worldPos,
            normal);
    #else
        surf.shadow *= ambientLight.a;
    #endif

    // apply post processing and fog effects
    PostFrag frag;
    frag.color = vec4(getShadedColor(
        #ifdef SAFE
        #else
            skyEnv,
        #endif
        light, surf), surf.shadow);
    frag.eye = eye;
    frag.position = worldPos;
    gl_FragColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);
}