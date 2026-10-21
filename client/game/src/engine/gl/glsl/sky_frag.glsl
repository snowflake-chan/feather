precision highp float;

varying highp vec2 uv;

uniform highp mat4 invViewProj;
uniform lowp sampler2D nightSampler;
uniform lowp samplerCube cloudSamplerCube;

uniform highp float timeOfDay, lunarPhase, now;

#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')
uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

uniform highp vec3 eye;

#ifdef REFLECTION_PASS
uniform mediump float zFar;
#endif

#pragma glslify: sampleAtmosphere = require('./atmosphere.glsl')
#pragma glslify: outputFragment = require('./post_out.glsl')

mediump vec3 revertToneMapping(vec3 color) {
    vec3 a = 2.43 * color - 2.51;
    vec3 b = 0.59 * color - 0.03;
    vec3 c = 0.14 * color;
    vec3 det = sqrt(b * b - 4.0 * a * c);
    return (-b - det) / (2.0 * a);
}

void main() {
    highp vec4 farRay = invViewProj * vec4(uv, 1, 1);
    highp vec4 nearRay = invViewProj * vec4(uv, 0, 1);
    highp vec3 viewDir = normalize(farRay.xyz * nearRay.w - nearRay.xyz * farRay.w);

    PostFrag frag;
    frag.color = vec4(revertToneMapping(sampleAtmosphere(  
        viewDir,
        timeOfDay,
        now,
        nightSampler,
        cloudSamplerCube)) / post.exposure / 1.5, 1.0);
    frag.position = farRay.xyz / farRay.w;
    frag.eye = eye;

    gl_FragColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light,
        post,
        frag);
}
