#pragma glslify: LightProperties = require('./pbr_light.glsl')
#pragma glslify: PostData = require('./post_data.glsl')
#pragma glslify: PostFrag = require('./post_frag.glsl')

#pragma glslify: applyFog = require('./fog.glsl')
#pragma glslify: toneMapping = require('./tone_mapping.glsl')

#ifdef COLOR_LUT
#pragma glslify: applyLUT = require('./lut.glsl')
#endif

#ifdef HDR
    mediump
#else
    #ifdef REFLECTION_PASS
        mediump
    #else
        lowp
    #endif
#endif
vec4 outputFragment (
    #ifdef COLOR_LUT
        const lowp sampler2D lut,
    #endif
    const LightProperties light,
    const PostData post,
    const PostFrag frag) {
    #ifdef REFLECTION_PASS
        return vec4(frag.color.rgb, distance(frag.eye, frag.position));
    #else
        #ifdef HDR
            return applyFog(light, post, frag);
        #else
            lowp vec4 fragColor = applyFog(light, post, frag);            
            fragColor.rgb = toneMapping(post.exposure * fragColor.rgb);
            #ifdef COLOR_LUT
                fragColor.rgb = applyLUT(fragColor.rgb, lut);
            #endif
            fragColor.rgb = pow(fragColor.rgb, vec3(1. / post.gamma));
            return fragColor;
        #endif
    #endif
}

#pragma glslify:export(outputFragment)