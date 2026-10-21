#define CHUNK_SIZE 32

attribute mediump vec4 s0;

uniform mediump vec3 chunkId;
uniform highp mat4 viewProj;

varying highp vec2 fShadow;

void main () {
    mediump vec3 lodPos = float(CHUNK_SIZE) * chunkId + s0.xyz;
    highp vec4 shadowPos = viewProj * vec4(lodPos, 1);
    fShadow = shadowPos.zw;
    gl_Position = shadowPos;
}
