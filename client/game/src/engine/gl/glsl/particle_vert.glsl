precision highp float;
attribute vec4 s0, s1;

uniform vec4 colorSize[5];
uniform vec4 forceNoise, miscVector, targetVector;
uniform mat4 viewProj;
uniform vec3 eye;
uniform float now, viewScale, invExposure;

uniform sampler2D noiseSampler;

varying vec3 fragColor, worldPos;

vec3 noise3 (float t) {
    vec3 seed = fract(vec3(s0.w) + s0.xyz * 19.19 + vec3(0.1303, 0.4223, 0.2334));
    return vec3(
            texture2D(noiseSampler, vec2(seed.x, t)).b,
            texture2D(noiseSampler, vec2(t, seed.y)).b,
            texture2D(noiseSampler, vec2(seed.z, -t)).b) - 0.5;
}

vec4 interpColorSize(float dt) {
    float t = dt * 4.;
    float tf = fract(t);
    float tif = 1. - tf;

    float h0 = step(t, 1.);
    float h1 = step(t, 2.);
    float h2 = step(t, 3.);

    float w0 = h0;
    float w1 = h1 - h0;
    float w2 = h2 - h1;
    float w3 = 1. - h2;

    return (
        w0 * (tif * colorSize[0] + tf * colorSize[1]) +
        w1 * (tif * colorSize[1] + tf * colorSize[2]) +
        w2 * (tif * colorSize[2] + tf * colorSize[3]) +
        w3 * (tif * colorSize[3] + tf * colorSize[4])
    );
}

void main () {
    float t0 = s0.w;
    float t1 = s1.w;

    // skip dead particles
    if (now < t0 || t1 < now) {
        gl_Position = vec4(0, 0, 0, 0);
        return;
    }

    // get initial position, velocity and time
    vec3 p0 = s0.xyz;
    vec3 v0 = s1.xyz;
    float dt = now - t0;
    float tf = dt / (t1 - t0);
    
    // use a really dumb damping model, but looks cool
    float t_damped = (t1 - t0) * pow(tf, miscVector.z);
    
    // calculate position
    vec3 cpos = p0 + t_damped * (v0 + 0.5 * t_damped * forceNoise.xyz);

    // add noise
    if (forceNoise.w > 0.) {
        cpos += forceNoise.w * noise3(miscVector.x * t_damped);
    }

    // apply target interpolation
    cpos = mix(cpos, targetVector.xyz, targetVector.w * tf);

    // interpolate color and size
    vec4 csize = interpColorSize(tf);

    // compute point size
    float sizeSpread = miscVector.y * (fract(t0 * 1337.103) - 0.5);
    gl_PointSize = max(1., viewScale * (csize.a + sizeSpread) / (1. + distance(cpos, eye)));

    // output frag vars
    worldPos = cpos;
    fragColor = invExposure * csize.rgb;

    // output position
    gl_Position = viewProj * vec4(cpos, 1.);
}