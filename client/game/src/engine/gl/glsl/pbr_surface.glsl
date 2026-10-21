struct SurfaceProperties {
    #ifdef GLSLIFY_HACK
        float foo;
    #endif
    highp vec3 position;
    mediump vec3 normal, faceU, faceV;
    #ifdef SAFE
        // safe mode surface props
    #else
        mediump vec3 view;
        lowp float metalness, smoothness;
    #endif
    lowp vec3 albedo;
    mediump vec4 light00, light01, light10, light11;
    lowp float emissive, ao, shadow;    
};

#pragma glslify:export(SurfaceProperties)