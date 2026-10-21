#pragma glslify: ShadowData = require('./shadow_data.glsl')

lowp float sampleShadows (
    const ShadowData shadow,
    const sampler2D shadowMap,
    const highp vec3 worldPos,
    const mediump vec3 faceNormal) {
    highp float zDepth = gl_FragCoord.z / gl_FragCoord.w;

    lowp float h0 = step(zDepth, shadow.cascadeSplits.x);
    lowp float h1 = step(zDepth, shadow.cascadeSplits.y);
    lowp float h2 = step(zDepth, shadow.cascadeSplits.z);
    lowp vec4 weight = vec4(
        h0,
        (1. - h0) * h1,
        (1. - h1) * h2,
        1. - h2);

    highp vec4 worldPosH = vec4(worldPos, 1);
    highp vec4 sampleClip =
        weight.x * (shadow.projection[0] * worldPosH) +
        weight.y * (shadow.projection[1] * worldPosH) +
        weight.z * (shadow.projection[2] * worldPosH) +
        weight.w * (shadow.projection[3] * worldPosH);

    highp vec3 normal =
        weight.x * (shadow.normal[0] * faceNormal) +
        weight.y * (shadow.normal[1] * faceNormal) +
        weight.z * (shadow.normal[2] * faceNormal) +
        weight.w * (shadow.normal[3] * faceNormal);

    mediump vec4 bounds =
        weight.x * shadow.bounds[0] +
        weight.y * shadow.bounds[1] +
        weight.z * shadow.bounds[2] +
        weight.w * shadow.bounds[3];

    mediump vec2 uvOffset = (0.5 / sampleClip.w) * sampleClip.xy + 0.5;
    highp float sampleDepth = 0.5 * (1. + sampleClip.z / sampleClip.w);
    
    highp float zScale = max(-1024. * normal.z, 0.0009765625);
    highp float biasX = normal.x / zScale;
    highp float biasY = normal.y / zScale;
    highp float bias = abs(biasX) + abs(biasY);

    #ifdef PCF
        mediump vec2 taps[16];
        taps[0]  = vec2(  -0.8835609, 2.523391 );
        taps[1]  = vec2(  -1.387375, 1.056318 );
        taps[2]  = vec2(  -2.854452, 1.313645 );
        taps[3]  = vec2(  0.6326182, 1.14569 );
        taps[4]  = vec2(  1.331515, 3.637297 );
        taps[5]  = vec2(  -2.175307, 3.885795 );
        taps[6]  = vec2(  -0.5396664, 4.1938 );
        taps[7]  = vec2(  -0.6708734, -0.36875 );
        taps[8]  = vec2(  -2.083908, -0.6921188 );
        taps[9]  = vec2(  -3.219028, 2.85465 );
        taps[10] = vec2(  -1.863933, -2.742254 );
        taps[11] = vec2(  -4.125739, -1.283028 );
        taps[12] = vec2(  -3.376766, -2.81844 );
        taps[13] = vec2(  -3.974553, 0.5459405 );
        taps[14] = vec2(  3.102514, 1.717692 );
        taps[15] = vec2(  2.951887, 3.186624 );

        mediump float total = 0.;
        const mediump float tapScale = 0.0009765625;
        for (int i = 0; i < 16; ++i) {
            mediump vec2 duv = 0.5 * taps[i] * tapScale;
            mediump vec2 uv = bounds.xy + 0.5 * clamp(uvOffset + duv, vec2(0.), vec2(1.));
            highp float depth = texture2D(shadowMap, uv).r;
            depth += bias - (biasX * duv.x + biasY * duv.y);
            depth += abs(depth) * 0.0009765625;
            total += step(sampleDepth, depth);
        }
        return total / 16.;
    #else
        mediump vec2 uv = bounds.xy + 0.5 * clamp(uvOffset, vec2(0.), vec2(1.));
        highp float depth = texture2D(shadowMap, uv).r;
        depth += bias;
        depth += max(abs(depth) 0.0009765625, 0.0009765625);

        return step(sampleDepth, depth);
    #endif
}

#pragma glslify: export(sampleShadows)