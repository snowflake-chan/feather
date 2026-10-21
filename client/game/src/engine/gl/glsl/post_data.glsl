struct PostData {
    #ifdef GLSLIFY_HACK
        float foo;
    #endif
    mediump float gamma, exposure;
    mediump vec4 fogParams, fogParams2, fogParams3;
};

#pragma glslify:export(PostData)