precision highp float;

attribute highp vec3 vertex;
attribute highp vec2 uv;
varying highp vec3 position;
varying highp vec2 v_uv;
uniform highp mat4 model;
uniform mat4 projection, view, translate;

void main () {
    vec4 worldPos = model * vec4(vertex, 1);
    position = worldPos.xyz;
    v_uv = uv;
    gl_Position = projection * view * vec4(position, 1);
}