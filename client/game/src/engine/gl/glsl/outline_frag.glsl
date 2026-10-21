precision highp float;

uniform vec2 shape;
uniform sampler2D depthStencil;

#define OUTLINE_COLOR vec4(1., 1., 1., 1.)

// 读取深度模板值，当有深度值的时候返回1，无深度值返回0
// 简化为有深度or无深度两个状态
float readStencil(vec2 coord) {
    return texture2D(depthStencil, coord).r < 1. ? 0. : 1.;
}

void main() {
    vec2 invSize = 1.0 / shape;
    vec2 vUv = gl_FragCoord.xy * invSize;

    // 取上，下，左，右四个点的深度模板值
    vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
    float c1 = readStencil(vUv + uvOffset.xy);
    float c2 = readStencil(vUv - uvOffset.xy);
    float c3 = readStencil(vUv + uvOffset.yw);
    float c4 = readStencil(vUv - uvOffset.yw);

    // 取对角线差值，任意一个对角线有插值即为边界点
    float diff1 = c1 - c2;
    float diff2 = c3 - c4;
    float d = length( vec2(diff1, diff2) );

    vec4 color = OUTLINE_COLOR * vec4(d);
    gl_FragColor = color;
}
