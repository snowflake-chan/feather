fn applyFog(frag : PostFrag) -> vec4f
{
  var fogParams = commonUniform.fogParams;
  var fogParams2 = commonUniform.fogParams2;
  var fogParams3 = commonUniform.fogParams3;

  //calculate view direction
  var V = frag.position - frag.eye;
  var d = length(V);
  V /= d;

  //calculate fog color
  var wX0 = max(V.x + 0.25, 0.);
  var wX1 = max(-V.x + 0.25, 0.);
  var wY0 = max(V.y + 0.25, 0.);
  var wY1 = max(-V.y + 0.25, 0.);
  var wZ0 = max(V.z + 0.25, 0.);
  var wZ1 = max(-V.z + 0.25, 0.);
  var wTotal = wX0 + wX1 + wY0 + wY1 + wZ0 + wZ1;
  var ambientColor = (fogParams2.r / wTotal) * (
  wX0 * commonUniform.skyLeft +
  wX1 * commonUniform.skyRight+
  wY0 * commonUniform.skyTop +
  wY1 * commonUniform.skyBottom +
  wZ0 * commonUniform.skyFront +
  wZ1 * commonUniform.skyBack);

  //calculate fog
  var fogDistance = max(0., d - fogParams.r);
  var fogHeight = frag.position.y - fogParams.g;
  var fogHeightScale = fogParams.b;
  var heightFogExtinction = 1. - max(min(
  (1. / V.y) * (exp(fogHeightScale * (fogDistance * V.y - fogHeight)) - exp(-fogHeightScale * fogHeight)),
  1.), 0.);
  var uniformFogExtinction = max(min(exp(-fogDistance * fogParams.a), 1.), 0.);
  var fogAmount = min(1. - heightFogExtinction * uniformFogExtinction, fogParams2.b);

  return mix(frag.color, vec4f(ambientColor * fogParams3.rgb, 1.), fogAmount);
}
