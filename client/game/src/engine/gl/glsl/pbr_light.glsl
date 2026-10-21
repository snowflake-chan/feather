struct LightProperties {
    #ifdef GLSLIFY_HACK
        float foo;
    #endif
    mediump vec3 direction, color, skyLeft, skyRight, skyTop, skyBottom, skyFront, skyBack;
    mediump float globalLight;
};

#pragma glslify:export(LightProperties)