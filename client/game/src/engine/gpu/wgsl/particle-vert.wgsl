fn vertMain(
@builtin(vertex_index) vertexIndex : u32,
@location(0) s0 : vec4f,
@location(1) s1 : vec4f
) -> VertexOutput {
  var output : VertexOutput;
  var t0 = s0.w;
  var t1 = s1.w;

  //skip dead particles
  if (commonUniform.now < t0 || t1 < commonUniform.now)
  {
    output.position = vec4f(0., 0., 0., 0.);
    return output;
  }

  //get initial position, velocity and time
  var p0 = s0.xyz;
  var v0 = s1.xyz;
  var dt = commonUniform.now - t0;
  var tf = dt / (t1 - t0);

  //use a really dumb damping model, but looks cool
  var t_damped = (t1 - t0) * pow(tf, uni.miscVector.z);

  //calculate position
  var cpos = p0 + t_damped * (v0 + 0.5 * t_damped * uni.forceNoise.xyz);

  //add noise
  if (uni.forceNoise.w > 0.)
  {
    cpos += uni.forceNoise.w * noise3(uni.miscVector.x * t_damped, s0);
  }

  //apply target interpolation
  cpos = mix(cpos, uni.targetVector.xyz, uni.targetVector.w * tf);

  //interpolate color and size
  var csize = interpColorSize(tf);

  //compute point size
  var sizeSpread = uni.miscVector.y * (fract(t0 * 1337.103) - 0.5);
  var size = (csize.a + sizeSpread) / 16. / 2.;

  //output frag vars
  var p = points[vertexIndex];
  var pos = uni.matrix * vec4f(p, 0., 1.);
  output.worldPos = vec3f(cpos + pos.xyz * size);
  output.fragColor = commonUniform.invExposure * csize.rgb;

  //output position
  output.position = commonUniform.viewProj * vec4f(output.worldPos, 1.);

  return output;
}

fn noise3(t : f32, s0 : vec4f) -> vec3f {
  var seed = fract(vec3f(s0.w) + s0.xyz * 19.19 + vec3f(0.1303, 0.4223, 0.2334));
  return vec3f(
  textureSampleLevel(noiseSampler, particleSampler, vec2f(seed.x, t), 0.).b,
  textureSampleLevel(noiseSampler, particleSampler, vec2f(t, seed.y), 0.).b,
  textureSampleLevel(noiseSampler, particleSampler, vec2f(seed.z, -t), 0.).b) - 0.5;
}


fn interpColorSize(dt : f32) -> vec4f {
  var t = dt * 4.;
  var tf = fract(t);
  var tif = 1. - tf;

  var h0 = step(t, 1.);
  var h1 = step(t, 2.);
  var h2 = step(t, 3.);

  var w0 = h0;
  var w1 = h1 - h0;
  var w2 = h2 - h1;
  var w3 = 1. - h2;

  return (
  w0 * (tif * uni.colorSize[0] + tf * uni.colorSize[1]) +
  w1 * (tif * uni.colorSize[1] + tf * uni.colorSize[2]) +
  w2 * (tif * uni.colorSize[2] + tf * uni.colorSize[3]) +
  w3 * (tif * uni.colorSize[3] + tf * uni.colorSize[4])
  );
}
