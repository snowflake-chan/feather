precision mediump float;
uniform mat4 projection, view, translate;
uniform bool screenSizeFixed, centerAtBottom;
uniform highp vec3 eye;
uniform vec3 center, offset, dimension;
uniform float fixedSize;
attribute vec4 vertex;
attribute vec2 uv;
varying highp vec3 position;
varying vec2 f_uv;

void main() {
  mat4 M = translate;
  f_uv = uv;
  vec3 actualPos = vertex.xyz;
  if (centerAtBottom) {
    actualPos.y = actualPos.y + 0.5;
  }
  if (screenSizeFixed) {
    float scale = distance(eye, center);
    vec3 pos2 = (M * vec4((actualPos * dimension * scale / fixedSize), 1)).xyz;
    position = pos2 + (offset * scale / fixedSize);
    gl_Position = projection * view * vec4(position, 1);
  } else {
    vec3 pos2 = (M * vec4(actualPos * dimension, 1)).xyz;
    position = pos2 + offset;
    gl_Position = projection * view * vec4(position, 1);
  }
}