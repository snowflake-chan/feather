precision highp float;

attribute highp vec3 meshPosition;
attribute highp vec2 uv;
varying highp vec3 position;
varying highp vec2 v_uv;
uniform highp mat4 model, viewProj;
uniform vec3 offset;

void main () {
    vec4 worldPos = model * vec4(meshPosition + offset, 1);
    position = worldPos.xyz;

    v_uv = uv;
    gl_Position = viewProj * worldPos;
}