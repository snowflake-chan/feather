fn vertMain(
@location(0) s0 : vec4f,
@location(1) s1 : vec4f
) -> VertexOutput {
  var output : VertexOutput;

  //compute fog color
  var ambientOcclusion = floor(s0.w * 255. / 8.) / 32.;
  output.fog = vec4f(s1.rgb * commonUniform.color * ambientOcclusion, s1.a);

  //compute face normal
  var faceCode = fract(s0.w * 255. / 8.);
  var h0 = step(faceCode, 0.5 / 8.);
  var h1 = step(faceCode, 1.5 / 8.);
  var h2 = step(faceCode, 2.5 / 8.);
  var h3 = step(faceCode, 3.5 / 8.);
  var h4 = step(faceCode, 4.5 / 8.);

  //pack normal + ambient occlusion
  output.faceNormalAmbient = vec4f(
  h1 - 2. * h0,
  h3 - 2. * h2 + h1,
  1. - 2. * h4 + h3,
  ambientOcclusion);

  //output position
  var p = s0.xyz * 255. + 32. * uni.chunkId;
  output.worldPos = p;
  output.position = commonUniform.viewProj * vec4f(p, 1.);
  return output;
}
