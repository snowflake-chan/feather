highp vec2 ray_vs_sphere(const highp vec3 pos, const highp vec3 dir, highp float sr) {
    highp float a = dot(dir, dir);
    highp float b = 2.0 * dot(dir, pos);
    highp float c = dot(pos, pos) - (sr * sr);
    highp float det = (b * b) - 4.0 * a * c;
    // det < 0 indicate no intersect
    if (det < 0.0) {
        return vec2(1e5, -1e5);
    }
    return vec2(
        (-b - sqrt(det)) / (2.0 * a),
        (-b + sqrt(det)) / (2.0 * a)
    );
}

#pragma glslify:export(ray_vs_sphere)