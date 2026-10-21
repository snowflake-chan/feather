precision highp float;

uniform highp sampler2D color, depthStencil;
uniform mediump vec2 shape;
uniform mediump float zNear, zFar;

mediump float weight (mediump float a, mediump float b) {
    return exp(-10. * abs(a - b));
}

void main () {
    mediump vec2 baseUV = gl_FragCoord.xy / shape;

    highp float depthVals[9];
    mediump vec3 colorVals[9];
    highp float depth = 0.;
    for (int dx = 0; dx < 3; ++dx) {
        for (int dy = 0; dy < 3; ++dy) {
            mediump vec2 uv = baseUV + vec2(dx - 1, dy - 1) / (shape);
            colorVals[3 * dx + dy] = texture2D(color, uv).rgb;
            highp float z = texture2D(depthStencil, uv).r;
            depthVals[3 * dx + dy] = z;
            depth = max(z, depth);
        }
    }

    mediump float w = weight(depth, depthVals[0]);
    mediump float wtot = w;
    mediump vec3 avgColor = colorVals[0] * w;
    w = weight(depth, depthVals[1]);
    avgColor       += colorVals[1] * w;
    wtot += w;
    w = weight(depth, depthVals[2]);
    avgColor       += colorVals[2] * w;
    wtot += w;
    w = weight(depth, depthVals[3]);
    avgColor       += colorVals[3] * w;
    wtot += w;
    w = weight(depth, depthVals[4]);
    avgColor       += colorVals[4] * w;
    wtot += w;
    w = weight(depth, depthVals[5]);
    avgColor       += colorVals[5] * w;
    wtot += w;
    w = weight(depth, depthVals[6]);
    avgColor       += colorVals[6] * w;
    wtot += w;
    w = weight(depth, depthVals[7]);
    avgColor       += colorVals[7] * w;
    wtot += w;
    w = weight(depth, depthVals[8]);
    avgColor       += colorVals[8] * w;
    wtot += w;

    highp float zn = 2. * depth - 1.;
    gl_FragColor = vec4(
        avgColor / wtot, 2. * zNear * zFar / (zFar + zNear - zn * (zFar - zNear)));
}