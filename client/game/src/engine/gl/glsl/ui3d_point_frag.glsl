precision highp float;

varying highp vec3 position;
uniform highp vec3 color, eye;
uniform vec3 center;

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
  float d = distance(gl_PointCoord, vec2(0.5,0.5));
  if (d < 0.5) {
    PostFrag frag;
    frag.color = vec4(color / post.exposure, 0.);
    frag.eye = eye;
    frag.position = position;
    gl_FragColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);
  } else {
    discard;
  }
}
