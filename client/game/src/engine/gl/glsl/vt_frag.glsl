precision highp float;

#define PI 3.14159265

#pragma glslify: SurfaceProperties = require('./pbr_surface.glsl')
#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

varying vec2 texCoord;
varying vec3 viewDirection;
varying vec4 light00, light01, light10, light11;
varying vec3 fposition;

uniform vec3 faceNormal, faceU, faceV;
uniform vec3 eye;

uniform LightProperties light;
uniform PostData post;

uniform sampler2D skyEnv;

uniform bool doPost;

uniform sampler2D albedoTexture;
uniform sampler2D bumpTexture;
uniform sampler2D metalTexture;
uniform sampler2D emissiveTexture;
uniform sampler2D smoothnessTexture;

#pragma glslify: getShadedColor = require('./pbr.glsl')
#pragma glslify: applyFog = require('./fog.glsl')
#pragma glslify: outputPost = require('./post_out.glsl')

float saturate (float v) {
    return clamp(v, 0., 1.);
}

float bump (vec2 uv) {
    return texture2D(bumpTexture, uv).r;
}

float crease (vec2 uv) {
    return texture2D(bumpTexture, uv).a;
}

vec3 surfaceNormal (vec2 uv) {
    vec2 dh = texture2D(bumpTexture, uv).gb - 0.5;
    return normalize(
        0.5 * faceNormal +
        dh.x * faceU +
        dh.y * faceV);
}

vec2 parallaxTexCoord (vec2 uvin, vec3 viewDir, vec3 faceU, vec3 faceV, float parallaxScale) {
    vec2 vUV = vec2(
        dot(viewDir, faceU),
        dot(viewDir, faceV));
    vec2 uvout = uvin + parallaxScale * vUV;
    vec2 uv = 0.5 * (uvout + uvin);
    float Hmin = 0.;
    float Hmax = 1.;
    for (int i = 0; i < 4; i++) {
        float H = 0.5 * (Hmin + Hmax);
        uv = uvin * H + uvout * (1. - H);
        float h = 1. - bump(uv);
        if (H <= h) Hmin = H;
        else Hmax = H;
    }
    return uv;
}

SurfaceProperties getSurface () {
    SurfaceProperties props;
    props.view = normalize(viewDirection);

    vec2 uv = parallaxTexCoord(texCoord, props.view, faceU, faceV, 1. / 16.);
    vec4 texColor = texture2D(albedoTexture, uv);
    props.position = fposition;
    props.normal = surfaceNormal(uv);
    props.albedo = texColor.rgb;
    props.metalness = texture2D(metalTexture, uv).r;
    props.smoothness = texture2D(smoothnessTexture, uv).r;
    props.emissive = texture2D(emissiveTexture, uv).r;
    props.ao = crease(texCoord);
    
    props.shadow = 1.;
    props.faceU = faceU;
    props.faceV = faceV;
    props.light00 = light00;
    props.light01 = light01;
    props.light10 = light10;
    props.light11 = light11;

    return props;
}

void main () {
    SurfaceProperties surf = getSurface();
    
    vec2 uv = parallaxTexCoord(texCoord, surf.view, faceU, faceV, 0.1);
    float alpha = texture2D(albedoTexture, uv).a; 
    
    #ifdef BUMP
        gl_FragColor = vec4(vec3(bump(texCoord) / post.exposure), 1.);
    #endif
    #ifdef NORMAL
        gl_FragColor = vec4((0.5 * surf.normal + 0.5) / post.exposure, 1);
    #endif
    #ifdef CREASE
        gl_FragColor = vec4(vec3(crease(texCoord) / post.exposure), 1.);
    #endif
    #ifdef SHADED
        gl_FragColor = vec4(getShadedColor(skyEnv, light, surf), alpha);
    #endif
    #ifdef ALBEDO
        gl_FragColor = vec4(surf.albedo / post.exposure, alpha);
    #endif
    #ifdef METALNESS
        gl_FragColor = vec4(vec3(surf.metalness / post.exposure), 1);
    #endif
    #ifdef SMOOTHNESS
        gl_FragColor = vec4(vec3(surf.smoothness / post.exposure), 1);
    #endif
    #ifdef EMISSIVE
        gl_FragColor = vec4(surf.emissive * surf.albedo, 1);
    #endif

    PostFrag frag;
    frag.color = gl_FragColor;
    frag.eye = eye;
    frag.position = fposition;
    if (!doPost) {
        gl_FragColor = outputPost(light, post, frag);
    } else {
        gl_FragColor = applyFog(light, post, frag);
    }
}