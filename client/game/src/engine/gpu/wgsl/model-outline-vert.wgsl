fn vertMain(
@location(0) meshPosition : vec4f,
@location(1) idx : u32,
@location(2) gltfPosition : vec4f,
) -> VertexOutput {
  var result : VertexOutput;

  if (IS_GLTF) {
    result.position = vec4f(gltfPosition.xyz, 1.0);
  } else {
    result.position = vec4f(meshPosition.xyz * 255., 1.0);
  }

  result.position = viewProj * model * nodesMatrix[idx].m * result.position;

  result.fShadow = result.position.zw;

  return result;
}
