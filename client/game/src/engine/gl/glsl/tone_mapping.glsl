lowp vec3 toneMapping(mediump vec3 _C) {
    mediump vec3 c = (_C * (2.51 * _C + 0.03)) / (_C * (2.43 * _C + 0.59) + 0.14);
    return clamp(c, vec3(0.), vec3(1.));
}

#pragma glslify:export(toneMapping)