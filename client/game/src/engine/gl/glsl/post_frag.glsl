struct PostFrag {
    #ifdef GLSLIFY_HACK
        float foo;
    #endif
    highp vec3 eye, position;
    mediump vec4 color;
};

#pragma glslify:export(PostFrag)