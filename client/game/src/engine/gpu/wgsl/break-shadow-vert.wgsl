fn vertMain(@location(0) s0 : vec4f) -> VertexOutput {
  let blockPos = s0.xyz * 255.;

  let faceCode = blockPos.z;
  let h0 = step(faceCode, 0.5);
  let h1 = step(faceCode, 1.5);
  let h2 = step(faceCode, 2.5);
  let h3 = step(faceCode, 3.5);
  let h4 = step(faceCode, 4.5);
  let faceNormal = vec3f(
  h1 - 2. * h0,
  h3 - 2. * h2 + h1,
  1. - 2. * h4 + h3);

  let faceU = vec3f(faceNormal.y + faceNormal.z, 0., -faceNormal.x);
  let faceV = vec3f(0., -abs(faceNormal.x + faceNormal.z), abs(faceNormal.y));

  //compute cube position
  let cubePosition = faceNormal + blockPos.x * faceU + blockPos.y * faceV;

  //compute seed
  let instanceId = s0.w * 255.;
  let seed = fract(sin(133.47589 * uni.rand * (1. + instanceId)));

  //compute dynamics stuff from random seed
  let initPosition = fract(sin(vec3f(seed * 10007., 2001. * seed.x + 113. * seed.y)));
  let velocity = BLOCK_SPEED * (0.5 * sin(vec3f(seed * 173., 217. * seed.x + 153. * seed.y)) + (initPosition - 0.5));
  let axis = polarToNormal(seed * PI2);
  let spinTime = SPIN_SPEED * uni.time * 5.;
  let rotation = spinMatrix(spinTime, axis);

  //calculate position
  var offset = uni.pos + BLOCK_SHAPE * initPosition + velocity * uni.time * BLOCK_SPEED;
  offset[1] -= 0.5 * uni.time * uni.time * GRAVITY;
  let scale = max(0., 1. - exp(uni.time - LIFETIME));
  let position = offset + BLOCK_SIZE * (1. + scale * rotation * cubePosition);

  var result : VertexOutput;

  var clipPosition = shadowUniform.viewProj * vec4f(position, 1.);
  result.position = clipPosition;
  result.fShadow = clipPosition.zw;

  return result;
}

fn polarToNormal(v : vec2f) -> vec3f {
  let c = cos(v.x);

  return vec3f(
  c * cos(v.y),
  c * sin(v.y),
  sin(v.x)
  );
}

fn spinMatrix(spinTime : f32, u : vec3f) -> mat3x3f {
  let c = cos(spinTime);
  let s = sin(spinTime);

  return mat3x3f(
  c + u.x * u.x * (1. - c), u.x * u.y * (1. - c) - u.z * s, u.x * u.z * (1. - c) + u.y * s,
  u.y * u.x * (1. - c) + u.z * s, c + u.y * u.y * (1. - c), u.y * u.z * (1. - c) - u.x * s,
  u.z * u.x * (1. - c) - u.y * s, u.z * u.y * (1. - c) + u.x * s, c + u.z * u.z * (1. - c));
}
