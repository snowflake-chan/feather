#define CHUNK_SIZE 32

precision highp float;

attribute highp vec4 s0, s1, s2, s3;

uniform highp mat4 viewProj;
uniform highp vec3 chunkId;
uniform float now;

#ifndef DEPTH
    varying highp vec4 worldPos;
    varying lowp vec2 texCoordBase;
    varying lowp vec3 faceNormal;
    varying lowp vec4 light00, light01, light10, light11;
    varying lowp vec4 edgeInfo;
#endif

#pragma glslify: unpackLight = require('./unpack_light.glsl')
#pragma glslify: config = require('./blocks.glsl')

void main () {
    // unpack position
    highp vec3 blockPos = s0.xyz;
    highp vec3 lodPos = float(CHUNK_SIZE) * chunkId + blockPos;

    #ifndef DEPTH
        // unpack normal
        mediump float faceCode = s0.w;

        // unpack light values
        unpackLight(s1, light00, light01);
        unpackLight(s2, light10, light11);

        // compute face normal
        lowp float h0 = step(faceCode, 0.5);
        lowp float h1 = step(faceCode, 1.5);
        lowp float h2 = step(faceCode, 2.5);
        lowp float h3 = step(faceCode, 3.5);
        lowp float h4 = step(faceCode, 4.5);

        faceNormal = vec3(
            h1 - 2. * h0,
            h3 - 2. * h2 + h1,
            1. - 2. * h4 + h3);
        
        // unpack texture coord
        #ifdef ATLAS_RADIUS
        highp float animOffset = floor(s3.a * fract(now));
        texCoordBase = (BLOCK_COLOR_SIZE / ATLAS_RADIUS) * (s3.rg + vec2(animOffset, 0));
        #endif

        //unpack edge information
        lowp float upEdge = step(0.5, fract(s3.b / 16.));
        lowp float rightEdge = step(0.5, fract(s3.b / 8.));
        lowp float downEdge = step(0.5, fract(s3.b / 4.));
        lowp float leftEdge = step(0.5, fract(s3.b / 2.));
        edgeInfo = vec4 (upEdge, rightEdge, downEdge, leftEdge);

        // store world position
        worldPos = vec4(lodPos, floor(s3.b / 16.));
    #endif

    gl_Position = viewProj * vec4(lodPos, 1);
}