mediump vec2 normalToParaboloid (mediump vec3 n) {
    return n.xz * (0.5 / (1. + n.y)) + 0.5;
}

#pragma glslify:export(normalToParaboloid)
