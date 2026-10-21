fn fragMain(@builtin(position) position : vec4f) -> @location(0) vec4 < f32> {
  var uv = position.xy;
  var shape = vec2f(textureDimensions(shadowDepth));
  var halfW = shape.x / 2;
  var halfH = shape.y / 2;

  var thirdBounds = uv.x > halfW && uv.y > halfH;
  var fourthBounds = uv.x > halfW && uv.y < halfH;

  var depth = textureLoad(shadowDepth, vec2u(uv), 0);

  if (useCacheIdx == 0. && thirdBounds)
  {
    discard;
  }

  if (useCacheIdx == 1. && fourthBounds)
  {
    discard;
  }

  return vec4f(depth, 0., 0., 1.);
}
