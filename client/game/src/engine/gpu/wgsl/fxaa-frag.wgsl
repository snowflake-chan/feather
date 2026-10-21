fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
  var fragCoord = position.xy;

  var rgbNW = textureLoad(targetTexture, vec2u(fragCoord + v_rgbNW), 0).xyz;
  var rgbNE = textureLoad(targetTexture, vec2u(fragCoord + v_rgbNE), 0).xyz;
  var rgbSW = textureLoad(targetTexture, vec2u(fragCoord + v_rgbSW), 0).xyz;
  var rgbSE = textureLoad(targetTexture, vec2u(fragCoord + v_rgbSE), 0).xyz;
  var texColor = textureLoad(targetTexture, vec2u(fragCoord), 0);
  var rgbM = texColor.xyz;
  var luma = vec3f(0.299, 0.587, 0.114);
  var lumaNW = dot(rgbNW, luma);
  var lumaNE = dot(rgbNE, luma);
  var lumaSW = dot(rgbSW, luma);
  var lumaSE = dot(rgbSE, luma);
  var lumaM = dot(rgbM, luma);
  var lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  var lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

  var dir : vec2f;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));

  var dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
  (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

  var rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2f(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
  max(vec2f(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
  dir * rcpDirMin));

  var rgbA = 0.5 * (
  textureLoad(targetTexture, vec2u(fragCoord + dir * (1.0 / 3.0 - 0.5)), 0).xyz +
  textureLoad(targetTexture, vec2u(fragCoord + dir * (2.0 / 3.0 - 0.5)), 0).xyz);
  var rgbB = rgbA * 0.5 + 0.25 * (
  textureLoad(targetTexture, vec2u(fragCoord + dir * -0.5), 0).xyz +
  textureLoad(targetTexture, vec2u(fragCoord + dir * 0.5), 0).xyz);

  var lumaB = dot(rgbB, luma);
  if ((lumaB < lumaMin) || (lumaB > lumaMax))
  {
    return vec4f(rgbA, texColor.a);
  }
  return vec4f(rgbB, texColor.a);
}
