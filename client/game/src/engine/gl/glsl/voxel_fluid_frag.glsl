precision highp float;

#define PI 3.14159265

varying highp vec3 position;
varying mediump vec4 fog;
varying lowp vec4 faceNormalAmbient;

uniform highp vec3 eye;
uniform highp float now;
uniform lowp sampler2D waterBumpTexture;

#pragma glslify:LightProperties = require('./pbr_light.glsl')
#pragma glslify:PostData = require('./post_data.glsl')
#pragma glslify:PostFrag = require('./post_frag.glsl')
uniform LightProperties light;
uniform PostData post;
#ifdef COLOR_LUT
    uniform lowp sampler2D lut;
#endif

#pragma glslify: outputFragment = require('./post_out.glsl')

mediump vec4 waterHeight (
    mediump vec3 faceNormal,
    mediump vec3 faceU,
    mediump vec3 faceV) {
    highp vec2 uv = vec2(
        dot(position, faceU),
        dot(position, faceV));
    mediump vec3 info =
        texture2D(waterBumpTexture,
            vec2(-0.09034713652888932, 0.04168606254177097) * uv.x +
            vec2(-0.04168606254177097, -0.09034713652888932) * uv.y +
            vec2(0.09047047097772415, -0.17836786112152822) * now).rgb +
        texture2D(waterBumpTexture,
            vec2(0.03761523317359175, -0.0905008243239295) * uv.x +
            vec2(0.0905008243239295, 0.03761523317359175) * uv.y +
            vec2(-0.19970633443880023, 0.010834204401712169) * now).rgb +
        texture2D(waterBumpTexture,
            vec2(0.03281944212910051, 0.08971935294507542) * uv.x +
            vec2(-0.08971935294507542, 0.03281944212910051) * uv.y +
            vec2(0.109235863461076, 0.16753365671981604) * now).rgb;
    mediump vec2 grad = info.rg - 1.5;
    return vec4(
        normalize(
            4. * faceNormal +
            grad.x * faceU +
            grad.y * faceV),
        info.b / 3.);
}

highp float pow5 (highp float x) {
    highp float x2 = x * x;
    return x2 * x2 * x;
}

void main () {
    // unpack normal and ambient occlusion values
    lowp vec3 faceNormal = faceNormalAmbient.xyz;
    lowp float ambientOcclusion = faceNormalAmbient.w;

    // calculate water height and gradient
    lowp vec3 U = vec3(faceNormal.y + faceNormal.z, 0., -faceNormal.x);
    lowp vec3 V = vec3(0., -abs(faceNormal.x + faceNormal.z), abs(faceNormal.y));
    mediump vec4 data = waterHeight(faceNormal, U, V);
    mediump vec3 fragNormal = data.rgb;
    mediump float height = data.a;

    // compute screen space view direction
    mediump vec3 viewDir = normalize(position - eye);
    mediump vec3 reflectDir = reflect(viewDir, fragNormal);
    mediump vec3 lightDir = light.direction;
    
    // calculate reflection
    mediump vec3 reflectColor = 0.125 * (ambientOcclusion / (abs(reflectDir.x) + abs(reflectDir.y) + abs(reflectDir.z))) * (
        max( reflectDir.x, 0.) * light.skyLeft +
        max(-reflectDir.x, 0.) * light.skyRight +
        max( reflectDir.y, 0.) * light.skyTop +
        max(-reflectDir.y, 0.) * light.skyBottom +
        max( reflectDir.z, 0.) * light.skyFront +
        max(-reflectDir.z, 0.) * light.skyBack);
    mediump float opticalDepth = 18. - 4. * height;

    // compute specular contribution
    mediump float specular = (ambientOcclusion * (68. / (PI * 8.))) * pow(clamp(dot(reflectDir, lightDir), 0., 1.), 60.);

    // compute extinction
    mediump float extinction = clamp(1. - exp(-0.1 * opticalDepth * fog.a), 0., 1.);
    
    // compute fresnel weight
    mediump float fresnel = 1. - 0.65 * pow5(1.0 - max(0., dot(fragNormal, viewDir)));
    mediump vec4 fragColor = vec4(
        specular * light.color +
        fresnel * reflectColor +
        extinction * fog.rgb,
        extinction);

    PostFrag frag;
    frag.color = fragColor;
    frag.eye = eye;
    frag.position = position;

    vec4 outColor = outputFragment(
        #ifdef COLOR_LUT
            lut,
        #endif
        light, post, frag);

    #ifdef HDR
        gl_FragColor = outColor;
    #else
        gl_FragColor = vec4(outColor.rgb, pow(outColor.a, 0.1));
    #endif
}