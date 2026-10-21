fn sampleAtmosphere(r : vec3f, timeOfDay : f32, now : f32, nightSampler : texture_2d<f32>, cloudSamplerCube : texture_cube < f32>) ->vec3f {
    var angle = timeOfDay * 2.0 * PI;
    var sunDir = normalize(vec3f(cos(angle), sin(angle), 0.));
    var scatteringColor = getScatterColor(r, timeOfDay);

    return ambientSky(
    r,
    sunDir,
    scatteringColor,
    timeOfDay,
    now,
    nightSampler,
    cloudSamplerCube);
}
