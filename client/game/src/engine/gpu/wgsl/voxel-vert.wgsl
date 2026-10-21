fn vertMain(
@location(0) s0 : vec4f,
@location(1) s1 : vec4f,
@location(2) s2 : vec4f,
@location(3) s3 : vec4f
) -> VertexOutput {
  var output : VertexOutput;
  //unpack position
  var blockPos = s0.xyz * 255.;
  var lodPos = CHUNK_SIZE * uni.chunkId + blockPos;
  output.position = commonUniform.viewProj * vec4f(lodPos, 1.);

  //unpack normal
  var faceCode = s0.w * 255.;

  //unpack light values
  var light0 = unpackLight(s1 * 255.);
  output.light00 = light0.light0;
  output.light01 = light0.light1;

  var light1 = unpackLight(s2 * 255.);
  output.light10 = light1.light0;
  output.light11 = light1.light1;

  //compute face normal
  var h0 = step(faceCode, 0.5);
  var h1 = step(faceCode, 1.5);
  var h2 = step(faceCode, 2.5);
  var h3 = step(faceCode, 3.5);
  var h4 = step(faceCode, 4.5);
  output.faceNormal = vec3f(
  h1 - 2. * h0,
  h3 - 2. * h2 + h1,
  1. - 2. * h4 + h3);

  //unpack texture coord
  var animOffset = floor(s3.a * 255. * fract(commonUniform.now));
  output.texCoordBase = (BLOCK_COLOR_SIZE / commonUniform.atlasRadius) * (s3.rg * 255. + vec2f(animOffset, 0.));

  //unpack edge information
  var b = s3.b * 255.;
  var upEdge = step(0.5, fract(b / 16.));
  var rightEdge = step(0.5, fract(b / 8.));
  var downEdge = step(0.5, fract(b / 4.));
  var leftEdge = step(0.5, fract(b / 2.));
  output.edgeInfo = vec4f(upEdge, rightEdge, downEdge, leftEdge);

  //store world position
  output.worldPos = vec4f(lodPos, floor(b / 16.));

  return output;
}

fn scaleDist2(l : vec4f) -> vec4f {
  return l / (16. - 15. * l);
}

struct Light {
  light0 : vec4f,
  light1 : vec4f
}

fn unpackLight(attrib : vec4f) -> Light {
  var tmp = attrib / 16.;
  var out : Light;
  out.light0 = scaleDist2(fract(tmp).xzyw);
  out.light1 = scaleDist2(floor(tmp).xzyw / 16.);
  return out;
}
