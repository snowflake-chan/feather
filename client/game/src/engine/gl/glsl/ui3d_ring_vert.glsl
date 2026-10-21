precision mediump float;
uniform mat4 projection, view, translate;
uniform bool screenSizeFixed;
uniform highp vec3 eye;
uniform vec3 center, offset;
uniform float fixedSize;
attribute vec3 vertex;
attribute vec2 uv;
varying vec2 vpos;
varying highp vec3 position;

void main() {
  vpos = uv;
  mat4 M = translate;
  if (screenSizeFixed) {
    vec4 pos = M * vec4(vertex, 1);
    float scale = distance(eye, center);
    vec3 pos2 = (M * vec4((vertex * scale / fixedSize), 1)).xyz;
    position = pos2 + (offset * scale / fixedSize);
    gl_Position = projection * view * vec4(position, 1);
  } else {
    vec3 pos2 = (M * vec4(vertex, 1)).xyz;
    position = pos2 + offset;
    gl_Position = projection * view * vec4(position, 1);
  }
}