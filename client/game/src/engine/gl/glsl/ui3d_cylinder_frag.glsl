precision mediump float;
uniform highp vec3 eye, color;
varying vec2 vpos;
varying highp vec3 position;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

void main() {
    PostFrag frag;
    frag.color = vec4(color / post.exposure, 0.);
    frag.eye = eye;
    frag.position = position;
    gl_FragColor = vec4(outputFragment(
    #ifdef COLOR_LUT
        lut,
    #endif
    light, post, frag).rgb, 1.0);
}