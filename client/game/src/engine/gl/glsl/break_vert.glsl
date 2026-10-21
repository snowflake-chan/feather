precision highp float;

#pragma glslify: config = require('./blocks.glsl')

#define PI 3.1415926535897932384626433832795
#define PI2 (PI * 2.)
#define BLOCK_SIZE 0.08
#define BLOCK_SPEED 0.3
#define BLOCK_SHAPE (1. - 2. * BLOCK_SIZE)
#define SPIN_SPEED 0.11
#define GRAVITY 0.1
#define LIFETIME 8.

attribute highp vec4 s0;

uniform highp mat4 viewProj;
uniform highp float time;
uniform highp vec2 rand;
uniform highp vec3 pos;

#ifdef FORWARD
    uniform mediump vec2 texCoordXPos, texCoordXNeg, texCoordYPos, texCoordYNeg, texCoordZPos, texCoordZNeg;
    uniform lowp vec4 ambient[8];

    varying highp vec3 worldPos;
    varying mediump vec3 normal, tangentU, tangentV;
    varying mediump vec2 texCoord;
    varying lowp vec4 ambientLight;

    lowp vec4 interpolateAmbientLight (const highp vec3 p) {
        lowp vec3 weight = max(min(p - pos - 0.5, 1.), 0.);
        return  mix(
            mix(
                mix(ambient[0], ambient[1], weight.x),
                mix(ambient[2], ambient[3], weight.x),
                weight.y),
            mix(
                mix(ambient[4], ambient[5], weight.x),
                mix(ambient[6], ambient[7], weight.x),
                weight.y),
            weight.z);
    }
#else
    varying highp vec2 fShadow;
#endif

mediump vec3 polarToNormal(mediump vec2 v) {
    mediump float c = cos(v.x);
    return vec3(
        c * cos(v.y),
        c * sin(v.y),
        sin(v.x)
    );
}

mediump mat3 spinMatrix (mediump float spinTime, mediump vec3 u) {
    mediump float c = cos(spinTime);
    mediump float s = sin(spinTime);
    return mat3(
        c + u.x * u.x * (1. - c), u.x * u.y * (1. - c) - u.z * s, u.x * u.z * (1. - c) + u.y * s,
        u.y * u.x * (1. - c) + u.z * s, c + u.y * u.y * (1. - c), u.y * u.z * (1. - c) - u.x * s,
        u.z * u.x * (1. - c) - u.y * s, u.z * u.y * (1. - c) + u.x * s, c + u.z * u.z * (1. - c));
}

void main() {    
    // compute face normal and UV
    mediump float faceCode = s0.z;
    lowp float h0 = step(faceCode, 0.5);
    lowp float h1 = step(faceCode, 1.5);
    lowp float h2 = step(faceCode, 2.5);
    lowp float h3 = step(faceCode, 3.5);
    lowp float h4 = step(faceCode, 4.5);
    lowp vec3 faceNormal = vec3(
        h1 - 2. * h0,
        h3 - 2. * h2 + h1,
        1. - 2. * h4 + h3);
    lowp vec3 faceU = vec3(faceNormal.y + faceNormal.z, 0., -faceNormal.x);
    lowp vec3 faceV = vec3(0., -abs(faceNormal.x + faceNormal.z), abs(faceNormal.y));

    // compute cube position
    highp vec3 cubePosition = faceNormal + s0.x * faceU + s0.y * faceV;

    // compute seed
    mediump float instanceId = s0.w;
    highp vec2 seed = fract(sin(133.47589 * rand * (1. + instanceId)));

    // compute dynamics stuff from random seed
    highp vec3 initPosition = fract(sin(vec3(seed * 10007., 2001. * seed.x + 113. * seed.y)));
    highp vec3 velocity = BLOCK_SPEED * (0.5 * sin(vec3(seed * 173., 217. * seed.x + 153. * seed.y)) + (initPosition - 0.5));
    mediump vec3 axis = polarToNormal(seed * PI2);
    highp float spinTime = SPIN_SPEED * time * 5.;
    mediump mat3 rotation = spinMatrix(spinTime, axis);

    // calculate position
    mediump vec3 offset = pos + BLOCK_SHAPE * initPosition + velocity * time * BLOCK_SPEED;
    offset[1] -= 0.5 * time * time * GRAVITY;
    mediump float scale = max(0., 1. - exp(time - LIFETIME));
    highp vec3 position = offset + BLOCK_SIZE * (1. + scale * rotation * cubePosition);
    
    #ifdef FORWARD
        // output frenet frame
        normal = normalize(rotation * faceNormal); // no need to inverse transpose since r is orthonormal
        tangentU = normalize(rotation * faceU);
        tangentV = normalize(rotation * faceV);

        // output ambient light
        ambientLight = interpolateAmbientLight(position);

        // set texture coordinate
        mediump vec2 atlasCoord =
            texCoordXPos * h0 +
            texCoordXNeg * (h1 - h0) +
            texCoordYPos * (h2 - h1) +
            texCoordYNeg * (h3 - h2) +
            texCoordZPos * (h4 - h3) +
            texCoordZNeg * (1. - h4);
        highp vec3 restPosition = (1. + cubePosition) * BLOCK_SIZE + BLOCK_SHAPE * initPosition;
        mediump vec2 atlasOffset = fract(vec2(
            dot(faceU, restPosition), 
            dot(faceV, restPosition)));
        texCoord = (atlasCoord + atlasOffset) * (BLOCK_COLOR_SIZE / ATLAS_RADIUS);

        // output position
        worldPos = position;
        gl_Position = viewProj * vec4(position, 1);
    #else
        highp vec4 clipPosition = viewProj * vec4(position, 1);
        fShadow = clipPosition.zw;
        gl_Position = clipPosition;
    #endif
}
