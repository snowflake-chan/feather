attribute highp vec2 position;
varying highp vec2 uv;
void main () {
  uv = position;
  gl_Position = vec4(position, 0.999, 1.0);
}
