precision highp float;

varying highp vec3 position;
uniform highp vec3 wireFrameColor, eye;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

void main () {
    PostFrag frag;
    frag.color = vec4(wireFrameColor / post.exposure, 0.0);
    frag.eye = eye;
    frag.position = position;
    vec3 col = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag).rgb;
    gl_FragColor = vec4(col, 1.0);
}