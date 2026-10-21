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

uniform highp vec3 eye;

varying highp vec3 fragColor, worldPos;

void main () {
    PostFrag frag;
    frag.color = vec4(fragColor, 0.);
    frag.eye = eye;
    frag.position = worldPos;

    vec4 outColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);

    outColor.a = 0.;
    gl_FragColor = outColor;
}