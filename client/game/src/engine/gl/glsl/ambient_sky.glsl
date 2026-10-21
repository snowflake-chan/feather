#define PI                  3.1415926535

#pragma glslify: normalToParaboloid = require('./normal_to_paraboloid.glsl')

#define THETA               0.7615564949871336
#define COS_THETA           0.7237628303765754
#define SIN_THETA           0.6900488137554389

#define INNER_MORNING      vec3(1.0, 0.9569, 0.4627)
#define OUTTER_MORNING     vec3(1.0, 0.6627, 0.4078)
#define INNER_NOON         vec3(0.4824, 0.8863, 1.0)
#define OUTTER_NOON        vec3(0.1255, 0.6314, 0.8549)
#define INNER_NIGHT        vec3(0.6, 0.7569, 0.9294)
#define OUTTER_NIGHT       vec3(0.4902, 0.6314, 0.8980)

mediump vec2 normalToParaboloidForStars (const mediump vec3 n) {
    return n.xz * (0.5 / (1. + min(abs(n.y),0.8))) + 0.5;
}

// 普通带有透明度的混合
mediump vec3 normalLight(vec3 a, vec4 b) {
    return a * (1.0 - b.a) + b.rgb * b.a;
}

mediump vec3 lerp(vec3 x, vec3 y, float t) {
    return (1.0 - t) * x + t * y;
}

// 美术规定太阳/月亮逐渐变化的透明度数值
mediump float smoothTransparent(float x, float y, float d) {
    if (d < x) {
        return 0.0;
    }

    if (d > y) {
        return 1.0;
    }

    float t = (d - x) / (y - x);
    if (t < 0.66) {
        return t * 0.45;
    }
    return (t - 0.66) * 2.05 + 0.3;
}

mediump vec4 getStars(mediump vec3 r, lowp float timeOfDay, const lowp sampler2D nightSampler) {
    highp float inSky = smoothstep(0.0, 0.02, r.y);

    mediump float angle = timeOfDay * PI * 2.0;
    mediump float c = cos(angle + PI), s = sin(angle + PI);
    r.xy = vec2(c * r.x + s * r.y, -s * r.x + c * r.y);
    mediump vec3 r2 = -r;

    mediump vec2 uvParaboloid = normalToParaboloidForStars(r) * 8.0;
    mediump vec2 uv2 = normalToParaboloid(r2) * 8.0;

    mediump mat2 rotation = mat2(COS_THETA, -SIN_THETA, SIN_THETA, COS_THETA);
    
    //Sample star texture
    lowp float s0 = texture2D(nightSampler, uvParaboloid).b;
    mediump vec2 uvTemp = (uvParaboloid + vec2(0.42452, 0.1234)) * rotation;
    lowp float s1 = texture2D(nightSampler, uvTemp).b;
    uvTemp = (uvTemp - vec2(0.1413, 0.136537)) * rotation;
    lowp float s2 = texture2D(nightSampler, uvTemp).b;
    lowp float s3 = texture2D(nightSampler, 4. * uv2).b;

    lowp float w0 = 0.3 * (s0 + s3);
    lowp float w1 = 1.1 * max(s1, s2);

    return vec4(vec3(0.1020, 1.0, 0.9686), clamp(w0 * w0 + w1 * w1, 0.0, 1.0) * smoothstep(-0.25, -0.1, - abs(timeOfDay - 0.75)) * inSky);
}

// 太阳/月亮的画法
mediump vec4 getTint(mediump vec3 r, vec3 dir, vec3 innerColor, vec3 outterColor) {
    highp float inSky = smoothstep(0.0, 0.02, r.y);
    highp float dotDir = dot(r, dir);
    highp float alpha = smoothTransparent(0.995, 0.9975, dotDir) * inSky;
    highp float innerStep = smoothstep(0.9965, 0.9975, dotDir);
    highp float whiteStep = smoothstep(0.9975, 0.9976, dotDir);
    return vec4(lerp(lerp(outterColor, innerColor, innerStep), vec3(1.0), whiteStep), alpha);
}

mediump vec4 getNightColor(
    mediump vec3 r,
    mediump vec3 moonDir,
    lowp float timeOfDay,
    const lowp sampler2D nightSampler) {
    // starts
    mediump vec4 moonStarsColor = getStars(r, timeOfDay, nightSampler);

    //moon
    highp vec4 moonTint = getTint(r, moonDir, INNER_NIGHT, OUTTER_NIGHT);
    if (moonTint.a > 0.0) {
        moonStarsColor = vec4(moonTint.rgb, moonTint.a * smoothstep(-0.25, -0.1, - abs(timeOfDay - 0.75)));
    }

    return moonStarsColor;
}

mediump vec3 ambientSky(
    const highp vec3 r,
    const highp vec3 sunDir,
    const highp vec3 scatteringColor,
    highp float timeOfDay,
    const float now,
    const lowp sampler2D nightSampler,
    const lowp samplerCube cloudSamplerCube) {

    highp vec4 sunTintMorning = getTint(r, sunDir, INNER_MORNING, OUTTER_MORNING);
    highp vec4 sunTintNoon = getTint(r, sunDir, INNER_NOON, OUTTER_NOON);

    vec3 sunTint = lerp(sunTintMorning.rgb, sunTintNoon.rgb, smoothstep(0.0, 0.25, timeOfDay)) * (1. - step(0.25, timeOfDay));
    sunTint += lerp(sunTintNoon.rgb, sunTintMorning.rgb, smoothstep(0.25, 0.5, timeOfDay)) * step(0.25, timeOfDay);

    mediump vec3 morningColor = normalLight(scatteringColor, vec4(sunTint, sunTintMorning.a));
    mediump vec4 nightColor = getNightColor(r, normalize(-sunDir), timeOfDay, nightSampler);
    mediump vec3 preAmbientColor = normalLight(morningColor, vec4(nightColor.rgb, nightColor.a));

    // 云朵自转，速度没要求，看心情写的
    mediump float cloudAngle = mod(now / 1000.0, 1.0) * 2.0 * PI;
    mediump vec3 cloudHit = r * mat3(
        cos(cloudAngle),0,sin(cloudAngle),
        0,1,0,
        -sin(cloudAngle),0,cos(cloudAngle));
    mediump vec4 cloudColor = textureCube(cloudSamplerCube, cloudHit);

    preAmbientColor = normalLight(preAmbientColor, vec4(cloudColor.rgb, cloudColor.a * 0.8));

    return preAmbientColor;
}

#pragma glslify:export(ambientSky)