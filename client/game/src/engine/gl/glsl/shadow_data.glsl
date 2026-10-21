struct ShadowData {
    mediump float resolution;
    mediump vec3 cascadeSplits;
    highp mat4 projection[4];
    highp mat3 normal[4];
    mediump vec4 bounds[4];
};

#pragma glslify:export(ShadowData)