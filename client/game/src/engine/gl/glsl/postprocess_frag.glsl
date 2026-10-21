precision highp float;

#pragma glslify:PostData = require('./post_data.glsl')
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

uniform mediump sampler2D color;

#ifdef BLOOM
uniform lowp sampler2D bloom;
#endif

#ifdef SSAO
uniform lowp sampler2D ssao;
#endif

#ifdef DEPTH_OF_FIELD
uniform highp sampler2D depthStencil;
uniform mediump float playerDepth;
uniform mediump float zNear, zFar;
uniform mediump float depthOfField;
#endif

uniform mediump vec2 shape;
uniform bool underwater;
uniform highp float tick;

#ifdef VOLUMETRIC_SCATTERING
#ifndef DEPTH_OF_FIELD
uniform highp sampler2D depthStencil;
#endif
uniform mediump sampler2D scatterColor;
uniform vec3 screenLightPos;
uniform float eyeFogExtinction;
#endif

#define MAX_BLUR_SIZE 10.
#define RAD_STEP 0.5
#define ANGLE_STEP 2.39996323
#define NUM_RADIAL_BLUR_STEPS 32

#pragma glslify: toneMapping = require('./tone_mapping.glsl')
#pragma glslify: applyLUT = require('./lut.glsl')

mediump vec4 fetchColor (mediump vec2 uv) {
    return texture2D(color, uv / shape);
}

#ifdef DEPTH_OF_FIELD
highp vec2 fetchDepthStencil (mediump vec2 uv) {
    return texture2D(depthStencil, uv / shape).ra;
}

highp float fetchDepth (mediump vec2 uv) {
    highp float z = fetchDepthStencil(uv).r;
    highp float zn = 2. * z - 1.;
    return 2. * zNear * zFar / (zFar + zNear - zn * (zFar - zNear));
}

mediump float blurSize (
    highp float depth,
    mediump float focusPoint,
    mediump float focusScale) {
    return MAX_BLUR_SIZE * clamp(focusScale * abs(1. / focusPoint - 1. / depth), 0., 1.);
}

mediump mat2 spiralStep (mediump float dscale, mediump float dtheta) {
    mediump float c = dscale * cos(dtheta);
    mediump float s = dscale * sin(dtheta);
    return mat2(c, s, -s, c);
}
#endif

#ifdef VOLUMETRIC_SCATTERING
vec3 volumetricScattering (vec2 uv) {
    mediump vec2 delta = sign(screenLightPos.z) * (uv - 0.5 * (1. + screenLightPos.xy));
    float r = length(delta);
    delta *= 0.5 * min(r, 1.) / (r * float(NUM_RADIAL_BLUR_STEPS));

    mediump vec3 accum = vec3(0);
    mediump float weight = 1. / float(NUM_RADIAL_BLUR_STEPS);

    float depth = texture2D(depthStencil, uv).r;

    for (int i = 0; i < NUM_RADIAL_BLUR_STEPS; ++i) {
        uv -= delta;
        float d = texture2D(depthStencil, uv).r;
        accum += (weight * step(depth * 0.99, d)) * texture2D(scatterColor, uv).rgb;
        weight *= eyeFogExtinction;
    }

    return accum;
}
#endif

void main () {
    mediump vec2 uv = gl_FragCoord.xy;
    if (underwater) {
        mediump vec2 d = uv / shape - 0.5;
        uv += -10. * d +
            vec2(
            0.3 * cos(0.05 * uv.x + 0.2 * tick) + 8. * cos(0.02 * uv.y + 0.7 * tick),
            5. * cos(0.009 * uv.x + tick) + 0.5 * cos(0.073 * uv.y + 0.3 * tick));
    }

    mediump vec4 centerColor = fetchColor(uv);
    #ifdef SSAO
    float occlusion = 0.;
    for (int i = - 2; i <= 2; i++) {
        for (int j = - 2; j <= 2; j++) {
            occlusion += texture2D(ssao, (uv + vec2(i, j)) / shape).r;
        }
    }
    mediump vec3 color = centerColor.rgb * (occlusion / 25.);
    #else
    mediump vec3 color = centerColor.rgb;
    #endif

    #ifdef DEPTH_OF_FIELD
        mediump float centerDepth = fetchDepth(uv);
        mediump float centerSize = blurSize(centerDepth, playerDepth, depthOfField);

        mediump float tot = 1.0;

        mediump vec2 dv = vec2(cos(ANGLE_STEP), sin(ANGLE_STEP));
        mediump vec2 v = dv;
        mediump float radius = RAD_STEP;
        for (int i = 0; i < 16; ++i) {
            mediump vec2 tc = uv + radius * v;
            mediump vec3 sampleColor = fetchColor(tc).rgb;
            highp float sampleDepth = fetchDepth(tc);
            mediump float sampleSize = blurSize(sampleDepth, playerDepth, depthOfField);

            if (sampleDepth > centerDepth) {
                sampleSize = clamp(sampleSize, 0., 2. * centerSize);
            }

            color += 
                mix(
                    color / tot, 
                    sampleColor, 
                    smoothstep(radius - 0.5, radius + 0.5, sampleSize));

            tot += 1.0;
            radius += RAD_STEP;
            v = vec2(v.x * dv.x - v.y * dv.y, v.x * dv.y + v.y * dv.x);
        }
        color /= tot;
    #endif

    #ifdef VOLUMETRIC_SCATTERING
        color += volumetricScattering(uv / shape);
    #endif

    // apply exposure correction
    color *= post.exposure;

    // add bloom (exposure correction is already applied)
    #ifdef BLOOM
        color += 2. * texture2D(bloom, uv / shape).rgb;
    #endif

    // tone mapping, color grading and gamma correction
    color = toneMapping(color);
    #ifdef COLOR_LUT
        color = applyLUT(color, lut);
    #endif

    gl_FragColor = vec4(pow(color, vec3(1. / post.gamma)), 1.);
}