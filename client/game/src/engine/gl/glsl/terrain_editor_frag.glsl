/**
* This file is used by voxel-editor
*/
precision highp float;

#define PI 3.14159265
#pragma glslify: config = require('./blocks.glsl')

varying vec3 faceNormal;
varying vec4 light00, light01, light10, light11;
varying vec2 texCoordBase;
varying vec4 worldPos;
varying vec4 edgeInfo;

uniform lowp sampler2D colorAtlasTexture, materialAtlasTexture, bumpAtlasTexture;

#pragma glslify:SurfaceProperties = require('./pbr_surface.glsl')
#pragma glslify:LightProperties = require('./pbr_light.glsl')
#pragma glslify:PostData = require('./post_data.glsl')
#pragma glslify:PostFrag = require('./post_frag.glsl')
uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

uniform mediump sampler2D skyEnv;

uniform vec3 eye;

#pragma glslify: getShadedColor = require('./pbr.glsl')
#pragma glslify: outputFragment = require('./post_out.glsl')

void main () {
    vec3 U = vec3(faceNormal.y + faceNormal.z, 0., -faceNormal.x);
    vec3 V = vec3(0., -abs(faceNormal.x + faceNormal.z), abs(faceNormal.y));

    float rotateInfo = worldPos.a;

    float h0 = step(rotateInfo, .5);
    float h1 = step(rotateInfo, 1.5);
    float h2 = step(rotateInfo, 2.5);

    float eq0 = h0;
    float eq1 = h1 - h0;
    float eq2 = h2 - h1;
    float eq3 = 1. - h2;

    vec3 faceU = (eq0 - eq2) * U + (eq1 - eq3) * V;
    vec3 faceV = (eq0 - eq2) * V + (eq3 - eq1) * U;

    vec2 texCoordFract = vec2(
        dot(worldPos.xyz, faceU),
        dot(worldPos.xyz, faceV));
    vec2 fTexCoord = fract(texCoordFract);

    vec2 texCoord = (BLOCK_COLOR_SIZE * texCoordBase + (BLOCK_COLOR_SIZE - 1.) * fTexCoord + 0.5) / ATLAS_RADIUS;

    #ifdef MIPMAP
        vec2 dPdx = dFdx(texCoordFract);
        vec2 dPdy = dFdy(texCoordFract); 
        float Pmax = max(dot(dPdx, dPdx), dot(dPdy, dPdy));
        float lod = 0.5 * log2(Pmax);
        float colorLod = min(lod + BLOCK_COLOR_SHIFT, BLOCK_COLOR_SHIFT);
        float bumpLod = min(lod + BLOCK_BUMP_SHIFT, BLOCK_BUMP_SHIFT);
    #endif

    vec3 viewDir = normalize(eye - worldPos.rgb);
        
    vec4 blockBump;

    #ifdef MIPMAP
        vec4 blockColor = texture2DLodEXT(colorAtlasTexture, texCoord, colorLod);
        vec4 blockMaterial = texture2DLodEXT(materialAtlasTexture, texCoord, colorLod);
        blockBump = texture2DLodEXT(bumpAtlasTexture, texCoord, bumpLod);
    #else
        vec4 blockColor = texture2D(colorAtlasTexture, texCoord);
        vec4 blockMaterial = texture2D(materialAtlasTexture, texCoord);
        blockBump = texture2D(bumpAtlasTexture, texCoord);
    #endif

    float alpha = blockColor.a;
    vec2 dh = blockBump.gb - 0.5;
    
    // unpack surface info
    SurfaceProperties surf;

    // geometry
    surf.position = worldPos.xyz;
    surf.normal = normalize(
        0.5 * faceNormal +
        dh.x * faceU +
        dh.y * faceV);
    surf.faceU = faceU;
    surf.faceV = faceV;
    surf.view = viewDir;
    
    // material
    surf.albedo = blockColor.rgb;
    surf.metalness = blockMaterial.r;
    surf.smoothness = blockMaterial.g;
    surf.emissive = blockMaterial.b;

    // local illumination
    surf.ao = blockBump.a;
    surf.light00 = light00;
    surf.light01 = light01;
    surf.light10 = light10;
    surf.light11 = light11;

    // compute shadow values
    surf.shadow = step(0., dot(faceNormal, light.direction));
    #ifdef SHADOW
        surf.shadow *= sampleShadows(
            shadowData,
            shadowMap,
            worldPos.rgb,
            faceNormal);
    #else
        surf.shadow *= 0.25 * (light00.a + light01.a + light10.a + light11.a);
    #endif

    // compute shaded color
    vec4 color = vec4(getShadedColor(skyEnv, light, surf), alpha);

    PostFrag frag;
    frag.color = color;
    frag.eye = eye;
    frag.position = worldPos.xyz;
    gl_FragColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);
}