fn fragMain(
@builtin(position) position : vec4f,
@location(0) worldPos : vec4f,
@location(1) texCoordBase : vec2f,
@location(2) faceNormal : vec3f,
@location(3) light00 : vec4f,
@location(4) light01 : vec4f,
@location(5) light10 : vec4f,
@location(6) light11 : vec4f,
@location(7) edgeInfo : vec4f) -> @location(0) vec4 < f32> {
  //透明像素点如果深度值超过了不透明的物体，直接discard，不会进入像素链表进行绘制
  var depth = textureLoad(depthTexture, vec2u(position.xy), 0);
  if (depth < position.z)
  {
    discard;
  }

  var U = vec3f(faceNormal.y + faceNormal.z, 0., -faceNormal.x);
  var V = vec3f(0., -abs(faceNormal.x + faceNormal.z), abs(faceNormal.y));

  var rotateInfo = worldPos.a;
  var h0 = step(rotateInfo, .5);
  var h1 = step(rotateInfo, 1.5);
  var h2 = step(rotateInfo, 2.5);
  var A = h0 - h2 + h1;
  var B = h1 - h0 - 1. + h2;
  var faceU = A * U + B * V;
  var faceV = A * V - B * U;

  var fTexCoord = tileOffset(fract(worldPos.xyz), faceU, faceV);
  var texCoord = getTexCoord(texCoordBase, fTexCoord);

  var blockColor = textureSample(colorAtlasTexture, voxelSampler, texCoord);
  var blockMaterial = textureSample(materialAtlasTexture, voxelSampler, texCoord);

  var alpha = blockColor.a;

  //unpack surface info
  var surf : SurfaceProperties;
  surf.normal = faceNormal;
  surf.ao = 1.;

  //geometry
  surf.position = worldPos.xyz;
  surf.faceU = faceU;
  surf.faceV = faceV;

  //albedo and emissive values
  surf.albedo = blockColor.rgb;
  surf.emissive = blockMaterial.b;

  //local illumination
  surf.light00 = light00;
  surf.light01 = light01;
  surf.light10 = light10;
  surf.light11 = light11;

  //compute shadow values
  surf.shadow = step(0., dot(faceNormal, commonUniform.direction));

  if (shadowData.enabledBakedShadow > 0.)
  {
    surf.shadow *= sampleBakedShadows(bakeShadowMap, worldPos.xyz, faceNormal, position, voxelSampler);
  }

  if (shadowData.enabled > 0.)
  {
    surf.shadow *= sampleShadows(shadowData, shadowMap, worldPos.xyz, faceNormal, position, voxelSampler);
  } else {
    //adjust shadow scaling since maximum intesnity from unpacked light = 1 / (16 - 15 * 15 / 16)
    surf.shadow *= 0.484375 * (light00.a + light01.a + light10.a + light11.a);
  }

  var frag : PostFrag;
  frag.color = vec4f(getShadedColor(surf), alpha);
  frag.eye = commonUniform.eye;
  frag.position = worldPos.xyz;

  var color = outputFragment(frag);
  oitStorePixels(color, position);
  return color;
}

fn getTexCoord(base : vec2f, tile : vec2f) -> vec2f {
  var uvOffset = (0.5 / commonUniform.atlasRadius) + ((BLOCK_COLOR_SIZE - 1.) / commonUniform.atlasRadius) * tile;
  return uvOffset + base;
}

//We have to do fract twice in this way to work around a shader precision bug in iOS
fn tileOffset(pos : vec3f, faceU : vec3f, faceV : vec3f) -> vec2f
{
  return fract(vec2f(
  dot(pos, faceU),
  dot(pos, faceV)));
}
