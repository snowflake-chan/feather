precision highp float;

#define PI 3.14159265

varying highp vec3 position;
varying highp vec2 v_uv;
uniform highp vec3 eye;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
uniform float iTime;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

uniform lowp sampler2D hackingSampler;

float LO_X = 4.0 / 9.03;
float LO_Y = 2.0 / 9.03;
float HI_X = 8.0 / 9.03;
float HI_Y = 7.0 / 9.03;

bool inBound(vec2 p) {
    return all(greaterThanEqual(p, vec2(LO_X, LO_Y))) && all(lessThan(p, vec2(HI_X, HI_Y)));
}

void main () {
    // compute shaded color
    PostFrag frag;
    vec2 coord = vec2(1.0) - v_uv;
    coord.x = 1.0 - coord.x;
    if (inBound(coord)) {
        coord.y -= LO_Y;
        coord.y += 0.05 * iTime;
        coord.y = mod(coord.y, HI_Y - LO_Y) + LO_Y;
    }

    vec4 color = texture2D(hackingSampler, coord);
    if (color.a < 0.1) {
        discard;
    }
    frag.color = color;
    if (all(lessThan(frag.color.rgb, vec3(0.1)))) {
        frag.color = vec4(0.0, 0.0, 0.0, 0.8);
    }
    frag.color.rgb = frag.color.rgb / post.exposure;
    // set fragment position info
    frag.eye = eye;
    frag.position = position;

    gl_FragColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);
}
