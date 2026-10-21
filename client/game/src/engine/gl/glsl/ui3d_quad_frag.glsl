precision highp float;

varying highp vec3 position;
varying vec2 f_uv;
uniform highp vec3 color, eye;
uniform float radius;
uniform float fence;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

uniform float opacity;

vec2 rotate(float angle, vec2 p) {
    return vec2(p.x * cos(angle), p.y * sin(angle));
}

void main () {
    float finalOpacity = opacity;
    if (fence > 0.0) {
        vec2 r_uv = rotate(3.1415926 * 0.25, f_uv);
        float rst = cos((r_uv.y + r_uv.x) * 3.1415926 * 16.0);
        if (rst > 0.0) {
            finalOpacity = 0.0;
        }
    }
    PostFrag frag;
    frag.color = vec4(color / post.exposure, 0.0);
    frag.eye = eye;
    frag.position = position;
    vec3 col = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag).rgb;
    gl_FragColor = vec4(col, finalOpacity);
}