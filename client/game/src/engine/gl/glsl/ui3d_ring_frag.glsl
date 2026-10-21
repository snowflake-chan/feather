precision mediump float;
uniform highp vec3 eye, color, fillColor;
uniform float radius, startRad, currentRad;
varying vec2 vpos;
varying highp vec3 position;
uniform bool highlight, clockwise;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

float lineDot(vec2 l1, vec2 l2) {
    return dot(l1, l2);
}

vec2 rotatePoint(vec2 center, float angle, vec2 p) {
    float s = sin(angle);
    float c = cos(angle);
    // translate point back to origin:
    p.x -= center.x;
    p.y -= center.y;
    // rotate point
    float xnew = p.x * c - p.y * s;
    float ynew = p.x * s + p.y * c;
    p.x = xnew + center.x;
    p.y = ynew + center.y;
    return p;
}

void main() {
    vec2 coord = vpos;
    float circleWitdh = 0.02;
    vec2 center = vec2(0);
    float distanceToCenter = distance(center, coord.xy);
    if (distanceToCenter >= radius && distanceToCenter <= radius + circleWitdh) {
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

    vec2 refLineEnd = vec2(0, distanceToCenter);
    refLineEnd = rotatePoint(center, startRad, refLineEnd);

    vec2 middleLineEnd = vec2(0, distanceToCenter);
    float middleRad = (currentRad - startRad) / 2.0 + startRad;
    middleLineEnd = rotatePoint(center, middleRad, middleLineEnd);
    float maxDot = lineDot(refLineEnd, middleLineEnd);
    bool shouldLight = clockwise ? lineDot(coord.xy, middleLineEnd) < maxDot : lineDot(coord.xy, middleLineEnd) > maxDot;

    if (distanceToCenter <= radius && highlight && currentRad != startRad && shouldLight) {
        PostFrag frag;
        frag.color = vec4(fillColor / post.exposure, 0.);
        frag.eye = eye;
        frag.position = position;
        gl_FragColor = vec4(outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag).rgb, 0.5);
    }
}