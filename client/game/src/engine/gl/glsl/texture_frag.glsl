precision highp float;

varying highp vec3 position;
varying highp vec2 v_uv;
uniform highp vec3 eye;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

uniform lowp sampler2D texture;

void main () {
    PostFrag frag;
    vec4 color = texture2D(texture, v_uv);
    frag.color = vec4(color.rgb / post.exposure, 0.);
    frag.eye = eye;
    frag.position = position;
    gl_FragColor = vec4(outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag).rgb, 1.0);
}
