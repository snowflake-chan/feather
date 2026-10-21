#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

mediump vec4 applyFog (const LightProperties light, const PostData post, const PostFrag frag) {
    mediump vec4 fogParams = post.fogParams;
    mediump vec4 fogParams2 = post.fogParams2;
    mediump vec4 fogParams3 = post.fogParams3;

    // calculate view direction
    mediump vec3 V = frag.position - frag.eye;
    mediump float d = length(V);
    V /= d;

    // calculate fog color
    mediump float wX0 = max( V.x + 0.25, 0.);
    mediump float wX1 = max(-V.x + 0.25, 0.);
    mediump float wY0 = max( V.y + 0.25, 0.);
    mediump float wY1 = max(-V.y + 0.25, 0.);
    mediump float wZ0 = max( V.z + 0.25, 0.);
    mediump float wZ1 = max(-V.z + 0.25, 0.);
    mediump float wTotal = wX0 + wX1 + wY0 + wY1 + wZ0 + wZ1;
    mediump vec3 ambientColor = (fogParams2.r / wTotal) * (
        wX0 * light.skyLeft +
        wX1 * light.skyRight+
        wY0 * light.skyTop +
        wY1 * light.skyBottom +
        wZ0 * light.skyFront +
        wZ1 * light.skyBack);

    // calculate fog
    mediump float fogDistance = max(0., d - fogParams.r);
    mediump float fogHeight = frag.position.y - fogParams.g;
    mediump float fogHeightScale = fogParams.b;
    mediump float heightFogExtinction = 1. - max(min(
            (1. / V.y) * (exp(fogHeightScale * (fogDistance * V.y - fogHeight)) - exp(-fogHeightScale * fogHeight)),
        1.), 0.);
    mediump float uniformFogExtinction = max(min(exp(-fogDistance * fogParams.a), 1.), 0.);
    lowp float fogAmount = min(1. - heightFogExtinction * uniformFogExtinction, fogParams2.b);
    
    return mix(frag.color, vec4(ambientColor * fogParams3.rgb, 1), fogAmount);
}

#pragma glslify:export(applyFog)