const EMISSIVE_SCALE = 100.;

fn globalShade(v : f32, globalLight : f32) -> f32 {
  return v * (1. - globalLight) + globalLight;
}

fn saturate(v : f32) -> f32 {
  return clamp(v, 0., 1.);
}

fn sampleIrradiance(surf : SurfaceProperties, N : vec3f) -> vec3f {
  var nu = 0.5 * dot(N, surf.faceU) + 0.5;
  var nv = 0.5 * dot(N, surf.faceV) + 0.5;
  var iu = 1. - nu;
  var iv = 1. - nv;
  var light =
  (iu * iv) * surf.light00 +
  (nu * iv) * surf.light01 +
  (iu * nv) * surf.light10 +
  (nu * nv) * surf.light11;

  var wX0 = max(N.x + 0.25, 0.);
  var wX1 = max(-N.x + 0.25, 0.);
  var wY0 = max(N.y + 0.25, 0.);
  var wY1 = max(-N.y + 0.25, 0.);
  var wZ0 = max(N.z + 0.25, 0.);
  var wZ1 = max(-N.z + 0.25, 0.);
  var wTotal = wX0 + wX1 + wY0 + wY1 + wZ0 + wZ1;
  var sky = (light.a / wTotal) * (
  wX0 * commonUniform.skyLeft +
  wX1 * commonUniform.skyRight+
  wY0 * commonUniform.skyTop +
  wY1 * commonUniform.skyBottom +
  wZ0 * commonUniform.skyFront +
  wZ1 * commonUniform.skyBack);

  return EMISSIVE_SCALE * light.rgb + sky;
}

fn getShadedColor(surf : SurfaceProperties) -> vec3f {
  return surf.albedo * (
  surf.ao * (
  globalShade(saturate(dot(surf.normal, normalize(commonUniform.direction))) * surf.shadow, commonUniform.globalLight) * commonUniform.color +
  sampleIrradiance(surf, surf.normal)) +
  4. * EMISSIVE_SCALE * surf.emissive);
}
