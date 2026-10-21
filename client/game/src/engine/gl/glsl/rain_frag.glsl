precision mediump float;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')
#pragma glslify: outputFragment = require('./post_out.glsl')

uniform LightProperties light;
uniform PostData post;

#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

uniform lowp sampler2D texture;
uniform lowp vec4 color;
uniform vec3 eye;

varying vec3 worldPos;

void main() {
    PostFrag frag;
    frag.color = vec4(color.rgb * light.color, color.a);
    frag.eye = eye;
    frag.position = worldPos;

    gl_FragColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);
}
