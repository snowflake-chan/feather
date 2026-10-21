precision highp float;
attribute mediump vec4 s0;
attribute mediump float s1;
varying highp vec3 position;
uniform highp mat4 viewProj, model;
uniform sampler2D matrixTexture;
uniform int matrixTextureSize;

#ifdef NODE_SIZE
    uniform lowp mat4 nodesMatrix[int(NODE_SIZE)];
#endif

#pragma glslify: getNodeMatrix = require('./node_matrix.glsl')

void main () {
    // compute position
    highp vec4 modelPos = vec4(s0.xyz, 1);

    #ifdef UINT8_TEXTURE
        #ifdef NODE_SIZE
            modelPos = model * nodesMatrix[int(s1)] * modelPos;
        #else
            modelPos = model * modelPos;
        #endif
    #else
        modelPos = model * getNodeMatrix(s1, matrixTextureSize, matrixTexture) * modelPos;
    #endif

    position = modelPos.xyz;
    gl_Position = viewProj * modelPos;
}