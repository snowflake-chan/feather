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
varying vec2 spin;

void main() {
    mediump vec2 p = gl_PointCoord.xy - 0.5;
    mediump vec2 uv = 0.5 + vec2(
        p.x * spin.x - p.y * spin.y,
        p.x * spin.y + p.y * spin.x);
    mediump vec4 c = texture2D(texture, uv) * color;

    PostFrag frag;
    frag.color = vec4(c.rgb * light.color, c.a);
    frag.eye = eye;
    frag.position = worldPos;

    vec4 outColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);

    // override color mask for additive particles
    outColor.a = c.a;
    gl_FragColor = outColor;
}
