mediump vec3 paraboloidToNormal (mediump vec2 screen) {
    mediump float K = 2. / (dot(screen, screen) + 1.);
    return vec3(K * screen.x, K - 1., K * screen.y);
}

#pragma glslify:export(paraboloidToNormal)
