/**
* This file is used by voxel-editor
*/
precision highp float;

attribute vec4 s0, s1, s2, s3;

uniform mat4 view, projection;
uniform vec3 eye;
uniform vec3 chunkId;

varying vec3 faceNormal;
varying vec4 light00, light01, light10, light11;
varying vec2 texCoordBase;
varying vec4 worldPos;
varying vec4 edgeInfo;

#pragma glslify: unpackLight = require('./unpack_light.glsl')

void main () {
    // unpack position
    vec3 blockPos = s0.xyz;

    // unpack normal
    float faceCode = s0.w;

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
    texCoordBase = s3.rg;

    //unpack edge information
    float edgeFlag = s3.b;
    lowp float upEdge = step(8., edgeFlag);
    lowp float rightEdge = step(4., mod(edgeFlag, 8.));
    lowp float downEdge = step(2., mod(edgeFlag, 4.));
    lowp float leftEdge = step(1., mod(edgeFlag, 2.));
    edgeInfo = vec4 (upEdge, rightEdge, downEdge, leftEdge);

    worldPos = vec4(blockPos, 0.);
    gl_Position = projection * view * vec4(blockPos, 1);
}