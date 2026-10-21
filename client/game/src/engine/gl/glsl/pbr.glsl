#pragma glslify:SurfaceProperties = require('./pbr_surface.glsl')
#pragma glslify:LightProperties = require('./pbr_light.glsl')
#pragma glslify:normalToParaboloid = require('./normal_to_paraboloid.glsl')

#define EMISSIVE_SCALE 100.

mediump float saturate (mediump float v) {
    return clamp(v, 0., 1.);
}

mediump float globalShade (mediump float v, mediump float globalLight) {
    return v * (1. - globalLight) + globalLight;
}

mediump vec3 sampleIrradiance (
    const LightProperties irr,
    const SurfaceProperties surf,
    const mediump vec3 N) {
    lowp float nu = 0.5 * dot(N, surf.faceU) + 0.5;
    lowp float nv = 0.5 * dot(N, surf.faceV) + 0.5;
    lowp float iu = 1. - nu;
    lowp float iv = 1. - nv;
    mediump vec4 light =
        (iu * iv) * surf.light00 +
        (nu * iv) * surf.light01 +
        (iu * nv) * surf.light10 +
        (nu * nv) * surf.light11;

    mediump float wX0 = max( N.x + 0.25, 0.);
    mediump float wX1 = max(-N.x + 0.25, 0.);
    mediump float wY0 = max( N.y + 0.25, 0.);
    mediump float wY1 = max(-N.y + 0.25, 0.);
    mediump float wZ0 = max( N.z + 0.25, 0.);
    mediump float wZ1 = max(-N.z + 0.25, 0.);
    mediump float wTotal = wX0 + wX1 + wY0 + wY1 + wZ0 + wZ1;
    mediump vec3 sky = (light.a / wTotal) * (
        wX0 * irr.skyLeft +
        wX1 * irr.skyRight+
        wY0 * irr.skyTop +
        wY1 * irr.skyBottom +
        wZ0 * irr.skyFront +
        wZ1 * irr.skyBack);

    return EMISSIVE_SCALE * light.rgb + sky;
}

#ifdef SAFE

#else
    mediump float D_GGX(mediump float linearRoughness, mediump float NoH) {
        // Walter et al. 2007, "Microfacet Models for Refraction through Rough Surfaces"
        mediump float oneMinusNoHSquared = 1.0 - NoH * NoH;
        mediump float a = NoH * linearRoughness;
        mediump float k = linearRoughness / max(oneMinusNoHSquared + a * a, 1e-3);
        mediump float d = k * k * (1.0 / PI);
        return d;
    }

    mediump float V_SmithGGXCorrelated(mediump float linearRoughness, mediump float NoV, mediump float NoL) {
        // Heitz 2014, "Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs"
        mediump float a2 = linearRoughness * linearRoughness;
        mediump float GGXV = NoL * sqrt((NoV - a2 * NoV) * NoV + a2);
        mediump float GGXL = NoV * sqrt((NoL - a2 * NoL) * NoL + a2);
        return 0.5 / max(GGXV + GGXL, 1e-3);
    }

    mediump float pow5(mediump float x) {
        mediump float x2 = x * x;
        return x2 * x2 * x;
    }

    mediump vec3 F_Schlick(const lowp vec3 f0, mediump float VoH) {
        // Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"
        return f0 + (vec3(1.0) - f0) * pow5(1.0 - VoH);
    }

    mediump vec2 PrefilteredDFG_Karis(lowp float roughness, mediump float NoV) {
        // Karis 2014, "Physically Based Material on Mobile"
        const lowp vec4 c0 = vec4(-1.0, -0.0275, -0.572,  0.022);
        const lowp vec4 c1 = vec4( 1.0,  0.0425,  1.040, -0.040);

        mediump vec4 r = roughness * c0 + c1;
        mediump float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;

        return vec2(-1.04, 1.04) * a004 + r.zw;
    }

    mediump vec4 specularBRDF (
        mediump float linearRoughness,
        const lowp vec3 f0,
        const mediump vec3 N,
        const mediump vec3 V,
        const mediump vec3 L,
        mediump float NdotV
    ) {
        mediump vec3 H = normalize(V + L);

        mediump float NdotL = saturate(dot(N, L));
        mediump float NdotH	= saturate(dot(N, H));
        mediump float LdotH = saturate(dot(L, H));

        mediump float lightD = D_GGX(linearRoughness, NdotH);
        mediump float lightV = V_SmithGGXCorrelated(linearRoughness, NdotV, NdotL);
        mediump vec3  lightF = F_Schlick(f0, LdotH);

        return vec4((lightD * lightV) * lightF, NdotL);
    }
#endif

mediump vec3 getShadedColor (
    #ifdef SAFE
        // safe mode args
    #else
        const mediump sampler2D skyEnv,
    #endif
    const LightProperties light,
    const SurfaceProperties surf) {
    #ifdef SAFE
        return surf.albedo * (
                surf.ao * (
                    globalShade(saturate(dot(surf.normal, normalize(light.direction))) * surf.shadow, light.globalLight) * light.color +
                    sampleIrradiance(light, surf, surf.normal)) +
                4. * EMISSIVE_SCALE * surf.emissive);
    #else
        // early out for diffuse surfaces
        if (surf.smoothness < 0.01) {
            return surf.albedo * (
                surf.ao * (
                    saturate(dot(surf.normal, normalize(light.direction))) * surf.shadow * light.color +
                    sampleIrradiance(light, surf, surf.normal)) +
                4. * EMISSIVE_SCALE * surf.emissive);
        }
        
        // unpack geometry and compute constant brdf terms
        mediump vec3 N = surf.normal;
        mediump vec3 V = surf.view;
        lowp float NdotV = saturate(dot(N, V));
        
        // ambient occlusion
        lowp float ao = surf.ao;
        
        // unpack material properties
        lowp vec3 diffuseColor = ((1. - surf.metalness) / PI) * surf.albedo;  // apply lambert weight here
        lowp vec3 f0 = 0.04 * (1. - surf.metalness) + surf.albedo * surf.metalness;
        lowp float roughness = 1.0 - surf.smoothness;
        mediump float linearRoughness = roughness * roughness;

        // compute specular color
        mediump vec2 dfg = PrefilteredDFG_Karis(roughness, NdotV);
        lowp vec3 specularColor = f0 * dfg.x + dfg.y;

        // compute analytic light contribution
        mediump vec4 brdf = specularBRDF(linearRoughness, specularColor, N, V, normalize(light.direction), NdotV);
        mediump vec3 color = (brdf.a * surf.shadow * ao) * light.color * (diffuseColor + brdf.rgb);

        // compute diffuse irradiance
        mediump vec3 diffuseIrradiance = ao * sampleIrradiance(light, surf, N);
        color += diffuseIrradiance * diffuseColor;

        // For specular irradiance use reflection
        mediump vec3 R = -normalize(reflect(V, N));

        // sample sky
        lowp float skyVis = 0.25 * (surf.light00.a + surf.light01.a + surf.light10.a + surf.light11.a);
        mediump vec2 envUV = normalToParaboloid(vec3(R.x, abs(R.y), R.z));
        envUV.x = 0.5 * (envUV.x + step(0., R.y));
        mediump vec3 reflection = skyVis * texture2D(skyEnv, envUV).rgb;
        mediump vec3 specularIrradiance = mix(reflection, diffuseIrradiance, linearRoughness);
        
        color += specularIrradiance * specularColor;
        
        // compute emissive light
        color += 4. * EMISSIVE_SCALE * surf.emissive * surf.albedo;
        
        // final color
        return color;
    #endif
}

#pragma glslify:export(getShadedColor)