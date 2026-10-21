lowp vec3 applyLUT (const lowp vec3 color, const lowp sampler2D lut) {
    lowp vec2 uv = clamp(color.rg, vec2(0.5 / 16.), vec2(15.5 / 16.));

    mediump float z = 16. * color.b;
    mediump float zi = floor(z);
    lowp float zf = fract(z);

    lowp vec3 c0 = texture2D(lut, vec2((uv.r + zi) / 16., uv.g)).rgb;
    lowp vec3 c1 = texture2D(lut, vec2((uv.r + min(zi + 1., 15.)) / 16., uv.g)).rgb;

    return mix(c0, c1, zf);
}

#pragma glslify:export(applyLUT)