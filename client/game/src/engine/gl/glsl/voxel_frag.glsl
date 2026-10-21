#ifdef ATLAS_RADIUS

precision highp float;

#define PI 3.14159265
#define PARALLAX_FACTOR 0.25
#define EDGE_SIZE 0.05

#pragma glslify: config = require('./blocks.glsl')

varying highp vec4 worldPos;
varying lowp vec2 texCoordBase;
varying lowp vec3 faceNormal;
varying lowp vec4 light00, light01, light10, light11;
varying lowp vec4 edgeInfo;

uniform lowp sampler2D colorAtlasTexture, materialAtlasTexture;

#pragma glslify:SurfaceProperties = require('./pbr_surface.glsl')
#pragma glslify:LightProperties = require('./pbr_light.glsl')

#ifdef SAFE
#else
    // pbr material textures
    uniform lowp sampler2D bumpAtlasTexture;

    uniform sampler2D skyEnv;
    
    mediump float pow2 (mediump float x) {
        return x * x;
    }

    mediump vec2 upNormal(mediump vec2 d, const lowp vec2 uv) {
        d.y = -(EDGE_SIZE * (1. / EDGE_SIZE) - (1. / EDGE_SIZE) * uv.y) / pow2(1. - d.y);
        d.x = 0.;
        return d;
    }

    mediump vec2 downNormal(mediump vec2 d, const lowp vec2 uv) {
        d.y = ((1. / EDGE_SIZE) * uv.y - (1. / EDGE_SIZE) * (1. - EDGE_SIZE)) / pow2(1. - d.y);
        d.x = 0.;
        return d;
    }

    mediump vec2 leftNormal(mediump vec2 d, const lowp vec2 uv) {
        d.x = -(EDGE_SIZE * (1. / EDGE_SIZE) - (1. / EDGE_SIZE) * uv.x) / pow2(1. - d.x);
        d.y = 0.;
        return d;
    }

    mediump vec2 rightNormal(mediump vec2 d, const lowp vec2 uv) {
        d.x = ((1. / EDGE_SIZE) * uv.x - (1. / EDGE_SIZE) * (1. - EDGE_SIZE)) / pow2(1. - d.x);
        d.y = 0.;
        return d;
    }

    mediump vec2 bevelDerivative(mediump vec2 d, const lowp vec2 uv, const lowp vec4 edgeInfo) {
        mediump vec2 derivative = vec2(.0);
        // left
        derivative +=
            step(.5, edgeInfo.a)
            * step(uv.x, EDGE_SIZE)
            * leftNormal(d, uv);
        // right
        derivative +=
            step(.5, edgeInfo.g)
            * step((1. - uv.x), EDGE_SIZE)
            * rightNormal(d, uv);
        // up
        derivative +=
            step(.5, edgeInfo.r)
            * step(uv.y, EDGE_SIZE)
            * upNormal(d, uv);
        // down
        derivative +=
            step(.5, edgeInfo.b)
            * step((1. - uv.y), EDGE_SIZE)
            * downNormal(d, uv);

        if (faceNormal.z - faceNormal.x < 0.) {
            return derivative.yx;
        } else {
            return derivative;
        }
    }
#endif

#pragma glslify: getShadedColor = require('./pbr.glsl')

uniform highp vec3 eye;

#pragma glslify:PostData = require('./post_data.glsl')
#pragma glslify:PostFrag = require('./post_frag.glsl')
uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
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
#pragma glslify:ShadowData = require('./shadow_data.glsl')
    uniform ShadowData shadowData;
    uniform sampler2D shadowMap;
#pragma glslify: sampleShadows = require('./sample_shadow.glsl')
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

highp vec2 getTexCoord (
    const highp vec2 base,
    const highp vec2 tile) {
    highp vec2 uvOffset = (0.5 / ATLAS_RADIUS) + ((BLOCK_COLOR_SIZE - 1.) / ATLAS_RADIUS) * tile;
    return uvOffset + base;
}

// We have to do fract twice in this way to work around a shader precision bug in iOS
highp vec2 tileOffset (
    const highp vec3 pos,
    const highp vec3 faceU,
    const highp vec3 faceV) {
    return fract(vec2(
        dot(pos, faceU),
        dot(pos, faceV)));
}

void main () {
    lowp vec3 U = vec3(faceNormal.y + faceNormal.z, 0., -faceNormal.x);
    lowp vec3 V = vec3(0., -abs(faceNormal.x + faceNormal.z), abs(faceNormal.y));

    lowp float rotateInfo = worldPos.a;
    lowp float h0 = step(rotateInfo, .5);
    lowp float h1 = step(rotateInfo, 1.5);
    lowp float h2 = step(rotateInfo, 2.5);
    lowp float A = h0 - h2 + h1;
    lowp float B = h1 - h0 - 1. + h2;
    lowp vec3 faceU = A * U + B * V;
    lowp vec3 faceV = A * V - B * U;

    highp vec2 fTexCoord = tileOffset(fract(worldPos.xyz), faceU, faceV);
    highp vec2 texCoord = getTexCoord(texCoordBase, fTexCoord);

    #ifdef MIPMAP
        mediump vec2 P = vec2(dot(worldPos.xyz, faceU), dot(worldPos.xyz, faceV));
        mediump vec2 dPdx = dFdx(P);
        mediump vec2 dPdy = dFdy(P); 
        mediump float Pmax = max(dot(dPdx, dPdx), dot(dPdy, dPdy));
        mediump float lod = 0.5 * log2(Pmax);
        mediump float colorLod = min(lod + BLOCK_COLOR_SHIFT, BLOCK_COLOR_SHIFT);

        #ifndef SAFE
            mediump float bumpLod = min(lod + BLOCK_BUMP_SHIFT, BLOCK_BUMP_SHIFT);
        #endif
    #endif

    #ifndef SAFE
        mediump vec3 viewDir = normalize(eye - worldPos.rgb);
            
        lowp vec4 blockBump = vec4(0);
        #ifdef PARALLAX_MAP
            #ifdef MIPMAP
                mediump vec2 vUV = vec2(dot(viewDir, faceU), dot(viewDir, faceV));
                mediump vec2 uvin = texCoord;
                mediump vec2 uvout = getTexCoord(
                    texCoordBase,
                    clamp(PARALLAX_FACTOR * vUV + fTexCoord, vec2(0), vec2(1)));
                lowp float Hmin = 0.;
                lowp float Fmin = 1.;
                lowp float Hmax = 1.;
                lowp float Fmax = 0.;
                for (int i = 0; i < 4; i++) {
                    lowp float H = mix(Hmin, Hmax, clamp((Fmin - Hmin) / (Hmax - Hmin - Fmax + Fmin), 0., 1.));
                    mediump vec2 uv = mix(uvout, uvin, H);
                    lowp float f = 1. - texture2DLodEXT(bumpAtlasTexture, uv, 0.).r;
                    if (H <= f) {
                        Hmin = H;
                        Fmin = f;
                    } else {
                        Hmax = H;
                        Fmax = f;
                    }
                }
                lowp float H = mix(Hmin, Hmax, clamp((Fmin - Hmin) / (Hmax - Hmin - Fmax + Fmin), 0., 1.));
                texCoord = uvin * H + uvout * (1. - H);
            #else
                blockBump = texture2D(bumpAtlasTexture, texCoord);
                mediump vec2 parallaxOffset = PARALLAX_FACTOR * blockBump.r * vec2(
                    dot(viewDir, faceU),
                    dot(viewDir, faceV));
                texCoord = getTexCoord(texCoordBase, clamp(fTexCoord + parallaxOffset, vec2(0), vec2(1)));
            #endif
        #endif
    #endif

    #ifdef MIPMAP
        lowp vec4 blockColor = texture2DLodEXT(colorAtlasTexture, texCoord, colorLod);
        lowp vec4 blockMaterial = texture2DLodEXT(materialAtlasTexture, texCoord, colorLod);

        #ifndef SAFE
            blockBump = texture2DLodEXT(bumpAtlasTexture, texCoord, bumpLod);
        #endif
    #else
        lowp vec4 blockColor = texture2D(colorAtlasTexture, texCoord);
        lowp vec4 blockMaterial = texture2D(materialAtlasTexture, texCoord);

        #ifndef SAFE
            blockBump = texture2D(bumpAtlasTexture, texCoord);
        #endif
    #endif

    lowp float alpha = blockColor.a;

    // unpack surface info
    SurfaceProperties surf;
    
    #ifdef SAFE
        surf.normal = faceNormal;
        surf.ao = 1.;
    #else
        mediump vec2 dh = blockBump.gb - 0.5;

        lowp float isEdge = 
            step(.5, edgeInfo.r) * step(fTexCoord.y, EDGE_SIZE)
            + step(.5, edgeInfo.g) * step((1. - EDGE_SIZE), fTexCoord.x)
            + step(.5, edgeInfo.b) * step((1. - EDGE_SIZE), fTexCoord.y)
            + step(.5, edgeInfo.a) * step(fTexCoord.x, EDGE_SIZE);
        if (isEdge > .5) {
            dh += clamp(bevelDerivative(dh, fTexCoord, edgeInfo), -.5, .5);
        }

        // surface geometry
        surf.normal = normalize(
            0.5 * faceNormal +
            dh.x * faceU +
            dh.y * faceV);
        surf.view = viewDir;

        // material
        surf.metalness = blockMaterial.r;
        surf.smoothness = blockMaterial.g;

        // ambient occlusion
        surf.ao = blockBump.a;
    #endif
    
    // geometry
    surf.position = worldPos.xyz;
    surf.faceU = faceU;
    surf.faceV = faceV;

    // albedo and emissive values
    surf.albedo = blockColor.rgb;
    surf.emissive = blockMaterial.b;
    
    // local illumination
    surf.light00 = light00;
    surf.light01 = light01;
    surf.light10 = light10;
    surf.light11 = light11;

    // compute shadow values
    surf.shadow = step(0., dot(faceNormal, light.direction));

    #ifdef BAKED_SHADOW
    surf.shadow *= sampleBakedShadows(
            bakedChunkShift,
            bakedZRatio,
            chunkDimX,
            chunkDimY,
            chunkDimZ,
            bakedShadowTexture,
            bakedDataTexture,
            worldPos.rgb,
            faceNormal);
    #endif

    #ifdef SHADOW
        surf.shadow *= sampleShadows(
            shadowData,
            shadowMap,
            worldPos.rgb,
            faceNormal);
    #else
        // adjust shadow scaling since maximum intesnity from unpacked light = 1 / (16 - 15 * 15 / 16)
        surf.shadow *= 0.484375 * (light00.a + light01.a + light10.a + light11.a);
    #endif

    // compute shaded color
    mediump vec4 color = vec4(getShadedColor(
        #ifndef SAFE
            skyEnv,
        #endif
        light,
        surf),
        #ifdef ALPHA_PASS
            alpha
        #else
            surf.shadow
        #endif
        );

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
#endif