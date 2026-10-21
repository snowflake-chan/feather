const THETA = 0.7615564949871336;
const COS_THETA = 0.7237628303765754;
const SIN_THETA = 0.6900488137554389;

const INNER_MORNING = vec3f(1.0, 0.9569, 0.4627);
const OUTTER_MORNING = vec3f(1.0, 0.6627, 0.4078);
const INNER_NOON = vec3f(0.4824, 0.8863, 1.0);
const OUTTER_NOON = vec3f(0.1255, 0.6314, 0.8549);
const INNER_NIGHT = vec3f(0.6, 0.7569, 0.9294);
const OUTTER_NIGHT = vec3f(0.4902, 0.6314, 0.8980);

fn normalToParaboloidForStars(n : vec3f) -> vec2f {
    return n.xz * (0.5 / (1. + min(abs(n.y), 0.8))) + 0.5;
}

//普通带有透明度的混合
fn normalLight(a : vec3f, b : vec4f) -> vec3f
{
    return a * (1.0 - b.a) + b.rgb * b.a;
}

//美术规定太阳/月亮逐渐变化的透明度数值
fn smoothTransparent(x : f32, y : f32, d : f32) -> f32
{
    if (d < x)
    {
        return 0.0;
    }

    if (d > y)
    {
        return 1.0;
    }

    let t = (d - x) / (y - x);
    if (t < 0.66)
    {
        return t * 0.45;
    }
    return (t - 0.66) * 2.05 + 0.3;
}

fn getStars(r : vec3f, timeOfDay : f32, nightSampler : texture_2d<f32>) -> vec4f
{
    var inSky = smoothstep(0.0, 0.02, r.y);

    var angle = timeOfDay * PI * 2.0;
    var c = cos(angle + PI);
    var s = sin(angle + PI);
    var tmpR = vec3f(vec2f(c * r.x + s * r.y, -s * r.x + c * r.y), r.z);
    var r2 = -tmpR;

    var uvParaboloid = normalToParaboloidForStars(tmpR) * 8.0;
    var uv2 = normalToParaboloid(r2) * 8.0;

    var rotation = mat2x2 < f32 > (COS_THETA, -SIN_THETA, SIN_THETA, COS_THETA);

    //Sample star texture
    var s0 = textureSample(nightSampler, skySampler, uvParaboloid).b;
    var uvTemp = (uvParaboloid + vec2f(0.42452, 0.1234)) * rotation;
    var s1 = textureSample(nightSampler, skySampler, uvTemp).b;
    uvTemp = (uvTemp - vec2f(0.1413, 0.136537)) * rotation;
    var s2 = textureSample(nightSampler, skySampler, uvTemp).b;
    var s3 = textureSample(nightSampler, skySampler, 4. * uv2).b;

    var w0 = 0.3 * (s0 + s3);
    var w1 = 1.1 * max(s1, s2);

    return vec4f(vec3f(0.1020, 1.0, 0.9686), clamp(w0 * w0 + w1 * w1, 0.0, 1.0) * smoothstep(-0.25, -0.1, - abs(timeOfDay - 0.75)) * inSky);
}

//太阳/月亮的画法
fn getTint(r : vec3f, dir : vec3f, innerColor : vec3f, outterColor : vec3f) -> vec4f
{
    var inSky = smoothstep(0.0, 0.02, r.y);
    var dotDir = dot(r, dir);
    var alpha = smoothTransparent(0.995, 0.9975, dotDir) * inSky;
    var innerStep = smoothstep(0.9965, 0.9975, dotDir);
    var whiteStep = smoothstep(0.9975, 0.9976, dotDir);
    return vec4f(lerp(lerp(outterColor, innerColor, innerStep), vec3f(1.0), whiteStep), alpha);
}

fn getNightColor(r : vec3f, moonDir : vec3f, timeOfDay : f32, nightSampler : texture_2d<f32>) -> vec4f
{
    //starts
    var moonStarsColor = getStars(r, timeOfDay, nightSampler);

    //moon
    var moonTint = getTint(r, moonDir, INNER_NIGHT, OUTTER_NIGHT);
    if (moonTint.a > 0.0)
    {
        moonStarsColor = vec4f(moonTint.rgb, moonTint.a * smoothstep(-0.25, -0.1, - abs(timeOfDay - 0.75)));
    }

    return moonStarsColor;
}

fn ambientSky(r : vec3f, sunDir : vec3f, scatteringColor : vec3f, timeOfDay : f32, now : f32, nightSampler : texture_2d<f32>, cloudSamplerCube : texture_cube < f32>) -> vec3f
{

    var sunTintMorning = getTint(r, sunDir, INNER_MORNING, OUTTER_MORNING);
    var sunTintNoon = getTint(r, sunDir, INNER_NOON, OUTTER_NOON);

    var sunTint = lerp(sunTintMorning.rgb, sunTintNoon.rgb, smoothstep(0.0, 0.25, timeOfDay)) * (1. - step(0.25, timeOfDay));
    sunTint += lerp(sunTintNoon.rgb, sunTintMorning.rgb, smoothstep(0.25, 0.5, timeOfDay)) * step(0.25, timeOfDay);

    var morningColor = normalLight(scatteringColor, vec4f(sunTint, sunTintMorning.a));
    var nightColor = getNightColor(r, normalize(-sunDir), timeOfDay, nightSampler);
    var preAmbientColor = normalLight(morningColor, vec4f(nightColor.rgb, nightColor.a));

    //云朵自转，速度没要求，看心情写的
    var cloudAngle = now / 1000.0 % 1.0 * 2.0 * PI;
    var cloudHit = r * mat3x3 <f32 > (
    cos(cloudAngle), 0., sin(cloudAngle),
    0., 1., 0.,
    -sin(cloudAngle), 0., cos(cloudAngle));
    var cloudColor = textureSample(cloudSamplerCube, skySampler, cloudHit);

    preAmbientColor = normalLight(preAmbientColor, vec4f(cloudColor.rgb, cloudColor.a * 0.8));

    return preAmbientColor;
}
