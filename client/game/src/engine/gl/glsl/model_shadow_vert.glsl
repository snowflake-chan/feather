precision highp float;
attribute mediump vec3 s0;
attribute mediump float s1;

uniform highp mat4 viewProj, model;
varying highp vec2 fShadow;
uniform sampler2D matrixTexture;
uniform int matrixTextureSize;

#ifdef NODE_SIZE
    uniform lowp mat4 nodesMatrix[int(NODE_SIZE)];
#endif

#pragma glslify: getNodeMatrix = require('./node_matrix.glsl')

void main () {
    highp vec4 shadowPos = vec4(s0.xyz, 1);

    #ifdef UINT8_TEXTURE
        #ifdef NODE_SIZE
            shadowPos = model * nodesMatrix[int(s1)] * shadowPos;
        #else
            shadowPos = model * shadowPos;
        #endif
    #else
        shadowPos = model * getNodeMatrix(s1, matrixTextureSize, matrixTexture) * shadowPos;
    #endif

    shadowPos = viewProj * shadowPos;
    fShadow = shadowPos.zw;
    gl_Position = shadowPos;
}