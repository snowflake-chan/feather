precision mediump float;

#pragma glslify: config = require('./blocks.glsl')
#define BLOCK_SIZE 0.08
uniform highp vec3 eye;
uniform mat4 projection, view, translate;
uniform vec3 center, offset, dimension;
uniform vec2 texCoordXPos, texCoordXNeg, texCoordYPos, texCoordYNeg, texCoordZPos, texCoordZNeg;
uniform mediump float atlasRadius;
uniform lowp float rotation;
uniform float now;
uniform float frameLeft, frameRight, frameBottom, frameTop, frameFront, frameBack;

attribute vec4 vertex;

varying highp vec4 worldPos;
varying mediump vec3 normal;
varying mediump vec2 texCoordBase;


void main() {
  mat4 M = translate;
  vec3 actualPos = vertex.xyz;

  mediump float faceCode = vertex.w;
  lowp float h0 = step(faceCode, 0.5);
  lowp float h1 = step(faceCode, 1.5);
  lowp float h2 = step(faceCode, 2.5);
  lowp float h3 = step(faceCode, 3.5);
  lowp float h4 = step(faceCode, 4.5);
  lowp vec3 faceNormal = vec3(
        h1 - 2. * h0,
        h3 - 2. * h2 + h1,
        1. - 2. * h4 + h3);
  normal = faceNormal;

  float frame = 1.0;
  if (faceNormal.x > 0.0) {
    frame = frameRight;
  } else if (faceNormal.x < 0.0) {
    frame = frameLeft;
  } else if (faceNormal.y > 0.0) {
    frame = frameTop;
  } else if (faceNormal.y < 0.0) {
    frame = frameBottom;
  } else if (faceNormal.z > 0.0) {
    frame = frameBack;
  } else {
    frame = frameFront;
  }

  mediump vec2 atlasCoord =
            texCoordXPos * h0 +
            texCoordXNeg * (h1 - h0) +
            texCoordYPos * (h2 - h1) +
            texCoordYNeg * (h3 - h2) +
            texCoordZPos * (h4 - h3) +
            texCoordZNeg * (1. - h4);
  vec3 pos2 = (M * vec4(actualPos * dimension, 1)).xyz;
  vec3 position = pos2 + offset;

  highp float animOffset = floor(frame * fract(now));
  texCoordBase = (atlasCoord + vec2(animOffset, 0)) * (BLOCK_COLOR_SIZE / atlasRadius);

  if (normal.y != 0.0) {
    worldPos = vec4(position, rotation);
  } else {
    worldPos = vec4(position, 0.0);
  }
  gl_Position = projection * view * vec4(position, 1);
}