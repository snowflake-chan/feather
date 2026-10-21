#define CHUNK_SIZE 32

mediump float calcLOD (
    const highp vec3 eye,
    const highp vec3 position,
    mediump float lodBias) {
    highp float viewDistance = length(eye - position);
    return 5. - max(0., min(5., lodBias - log2(viewDistance)));
}

highp vec3 roundTo (highp vec3 v, highp float num) {
    return ceil(v / num) * num;
}

highp vec3 interpToLOD (highp vec3 blockPos, mediump float lod) {
    mediump float lodi = floor(lod);
    mediump float lodf = lod - lodi;
    highp float lodScale = pow(2., lodi);
    return mix(
        roundTo(blockPos, lodScale),
        roundTo(blockPos, 2. * lodScale),
        lodf);
}

highp vec3 computeVoxelLODPos (highp vec3 eye, mediump float lodBias, highp vec3 blockPos, highp vec3 chunkId) {
    // unpack position
    highp vec3 chunkPos = float(CHUNK_SIZE) * chunkId;

    // compute position
    highp vec3 samplePos = roundTo(blockPos, 32.);
    mediump float lod = calcLOD(eye, chunkPos + samplePos, lodBias);
    highp vec3 lodPos = interpToLOD(blockPos, calcLOD(eye, chunkPos + interpToLOD(blockPos, lod), lodBias));

    return chunkPos + lodPos;
}

#pragma glslify: export(computeVoxelLODPos)