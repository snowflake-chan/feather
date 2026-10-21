fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
  var shape = vec2f(textureDimensions(depthTexture));
  var vUv = position.xy / shape;
  var noise = rand(vUv, shape);
  var depth = readDepth(vUv, shape);

  var tt = clamp(depth, aoClamp, 1.0);
  var aspect = shape.y / shape.x;
  var w = 0.0015 * aspect / tt + (noise.x * (1.0 - noise.x));
  var h = 0.0015 / tt + (noise.y * (1.0 - noise.y));
  var ao = 0.0;
  var dz = 1.0 / f32(samples);
  var z = 1.0 - dz / 2.0;
  var l = 0.0;
  for (var i = 0; i <= samples; i ++)
  {
    var r = sqrt(1.0 - z);
    var pw = cos(l) * r;
    var ph = sin(l) * r;
    ao += calcAO(vUv, shape, depth, pw * w, ph * h);
    z = z - dz;
    l = l + DL;
  }
  ao = 1.0 - (ao / f32(samples) - 0.4253319);
  return vec4f(vec3f(ao), 1.0);
}

fn rand(coord : vec2f, shape : vec2f) -> vec2f {
  var ff = fract(1.0 - coord.x * (shape.x / 2.0));
  var gg = fract(coord.y * (shape.y / 2.0));
  var noise = vec2f(0.25, 0.75) * vec2f(ff) + vec2f(0.75, 0.25) * gg;
  return (noise * 2.0 - 1.0) * noiseAmount;
}

fn readDepth(coord : vec2f, shape : vec2f) -> f32{
  var cameraFarPlusNear = zFar + zNear;
  var cameraFarMinusNear = zFar - zNear;
  var cameraCoef = 2.0 * zNear;
  var depth = textureLoad(depthTexture, vec2u(coord * shape), 0);
  var transparentDepth = textureLoad(transparentDepthTexture, vec2u(coord * shape), 0);
  return cameraCoef / (cameraFarPlusNear - min(depth, transparentDepth) * cameraFarMinusNear);
}

fn compareDepths(depth1 : f32, depth2 : f32) -> CompareRes{
  var res : CompareRes;
  res.far = u32(0);
  res.gauss = 0.;
  var garea = 2.0;
  var diff = (depth1 - depth2) * 100.0;
  if (diff < gDisplace)
  {
    garea = diffArea;
  } else {
    res.far = u32(1);
  }
  var dd = diff - gDisplace;
  res.gauss = pow(EULER, -2.0 * dd * dd / (garea * garea));
  return res;
}

fn calcAO(vUv : vec2f, shape : vec2f, depth : f32, dw : f32, dh : f32) -> f32{
  var dd = radius - depth * radius;
  var vv = vec2f(dw, dh);
  var coord1 = vUv + dd * vv;
  var coord2 = vUv - dd * vv;

  var temp1 = compareDepths(depth, readDepth(coord1, shape));
  if (temp1.far > u32(0))
  {
    var temp2 = compareDepths(readDepth(coord2, shape), depth);
    temp1.gauss += (1.0 - temp1.gauss) * temp2.gauss;
  }
  return temp1.gauss;
}