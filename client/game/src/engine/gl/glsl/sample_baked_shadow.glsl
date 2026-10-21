lowp float sampleBakedShadows (
    const float bakedChunkShift,
    const float bakedZRatio,
    const float chunkDimX,
    const float chunkDimY,
    const float chunkDimZ,
    const sampler2D bakedShadowTexture,
    const sampler2D bakedDataTexture,
    const highp vec3 worldPos,
    const mediump vec3 faceNormal) {

    highp float zDepth = gl_FragCoord.z / gl_FragCoord.w;

    highp vec4 worldPosH = vec4(worldPos, 1);

    highp float size = pow(2.0, bakedChunkShift);
    highp float stepX = floor(worldPosH.x / size);
    highp float stepZ = floor(worldPosH.z / size);
    highp float useIdx = stepX + chunkDimX * stepZ;

    // 坐标位置转uv, 已知bakedDataTexture宽度一定为8像素, 转换倍率就是 1 / 8
    float dx = 1.0 / 8.0;
    float y = useIdx / (chunkDimX * chunkDimZ);
  
    vec4 proj1 = texture2D(bakedDataTexture, vec2(0., y));
    vec4 proj2 = texture2D(bakedDataTexture, vec2(dx * 1., y));
    vec4 proj3 = texture2D(bakedDataTexture, vec2(dx * 2., y));
    vec4 proj4 = texture2D(bakedDataTexture, vec2(dx * 3., y));
    mat4 projection = mat4(proj1, proj2, proj3, proj4);

    highp vec4 sampleClip = projection * worldPosH;

    vec4 nor1 = texture2D(bakedDataTexture, vec2(dx * 4., y));
    vec4 nor2 = texture2D(bakedDataTexture, vec2(dx * 5., y));
    vec4 nor3 = texture2D(bakedDataTexture, vec2(dx * 6., y));
    mat3 normalMat = mat3(nor1.xyz, nor2.xyz, nor3.xyz);

    highp vec3 normal = normalMat * faceNormal;

    mediump vec4 bounds = texture2D(bakedDataTexture, vec2(dx * 7., y));

    mediump vec2 uvOffset = (0.5 / sampleClip.w) * sampleClip.xy + 0.5;
    highp float sampleDepth = sampleClip.z / sampleClip.w;
    
    float zRatio = (chunkDimX + chunkDimY + chunkDimZ) / 3.;
    highp float zScale = max(-400. / zRatio * normal.z * bakedZRatio, 0.0009765625);
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
            mediump vec2 uv = bounds.xy + vec2(1. / chunkDimX, 1. / chunkDimZ) * clamp(uvOffset + duv, vec2(0.), vec2(1.));
            highp float depth = texture2D(bakedShadowTexture, vec2(uv.x, 1. - uv.y)).r;
            depth += bias - (biasX * duv.x + biasY * duv.y);
            depth += abs(depth) * 0.0009765625;
            total += step(sampleDepth, depth);
        }
        return total / 16.;
    #else
        mediump vec2 uv = bounds.xy + vec2(1. / chunkDimX, 1. / chunkDimZ) * clamp(uvOffset, vec2(0.), vec2(1.));
        highp float depth = texture2D(bakedShadowTexture, vec2(uv.x, 1. - uv.y)).r;
        depth += bias;
        depth += max(abs(depth) 0.0009765625, 0.0009765625);

        return step(sampleDepth, depth);
    #endif
}

#pragma glslify: export(sampleBakedShadows)