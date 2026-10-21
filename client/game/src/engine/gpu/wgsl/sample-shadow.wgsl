struct ShadowData {
  //是否开启阴影
  enabled : f32,
  //平截头体z轴分割点
  cascadeSplits : vec3f,
  //各个平截头体的数据
  projection : array<mat4x4 < f32>, 4>,
  normal : array<mat3x3 < f32>, 4>,
  bounds : array<vec4 < f32>, 4>,
  enabledBakedShadow : f32,
  bakeChunkShift : f32,
  bakedZRatio : f32,
  chunkDimX : f32,
  chunkDimY : f32,
  chunkDimZ : f32,
}

fn sampleShadows(shadow : ShadowData, shadowMap : texture_2d<f32>, worldPos : vec3f, faceNormal : vec3f, fragCoord : vec4f, shadowMapSampler : sampler) -> f32 {
  var zDepth = fragCoord.z / fragCoord.w;

  var h0 = step(zDepth, shadow.cascadeSplits.x);
  var h1 = step(zDepth, shadow.cascadeSplits.y);
  var h2 = step(zDepth, shadow.cascadeSplits.z);
  var weight = vec4f(
  h0,
  (1. - h0) * h1,
  (1. - h1) * h2,
  1. - h2);

  var worldPosH = vec4f(worldPos, 1.);
  var sampleClip =
  weight.x * (shadow.projection[0] * worldPosH) +
  weight.y * (shadow.projection[1] * worldPosH) +
  weight.z * (shadow.projection[2] * worldPosH) +
  weight.w * (shadow.projection[3] * worldPosH);

  var normal =
  weight.x * (shadow.normal[0] * faceNormal) +
  weight.y * (shadow.normal[1] * faceNormal) +
  weight.z * (shadow.normal[2] * faceNormal) +
  weight.w * (shadow.normal[3] * faceNormal);

  var bounds =
  weight.x * shadow.bounds[0] +
  weight.y * shadow.bounds[1] +
  weight.z * shadow.bounds[2] +
  weight.w * shadow.bounds[3];

  var uvOffset = (0.5 / sampleClip.w) * sampleClip.xy + 0.5;
  var sampleDepth = sampleClip.z / sampleClip.w;

  var zScale = max(-1024. * normal.z, 0.0009765625);
  var biasX = normal.x / zScale;
  var biasY = normal.y / zScale;
  var bias = abs(biasX) + abs(biasY);

  var taps : array<vec2f, 16>;
  taps[0] = vec2f(-0.8835609, 2.523391);
  taps[1] = vec2f(-1.387375, 1.056318);
  taps[2] = vec2f(-2.854452, 1.313645);
  taps[3] = vec2f(0.6326182, 1.14569);
  taps[4] = vec2f(1.331515, 3.637297);
  taps[5] = vec2f(-2.175307, 3.885795);
  taps[6] = vec2f(-0.5396664, 4.1938);
  taps[7] = vec2f(-0.6708734, -0.36875);
  taps[8] = vec2f(-2.083908, -0.6921188);
  taps[9] = vec2f(-3.219028, 2.85465);
  taps[10] = vec2f(-1.863933, -2.742254);
  taps[11] = vec2f(-4.125739, -1.283028);
  taps[12] = vec2f(-3.376766, -2.81844);
  taps[13] = vec2f(-3.974553, 0.5459405);
  taps[14] = vec2f(3.102514, 1.717692);
  taps[15] = vec2f(2.951887, 3.186624);

  var total = 0.;
  var tapScale = 0.0009765625;
  for (var i = 0; i < 16; i++)
  {
    var duv = 0.5 * taps[i] * tapScale;
    var uv = bounds.xy + 0.5 * clamp(uvOffset + duv, vec2f(0.), vec2f(1.));
    //webgpu的y取值与webgl是相反的，这里取 1 - uv.y
    var depth = textureSample(shadowMap, shadowMapSampler, vec2f(uv.x, 1. - uv.y)).r;
    depth += bias - (biasX * duv.x + biasY * duv.y);
    depth += abs(depth) * 0.0009765625;
    total += step(sampleDepth, depth);
  }
  return total / 16.;
}
