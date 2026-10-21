precision highp float;
varying highp vec3 position;
varying vec2 f_uv;
uniform highp vec3 eye;
uniform float radius;
uniform sampler2D tRGBA;

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
  vec2 uv = ((f_uv / radius) + 1.0) * 0.5;
  // vec2 uv = gl_FragCoord.xy / vec2(32.0, 32.0);
  vec4 textColor = texture2D(tRGBA, uv);
  frag.color = vec4(textColor.rgb / post.exposure, 0.);
  frag.eye = eye;
    frag.position = position;
    vec3 col = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag).rgb;
  gl_FragColor = vec4(col, textColor.a);
}