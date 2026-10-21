precision highp float;

attribute highp vec4 s0;

uniform highp vec3 chunkId;
uniform highp mat4 viewProj;

void main () {
    gl_Position = viewProj * vec4(s0.xyz + 32. * chunkId, 1);
}