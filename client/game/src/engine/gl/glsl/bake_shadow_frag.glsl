precision highp float;

uniform vec2 shape;
uniform sampler2D depthStencil;

void main() {
    vec2 invSize = 1.0 / shape;
    vec2 vUv = gl_FragCoord.xy * invSize;

    float depth = texture2D(depthStencil, vUv).r;
    depth = 2. * depth - 1.;
    gl_FragColor = vec4(depth, depth, depth, 1.);
}
