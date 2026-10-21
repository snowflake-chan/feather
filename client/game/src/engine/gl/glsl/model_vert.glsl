precision highp float;

attribute mediump vec4 s0;
attribute mediump float s1;
attribute highp vec2 uv;
attribute highp vec3 normals;

varying highp vec2 _uv;

varying highp vec3 position;
varying mediump vec3 normal;
varying lowp vec4 ambient;
varying highp float alpha;

uniform highp vec2 textureShape;
uniform highp mat4 viewProj, model;
uniform highp mat3 normalMat;
uniform highp vec3 lo, hi;
uniform lowp vec4 ambientLight[8];

uniform sampler2D matrixTexture;
uniform int matrixTextureSize;
uniform sampler2D alphaTexture;
uniform int alphaTextureSize;

#ifdef NODE_SIZE
    uniform lowp mat4 nodesMatrix[int(NODE_SIZE)];
#endif

#pragma glslify: getNodeMatrix = require('./node_matrix.glsl')

lowp vec4 interpolateAmbientLight (const mediump vec3 p) {
    lowp vec3 weight = (p - lo) / max(hi - lo, vec3(1.));
    return  mix(
        mix(
            mix(ambientLight[0], ambientLight[1], weight.x),
            mix(ambientLight[2], ambientLight[3], weight.x),
            weight.y),
        mix(
            mix(ambientLight[4], ambientLight[5], weight.x),
            mix(ambientLight[6], ambientLight[7], weight.x),
            weight.y),
        weight.z);
}

void main () {
    // compute position
    highp vec4 modelPos = vec4(s0.xyz, 1);
    float alphaX = mod(s1, float(alphaTextureSize)) / float(alphaTextureSize);
    float alphaY = floor(s1 / float(alphaTextureSize)) / float(alphaTextureSize);
    vec4 rgba = texture2D(alphaTexture, vec2(alphaX, alphaY));
    alpha = rgba.a;

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

    #ifdef IS_GLTF
        normal = normalize(normalMat * normals);
    # else
        // compute face normal
        mediump float faceCode = s0.a;
        lowp float h0 = step(faceCode, 0.5);
        lowp float h1 = step(faceCode, 1.5);
        lowp float h2 = step(faceCode, 2.5);
        lowp float h3 = step(faceCode, 3.5);
        lowp float h4 = step(faceCode, 4.5);
        normal = normalize(normalMat * vec3(h1 - 2. * h0, h3 - 2. * h2 + h1, 1. - 2. * h4 + h3));
    #endif

    // compute uv
    _uv = uv / textureShape;

    // compute ambient light
    ambient = interpolateAmbientLight(s0.xyz);
}