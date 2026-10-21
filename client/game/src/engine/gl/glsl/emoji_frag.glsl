precision highp float;
uniform lowp sampler2D emojiAtlas;

#pragma glslify:PostData = require('./post_data.glsl')
#pragma glslify: LightProperties = require('./pbr_light.glsl')
uniform PostData post;
uniform LightProperties light;
uniform mediump vec3 eye;

varying mediump vec2 texCoordBase;
varying highp vec3 emojiPposition;

#pragma glslify: PostFrag = require('./post_frag.glsl')
#pragma glslify: outputPost = require('./post_out.glsl')

void main () {
    lowp vec4 color = texture2D(emojiAtlas, (gl_PointCoord + texCoordBase) / 4.);
    if (color.a < 1.) {
        discard;
    }

    PostFrag frag;
    frag.color = color;
    frag.eye = eye;
    frag.position = emojiPposition;
    gl_FragColor = outputPost(light, post, frag);
}