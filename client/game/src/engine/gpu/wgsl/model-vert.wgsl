fn vertMain(
@location(0) meshPosition : vec4f,
@location(1) idx : u32,
@location(2) uv : vec2f,
@location(3) normals: vec3f,
@location(4) gltfPosition: vec4f,
) -> VertexOutput {
  var output : VertexOutput;

  var tempPos: vec3f;

  if (IS_GLTF) {
    tempPos = gltfPosition.xyz;
  } else {
    tempPos = meshPosition.xyz * 255.;
  }
  var modelPos = model.m * nodesMatrix[idx].m * vec4(tempPos, 1.0);

  output.worldPos = modelPos.xyz;
  output.position = commonUniform.viewProj * modelPos;
  output.texcoord = uv;
  output.alpha = nodesAlpha[idx];

  //compute face normal
  if (!IS_GLTF) {
    var faceCode = meshPosition.a * 255.;
    var h0 = step(faceCode, 0.5);
    var h1 = step(faceCode, 1.5);
    var h2 = step(faceCode, 2.5);
    var h3 = step(faceCode, 3.5);
    var h4 = step(faceCode, 4.5);
    output.normal = normalize(model.normalMat * vec3f(
    h1 - 2. * h0,
    h3 - 2. * h2 + h1,
    1. - 2. * h4 + h3));
  } else {
    output.normal = normalize(model.normalMat * normals);
  }

  //compute ambient light
  output.ambient = interpolateAmbientLight(tempPos);
  return output;
}

fn interpolateAmbientLight(p : vec3f) -> vec4f {
  var weight = (p - model.lo) / max(model.hi - model.lo, vec3f(1.));
  return mix(
  mix(
  mix(model.ambientLight[0], model.ambientLight[1], weight.x),
  mix(model.ambientLight[2], model.ambientLight[3], weight.x),
  weight.y),
  mix(
  mix(model.ambientLight[4], model.ambientLight[5], weight.x),
  mix(model.ambientLight[6], model.ambientLight[7], weight.x),
  weight.y),
  weight.z);
}
